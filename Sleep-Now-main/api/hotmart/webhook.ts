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
  return (
    body?.data?.buyer?.email ??
    body?.buyer?.email ??
    body?.data?.subscriber?.email ??
    body?.subscriber?.email ??
    null
  );
}

export default async function handler(req: HotmartRequest, res: HotmartResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "sleep-now-hotmart-webhook",
      configured: Boolean(process.env.HOTMART_HOTTOK),
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const configuredHottok = process.env.HOTMART_HOTTOK;
  if (!configuredHottok) {
    console.error("HOTMART_HOTTOK is not configured");
    return res.status(503).json({ ok: false, error: "Webhook not configured" });
  }

  const receivedHottok = getHeader(req, "x-hotmart-hottok");
  if (!receivedHottok || receivedHottok !== configuredHottok) {
    console.warn("Rejected Hotmart webhook: invalid Hottok");
    return res.status(401).json({ ok: false, error: "Invalid Hottok" });
  }

  const body = req.body ?? {};
  const event = body?.event ?? body?.data?.event ?? body?.event_name ?? "UNKNOWN";
  const transaction =
    body?.data?.purchase?.transaction ??
    body?.purchase?.transaction ??
    body?.transaction ??
    null;
  const buyerEmail = safeEmail(body);

  // Never log the full payload because it can contain personal and payment data.
  console.info("Hotmart webhook accepted", {
    event,
    transaction,
    buyerEmail,
  });

  const premiumEvents = new Set([
    "PURCHASE_APPROVED",
    "PURCHASE_COMPLETE",
    "SUBSCRIPTION_REACTIVATED",
  ]);

  const revokeEvents = new Set([
    "PURCHASE_REFUNDED",
    "PURCHASE_CANCELED",
    "PURCHASE_CHARGEBACK",
    "SUBSCRIPTION_CANCELLATION",
  ]);

  const accessAction = premiumEvents.has(event)
    ? "grant"
    : revokeEvents.has(event)
      ? "revoke"
      : "ignore";

  // Next integration step: persist `accessAction` in Firebase using buyerEmail.
  return res.status(200).json({
    ok: true,
    received: true,
    event,
    accessAction,
  });
}
