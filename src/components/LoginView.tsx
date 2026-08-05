import React, { useState } from "react";
import { ArrowRight, MoonStar, ShieldCheck } from "lucide-react";

interface LoginViewProps { onLogin: (name: string) => void; }

export default function LoginView({ onLogin }: LoginViewProps) {
  const [name, setName] = useState("Sebastián");
  return (
    <div className="sn-login">
      <div className="sn-login-glow one"/><div className="sn-login-glow two"/>
      <header className="sn-login-header"><span className="sn-logo"><MoonStar size={21}/></span><strong>Sleep Now®</strong><small>V2 Preview</small></header>
      <main className="sn-login-card">
        <span className="sn-kicker">TU CAMINO HACIA UN MEJOR DESCANSO</span>
        <h1>Entrá en calma.</h1>
        <p>Una experiencia guiada de 21 días para bajar la ansiedad nocturna y recuperar tus noches.</p>
        <form onSubmit={(e) => {e.preventDefault(); onLogin(name || "Invitado");}}>
          <label>¿Cómo querés que te llamemos?</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
          <button className="sn-primary" type="submit">Comenzar <ArrowRight size={18}/></button>
        </form>
        <div className="sn-privacy"><ShieldCheck size={16}/> Tus datos permanecen protegidos.</div>
      </main>
      <footer>Sleep Now® es una herramienta educativa y no reemplaza la consulta con un profesional de la salud.</footer>
    </div>
  );
}
