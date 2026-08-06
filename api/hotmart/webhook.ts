import crypto from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

type HotmartRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
};

type HotmartResponse = {
  status: (code: number) => HotmartResponse;
  json: (payload: unknown) => void;
};

function getHeader(req: HotmartRequest, name: string): string {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function safeEmail(body: any): string | null {
  const email = body?.data?.buyer?.email ?? body?.buyer?.email ?? body?.data?.subscriber?.email ?? body?.subscriber?.email ?? null;
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

function eventName(body: any): string {
  return String(body?.event ?? body?.data?.event ?? body?.event_name ?? "UNKNOWN").trim().toUpperCase();
}

function transactionId(body: any): string | null {
  const transaction = body?.data?.purchase?.transaction ?? body?.purchase?.transaction ?? body?.transaction ?? null;
  return transaction ? String(transaction) : null;
}

function productId(body: any): string | null {
  const id = body?.data?.product?.id ?? body?.product?.id ?? null;
  return id == null ? null : String(id);
}

function emailKey(email: string): string {
  return crypto.createHash("sha256").update(email).digest("hex");
}

function getAdminDb() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const databaseId = process.env.FIREBASE_DATABASE_ID || "ai-studio-insomnia0-353ab32a-f0f0-410d-9d48-f0543b46d89f";

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin environment variables are not configured");
  }

  const app = getApps()[0] ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });

  return getFirestore(app, databaseId);
}

export default async function handler(req: HotmartRequest, res: HotmartResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "sleep-now-hotmart-webhook",
      hottokConfigured: Boolean(process.env.HOTMART_HOTTOK),
      firebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const configuredHottok = process.env.HOTMART_HOTTOK;
  if (!configuredHottok) {
    return res.status(503).json({ ok: false, error: "Webhook not configured" });
  }

  const receivedHottok = getHeader(req, "x-hotmart-hottok");
  const validHottok = receivedHottok.length === configuredHottok.length && crypto.timingSafeEqual(Buffer.from(receivedHottok), Buffer.from(configuredHottok));

  if (!receivedHottok || !validHottok) {
    return res.status(401).json({ ok: false, error: "Invalid Hottok" });
  }

  const body = req.body ?? {};
  const event = eventName(body);
  const transaction = transactionId(body);
  const buyerEmail = safeEmail(body);
  const hotmartProductId = productId(body);

  const premiumEvents = new Set(["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "SUBSCRIPTION_REACTIVATED"]);
  const revokeEvents = new Set(["PURCHASE_REFUNDED", "PURCHASE_CANCELED", "PURCHASE_CHARGEBACK", "SUBSCRIPTION_CANCELLATION"]);

  const accessAction = premiumEvents.has(event) ? "grant" : revokeEvents.has(event) ? "revoke" : "ignore";

  if (accessAction === "ignore") {
    return res.status(200).json({ ok: true, received: true, event, accessAction });
  }

  if (!buyerEmail) {
    return res.status(422).json({ ok: false, error: "Buyer email is required" });
  }

  try {
    const db = getAdminDb();
    const entitlementId = emailKey(buyerEmail);
    const entitlementRef = db.collection("premium_entitlements").doc(entitlementId);
    const eventId = transaction ? `${transaction}_${event}` : crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
    const eventRef = db.collection("hotmart_webhook_events").doc(eventId);

    await db.runTransaction(async (tx) => {
      const previousEvent = await tx.get(eventRef);
      if (previousEvent.exists) return;

      tx.set(eventRef, {
        event,
        transaction,
        productId: hotmartProductId,
        entitlementId,
        accessAction,
        processedAt: FieldValue.serverTimestamp(),
      });

      tx.set(entitlementRef, {
        email: buyerEmail,
        active: accessAction === "grant",
        source: "hotmart",
        productId: hotmartProductId,
        transaction,
        lastEvent: event,
        updatedAt: FieldValue.serverTimestamp(),
        ...(accessAction === "grant" ? { grantedAt: FieldValue.serverTimestamp(), revokedAt: null } : { revokedAt: FieldValue.serverTimestamp() }),
      }, { merge: true });
    });

    return res.status(200).json({
      ok: true,
      received: true,
      event,
      accessAction,
      accessUpdated: true,
    });
  } catch (error) {
    console.error("Failed to synchronize Hotmart access", error);
    return res.status(500).json({ ok: false, error: "Could not update premium access" });
  }
}
