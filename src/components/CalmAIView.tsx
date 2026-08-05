import { useState, useRef, useEffect } from "react";
import { Send, Mic, Radio, Smartphone, AlertCircle, Compass, Smile } from "lucide-react";
import { ChatMessage } from "../types";

export default function CalmAIView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "model",
      text: "Hola, soy tu IA de Calma. Estoy aquí para ofrecerte un santuario mental y liberarte del peso de tus pensamientos antes de cerrar la noche. Cuéntame, ¿qué sensaciones viajan contigo hoy?",
      timestamp: "Hace un momento"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micSimulationText, setMicSimulationText] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chats to the latest
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Assemble history format for standard multi-turn Gemini API
      const historyList = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/calma-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyList })
      });

      if (res.ok) {
        const data = await res.json();
        const responseMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "model",
          text: data.text,
          timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, responseMsg]);
      } else {
        throw new Error("Chat fetch failed.");
      }
    } catch (e) {
      console.warn("Calm API failed, using fallback.", e);
      const errResponse: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: "Siento un pequeño eco de ruido eléctrico en mis canales de calma. Concentrémonos juntos en inspirar hondo... exhalar largo... cuéntame, ¿cómo se siente tu cuerpo ahora?",
        timestamp: "Ahora"
      };
      setMessages((prev) => [...prev, errResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (feeling: string) => {
    let prompt = "";
    if (feeling === "Siento ansiedad") {
      prompt = "Tengo algo de ansiedad esta noche y no puedo calmar mi corazón.";
    } else if (feeling === "Día agotador") {
      prompt = "He tenido un día extenuante y mi cuerpo está tenso, pero mi mente sigue despierta.";
    } else if (feeling === "Pensamientos en bucle") {
      prompt = "Tengo pensamientos circulares sobre un pendiente de mañana y no puedo dormir.";
    }
    handleSendMessage(prompt);
  };

  // Simulate microphone recording transcribe
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setMicSimulationText("Escuchando tu respiración y ritmo...");
      const simulatedSentences = [
        "Siento que mañana será un día difícil",
        "Tengo un nudo en el estómago que me impide relajarme",
        "Solo quiero apagar mis pensamientos y dormir profundamente"
      ];
      
      const randomText = simulatedSentences[Math.floor(Math.random() * simulatedSentences.length)];

      setTimeout(() => {
        setMicSimulationText(`Transcribiendo: "${randomText}"`);
        setTimeout(() => {
          setIsListening(false);
          setInputText(randomText);
          setMicSimulationText("");
        }, 1200);
      }, 2000);
    } else {
      setIsListening(false);
      setMicSimulationText("");
    }
  };

  return (
    <div id="calm-ai-view" className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-lg mx-auto flex flex-col min-h-[75vh]">
      
      {/* Centerpiece Pulsing Holographic Orb and Welcoming Status */}
      <section className="flex flex-col items-center justify-center py-4 relative group">
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          {/* Ambient Glows */}
          <div className="absolute w-[130%] h-[130%] rounded-full bg-primary/12 blur-[50px] animate-pulse pointer-events-none -z-10" />
          <div className="absolute w-[90%] h-[90%] rounded-full bg-[#818cf8]/10 blur-[35px] animate-pulse pointer-events-none -z-10" />
          
          {/* Equalizer rings when listening, or spinning gears inside orb */}
          <div 
            className={`absolute inset-0 rounded-full border-2 border-primary/20 transition-all duration-700 ${
              isListening || loading ? "scale-110 border-dashed animate-spin" : "scale-100 opacity-60"
            }`} 
          />

          {/* Central main glowing orb */}
          <div 
            id="ai-centerpiece-orb"
            onClick={toggleListening}
            className={`w-36 h-36 aspect-square rounded-full bg-gradient-to-br from-[#bdc2ff] to-[#4953bc] flex items-center justify-center transition-all duration-700 cursor-pointer relative z-10 ${
              loading ? "shadow-[0_0_90px_rgba(189,194,255,0.65)] scale-105" : "shadow-[0_0_50px_rgba(189,194,255,0.35)]"
            }`}
          >
            {loading ? (
              <Radio className="w-10 h-10 text-white animate-pulse" />
            ) : isListening ? (
              <div className="flex gap-1 items-center justify-center">
                <span className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.8s_infinite_-0.2s]" />
                <span className="w-1.5 h-8 bg-white rounded-full animate-[bounce_0.8s_infinite]" />
                <span className="w-1.5 h-6 bg-white rounded-full animate-[bounce_0.8s_infinite_-0.2s]" />
              </div>
            ) : (
              <Compass className="w-9 h-9 text-white/80 transition-transform group-hover:rotate-45 duration-700" />
            )}
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-primary tracking-tight">Cuéntame, estoy aquí</h3>
          <p className="text-xs text-text-muted max-w-xs leading-normal">
            Expresa tus preocupaciones para desinflar el cortisol antes de cerrar tus ojos.
          </p>
          {micSimulationText && (
            <div className="mt-2 text-xs font-semibold text-primary animate-pulse">
              {micSimulationText}
            </div>
          )}
        </div>
      </section>

      {/* Chat transcripts thread */}
      <section className="flex-1 bg-white rounded-3xl p-4 sm:p-5 h-72 overflow-y-auto flex flex-col gap-4 border border-indigo-100/75 shadow-sm shadow-indigo-100/40">
        {messages.map((m) => (
          <div 
            id={`message-bubble-${m.id}`}
            key={m.id} 
            className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-primary-container/40 text-text-primary self-end rounded-tr-none border border-primary/10"
                : "bg-slate-50 text-text-primary self-start rounded-tl-none border border-indigo-100/30"
            }`}
          >
            <p className="whitespace-pre-line">{m.text}</p>
            <span className="block text-[9px] text-text-muted mt-1.5 text-right font-mono opacity-80">
              {m.timestamp}
            </span>
          </div>
        ))}
        {loading && (
          <div className="bg-slate-50 text-text-primary self-start rounded-2xl rounded-tl-none p-4 max-w-[80%] border border-indigo-100/30 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="text-[11px] text-text-muted ml-1">Escribiendo tranquilidad...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </section>

      {/* Recommended prompt chips */}
      <section className="flex flex-wrap justify-center gap-2">
        {["Siento ansiedad", "Día agotador", "Pensamientos en bucle"].map((chip) => (
          <button
            id={`chat-chip-${chip.replace(/\s+/g, '-').toLowerCase()}`}
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="px-3 py-1.5 rounded-full border border-indigo-100 bg-white shadow-xs text-xs text-text-primary hover:bg-primary-container hover:text-primary transition-all duration-300 font-semibold cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </section>

      {/* Input container bar */}
      <section className="flex gap-2 items-center">
        <div className="flex-1 bg-white rounded-full p-2 pl-4 pr-2 flex items-center gap-2 border border-indigo-100 hover:border-primary/20 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/40">
          <input
            id="chat-text-input-field"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
            placeholder="Escribe lo que corre por tu mente..."
            disabled={isListening}
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-text-primary focus:ring-0 placeholder:text-text-muted outline-none"
          />
          <button
            id="chat-send-message-trigger"
            onClick={() => handleSendMessage(inputText)}
            className="w-10 h-10 rounded-full bg-primary hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-indigo-100"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4 ml-0.5 text-white fill-white" />
          </button>
        </div>

        {/* Voice Microphone float */}
        <button
          id="chat-mic-record-simulator"
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full bg-white border flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm ${
            isListening 
              ? "bg-[#818cf8]/20 border-primary shadow-sm" 
              : "border-indigo-100 hover:border-primary text-primary"
          }`}
          title="Grabar nota de voz"
        >
          <Mic className={`w-5 h-5 ${isListening ? "animate-pulse text-primary" : ""}`} />
        </button>
      </section>

    </div>
  );
}
