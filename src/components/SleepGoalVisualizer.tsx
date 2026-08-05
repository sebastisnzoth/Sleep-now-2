import React, { useState } from "react";
import { SleepLog } from "../types";
import { Target, Clock, TrendingUp, Award, CheckCircle2, AlertCircle, SlidersHorizontal, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Legend } from "recharts";

interface SleepGoalVisualizerProps {
  logs: SleepLog[];
}

export default function SleepGoalVisualizer({ logs }: SleepGoalVisualizerProps) {
  const [plannedHours, setPlannedHours] = useState<number>(() => {
    const saved = localStorage.getItem("sleep_planned_hours");
    return saved ? parseFloat(saved) : 8.0;
  });

  const handleGoalChange = (hours: number) => {
    setPlannedHours(hours);
    localStorage.setItem("sleep_planned_hours", hours.toString());
  };

  // Helper to parse duration string e.g. "8h 12m" or "7h 55m" into decimal hours
  const parseDurationToHours = (durationStr: string): number => {
    if (!durationStr) return 7.5;
    const hMatch = durationStr.match(/(\d+)h/);
    const mMatch = durationStr.match(/(\d+)m/);
    const h = hMatch ? parseInt(hMatch[1], 10) : 0;
    const m = mMatch ? parseInt(mMatch[1], 10) : 0;
    return parseFloat((h + m / 60).toFixed(1));
  };

  const latestLog = logs.length > 0 ? logs[0] : { dayNum: 1, date: "Hoy", duration: "8h 00m", statusLabel: "Óptimo", wakeEnergy: 8 };
  const actualHours = parseDurationToHours(latestLog.duration);
  const plannedMinutes = plannedHours * 60;
  const actualMinutes = actualHours * 60;
  const diffMinutes = Math.round(actualMinutes - plannedMinutes);
  const achievementPercent = Math.min(Math.round((actualMinutes / plannedMinutes) * 100), 150);

  // Prepare chart data from logs (chronological order, last 7 days)
  const chartData = [...logs]
    .sort((a, b) => a.dayNum - b.dayNum)
    .slice(-7)
    .map((log) => ({
      name: `Día ${log.dayNum} (${log.date})`,
      Real: parseDurationToHours(log.duration),
      Planificado: plannedHours,
      energia: log.wakeEnergy,
      status: log.statusLabel
    }));

  return (
    <div className="sn-section-card bg-gradient-to-br from-[#12243d] to-[#0d1b2f] border border-[#abcfbe]/20 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
      {/* Header & Goal Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#abcfbe]/10">
        <div>
          <span className="sn-kicker flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#7cc7ff]">
            <Target size={14} /> Análisis de Objetivo Circadiano
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#f5f8fc] mt-1">
            Tendencia de Sueño: Planificado vs. Real
          </h2>
          <p className="text-sm text-[#9caec4] mt-0.5">
            Evolución de las horas dormidas durante la semana comparadas con tu meta biológica.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#091524] p-1.5 rounded-2xl border border-[#abcfbe]/15 self-start">
          <span className="text-xs font-bold text-[#9caec4] pl-2.5 flex items-center gap-1">
            <SlidersHorizontal size={13} /> Meta:
          </span>
          {[7.0, 7.5, 8.0, 8.5].map((h) => (
            <button
              key={h}
              onClick={() => handleGoalChange(h)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                plannedHours === h
                  ? "bg-gradient-to-r from-[#7cc7ff] to-[#7ee0c3] text-[#04121f] shadow-md"
                  : "text-[#9caec4] hover:text-white hover:bg-white/5"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Main Metric Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0a1728]/80 border border-[#abcfbe]/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs text-[#9caec4] font-medium flex items-center gap-1.5">
            <Clock size={15} className="text-[#7cc7ff]" /> Objetivo Planificado
          </span>
          <div className="mt-3">
            <strong className="text-3xl font-extrabold text-[#f5f8fc]">
              {Math.floor(plannedHours)}h {plannedHours % 1 !== 0 ? "30m" : "00m"}
            </strong>
            <span className="block text-xs text-[#7ee0c3] mt-1 font-medium">Meta circadiana establecida</span>
          </div>
        </div>

        <div className="bg-[#0a1728]/80 border border-[#abcfbe]/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs text-[#9caec4] font-medium flex items-center gap-1.5">
            <TrendingUp size={15} className="text-[#7ee0c3]" /> Último Registro (Día {latestLog.dayNum})
          </span>
          <div className="mt-3">
            <strong className="text-3xl font-extrabold text-[#f5f8fc]">
              {latestLog.duration}
            </strong>
            <span className={`block text-xs mt-1 font-semibold ${actualMinutes >= plannedMinutes ? "text-[#7ee0c3]" : "text-[#ff8c91]"}`}>
              {diffMinutes >= 0 ? `+${diffMinutes} min respecto a la meta` : `${diffMinutes} min respecto a la meta`}
            </span>
          </div>
        </div>

        <div className="bg-[#0a1728]/80 border border-[#abcfbe]/10 rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-xs text-[#9caec4] font-medium flex items-center gap-1.5">
            <Award size={15} className="text-[#7cc7ff]" /> Grado de Cumplimiento
          </span>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <strong className="text-3xl font-extrabold text-[#f5f8fc]">{achievementPercent}%</strong>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${achievementPercent >= 100 ? "bg-[#7ee0c3]/15 text-[#7ee0c3] border border-[#7ee0c3]/30" : "bg-[#ff8c91]/15 text-[#ff8c91] border border-[#ff8c91]/30"}`}>
                {achievementPercent >= 100 ? "¡Meta cumplida!" : "En progreso"}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#12243d] h-2 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${achievementPercent >= 100 ? "bg-gradient-to-r from-[#7cc7ff] to-[#7ee0c3]" : "bg-gradient-to-r from-[#7cc7ff] to-[#ff8c91]"}`}
                style={{ width: `${Math.min(achievementPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart Visualizer */}
      <div className="bg-[#091524]/60 border border-[#abcfbe]/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#f5f8fc] flex items-center gap-2">
            <Activity size={16} className="text-[#7cc7ff]" /> Gráfico de Tendencia: Horas Reales vs. Meta
          </h4>
          <div className="flex items-center gap-3 text-xs text-[#9caec4]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#7ee0c3] inline-block" /> Real</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#7cc7ff] inline-block opacity-70" /> Planificado</span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(171,207,190,0.1)" />
              <XAxis dataKey="name" stroke="#9caec4" fontSize={11} tickLine={false} />
              <YAxis stroke="#9caec4" fontSize={11} domain={[4, 12]} tickLine={false} unit="h" />
              <Tooltip 
                contentStyle={{ background: "#0f2138", borderColor: "rgba(124,199,255,0.2)", borderRadius: "12px", color: "#f5f8fc", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" }}
                formatter={(value: any, name: any) => [`${value} horas`, name === "Real" ? "Sueño Real" : "Meta Planificada"]}
              />
              <Line 
                type="monotone" 
                dataKey="Planificado" 
                stroke="#7cc7ff" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false}
                name="Planificado"
              />
              <Line 
                type="monotone" 
                dataKey="Real" 
                stroke="#7ee0c3" 
                strokeWidth={3} 
                activeDot={{ r: 7, fill: "#7ee0c3", stroke: "#0d1b2f", strokeWidth: 2 }} 
                dot={{ r: 5, fill: "#7ee0c3", stroke: "#0d1b2f", strokeWidth: 2 }}
                name="Real"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Footer */}
      <div className="flex items-start gap-3 bg-[#132b49]/60 border border-[#7cc7ff]/20 p-4 rounded-xl text-xs text-[#bde5ff]">
        {achievementPercent >= 100 ? (
          <CheckCircle2 size={18} className="text-[#7ee0c3] shrink-0 mt-0.5" />
        ) : (
          <AlertCircle size={18} className="text-[#7cc7ff] shrink-0 mt-0.5" />
        )}
        <p className="leading-relaxed">
          {achievementPercent >= 100
            ? "¡Excelente trabajo! Tu consistencia nocturna está alineada con el descanso restaurador. Mantén tus horarios estables para consolidar este ritmo circadiano."
            : "Estás cerca de tu objetivo de sueño. Recuerda que no se trata de buscar la perfección, sino de mantener la constancia en tu rutina nocturna y evitar mirar el reloj de madrugada."}
        </p>
      </div>
    </div>
  );
}

