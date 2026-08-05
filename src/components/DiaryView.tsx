import React, { useState, useEffect } from "react";
import { SleepLog } from "../types";
import { Sliders, Calendar, BookOpen, Clock, Heart, History, Trash2, Award, ChevronRight, Download, Sparkles, Brain } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-indigo-100 p-3.5 rounded-2xl shadow-lg text-xs leading-normal space-y-1.5 backdrop-blur-md">
        <p className="font-bold text-text-primary text-[11px] border-b border-indigo-50 pb-1">{data.fullDate} ({data.Día})</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span className="text-text-primary font-medium">Energía Matutina: <strong className="text-primary font-bold">{data["Energía"]}/10</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-text-primary font-medium">Duración de Sueño: <strong className="text-emerald-700 font-bold">{data.durationLabel || `${data["Duración (h)"]}h`}</strong></span>
        </div>
        <div className="pt-1 border-t border-indigo-50/60 flex justify-between items-center text-[10px] text-text-muted">
          <span>Estado: <span className="font-semibold text-primary uppercase">{data.status}</span></span>
        </div>
      </div>
    );
  }
  return null;
};

interface DiaryViewProps {
  logs: SleepLog[];
  onAddLog: (newLog: SleepLog) => void;
  onDeleteLog: (id: string) => void;
}

