import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { SleepLog, UserProfile } from "./types";
import TranquilView from "./components/TranquilView";
import DiaryView from "./components/DiaryView";
import CalmAIView from "./components/CalmAIView";
import ProfileView from "./components/ProfileView";
import LoginView from "./components/LoginView";
import SleepBreather from "./components/SleepBreather";
import ELearningView from "./components/ELearningView";
import {
  Home, MoonStar, BookOpen, Sparkles, UserRound, Wind, Headphones,
  PenLine, ChevronRight, Flame, Clock3, CheckCircle2, Circle, BarChart3,
  ShieldCheck, Play, CalendarDays
} from "lucide-react";

type Tab = "today" | "program" | "diary" | "calm-ai" | "profile";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("sleep_now_user") || localStorage.getItem("insomnia_user");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* noop */ }
    }
    return { name: "Sebastián", memberSince: "Agosto, 2026", nightsOfCalm: 24, consistencyRate: 92, currentStreak: 5 };
  });
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [breatherType, setBreatherType] = useState<"military" | "rescate" | null>(null);
  const [deepNightActive, setDeepNightActive] = useState(() => localStorage.getItem("deep_night_mode") === "true");
  const [currentTime, setCurrentTime] = useState("");
  const [todayDone, setTodayDone] = useState([true, false, false]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem("sleep_logs");
    if (saved) { try { return JSON.parse(saved); } catch { /* noop */ } }
    return [
      { id: "l-4", dayNum: 4, date: "6 Jun", wakeEnergy: 9, complied321: true, notes: "Respiración guiada y rutina completa.", statusLabel: "Zen", duration: "8h 12m" },
      { id: "l-3", dayNum: 3, date: "5 Jun", wakeEnergy: 7, complied321: true, notes: "Menos pantallas y cena más liviana.", statusLabel: "Óptimo", duration: "7h 55m" },
      { id: "l-2", dayNum: 2, date: "4 Jun", wakeEnergy: 5, complied321: false, notes: "Mucho trabajo antes de dormir.", statusLabel: "Calma", duration: "7h 10m" }
    ];
  });

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (currentUser) localStorage.setItem("sleep_now_user", JSON.stringify(currentUser));
    else localStorage.removeItem("sleep_now_user");
  }, [currentUser]);
  useEffect(() => localStorage.setItem("sleep_logs", JSON.stringify(sleepLogs)), [sleepLogs]);

  const day = 8;
  const progress = Math.round((day / 21) * 100);
  const completedToday = todayDone.filter(Boolean).length;
  const energyAverage = useMemo(() => sleepLogs.length ? Math.round(sleepLogs.reduce((a, b) => a + b.wakeEnergy, 0) / sleepLogs.length) : 0, [sleepLogs]);

  if (!currentUser) {
    return <LoginView onLogin={(name) => setCurrentUser({ name, memberSince: "Agosto, 2026", nightsOfCalm: 1, consistencyRate: 100, currentStreak: 1 })} />;
  }

  const addSleepLog = (log: SleepLog) => setSleepLogs(prev => [log, ...prev]);
  const deleteSleepLog = (id: string) => setSleepLogs(prev => prev.filter(x => x.id !== id));

  return (
    <div className="sleepnow-shell">
      {deepNightActive && <div className="blue-blocker-overlay" />}
      {breatherType && <SleepBreather initialType={breatherType} onClose={() => setBreatherType(null)} />}

      <header className="sn-header">
        <div className="sn-header-inner">
          <button className="sn-brand" onClick={() => setActiveTab("today")}>
            <span className="sn-logo"><MoonStar size={20} /></span>
            <span><strong>Sleep Now®</strong><small>Tu descanso, paso a paso</small></span>
          </button>
          <div className="sn-header-actions">
            <span className="sn-time"><Clock3 size={15} /> {currentTime}</span>
            <button className="sn-avatar" onClick={() => setActiveTab("profile")}>{currentUser.name.slice(0,1).toUpperCase()}</button>
          </div>
        </div>
      </header>

      <main className="sn-main">
        {activeTab === "today" && (
          <div className="sn-stack">
            <section className="sn-hero-card">
              <div className="sn-hero-copy">
                <span className="sn-kicker">DÍA {day} DE 21 · REPROGRAMAR EL CEREBRO</span>
                <h1>Buenas noches, {currentUser.name.split(" ")[0]}.</h1>
                <p>Tu rutina de hoy está diseñada para bajar el ritmo mental y preparar el cuerpo para descansar.</p>
                <div className="sn-hero-actions">
                  <button className="sn-primary" onClick={() => setBreatherType("military")}><Play size={18} fill="currentColor" /> Comenzar rutina · 12 min</button>
                  <button className="sn-secondary" onClick={() => setActiveTab("program")}>Ver programa <ChevronRight size={17}/></button>
                </div>
              </div>
              <div className="sn-progress-orb" style={{"--progress": `${progress * 3.6}deg`} as CSSProperties}>
                <div><strong>{progress}%</strong><span>del programa</span></div>
              </div>
            </section>

            <section className="sn-metrics">
              <article><span><Flame size={17}/> Racha</span><strong>{currentUser.currentStreak} noches</strong><small>Seguí así</small></article>
              <article><span><BarChart3 size={17}/> Energía</span><strong>{energyAverage}/10</strong><small>Promedio reciente</small></article>
              <article><span><ShieldCheck size={17}/> Constancia</span><strong>{currentUser.consistencyRate}%</strong><small>Últimos 7 días</small></article>
              <article><span><CalendarDays size={17}/> Noches</span><strong>{currentUser.nightsOfCalm}</strong><small>Registradas</small></article>
            </section>

            <section className="sn-section-card">
              <div className="sn-section-title"><div><span className="sn-kicker">RUTINA DE HOY</span><h2>Tres pasos. Una noche más tranquila.</h2></div><span className="sn-chip">{completedToday}/3 completados</span></div>
              <div className="sn-routine-list">
                {[
                  {icon:<PenLine size={20}/>, title:"Descargar la mente", meta:"Escritura guiada · 4 min"},
                  {icon:<Wind size={20}/>, title:"Respiración 4–6", meta:"Ejercicio guiado · 5 min"},
                  {icon:<Headphones size={20}/>, title:"Meditación para soltar", meta:"Audio · 3 min"}
                ].map((item, index) => (
                  <button key={item.title} className={`sn-routine-item ${todayDone[index] ? "done" : ""}`} onClick={() => { const next=[...todayDone]; next[index]=!next[index]; setTodayDone(next); if(index===1) setBreatherType("military"); }}>
                    <span className="sn-routine-icon">{item.icon}</span>
                    <span className="sn-routine-text"><strong>{item.title}</strong><small>{item.meta}</small></span>
                    {todayDone[index] ? <CheckCircle2 className="sn-check" size={22}/> : <Circle size={22}/>} 
                  </button>
                ))}
              </div>
            </section>

            <section className="sn-grid-two">
              <article className="sn-feature-card rescue">
                <span className="sn-kicker">AYUDA INMEDIATA</span>
                <h3>¿Te despertaste a las 3 AM?</h3>
                <p>Usá una secuencia breve para bajar la activación sin mirar el reloj ni pelear con el sueño.</p>
                <button className="sn-link-button" onClick={() => setBreatherType("rescate")}>Abrir Rescate 3 AM <ChevronRight size={17}/></button>
              </article>
              <article className="sn-feature-card ai">
                <span className="sn-kicker">CALM AI</span>
                <h3>Contame cómo te sentís.</h3>
                <p>Recibí una recomendación breve basada en tu estado actual y en tu recorrido.</p>
                <button className="sn-link-button" onClick={() => setActiveTab("calm-ai")}>Hablar con Calm AI <ChevronRight size={17}/></button>
              </article>
            </section>

            <section className="sn-tools-wrap">
              <div className="sn-section-title"><div><span className="sn-kicker">HERRAMIENTAS</span><h2>Tu espacio de calma.</h2></div></div>
              <TranquilView />
            </section>
          </div>
        )}

        {activeTab === "program" && <ELearningView />}
        {activeTab === "diary" && <DiaryView logs={sleepLogs} onAddLog={addSleepLog} onDeleteLog={deleteSleepLog} />}
        {activeTab === "calm-ai" && <CalmAIView />}
        {activeTab === "profile" && <ProfileView user={currentUser} onLogout={() => setCurrentUser(null)} deepNightActive={deepNightActive} onToggleDeepNight={(v) => {setDeepNightActive(v); localStorage.setItem("deep_night_mode", String(v));}} />}
      </main>

      <nav className="sn-bottom-nav">
        {[
          {id:"today", label:"Hoy", icon:<Home size={20}/>},
          {id:"program", label:"Programa", icon:<MoonStar size={20}/>},
          {id:"diary", label:"Diario", icon:<BookOpen size={20}/>},
          {id:"calm-ai", label:"Calm AI", icon:<Sparkles size={20}/>},
          {id:"profile", label:"Perfil", icon:<UserRound size={20}/>}
        ].map(item => <button key={item.id} className={activeTab === item.id ? "active" : ""} onClick={() => setActiveTab(item.id as Tab)}>{item.icon}<span>{item.label}</span></button>)}
      </nav>
    </div>
  );
}
