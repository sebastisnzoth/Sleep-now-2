import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of GoogleGenAI to check for key existence without crashing on server startup
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      console.warn("WARN: GEMINI_API_KEY is not defined in environment variables. Falling back to serene offline responder.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI de Calma Chat
  app.post("/api/calma-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const client = getAiClient();

      const lowerMsg = (message || "").toLowerCase();

      if (!client) {
        // Offline / No API Key fallback responses containing rich instructions from "Insomnio Cero"
        let fallbackText = "";
        
        if (lowerMsg.includes("ansiedad") || lowerMsg.includes("nervioso") || lowerMsg.includes("asustado") || lowerMsg.includes("corazon") || lowerMsg.includes("ritmo")) {
          fallbackText = "Siento mucho que estés lidiando con esa ansiedad en este momento. Vamos a apagar tu sistema simpático de forma biológica.\n\n" +
            "Aplica el Método Militar de 120 segundos:\n" +
            "1. Desconexión Facial: Relaja la frente, los párpados, suelta la mandíbula y deja que tu lengua descanse sin tensión.\n" +
            "2. Descenso Corporal: Deja caer tus hombros, relaja bíceps, antebrazos y manos. Siente tus piernas como peso muerto hundirse en la cama.\n" +
            "3. Bloqueo de Banda Mental: Imagina que estás boca arriba en una canoa flotando en un lago cristalino y plano, bajo un cielo azul infinito. Si entra un pensamiento, repite suavemente: 'No pienses, no pienses, no pienses'.\n\n" +
            "Respira hondo... Todo está en orden aquí.";
        } else if (lowerMsg.includes("desvelo") || lowerMsg.includes("3 am") || lowerMsg.includes("desperte") || lowerMsg.includes("mitad de la noche") || lowerMsg.includes("reloj")) {
          fallbackText = "Despertarse de madrugada es totalmente normal, pero dar vueltas y calcular las horas activa el cortisol. Apliquemos el Protocolo de Rescate Activo de las 3 AM:\n\n" +
            "1. ¡Prohibido mirar la hora! Ver el reloj digital activa la ansiedad por desempeño nocturno.\n" +
            "2. Sal de la cama inmediatamente. No asocies el colchón con frustración.\n" +
            "3. Trasládate a otra habitación con luz muy tenue y realiza una tarea física monótona como doblar ropa o leer un texto aburrido (evita pantallas).\n" +
            "4. Regresa al dormitorio solo cuando sientas señales físicas de sueño verdadero (bostezos, párpados pesados).\n\n" +
            "Confía en tu biología, el sueño volverá de inmediato al apagar la alerta.";
        } else if (lowerMsg.includes("bucle") || lowerMsg.includes("pensamientos") || lowerMsg.includes("mañana") || lowerMsg.includes("parar") || lowerMsg.includes("mente")) {
          fallbackText = "Tu cerebro está atrapado en un bucle de hiperalerta cognitiva. Recuerda: tu mente no ha perdido la capacidad de dormir, solo lo ha olvidado por esta noche.\n\n" +
            "Prueba el Método Militar de saturación mental. Elige una de estas opciones durante 10 segundos:\n" +
            "• Opción A (La Canoa): Imagínate recostado boca arriba en una canoa que flota tranquilamente en un lago perfectamente plano y silencioso.\n" +
            "• Opción B (La Hamaca): Visualízate en una comodísima hamaca de terciopelo negro dentro de una habitación totalmente oscura e infinitamente silenciosa.\n\n" +
            "Al ocupar tu memoria de trabajo con esta imagen estática, impides que los pensamientos del mañana ganen terreno. Suelta el control.";
        } else if (lowerMsg.includes("comer") || lowerMsg.includes("cena") || lowerMsg.includes("dieta") || lowerMsg.includes("hambre") || lowerMsg.includes("suplemento") || lowerMsg.includes("magnesio") || lowerMsg.includes("teanina") || lowerMsg.includes("platano") || lowerMsg.includes("cafe")) {
          fallbackText = "Hablemos de Crononutrición, la comida afecta directamente tus neurotransmisores nocturnos (Triptófano -> 5-HTP -> Serotonina -> Melatonina):\n\n" +
            "• Protocolo 3-2-1-0: Cenar al menos 3 horas antes de dormir para que la temperatura central de tu cerebro disminuya de 1°C a 2°C, activando el interruptor del sueño profundo. Si tienes un vacío estomacal insoportable, come 5 nueces o almendras; estabilizan la glucemia sin reactivar el metabolismo.\n" +
            "• Alimentos clave: Plátanos (ricos en triptófano y magnesio) y Kiwis (comer dos kiwis 1h antes reduce la latencia de sueño).\n" +
            "• Suplementos sugeridos: Glicinato de Magnesio (200-400mg, 60m antes) y L-Teanina (100-200mg con la cena/45m antes).\n" +
            "• Límite estricto de cafeína: ¡Toque de queda absoluto a partir de las 2:00 PM!";
        } else if (lowerMsg.includes("meditacion") || lowerMsg.includes("guiada") || lowerMsg.includes("desconexion") || lowerMsg.includes("respirar") || lowerMsg.includes("ejercicio")) {
          fallbackText = "Vamos a iniciar una micro-sesión de 'Desconexión Cero' para calmar tu mente. Cierra suavemente tus ojos...\n\n" +
            "Enfócate en tu respiración. Visualiza que el aire limpio que entra es una brisa fría y azul que calma tus pensamientos acelerados... y que al exhalar liberas una bruma gris con toda tu tensión.\n" +
            "Comencemos una cuenta progresiva interna:\n" +
            "• 10... descendiendo más y más profundo...\n" +
            "• 9... todo tu cuerpo se apaga lentamente...\n" +
            "• 8... la calma te envuelve por completo...\n" +
            "• 7... te dejas llevar por la gravedad...\n" +
            "• 6... tu mente se siente agradablemente difusa...\n\n" +
            "No hay nada que planificar. El mundo exterior puede esperar tranquilamente.";
        } else {
          fallbackText = "Bienvenido a Insomnio Cero. Estoy aquí en el silencio de la noche como tu sedante digital.\n\n" +
            "Para ayudarte mejor, cuéntame: ¿estás en la cama intentando dormir, te has despertado a mitad de la noche, o te gustaría conocer las pautas de Crononutrición y el Protocolo 3-2-1-0 de nuestro manual?\n\n" +
            "Respira hondo... suelta los hombros... todo está bien.";
        }
        return res.json({ text: fallbackText, offline: true });
      }

      const systemInstruction = 
        "Eres 'IA de Calma', el terapeuta y colega de neuro-reprogramación nocturna oficial integrado en 'Insomnio Cero'. " +
        "Tu objetivo es actuar como un sedante digital y un espacio de descompresión mental altamente tranquilo, compasivo y científico para personas que sufren de insomnio o ansiedad nocturna.\n\n" +
        "FILOSOFÍA Y METODOLOGÍA (Sigue rigurosamente el manual de Insomnio Cero):\n" +
        "1. No uses consejos genéricos, condescendientes ni obvios como 'toma un té de manzanilla'. En su lugar, enseña técnicas de ingeniería biológica.\n" +
        "2. Si el usuario está ansioso, guiño rápido de respiración y recomiéndale el MÉTODO MILITAR DE 120 SEGUNDOS:\n" +
        "   - Desconexión facial: relajar 40+ músculos, párpados pesados, mandíbula suelta, lengua relajada en el suelo de la boca.\n" +
        "   - Hombros y brazos laxos. Si hay tensión muscular, apretar 3 segundos y soltar.\n" +
        "   - Exhalar profundamente y dejar el control automático al diafragma.\n" +
        "   - Piernas relajadas como peso muerto entregado a la gravedad.\n" +
        "   - Bloqueo mental por 10 segundos: Opción A (canoa en lago plano y cielo azul infinito), Opción B (hamaca de terciopelo negro en habitación oscura y silenciosa), u Opción C (Mantra: 'no pienses').\n" +
        "3. Si se despierta a las 3 AM o a mitad de la noche, enséñale el PROTOCOLO DE RESCATE ACTIVO A LAS 3 AM:\n" +
        "   - ¡PROHIBIDO MIRAR LA HORA! Genera ansiedad por desempeño nocturno.\n" +
        "   - Sal de la cama si lleva más de 20 minutos sin poder conciliar el sueño.\n" +
        "   - Ve a otra habitación con luz tenue y realiza una tarea física aburrida (doblar ropa limpia, leer textos interactivos o técnicos sin pantallas).\n" +
        "   - Regresa al dormitorio solo cuando sienta señales físicas claras (bostezos, párpados pesados).\n" +
        "4. Si pregunta sobre alimentos, dieta, cafeína o suplementos, enséñale la CRONONUTRICIÓN:\n" +
        "   - El proceso biológico: Triptófano -> 5-HTP -> Serotonina -> Melatonina.\n" +
        "   - Los 3 Superalimentos: Plátanos (potasio, triptófano, B6), almendras (grasas saludables, magnesio que modula GABA), y kiwis (dos kiwis una hora antes de dormir reduce significativamente el tiempo de latencia).\n" +
        "   - Stack de suplementación inteligente: Glicinato de Magnesio (200-400 mg 60 min antes de acostarse para estimular receptores GABA) y L-Teanina (100-200 mg con la cena o 45 min antes, incrementa ondas Alfa).\n" +
        "   - Toque de queda estricto de cafeína después de las 2:00 PM (vida media de 6 horas, bloquea receptores de adenosina).\n" +
        "5. El PROTOCOLO 3-2-1-0:\n" +
        "   - 3 Horas Antes: Cero Comida (la digestión eleva la temperatura corporal central y el cerebro necesita bajar ~1°C o 2°C para sueño profundo). Si tiene hambre voraz, aconseja un snack ligero de 5 almendras/nueces.\n" +
        "   - 2 Horas Antes: Cero Trabajo (corte cognitivo para apagar cortisol).\n" +
        "   - 1 Hora Antes: Cero Pantallas (luz azul frena en seco la melatonina).\n" +
        "   - 0 Veces Posponer la Alarma (Snooze) por la mañana (fragmenta el ciclo y genera inercia de sueño).\n" +
        "6. GUION DE MEDITACIÓN GUIADA 'DESCONEXIÓN CERO':\n" +
        "   - Puedes guiarlo paso a paso haciendo una cuenta regresiva del 10 al 1 de manera sumamente pausada, invitándolo a relajar cada parte de su cuerpo y concentrarse en el aire frío que calma sus ideas.\n\n" +
        "TONO Y FORMATO DE RESPUESTA:\n" +
        "- Responde siempre en español con un tono extremadamente suave, pausado, poético, empático y tranquilizador.\n" +
        "- Sé breve y estructurado en párrafos sumamente cortos de 2 o 3 líneas, fácil de leer en la noche bajo pantallas con luz tenue.\n" +
        "- Utiliza negrita sutilmente para destacar términos de tranquilidad o técnicas (ej: **Método Militar**, **Protocolo de Rescate Activo**, **Glicinato de Magnesio**).\n" +
        "- Evita adornos informáticos, métricas, pings o textos técnicos fuera de contexto. Concéntrate puramente en el florecimiento de la salud de su descanso.";

      // format contents with history
      const contentsList: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((h: any) => {
          contentsList.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      contentsList.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });

      res.json({ text: response.text || "La calma regresa a tu mente lentamente. Descansa..." });
    } catch (error: any) {
      console.error("Gemini Chat API Error:", error);
      res.status(500).json({ error: "Surgió un pequeño eco en la calma del servidor. Por favor, concéntrate en tu respiración mientras lo sincronizamos." });
    }
  });

  // API Route: Dinner Suggestion based on Circadian Chrono-nutrition
  app.post("/api/dinner-suggestion", async (req, res) => {
    try {
      const { mood } = req.body;
      const client = getAiClient();

      if (!client) {
        // High quality fallbacks when API key isn't setup
        const recipes = [
          {
            recipeName: "Salmón al vapor con espárragos y nueces",
            ingredients: ["150g de filete de salmón fresco", "1 taza de espárragos trigueros", "1 cucharada de nueces picadas", "1 cucharadita de aceite de oliva", "Una pizca de sal marina"],
            preparation: "Cocina el salmón y los espárragos al vapor durante unos 10-12 minutos hasta que estén tiernos. Emplata con un hilo fino de aceite de oliva y espolvorea las nueces trituradas encima por su textura crujiente.",
            benefits: "Rico en Omega-3, Magnesio y Zinc para facilitar la transición hacia la arquitectura del sueño REM profundo y relajar el pulso muscular.",
            idealTiming: "Cenar idealmente 3 horas antes de acostarse para digestión completa."
          },
          {
            recipeName: "Crema templada de calabaza con semillas de sésamo",
            ingredients: [
              "200g de calabaza madura cocida",
              "1/2 taza de leche de almendras sin azúcar",
              "1 cucharada de semillas de calabaza tostadas",
              "Una pizca de nuez moscada y cúrcuma"
            ],
            preparation: "Tritura la calabaza cocida caliente junto a la leche de almendras tibia y las especias hasta obtener una textura tersa y homogénea. Sirve en un cuenco tibio adornado con las semillas.",
            benefits: "La calabaza aporta carbohidratos complejos que estimulan la secreción controlada de insulina, facilitando al cerebro la absorción de triptófano purificador.",
            idealTiming: "Consumir tibio de 2 a 3 horas antes de dormir."
          },
          {
            recipeName: "Pavito a la plancha con puré ligero de coliflor",
            ingredients: [
              "150g de pechuga de pavo",
              "1 taza de ramilletes de coliflor cocidos",
              "1 cucharadita de ghee o mantequilla clarificada",
              "Pizca de romero fresco"
            ],
            preparation: "Dorar el pavo sazonado con romero a la plancha con el ghee. Tritura la coliflor con sal y pimienta hasta simular un puré suave de textura sedosa.",
            benefits: "El pavo es una excelente fuente biológica de Triptófano limpio, el precursor de la melatonina inductora del sueño reconfortante.",
            idealTiming: "Cenar temprano, 3 horas antes de acostarse."
          }
        ];
        // Selected randomly
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        return res.json(randomRecipe);
      }

      const promptMsg = mood 
        ? `Sugiere una cena ideal de descompresión neural dadas las sensaciones del usuario: "${mood}".`
        : "Sugiere una cena ideal equilibrada, de bajo índice glucémico y rica en precursores del sueño para esta noche.";

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          recipeName: { type: Type.STRING, description: "El nombre de la receta nocturna" },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "La lista de ingredientes necesarios" },
          preparation: { type: Type.STRING, description: "Pasos breves de cocción o preparación" },
          benefits: { type: Type.STRING, description: "Por qué ayuda al sueño nocturno (magnesio, triptófano, etc.)" },
          idealTiming: { type: Type.STRING, description: "Momento idóneo para cenar con base en el ritmo circadiano" }
        },
        required: ["recipeName", "ingredients", "preparation", "benefits", "idealTiming"],
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMsg,
        config: {
          systemInstruction: 
            "Eres el Diseñador Nutricional de la app de descanso 'Insomnia 0'. Tu objetivo es sugerir cenas ideales " +
            "bajas en índice glucémico, fáciles de digerir y ricas en triptófano, magnesio y zinc. Responde estrictamente con formato JSON.",
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.5,
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (e: any) {
      console.error("Dinner suggest error:", e);
      res.status(500).json({ error: "Surgió una interrupción en el Bio-diseño culinario." });
    }
  });

  // API Route: Analyze Sleep Notes & Generate Personalized Recommendations
  app.post("/api/analyze-sleep-notes", async (req, res) => {
    try {
      const { notes, logsHistory } = req.body;
      const client = getAiClient();

      if (!client) {
        // High quality offline fallback
        let fallbackMsg = "### Análisis de Calma (Modo Offline o sin API Key)\n\n" +
          "Hemos detectado tus notas y nivel de energía. Aquí tienes algunas recomendaciones biológicas basadas en tu registro:\n\n" +
          "1. **Estabilidad Térmica**: Intenta mantener tu habitación a 18°C. El cuerpo necesita disipar calor para iniciar las fases de sueño profundo.\n" +
          "2. **Higiene Lumínica**: Asegúrate de apagar las pantallas 1 hora antes de acostarte. La luz azul detiene la síntesis natural de Melatonina.\n" +
          "3. **Saturación Cognitiva**: Si tuviste despertares o pensamientos rumiativos, antes de dormir realiza el *Método Militar de 120s* o la técnica de la canoa en el lago.\n\n" +
          "Mantén tu rutina de desactivación constante.";
        return res.json({ analysis: fallbackMsg, offline: true });
      }

      let prompt = "";
      if (notes) {
        prompt += `El usuario ha escrito la siguiente nota de sueño para hoy:\n"${notes}"\n\n`;
      }
      if (logsHistory && Array.isArray(logsHistory) && logsHistory.length > 0) {
        prompt += `Historial de registros de sueño recientes:\n`;
        logsHistory.forEach((log: any) => {
          prompt += `- Día ${log.dayNum}: Energía ${log.wakeEnergy}/10, 3-2-1 cumplido: ${log.complied321 ? "SÍ" : "NO"}. Notas: "${log.notes}"\n`;
        });
      }

      prompt += `\nGenera un análisis breve (máximo 4 párrafos cortos o viñetas muy limpias) con:\n` +
        `1. Diagnóstico breve de su estado (ej: hiperalerta cortical, desalineación circadiana, buena inercia de sueño, etc.).\n` +
        `2. Recomendaciones personalizadas y sumamente prácticas basadas en el método militar o crononutrición para mejorar la calidad del sueño de la noche siguiente.\n\n` +
        `Sé sumamente empático, poético y científico. Háblale con tranquilidad en español. Destaca palabras clave en negrita.`;

      const systemInstruction = 
        "Eres 'Coach de Calma', el especialista en neuro-reprogramación nocturna y biorritmos de la app 'Insomnio Cero'. " +
        "Tu misión es analizar las notas subjetivas de sueño del usuario y proporcionarle un resumen diagnóstico sumamente corto, alentador, " +
        "científico y recomendaciones de conducta biológica concretas (sin clichés habituales) para su próxima noche. Responde en un español sumamente " +
        "tranquilizador y poético con párrafos compactos y estructurados con Markdown.";

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ analysis: response.text || "La calma nos envuelve. No hemos podido procesar el análisis, pero mantén la fe en tu respiración." });
    } catch (error: any) {
      console.error("Analyze sleep notes error:", error);
      res.status(500).json({ error: "Surgió un pequeño eco en el análisis de calma. Revisa tu conexión circadiana." });
    }
  });

  // Enable Vite middleware in development or direct static handler in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} mode.`);
  });
}

startServer();