export default function DiaryView({ logs, onAddLog, onDeleteLog }: DiaryViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [wakeEnergy, setWakeEnergy] = useState<number>(7);
  const [complied321, setComplied321] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<"semana" | "mes" | "año">("semana");
  const [chartMetric, setChartMetric] = useState<"energia" | "duracion">("energia");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // States for the AI Sleep analysis functions
  const [currentAnalysis, setCurrentAnalysis] = useState<string>("");
  const [analyzingCurrent, setAnalyzingCurrent] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<string>("");

  const [weeklyAnalysis, setWeeklyAnalysis] = useState<string>("");
  const [analyzingWeekly, setAnalyzingWeekly] = useState<boolean>(false);
  const [weeklyError, setWeeklyError] = useState<string>("");

  // Calculate statistics dynamically
  const nightsOfCalm = logs.filter(l => l.wakeEnergy >= 7).length;
  const avgEnergy = logs.length > 0 
    ? (logs.reduce((acc, curr) => acc + curr.wakeEnergy, 0) / logs.length).toFixed(1)
    : "7.0";
  const consistency321 = logs.length > 0
    ? Math.round((logs.filter(l => l.complied321).length / logs.length) * 100)
    : 85;

  const handleExportTextSummary = () => {
    if (logs.length === 0) return;

    let content = "========================================================================\n";
    content += "           INSOMNIO CERO - INFORME CLÍNICO DE SEGUIMIENTO DEL SUEÑO\n";
    content += "========================================================================\n";
    content += `Fecha del Reporte: ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}\n`;
    content += "Destinado para:   Revisión de Medicina Especializada / Optimización del Ritmo Circadiano\n";
    content += "========================================================================\n\n";

    content += "1. MÉTRICAS GLOBALES DE DESPERTARES Y CONSISTENCIA\n";
    content += "------------------------------------------------------------------------\n";
    content += `• Total de Ciclos Nocturnos Registrados:    ${logs.length} de 7 días\n`;
    content += `• Noches de Calma Biológica (Energía >= 7):  ${nightsOfCalm} noches\n`;
    content += `• Nivel de Energía Promedio al Despertar:   ${avgEnergy} / 10\n`;
    content += `• Consistencia del Protocolo Co-Circadiano:   ${consistency321}%\n`;
    content += "------------------------------------------------------------------------\n";
    content += "EVALUACIÓN CLÍNICA INICIAL:\n";
    const avgEnergyNum = parseFloat(avgEnergy);
    if (avgEnergyNum >= 8) {
      content += "  La salud circadiana parece altovitalizada. Sigue consolidando el Método Militar.\n";
    } else if (avgEnergyNum >= 6) {
      content += "  Nivel óptimo promedio de restauración nerviosa. Se sugiere regularizar la regla 3-2-1.\n";
    } else {
      content += "  Se observan indicios de fatiga cortical y baja energía matinal. Priorizar el Protocolo de Rescate Activo.\n";
    }
    content += "========================================================================\n\n";

    content += "2. HISTORIAL DETALLADO DÍA A DÍA\n";
    content += "------------------------------------------------------------------------\n\n";

    // Sort logs by day number (ascending)
    const sortedLogs = [...logs].sort((a, b) => a.dayNum - b.dayNum);

    sortedLogs.forEach((log) => {
      content += `DÍA COMPLEMENTARIO ${log.dayNum} - Registro: ${log.date}\n`;
      content += `  • Diagnóstico Subjetivo:    ${log.statusLabel}\n`;
      content += `  • Energía Matutina:        ${log.wakeEnergy} / 10\n`;
      content += `  • Cumplimiento Regla 3-2-1: ${log.complied321 ? "SÍ (Alineación celular óptima)" : "NO (Interrupción circadiana detectada)"}\n`;
      content += `  • Duración Estimada:        ${log.duration}\n`;
      content += `  • Notas Cualitativas:      ${log.notes}\n`;
      content += "  ----------------------------------------------------------------------\n\n";
    });

    content += "========================================================================\n";
    content += "3. INSTRUCCIONES CLÍNICAS DE CONDUCTA PARA EL PACIENTE\n";
    content += "========================================================================\n";
    content += "• PROTOCOLO 3-2-1-0:\n";
    content += "  - 3 Horas Antes: Cenar ligero (por ejemplo, 5 almendras/nueces si hay hambre voraz) para bajar 1-2°C la temperatura cerebral.\n";
    content += "  - 2 Horas Antes: Corte cognitivo absoluto de emails y trabajo profesional.\n";
    content += "  - 1 Hora Antes: Condonación total de pantallas azules que frenen la síntesis de melatonina en la glándula pineal.\n";
    content += "  - 0 Snooze: No posponer la alarma para evitar la fragmentación celular y la inercia del sueño.\n\n";
    content += "• MÉTODO MILITAR DE REPROGRAMACIÓN MUSCULAR:\n";
    content += "  - Descompresión total de los 40 músculos faciales, mandíbula floja, ojos pesados y respiración libre automatizada por el diafragma.\n";
    content += "  - 10 segundos de enfoque estático completo (canoa en lago plano o hamaca en habitación oscura) para ocupar el ancho de banda mental.\n\n";
    content += "• PROTOCOLO DE RESCATE (3 AM):\n";
    content += "  - ¡PROHIBIDO MIRAR LA HORA! El despertador digital de madrugada es el disparador número uno del insomnio condicionado por desempeño.\n";
    content += "  - Si no concilia el sueño in 20 minutos, abandonar la cama y realizar una actividad física suave con luz tenue hasta sentir el pespunte circadiano real.\n\n";
    content += "========================================================================\n";
    content += "                         FIN DEL INFORME INSOMNIO CERO\n";
    content += "========================================================================\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `informe_clinico_insomnio_cero_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose dynamic descriptive duration and status based on wakeEnergy
    let statusLabel = "Calma";
    let duration = "7h 45m";
    if (wakeEnergy >= 9) {
      statusLabel = "Zen";
      duration = "8h 12m";
    } else if (wakeEnergy >= 7) {
      statusLabel = "Óptimo";
      duration = "7h 55m";
    } else if (wakeEnergy >= 5) {
      statusLabel = "Calma";
      duration = "7h 10m";
    } else {
      statusLabel = "Ligero";
      duration = "6h 30m";
    }

    const newLog: SleepLog = {
      id: Math.random().toString(36).substring(2, 9),
      dayNum: selectedDay,
      date: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      wakeEnergy,
      complied321,
      notes: notes || "Sin comentarios particulares.",
      statusLabel,
      duration
    };

    onAddLog(newLog);
    
    setNotes("");
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);

    // increment selected day for next entry convenience, within 1-7
    setSelectedDay((prev) => (prev < 7 ? prev + 1 : 1));
  };

  const handleAnalyzeCurrentNote = async () => {
    if (!notes.trim()) {
      setCurrentError("Escribe algo en las notas de tu ciclo de hoy antes de consultarle al Coach.");
      return;
    }
    setCurrentError("");
    setAnalyzingCurrent(true);
    setCurrentAnalysis("");
    
    try {
      const response = await fetch("/api/analyze-sleep-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      
      if (!response.ok) {
        throw new Error("Error en la conexión con el servidor");
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCurrentAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setCurrentError("Surgió una pequeña congestión en tu alineación cognitiva. Reintenta en breves instantes.");
    } finally {
      setAnalyzingCurrent(false);
    }
  };

  const handleAnalyzeWeeklyNotes = async () => {
    if (logs.length === 0) {
      setWeeklyError("Registra al menos una noche para analizar los patrones del biorritmo.");
      return;
    }
    setWeeklyError("");
    setAnalyzingWeekly(true);
    setWeeklyAnalysis("");
    
    try {
      const response = await fetch("/api/analyze-sleep-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logsHistory: logs }),
      });
      
      if (!response.ok) {
        throw new Error("Error en la comunicación con el Coach");
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setWeeklyAnalysis(data.analysis);
    } catch (err: any) {
      console.error(err);
      setWeeklyError("No hemos podido sincronizar tu registro completo de calma. Respira y reintenta.");
    } finally {
      setAnalyzingWeekly(false);
    }
  };

  function parseBoldText(input: string) {
    if (!input) return "";
    const parts = input.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-primary">{part}</strong>;
      }
      return part;
    });
  }

  function renderFormattedAnalysis(text: string) {
    if (!text) return null;
    const lines = text.split("\n");
    return (
      <div className="space-y-3 text-xs sm:text-sm text-text-primary leading-relaxed">
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={index} className="h-2" />;

          if (trimmed.startsWith("###")) {
            return (
              <h4 key={index} className="text-xs sm:text-sm font-extrabold text-primary mt-4 tracking-tight flex items-center gap-1.5 border-b border-indigo-100 pb-1 uppercase">
                {parseBoldText(trimmed.replace(/^###\s*/, ""))}
              </h4>
            );
          }
          if (trimmed.startsWith("##")) {
            return (
              <h3 key={index} className="text-sm sm:text-base font-bold text-primary mt-5 tracking-tight border-b border-indigo-100/60 pb-1.5">
                {parseBoldText(trimmed.replace(/^##\s*/, ""))}
              </h3>
            );
          }

          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const cleanLine = trimmed.replace(/^[-*]\s*/, "");
            return (
              <div key={index} className="flex gap-2 items-start pl-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-text-muted leading-relaxed">{parseBoldText(cleanLine)}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={index} className="flex gap-2.5 items-start bg-slate-50 border border-indigo-50/50 p-3 rounded-xl mt-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 border border-indigo-200 text-primary flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 mt-0.5 font-mono">
                  {numMatch[1]}
                </span>
                <span className="flex-1 text-xs text-text-muted leading-relaxed">{parseBoldText(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={index} className="text-xs text-text-muted leading-relaxed pl-0.5">{parseBoldText(trimmed)}</p>;
        })}
      </div>
    );
  }

  const parseDurationHours = (durStr: string) => {
    if (!durStr) return 7.5;
    const matchH = durStr.match(/(\d+)h/);
    const matchM = durStr.match(/(\d+)m/);
    const h = matchH ? parseInt(matchH[1], 10) : 7;
    const m = matchM ? parseInt(matchM[1], 10) : 0;
    return Number((h + m / 60).toFixed(1));
  };

  // Prepare data for Recharts (last 7 days in chronological order)
  const chartData = [...logs]
    .sort((a, b) => a.dayNum - b.dayNum)
    .slice(-7)
    .map((log) => ({
      name: `D${log.dayNum}`,
      fullDate: log.date,
      "Energía": log.wakeEnergy,
      "Duración (h)": parseDurationHours(log.duration),
      durationLabel: log.duration,
      "Día": `Día ${log.dayNum}`,
      status: log.statusLabel,
    }));

  return (
    <div id="diary-view" className="space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* Tu Progreso Header and SVG Chart */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Tu Progreso</h2>
            <p className="text-xs text-text-muted">Análisis del pulso circadiano semanal</p>
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 rounded-full border border-indigo-100 self-start">
            {["semana", "mes", "año"].map((filter) => (
              <button
                id={`progress-filter-${filter}`}
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all ${
                  activeFilter === filter
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Recharts Area Chart displaying Sleep Quality Trend (wake energy & sleep duration) */}
        <div className="bg-white rounded-[2rem] p-6 border border-indigo-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 mb-4">
            <div>
              <span className="text-[10px] text-primary tracking-widest uppercase font-bold font-mono">Sleep Quality Trend</span>
              <h4 className="text-sm font-bold text-text-primary mt-0.5">Evolución Semanal de Energía y Duración</h4>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-full border border-indigo-100">
                <button
                  type="button"
                  onClick={() => setChartMetric("energia")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
                    chartMetric === "energia"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Energía (0-10)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric("duracion")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
                    chartMetric === "duracion"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Duración (Horas)
                </button>
              </div>
            </div>
          </div>
          
          <div className="w-full relative h-[210px] z-10">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-text-muted italic">
                No hay registros suficientes para mostrar la tendencia de calidad de sueño.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="rechartsEnergiaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity="0.35" />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="rechartsDuracionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="95%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    domain={chartMetric === "energia" ? [0, 10] : [4, 12]} 
                    tickCount={6}
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartMetric === "energia" ? "#818cf8" : "#10b981", strokeWidth: 1, strokeDasharray: "2 2" }} />
                  {chartMetric === "energia" ? (
                    <Area 
                      type="monotone" 
                      dataKey="Energía" 
                      stroke="#818cf8" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#rechartsEnergiaGrad)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                    />
                  ) : (
                    <Area 
                      type="monotone" 
                      dataKey="Duración (h)" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#rechartsDuracionGrad)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#059669" }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-text-muted mt-3 border-t border-indigo-100 pt-2 font-mono">
            <span>Métrica Activa: {chartMetric === "energia" ? "Nivel de Energía al Despertar (0-10)" : "Horas de Sueño Registradas"}</span>
            <span className="text-primary font-bold">Sleep Quality Trend ✓</span>
          </div>
        </div>
      </section>

      {/* Main Stats metrics box */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-indigo-100 shadow-xs rounded-2xl p-5 flex flex-col items-center text-center space-y-2 hover:border-primary/20 transition-all">
          <Heart className="w-6 h-6 text-primary" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{nightsOfCalm}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Noches de Calma</p>
          </div>
        </div>

        <div className="bg-white border border-indigo-100 shadow-xs rounded-2xl p-5 flex flex-col items-center text-center space-y-2 hover:border-primary/20 transition-all">
          <Clock className="w-6 h-6 text-primary" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{avgEnergy}/10</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Energía Promedio</p>
          </div>
        </div>

        <div className="bg-white border border-indigo-100 shadow-xs rounded-2xl p-5 flex flex-col items-center text-center space-y-2 col-span-2 md:col-span-1 hover:border-primary/20 transition-all">
          <Award className="w-6 h-6 text-primary" />
          <div>
            <p className="text-2xl font-bold text-text-primary">{consistency321}%</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Consistencia 3-2-1</p>
          </div>
        </div>
      </section>

      {/* AI Coach Weekly Biorhythm Analysis and Diagnostics */}
      {logs.length > 0 && (
        <section className="bg-linear-to-b from-[#3730A3]/5 to-transparent border border-indigo-100 shadow-xs rounded-[2rem] p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">Diagnóstico Avanzado de Biorritmos</h4>
                <p className="text-[10px] text-text-muted">Análisis holístico de tus notas acumuladas de sueño</p>
              </div>
            </div>
            <button
              id="analyze-weekly-notes-btn"
              type="button"
              onClick={handleAnalyzeWeeklyNotes}
              disabled={analyzingWeekly}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-xs tracking-wide flex items-center gap-1.5 cursor-pointer ${
                analyzingWeekly
                  ? "bg-indigo-100 border-indigo-250 text-indigo-500 animate-pulse cursor-wait"
                  : "bg-primary hover:bg-indigo-700 text-white border-transparent hover:shadow-md active:scale-95"
              }`}
            >
              {analyzingWeekly ? "Estudiando patrones..." : "Analizar Patrones con IA"}
            </button>
          </div>

          {weeklyError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-150 p-3 rounded-xl">
              {weeklyError}
            </p>
          )}

          {weeklyAnalysis && (
            <div className="bg-white border border-indigo-100 p-5 rounded-2xl shadow-inner text-xs space-y-4 antialiased leading-relaxed max-h-[450px] overflow-y-auto">
              <div className="flex items-center gap-2 border-b border-indigo-100/50 pb-2.5">
                <Brain className="w-4 h-4 text-primary" />
                <span className="font-extrabold text-[10px] uppercase text-primary tracking-widest font-mono">Resumen de Calma y Plan de Acción Circadiana</span>
              </div>
              {renderFormattedAnalysis(weeklyAnalysis)}
            </div>
          )}

          {!weeklyAnalysis && !analyzingWeekly && (
            <p className="text-xs text-text-muted leading-relaxed pl-1">
              La IA analizará todos tus registros históricos ({logs.length} noches) y buscará correlaciones entre el cumplimiento de la regla 3-2-1, tu nivel de fatiga cortical y tus despertares subjetivos.
            </p>
          )}
        </section>
      )}

      {/* Add sleep log entry form */}
      <section className="bg-white border border-indigo-100 shadow-xs rounded-[2rem] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-indigo-100/60 pb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium text-text-primary">Registrar Calma Diaria</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" id="sleepLogForm">
          {/* Day selection */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Día de Implementación</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <button
                  id={`day-select-btn-${day}`}
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all border flex-shrink-0 cursor-pointer ${
                    selectedDay === day
                      ? "bg-primary text-white border-transparent shadow-lg text-sm"
                      : "border-indigo-100 text-text-primary hover:bg-slate-50 bg-white"
                  }`}
                >
                  D{day}
                </button>
              ))}
            </div>
          </div>

          {/* Wake up energy level */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-text-muted">
              <span>Energía al Despertar (1-10)</span>
              <span className="text-xl font-bold text-primary font-mono bg-primary-container px-3 py-1 rounded border border-primary/15 transition-all scale-110">
                {wakeEnergy}
              </span>
            </div>
            <input
              id="slider-energy-input"
              type="range"
              min="1"
              max="10"
              step="1"
              value={wakeEnergy}
              onChange={(e) => setWakeEnergy(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary border border-indigo-100"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-semibold uppercase tracking-wider px-1">
              <span>Agotado 🥱</span>
              <span>Vitalizado ⚡</span>
            </div>
          </div>

          {/* Rule checklist */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Estilo de desconexión</span>
            <button
              id="rule-321-toggle-choice"
              type="button"
              onClick={() => setComplied321(!complied321)}
              className={`w-full p-4 rounded-2xl flex items-start gap-3 border text-left cursor-pointer transition-all ${
                complied321
                  ? "bg-primary-container border-primary text-primary"
                  : "bg-white border-indigo-100 text-text-primary"
              }`}
            >
              <input
                id="checkbox-rule-321"
                type="checkbox"
                checked={complied321}
                readOnly
                className="mt-0.5 rounded text-primary focus:ring-0 focus:ring-offset-0 bg-transparent border-indigo-300"
              />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">¿Cumpliste la Regla 3-2-1?</p>
                <p className="text-[11px] opacity-80 leading-normal text-text-muted">
                  3h sin comida previa, 2h sin trabajo pesado, 1h sin pantallas luminosas.
                </p>
              </div>
            </button>
          </div>

          {/* Textarea notes */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Notas cualitativas o despertares</span>
            <textarea
              id="notes-quality-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe pensamientos persistentes, despertares a medianoche o sensaciones corporales al despertar de este ciclo..."
              className="w-full bg-white border border-indigo-100 rounded-xl p-4 text-xs sm:text-sm text-text-primary focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-text-muted h-28 resize-none transition-colors"
            />
          </div>

          {/* AI Calma Assistant trigger */}
          <div className="space-y-3 bg-slate-50/70 border border-indigo-50/60 rounded-2xl p-4.5 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>Coach de Sueño Inteligente</span>
              </span>
              <button
                id="analyze-current-note-btn"
                type="button"
                onClick={handleAnalyzeCurrentNote}
                disabled={analyzingCurrent || !notes.trim()}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all border flex items-center justify-center gap-1 cursor-pointer self-start sm:self-center ${
                  !notes.trim()
                    ? "bg-transparent border-slate-200 text-slate-400 cursor-not-allowed"
                    : analyzingCurrent
                    ? "bg-indigo-50 border-indigo-200 text-primary cursor-wait animate-pulse"
                    : "bg-white hover:bg-indigo-50 border-indigo-100 text-primary hover:border-primary active:scale-95"
                }`}
              >
                {analyzingCurrent ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <span>Sugerencias para Mañana</span>
                  </>
                )}
              </button>
            </div>

            {currentError && (
              <p className="text-[11px] text-red-650 bg-red-50 border border-red-100 p-2.5 rounded-xl">
                {currentError}
              </p>
            )}

            {currentAnalysis && (
              <div className="bg-white border border-indigo-100 p-4 rounded-xl text-xs space-y-3 shadow-inner relative max-h-[300px] overflow-y-auto antialiased">
                <div className="flex items-center gap-1.5 border-b border-indigo-50 pb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="font-extrabold text-[10px] uppercase text-primary tracking-wider font-mono">Plan de Contingencia Biológica</span>
                </div>
                {renderFormattedAnalysis(currentAnalysis)}
              </div>
            )}
            
            {!currentAnalysis && !analyzingCurrent && (
              <p className="text-[10px] text-text-muted leading-relaxed">
                Escribe pensamientos recurrentes o problemas para iniciar/mantener el sueño, y pulsa el botón para recibir estrategias preventivas con IA.
              </p>
            )}
          </div>

          {/* Save Button */}
          <button
            id="save-log-submit-button"
            type="submit"
            className={`w-full py-4.5 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 duration-300 ${
              saveSuccess 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-250" 
                : "bg-primary text-white font-bold hover:brightness-105 shadow-md shadow-indigo-100/50 active:scale-95 cursor-pointer"
            }`}
          >
            {saveSuccess ? "✓ Registro Guardado" : "Guardar Registro de Calma"}
          </button>
        </form>
      </section>

      {/* Past sessions history */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2 ml-1">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-text-primary">Sesiones Pasadas</h3>
          </div>
          {logs.length > 0 && (
            <button
              id="export-clinical-report-button"
              onClick={handleExportTextSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container hover:bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 duration-200 animate-in fade-in"
              title="Exportar registros para revisión médica"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Reporte Clínico</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center p-8 text-xs text-text-muted bg-white rounded-2xl border border-indigo-100/60">
              No hay noches registradas en este dispositivo todavía. Comienza arriba.
            </div>
          ) : (
            logs.map((log) => (
              <div 
                id={`session-card-${log.id}`}
                key={log.id} 
                className="bg-white border border-indigo-100 shadow-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-primary/20 transition-all group duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-container border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">D{log.dayNum}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary text-sm sm:text-base">{log.date}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        log.complied321 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-amber-50 text-amber-700 border-amber-150"
                      }`}>
                        {log.complied321 ? "Regla 321 ok" : "Regla incompleta"}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1 italic max-w-xs">{log.notes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-text-primary font-medium">Energía: {log.wakeEnergy}/10</p>
                    <p className="text-[10px] text-text-muted">{log.duration}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-primary-container border border-primary/20 rounded-xl px-2 py-1 flex-shrink-0 text-center">
                    <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">{log.statusLabel}</span>
                  </div>
                  <button
                    id={`delete-log-btn-${log.id}`}
                    onClick={() => onDeleteLog(log.id)}
                    className="p-2 rounded-full hover:bg-neutral-100 text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quote Insight */}
      <section className="bg-white border border-indigo-100 shadow-xs rounded-[2rem] p-6 text-center space-y-4">
        <span className="text-xl">💡</span>
        <p className="text-sm font-medium italic text-text-primary leading-normal max-w-md mx-auto">
          &ldquo;Tu consistencia para desconectar pantallas 2 horas antes de dormir está directamente correlacionada con la duración acumulada de la fase de sueño REM profundo.&rdquo;
        </p>
      </section>

    </div>
  );
}
