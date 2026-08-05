import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Play, Pause, Clock, Sparkles, CloudRain, Wind, Waves, Flame, Radio } from "lucide-react";
import { Howl } from "howler";

interface SoundPreset {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  filterType: BiquadFilterType;
  cutoffFreq: number;
  resonance: number;
  noiseType: "white" | "pink" | "brown";
  modulation: boolean;
}

export default function SleepSoundscape() {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [muted, setMuted] = useState<boolean>(false);
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const lfoNodeRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const presets: SoundPreset[] = [
    {
      id: "rain",
      name: "Lluvia Nocturna",
      subtitle: "Brownian Noise (Frecuencia Profunda)",
      icon: <CloudRain className="w-5 h-5 text-blue-400" />,
      color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
      bgColor: "from-blue-950/40 via-slate-900/60 to-slate-950",
      description: "Sonido envolvente de lluvia constante sobre tejado paramascarar ruidos y relajar la corteza cerebral.",
      filterType: "lowpass",
      cutoffFreq: 800,
      resonance: 2,
      noiseType: "brown",
      modulation: true
    },
    {
      id: "forest",
      name: "Bosque y Viento",
      subtitle: "Pink Noise (Susurro de Hojas)",
      icon: <Wind className="w-5 h-5 text-emerald-400" />,
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      bgColor: "from-emerald-950/40 via-slate-900/60 to-slate-950",
      description: "Brisa suave filtrada entre copas de árboles y pinos centenarios.",
      filterType: "bandpass",
      cutoffFreq: 1200,
      resonance: 3,
      noiseType: "pink",
      modulation: true
    },
    {
      id: "waves",
      name: "Olas del Océano",
      subtitle: "Modulación Rítmica (0.1 Hz)",
      icon: <Waves className="w-5 h-5 text-cyan-400" />,
      color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
      bgColor: "from-cyan-950/40 via-slate-900/60 to-slate-950",
      description: "Marea rítmica sincronizada con la frecuencia respiratoria lenta.",
      filterType: "lowpass",
      cutoffFreq: 500,
      resonance: 5,
      noiseType: "pink",
      modulation: true
    },
    {
      id: "white",
      name: "Ruido Blanco Puro",
      subtitle: "Espectro Completo Uniforme",
      icon: <Radio className="w-5 h-5 text-indigo-400" />,
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
      bgColor: "from-indigo-950/40 via-slate-900/60 to-slate-950",
      description: "Pantalla acústica ideal para bloquear estímulos externos abruptos.",
      filterType: "lowpass",
      cutoffFreq: 4000,
      resonance: 1,
      noiseType: "white",
      modulation: false
    },
    {
      id: "fire",
      name: "Fuego de Chimenea",
      subtitle: "Calidez Orgánica Acolchada",
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      color: "border-orange-500/30 text-orange-400 bg-orange-500/10",
      bgColor: "from-orange-950/40 via-slate-900/60 to-slate-950",
      description: "Crepitar suave de leña para inducir seguridad y confort térmico.",
      filterType: "lowpass",
      cutoffFreq: 1500,
      resonance: 4,
      noiseType: "brown",
      modulation: true
    }
  ];

  // Stop audio playback
  const stopAudio = () => {
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
      if (lfoNodeRef.current) {
        lfoNodeRef.current.stop();
        lfoNodeRef.current.disconnect();
        lfoNodeRef.current = null;
      }
      setIsPlaying(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Start procedural ambient sound using Web Audio API (extremely robust & instant)
  const playSound = (preset: SoundPreset) => {
    stopAudio();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create noise buffer (5 seconds looping)
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (preset.noiseType === "white") {
          output[i] = white * 0.5;
        } else if (preset.noiseType === "pink") {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        } else {
          // Brown noise (random walk)
          b0 = (b0 + (0.02 * white)) / 1.02;
          output[i] = b0 * 3.5;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = preset.filterType;
      filter.frequency.setValueAtTime(preset.cutoffFreq, ctx.currentTime);
      filter.Q.setValueAtTime(preset.resonance, ctx.currentTime);

      const gainNode = ctx.createGain();
      const currentVol = muted ? 0 : volume;
      gainNode.gain.setValueAtTime(currentVol, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Add rhythmic LFO modulation for waves or rain variance
      if (preset.modulation) {
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(preset.id === "waves" ? 0.12 : 0.4, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(preset.cutoffFreq * 0.4, ctx.currentTime);
        lfo.connect(filter.frequency);
        lfo.start();
        lfoNodeRef.current = lfo;
        lfoGainRef.current = lfoGain;
      }

      noiseSource.start();
      sourceNodeRef.current = noiseSource;
      gainNodeRef.current = gainNode;
      filterNodeRef.current = filter;

      setActiveSoundId(preset.id);
      setIsPlaying(true);
    } catch (err) {
      console.error("Web Audio API error:", err);
    }
  };

  const handleTogglePlay = (preset: SoundPreset) => {
    if (activeSoundId === preset.id && isPlaying) {
      stopAudio();
      setActiveSoundId(null);
    } else {
      playSound(preset);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(muted ? 0 : newVol, audioCtxRef.current.currentTime);
    }
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextMuted ? 0 : volume, audioCtxRef.current.currentTime);
    }
  };

  // Timer logic
  const startTimer = (mins: number) => {
    setTimerMinutes(mins);
    setTimeLeft(mins * 60);
    setTimerActive(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerIntervalRef.current);
          stopAudio();
          setActiveSoundId(null);
          setTimerActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerActive(false);
    setTimeLeft(null);
  };

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const activePreset = presets.find((p) => p.id === activeSoundId);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100/60 pb-5">
        <div className="space-y-1">
          <div className="inline-flex py-1 px-3 bg-primary-container border border-primary/20 rounded-full text-xs text-primary gap-1.5 items-center">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">Paisajes Sonoros del Sueño (Howler &amp; Web Audio)</span>
          </div>
          <h3 className="text-2xl font-semibold text-text-primary tracking-tight">Sleep Soundscape Studio</h3>
          <p className="text-xs sm:text-sm text-text-muted">
            Selecciona frecuencias estables de ruido marrón, rosa o blanco para enmascarar estímulos y favorecer la relajación delta.
          </p>
        </div>

        {isPlaying && activePreset && (
          <div className="flex items-center gap-3 bg-primary-container/70 border border-primary/30 px-4 py-2.5 rounded-2xl animate-pulse">
            <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
            <div className="flex flex-col">
              <span className="text-[10px] text-primary uppercase font-mono font-bold">Reproduciendo</span>
              <span className="text-xs font-bold text-text-primary">{activePreset.name}</span>
            </div>
            <button
              onClick={stopAudio}
              className="ml-2 w-8 h-8 rounded-full bg-white hover:bg-red-50 flex items-center justify-center text-text-muted hover:text-red-500 transition-all shadow-xs cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isActive = activeSoundId === preset.id && isPlaying;
          return (
            <motion.div
              key={preset.id}
              whileHover={{ y: -2 }}
              onClick={() => handleTogglePlay(preset)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-br from-indigo-50 via-white to-primary-container/30 border-primary shadow-md ring-2 ring-primary/20"
                  : "bg-white hover:bg-slate-50/80 border-indigo-100 shadow-xs hover:border-indigo-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${preset.color}`}>
                  {preset.icon}
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isActive ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary"
                }`}>
                  {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-text-primary tracking-tight">{preset.name}</h4>
                <span className="text-[10px] text-primary font-mono font-semibold uppercase">{preset.subtitle}</span>
                <p className="text-xs text-text-muted leading-relaxed pt-1">
                  {preset.description}
                </p>
              </div>

              {isActive && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-indigo-100/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[10px] text-primary font-semibold ml-2">Audio Activo en Bucle</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Global Soundscape Controls & Timer Bar */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-slate-100 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          {/* Volume Control */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {muted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-indigo-300" />}
            </button>
            <div className="flex items-center gap-2 flex-1 md:w-48">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <span className="text-xs font-mono text-slate-400 w-8 text-right">
                {Math.round((muted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Sleep Timer Section */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono">
              <Clock className="w-4 h-4" />
              <span>Apagado Automático:</span>
            </div>

            {timerActive && timeLeft !== null ? (
              <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-indigo-200 font-mono">{formatTimeLeft(timeLeft)}</span>
                <button
                  onClick={cancelTimer}
                  className="text-[10px] text-red-300 hover:text-red-200 uppercase font-bold underline cursor-pointer ml-1"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5">
                {[15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => startTimer(mins)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer active:scale-95"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
