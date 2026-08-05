import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface SleepBreatherProps {
  onClose: () => void;
  initialType?: "military" | "rescate";
}

type BreathPhase = "idle" | "inhale" | "holdIn" | "exhale" | "holdOut";

export default function SleepBreather({ onClose, initialType = "military" }: SleepBreatherProps) {
  const [phase, setPhase] = useState<BreathPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // States for the 3:00 AM Rescue decision algorithm
  const [rescueDecision, setRescueDecision] = useState<"yes" | "no" | null>(null);
  const [showRescuerInfo, setShowRescuerInfo] = useState<boolean>(initialType === "rescate");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play peaceful synth pitch based on phase
  const playTone = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio exception:", e);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Switch phase
          let nextPhase: BreathPhase = "idle";
          let nextDuration = 4;

          setPhase((currentPhase) => {
            switch (currentPhase) {
              case "idle":
                nextPhase = "inhale";
                nextDuration = 4;
                playTone(330, 2); // E4 tone for inhalation
                break;
              case "inhale":
                nextPhase = "holdIn";
                nextDuration = 4;
                playTone(392, 1); // G4 tone for hold
                break;
              case "holdIn":
                nextPhase = "exhale";
                nextDuration = 4;
                playTone(261, 3.5); // C4 tone for warm exhalation
                break;
              case "exhale":
                // In military method/box breathing, we usually hold out too. Or we can loop back.
                nextPhase = "holdOut";
                nextDuration = 4;
                playTone(293, 1); // D4 hold-out tone
                break;
              case "holdOut":
                nextPhase = "inhale";
                nextDuration = 4;
                playTone(330, 2);
                setCyclesCompleted((c) => c + 1);
                break;
              default:
                nextPhase = "inhale";
                nextDuration = 4;
            }
            return nextPhase;
          });
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, soundEnabled]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state !== "closed") {
          try {
            audioCtxRef.current.close();
          } catch (e) {}
        }
        audioCtxRef.current = null;
      }
    };
  }, []);

  const startSession = () => {
    setIsActive(true);
    setPhase("inhale");
    setSecondsLeft(4);
    playTone(330, 2);
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resetSession = () => {
    setIsActive(false);
    setPhase("idle");
    setSecondsLeft(4);
    setCyclesCompleted(0);
  };

  const getPhaseConfig = () => {
    switch (phase) {
      case "inhale":
        return {
          title: "Inhala...",
          instruction: "Llena tus pulmones con aire fresco y renovador.",
          scale: 1.3,
          color: "rgba(189, 194, 255, 0.8)",
          glow: "rgba(189, 194, 255, 0.4)"
        };
      case "holdIn":
        return {
          title: "Retén...",
          instruction: "Mantén el aire suspendido, permitiendo calma celular.",
          scale: 1.3,
          color: "rgba(129, 140, 248, 0.8)",
          glow: "rgba(129, 140, 248, 0.5)"
        };
      case "exhale":
        return {
          title: "Exhala...",
          instruction: "Suelta lentamente toda tensión y peso del pecho.",
          scale: 1.0,
          color: "rgba(184, 196, 255, 0.6)",
          glow: "rgba(184, 196, 255, 0.2)"
        };
      case "holdOut":
        return {
          title: "Espera...",
          instruction: "Disfruta del vacío del silencio antes de recomenzar.",
          scale: 1.0,
          color: "rgba(129, 140, 248, 0.45)",
          glow: "rgba(129, 140, 248, 0.15)"
        };
      default:
        return {
          title: "Listo para comenzar",
          instruction: "Toma asiento de forma cómoda o túmbate en tu cama.",
          scale: 1.0,
          color: "rgba(255, 255, 255, 0.15)",
          glow: "transparent"
        };
    }
  };

  const config = getPhaseConfig();

  if (initialType === "rescate" && showRescuerInfo) {
    return (
      <div id="sleep-breather-wizard" className="fixed inset-0 z-50 bg-[#05101a]/98 backdrop-blur-3xl flex flex-col items-center justify-between p-6 overflow-y-auto font-sans">
        <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
          <div className="absolute w-[80%] aspect-square rounded-full blur-[130px] opacity-15 bg-blue-500" />
        </div>

        <header className="w-full max-w-md flex justify-between items-center py-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#818cf8] tracking-[0.2em] uppercase font-bold">Despertar Nocturno</span>
            <h2 className="text-xl font-bold text-slate-100">Algoritmo Rescate 3AM</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center py-6">
          <AnimatePresence mode="wait">
            {rescueDecision === null ? (
              <motion.div 
                key="q"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl mx-auto shadow-inner">
                  <span>⏰</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                    ¿Llevas más de 20 minutos despierto y con frustración?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Si te desvelas y aparece el agobio, tu cerebro entra en bucle de alerta y segrega cortisol. Evaluemos tu situación con rigor.
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setRescueDecision("yes")}
                    className="flex-1 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-950/30 transition-all active:scale-95 cursor-pointer"
                  >
                    SÍ, estoy desvelado
                  </button>
                  <button
                    onClick={() => setRescueDecision("no")}
                    className="flex-1 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-sm transition-all active:scale-95 cursor-pointer"
                  >
                    NO, solo quiero relajarme
                  </button>
                </div>
              </motion.div>
            ) : rescueDecision === "yes" ? (
              <motion.div 
                key="yes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-indigo-500/[0.02] border border-indigo-500/20 p-6 rounded-[2rem] space-y-6 text-left"
              >
                <div className="flex items-center gap-2 text-[#818cf8]">
                  <span className="text-xl">⚠️</span>
                  <span className="text-xs font-bold uppercase tracking-widest font-mono">Rescate Circadiano Activado</span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex gap-2">
                      <span className="text-indigo-400">1.</span>
                      <span>Sal de la cama inmediatamente</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                      No permitas que tu subconsciente asocie el colchón con el insomnio, la tensión o la vigilia ansiosa.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex gap-2">
                      <span className="text-indigo-400">2.</span>
                      <span>Transfiérete a otro espacio físico</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                      Ve a una estancia adyacente con luz muy tenue y realiza algo de ínfima demanda cognitiva (ej. doblar ropa, leer).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex gap-2">
                      <span className="text-indigo-400">3.</span>
                      <span>Prohibido consultar la hora</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                      Mirar el reloj activa el cómputo inconsciente de horas de descanso restantes, disparando el cortisol.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex gap-2">
                      <span className="text-indigo-400">4.</span>
                      <span>Regresa únicamente al bostezar</span>
                    </h4>
                    <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                      Vuelve al lecho solo cuando sientas pesadez real de párpados o sueño biológico inminente.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setShowRescuerInfo(false)}
                    className="w-full py-3 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  >
                    Hacer respiración sedante ahora
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  >
                    Entendido, saldré de la cama
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="no"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-emerald-500/[0.02] border border-emerald-500/20 p-6 rounded-[2rem] space-y-6 text-left"
              >
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="text-xl">✓</span>
                  <span className="text-xs font-bold uppercase tracking-widest font-mono text-emerald-400">Preservar Estado de Calma</span>
                </div>

                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    El micro-despertar es un acontecimiento biológico habitual e inocuo. Recuperarás la inercia del sueño si no le dedicas atención voluntaria ni cálculos de angustia.
                  </p>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Táctica de Apoyo:</h5>
                    <p className="text-xs text-slate-400 leading-relaxed font-serif italic">
                      &quot;Aplica el Paso 5 del Método Militar: visualízate tumbado confortablemente en una canoa en un lago inmóvil o en una hamaca de terciopelo negro bajo un cielo estrellado.&quot;
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setShowRescuerInfo(false)}
                    className="w-full py-3 rounded-full bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all active:scale-95 cursor-pointer"
                  >
                    Iniciar respiración de rescate
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                  >
                    Cerrar y dormir
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="w-full max-w-md py-4 text-center">
          <p className="text-[10px] text-slate-500">
            Regla de oro circadiana: nunca asocies tu cama con estados de angustia.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div id="sleep-breather" className="fixed inset-0 z-50 bg-[#05101a]/95 backdrop-blur-3xl flex flex-col items-center justify-between p-6 overflow-y-auto">
      {/* Background radial soft light */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute w-[80%] aspect-square rounded-full transition-all duration-1000 blur-[130px] opacity-20"
          style={{ backgroundColor: config.glow }}
        />
      </div>

      {/* Header bar */}
      <header className="w-full max-w-md flex justify-between items-center py-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-primary tracking-[0.2em] uppercase font-semibold">Técnica Neurológica</span>
          <h2 className="text-xl font-medium text-text-primary">
            {initialType === "military" ? "Método Militar" : "Rescate 3 AM"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            id="breather-sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-10 h-10 rounded-full glass-card hover:bg-white/10 flex items-center justify-center text-text-muted transition-all active:scale-95"
            title={soundEnabled ? "Silenciar tonos" : "Activar tonos sedantes"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>
          <button 
            id="breather-close-button"
            onClick={onClose}
            className="w-10 h-10 rounded-full glass-card hover:bg-red-500/20 flex items-center justify-center text-text-muted hover:text-red-400 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Central Interactive Orb animating with current stage */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center py-8">
        <div className="relative w-72 h-72 flex items-center justify-center">
          
          {/* Animated pulsing outer halos */}
          <AnimatePresence mode="popLayout">
            {phase !== "idle" && (
              <motion.div
                key={phase}
                initial={{ opacity: 0.1, scale: 0.8 }}
                animate={{ 
                  opacity: [0.1, 0.4, 0.1], 
                  scale: phase === "inhale" || phase === "holdIn" ? [1.1, 1.4, 1.1] : [1.0, 1.15, 1.0]
                }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full border border-primary/20 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Central orb */}
          <motion.div
            animate={{ 
              scale: config.scale,
              boxShadow: `0 0 80px ${config.glow}`
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            style={{ backgroundColor: config.color }}
            className="w-48 h-48 rounded-full flex flex-col items-center justify-center border border-white/10 relative transition-colors duration-1000 cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {phase === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={startSession}
                  className="flex flex-col items-center text-center p-4 hover:scale-105 transition-all text-on-surface"
                >
                  <Play className="w-12 h-12 text-primary mb-2 fill-primary/10" />
                  <span className="text-xs uppercase tracking-widest font-medium text-primary">Comenzar</span>
                </motion.div>
              ) : (
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex flex-col items-center text-center p-4"
                >
                  <span className="text-3xl font-light text-text-primary mb-1">{secondsLeft}s</span>
                  <span className="text-xs tracking-wider uppercase font-semibold text-white/50">{config.title}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Text descriptions below the orb */}
        <div className="text-center mt-8 space-y-2 px-6">
          <h3 className="text-2xl font-medium text-text-primary tracking-tight h-8">
            {phase !== "idle" && config.title}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed h-12 transition-all">
            {config.instruction}
          </p>
        </div>

        {/* Informative Stats */}
        {phase !== "idle" && (
          <div className="mt-6 flex flex-wrap gap-4 justify-center text-center">
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-primary">
              Fase: <strong className="uppercase">{phase}</strong>
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-primary">
              Ciclos: <strong>{cyclesCompleted}</strong>
            </span>
          </div>
        )}
      </main>

      {/* Control panel buttons at bottom */}
      <footer className="w-full max-w-md py-6 flex flex-col items-center gap-4">
        {phase !== "idle" ? (
          <div className="flex items-center gap-4">
            <button 
              id="breather-play-pause"
              onClick={isActive ? pauseSession : startSession}
              className="px-8 py-3.5 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-on-primary" />}
              {isActive ? "Pausar" : "Reanudar"}
            </button>
            <button 
              id="breather-reset"
              onClick={resetSession}
              className="w-12 h-12 rounded-full glass-card hover:bg-white/10 text-text-muted hover:text-white flex items-center justify-center transition-all active:scale-95"
              title="Reiniciar"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button 
            id="breather-start-trigger"
            onClick={startSession}
            className="w-full py-4.5 rounded-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-semibold tracking-wider hover:brightness-110 shadow-xl transition-all text-center uppercase"
          >
            Iniciar Respiración Consciente
          </button>
        )}
        <p className="text-[11px] text-text-muted/60 text-center max-w-xs mt-2 leading-relaxed">
          {initialType === "military" 
            ? "Técnica militar de desactivación por escaneo corporal. Libera rostro, hombros y expira profundamente para conciliar sueño rápido."
            : "Descomprensión de emergencia para despertares nocturnos a las 3:00 AM. Calma el pulso cerebral acelerado."}
        </p>
      </footer>
    </div>
  );
}
