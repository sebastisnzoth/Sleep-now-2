import { useState, useRef, useEffect } from "react";
import { UserProfile } from "../types";
import { User, Bell, Shield, HelpCircle, Moon, Volume2, LogOut, Info, Settings, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
  deepNightActive: boolean;
  onToggleDeepNight: (val: boolean) => void;
}

export default function ProfileView({ user, onLogout, deepNightActive, onToggleDeepNight }: ProfileViewProps) {
  const [ambientSounds, setAmbientSounds] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  // Play a smooth, low-frequency hum (alpha-theta brainwave 110Hz / 114Hz binaural beat or cozy dark drone) for sleep promotion
  useEffect(() => {
    if (ambientSounds) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = audioCtx;

        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        // Binaural sleep drone oscillators
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const mainGain = audioCtx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(100, audioCtx.currentTime); // Low G drone

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(150, audioCtx.currentTime); // Perfect fifth drone

        // Modulate with very low frequency to create rolling waves of soothing comfort
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime); // 0.2Hz wave cycle
        lfoGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

        mainGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

        osc1.connect(mainGain);
        osc2.connect(mainGain);
        lfo.connect(lfoGain);
        lfoGain.connect(mainGain.gain); // modulate gain with lfo

        mainGain.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
        lfo.start();

        nodesRef.current = { osc1, osc2, gain: mainGain };
      } catch (e) {
        console.warn("Synthesizer failed to spin up:", e);
      }
    } else {
      // Turn off
      if (nodesRef.current) {
        try {
          nodesRef.current.osc1.stop();
        } catch (e) {}
        try {
          nodesRef.current.osc2.stop();
        } catch (e) {}
        nodesRef.current = null;
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state !== "closed") {
          try {
            audioCtxRef.current.close();
          } catch (e) {}
        }
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (nodesRef.current) {
        try {
          nodesRef.current.osc1.stop();
        } catch (e) {}
        try {
          nodesRef.current.osc2.stop();
        } catch (e) {}
        nodesRef.current = null;
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state !== "closed") {
          try {
            audioCtxRef.current.close();
          } catch (e) {}
        }
        audioCtxRef.current = null;
      }
    };
  }, [ambientSounds]);

  return (
    <div id="profile-view" className="space-y-8 pb-16 animate-in fade-in duration-500 max-w-lg mx-auto">
      
      {/* Account Info avatar profile header */}
      <section className="bg-gradient-to-br from-white via-white to-primary-container/20 rounded-[2.5rem] p-6 text-center space-y-4 border border-indigo-150 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/6 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative w-24 h-24 mx-auto">
          {/* Pulsing ring around avatar */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse scale-105" />
          <div className="w-24 h-24 bg-[#818cf8] rounded-full flex items-center justify-center border border-indigo-200 shadow-inner relative z-10">
            <span className="text-3xl font-extrabold text-white tracking-widest uppercase">
              {user.name.slice(0, 2)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">{user.name}</h3>
          <p className="text-xs text-text-muted">Miembro desde {user.memberSince}</p>
        </div>

        {/* Level Banner */}
        <div className="py-2 px-4 bg-primary-container border border-primary/25 rounded-full inline-flex items-center gap-1.5 text-xs text-primary font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Explorador Lunar Nivel {user.currentStreak > 3 ? "2" : "1"}</span>
        </div>
      </section>

      {/* Stats row list */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-indigo-100 shadow-xs rounded-2xl p-4 text-center space-y-1">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Calma Actual</p>
          <p className="text-xl font-bold text-primary">{user.currentStreak} días</p>
        </div>
        <div className="bg-white border border-indigo-100 shadow-xs rounded-2xl p-4 text-center space-y-1">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Tasa de Logros</p>
          <p className="text-xl font-bold text-indigo-600">{user.consistencyRate}%</p>
        </div>
      </section>

      {/* Premium Comfort settings triggers */}
      <section className="bg-white border border-indigo-100 shadow-xs rounded-[2rem] p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-indigo-100/60 pb-3">
          <Moon className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-medium text-text-primary">Atmósfera Sensorial</h4>
        </div>

        <div className="space-y-4">
          {/* Blue light simulator toggle */}
          <div className="flex items-center justify-between p-2">
            <div className="space-y-1 flex-1 pr-4">
              <p className="font-semibold text-text-primary text-sm flex items-center gap-2">
                <span>Modo Noche Profunda</span>
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Filtra las ondas de luz azul críticas (simulando lentes ámbar) oscureciendo y entibiando toda la pantalla para salvaguardar tu producción ocular de melatonina.
              </p>
            </div>
            {deepNightActive ? (
              <ToggleRight 
                id="deep-night-toggle-btn"
                className="w-12 h-12 text-primary cursor-pointer active:scale-95 transition-all" 
                onClick={() => onToggleDeepNight(false)} 
              />
            ) : (
              <ToggleLeft 
                id="deep-night-toggle-btn"
                className="w-12 h-12 text-text-muted cursor-pointer active:scale-95 transition-all" 
                onClick={() => onToggleDeepNight(true)} 
              />
            )}
          </div>

          {/* Sound wave synthesize toggle */}
          <div className="flex items-center justify-between p-2 border-t border-indigo-100/60 pt-4">
            <div className="space-y-1 flex-1 pr-4">
              <p className="font-semibold text-text-primary text-sm flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                <span>Sonidos Ambientales</span>
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Activa un suave acorde analógico constante a 100Hz que tranquiliza la amígdala cerebral y enmascara ruidos bruscos del entorno de tu habitación.
              </p>
            </div>
            {ambientSounds ? (
              <ToggleRight 
                id="ambient-sound-toggle-btn"
                className="w-12 h-12 text-primary cursor-pointer active:scale-95 transition-all" 
                onClick={() => setAmbientSounds(false)} 
              />
            ) : (
              <ToggleLeft 
                id="ambient-sound-toggle-btn"
                className="w-12 h-12 text-text-muted cursor-pointer active:scale-95 transition-all" 
                onClick={() => setAmbientSounds(true)} 
              />
            )}
          </div>
        </div>
      </section>

      {/* Account Settings List */}
      <section className="bg-white border border-indigo-100 shadow-xs rounded-[2rem] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-indigo-100/60 pb-3">
          <Settings className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-medium text-text-primary">Opciones de Soporte</h4>
        </div>

        <div className="space-y-1">
          {/* Support items */}
          <button 
            id="account-btn-notifications"
            className="w-full py-3 px-2 rounded-xl text-left hover:bg-slate-50 text-xs sm:text-sm text-text-primary flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-text-muted" />
              <span>Recordatorios circadianos</span>
            </span>
            <span className="text-[10px] bg-primary-container text-primary px-2 py-0.5 rounded-full border border-primary/20 font-semibold">22:00</span>
          </button>

          <button 
            id="account-btn-privacy"
            className="w-full py-3 px-2 rounded-xl text-left hover:bg-slate-50 text-xs sm:text-sm text-text-primary flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-text-muted" />
              <span>Privacidad &amp; Datos cifrados</span>
            </span>
            <span className="text-xs text-text-muted font-bold font-mono">Local ✓</span>
          </button>

          <button 
            id="account-btn-questions"
            className="w-full py-3 px-2 rounded-xl text-left hover:bg-slate-50 text-xs sm:text-sm text-text-primary flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-text-muted" />
              <span>Base educativa de Sleep Now®</span>
            </span>
            <Info className="w-4 h-4 text-text-muted opacity-60" />
          </button>
        </div>
      </section>

      {/* Terminate session */}
      <button
        id="profile-logout-button"
        onClick={onLogout}
        className="w-full py-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 border border-red-200 active:scale-95 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar Sesión</span>
      </button>

    </div>
  );
}
