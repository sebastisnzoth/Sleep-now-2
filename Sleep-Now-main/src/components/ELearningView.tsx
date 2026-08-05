import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Lightbulb, 
  Clock, 
  Apple, 
  Volume2, 
  ChevronRight, 
  Bookmark, 
  GraduationCap, 
  RotateCcw, 
  FileText, 
  Download, 
  ClipboardCheck, 
  Check,
  AlertCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

const hormonalData = [
  { time: "08:00", cortisol: 90, melatonin: 5 },
  { time: "12:00", cortisol: 70, melatonin: 5 },
  { time: "16:00", cortisol: 50, melatonin: 10 },
  { time: "20:00", cortisol: 20, melatonin: 40 },
  { time: "22:00", cortisol: 10, melatonin: 85, note: "Cruce óptimo: Cena lista, Melatonina en rampa ascendente" },
  { time: "00:00", cortisol: 5, melatonin: 95, note: "Sueño REM y regeneración sistémica activa" },
  { time: "04:00", cortisol: 15, melatonin: 80, note: "Madriguera térmica óptima" },
  { time: "08:00 ", cortisol: 95, melatonin: 5, note: "Pulso matutino para vigor diurno" }
];

interface Module {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  readingTime: string;
  color: string;
  badge: string;
  intro: string;
  sections: {
    title: string;
    content: string;
    bulletPoints?: string[];
  }[];
  keyTakeaway: string;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

export default function ELearningView() {
  // Read and write module completion from LocalStorage
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem("insomnia_completed_modules");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizHistory, setQuizHistory] = useState<{ qIdx: number; userAns: number }[]>([]);
  
  // PDF download simulation state
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [downloadComplete, setDownloadComplete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("insomnia_completed_modules", JSON.stringify(completedModules));
  }, [completedModules]);

  const toggleModuleCompletion = (id: number) => {
    if (completedModules.includes(id)) {
      setCompletedModules(completedModules.filter(m => m !== id));
    } else {
      setCompletedModules([...completedModules, id]);
    }
  };

  const markModuleComplete = (id: number) => {
    if (!completedModules.includes(id)) {
      setCompletedModules([...completedModules, id]);
    }
  };

  const handleDownloadPdf = (pdfName: string) => {
    setDownloadingPdfId(pdfName);
    setDownloadComplete(null);
    setTimeout(() => {
      setDownloadingPdfId(null);
      setDownloadComplete(pdfName);
      setTimeout(() => setDownloadComplete(null), 3000);
    }, 2000);
  };

  const modules: Module[] = [
    {
      id: 1,
      title: "Sincronización Diaria",
      subtitle: "La Regla de Oro 3-2-1-0",
      badge: "Módulo 1",
      icon: <Clock className="w-5 h-5 text-indigo-500" />,
      readingTime: "5 min de lectura",
      color: "from-indigo-500/10 to-indigo-500/5",
      intro: "La desconexión circadiana no ocurre de golpe cuando cerramos los ojos. El cerebro requiere de una transición metabólica y hormonal estrictamente orquestada por el Núcleo Supraquiasmático (NSQ) en respuesta al cese de estímulos digestivos, mentales y lumínicos.",
      sections: [
        {
          title: "3 Horas Antes: Descompresión de Órganos Vitales",
          content: "Detener completamente la ingesta de alimentos sólidos y calóricos. El aparato digestivo requiere un mínimo de 180 minutos para vaciar el estómago. Al postergar la comida, evitas el drenaje de glucosa nocturno que perturba las oscilaciones profundas de ondas delta e impides el reflujo ácido que fragmenta el sueño sutilmente.",
          bulletPoints: [
            "Evita picos de insulina que inhiben la hormona de crecimiento humana (hGH).",
            "Permite el descenso térmico: el cerebro necesita bajar 1.2°C para activar los núcleos de descanso.",
            "Evita la inflamación hepática por digestión a destiempo."
          ]
        },
        {
          title: "2 Horas Antes: Neutralización del Estrés Cortical",
          content: "Cesar toda actividad de alta demanda cognitiva o laboral. El cortisol libre en plasma inhibe categóricamente la deiodinasa y altera la síntesis de neurotransmisores propicios para el reposo en la glándula pineal.",
          bulletPoints: [
            "Desconecta correos y tareas complejas que demandan ondas cerebrales Beta de alta frecuencia.",
            "Sustituye la tensión intelectual por conversaciones reposadas, lectura blanda o estiramientos suaves.",
            "Ayuda al sistema nervioso simpático a desactivar su respuesta ante estímulos estresores de lucha o huida."
          ]
        },
        {
          title: "1 Hora Antes: Blindaje Melatónico de la Retina",
          content: "Supresión absoluta de pantallas emisoras de luz LED y longitudes de onda azulina (rango 450-485 nm). La retina ocular posee células de melanopsina altamente sensibles que inhiben al instante la secreción natural de melatonina.",
          bulletPoints: [
            "Apaga celulares, tablets y monitores LED sin filtro.",
            "Utiliza luz cálida indirecta e incandescente (menos de 40 luxes) en la ambientación del hogar.",
            "Permite que la glándula pineal interprete la oscuridad ambiental constante como señal biológica segura para secretar melatonina."
          ]
        },
        {
          title: "0 Horas: Transición Orgánica Al Descanso",
          content: "Entrar en el soporte de sueño con metas térmicas y de aislamiento completas. El espacio físico debe estar óptimamente aislado de polución acústica y picos térmicos desagradables, actuando como una perfecta madriguera biológica.",
          bulletPoints: [
            "Establece una temperatura neutra templada o fresca constante.",
            "Prepara la mente desactivando la necesidad de repasar pendientes del día siguiente.",
            "Sincroniza un ritmo respiratorio bajo para propiciar ondas cerebrales Alfa y Theta rápidamente."
          ]
        }
      ],
      keyTakeaway: "La regla 3-2-1-0 sincroniza sistemáticamente los relojes biológicos periféricos de tus órganos (reloj estomacal, hepático, visual y cerebral) con el reloj maestro central."
    },
    {
      id: 2,
      title: "Crononutrición Inteligente",
      subtitle: "Ingredientes Precursores de Calma",
      badge: "Módulo 2",
      icon: <Apple className="w-5 h-5 text-emerald-500" />,
      readingTime: "4 min de lectura",
      color: "from-emerald-500/10 to-emerald-500/5",
      intro: "La síntesis de inductores metabólicos naturales del descanso depende íntimamente de la calidad de los nutrientes que cruzan la barrera hematoencefálica durante las horas previas al ciclo de sueño.",
      sections: [
        {
          title: "Aminoácidos Esenciales: El Camino del Triptófano",
          content: "El L-Triptófano es un aminoácido esencial que el cuerpo no puede fabricar por sí mismo. A nivel cerebral, es hidroxilado para la síntesis de 5-HTP (5-hidroxitriptófano), el cual se convierte directamente en Serotonina y, en última instancia, en Melatonina.",
          bulletPoints: [
            "Fuentes naturales: Pescado azul, plátano macho, semillas de calabaza y huevo ecológico.",
            "Debe ingerirse preferiblemente acompañado de carbohidratos complejos de baja carga glucémica para ingresar de forma competitiva al cerebro.",
            "La deficiencia de triptófano acorta sensiblemente la duración de las primeras fases de sueño no-REM."
          ]
        },
        {
          title: "Magnesio Bisglicinato: El Bloqueador del Estrés",
          content: "El magnesio es un mineral crucial que regula cientos de reacciones biológicas. Su forma de bisglicinato (quelado con glicina) ofrece una biodisponibilidad sobresaliente, estabilizando membranas nerviosas y actuando como un modulador alostérico sobre el sistema receptor GABA.",
          bulletPoints: [
            "Inhibe de forma competitiva los receptores de glutamato excitatorio (NMDA).",
            "Disminuye la secreción de ACTH celular (hormona adrenocorticotropa) atenuando el cortisol plasmático.",
            "Promueve la relajación del tono de la elasticidad de los capilares musculares."
          ]
        },
        {
          title: "Apigenina y L-Teanina: Sintonizadores Sinápticos",
          content: "La Manzanilla concentra apigenina, un flavonoide capaz de ligarse selectivamente a los receptores de benzodiazepina sin los efectos secundarios adictivos de un fármaco. Por su parte, la L-Teanina (sustancia abundante en hojas de té blanco o verde descafeinado) incrementa de manera drástica las ondas Alfa cerebrales de calma despierta.",
          bulletPoints: [
            "La apigenina pacifica y reduce la hiperactividad del tálamo cerebral nocturno.",
            "La L-Teanina promueve la síntesis endógena de GABA e inhibe la unión de neurotransmisores estresantes.",
            "Su ingesta sinérgica 90 minutos antes del descanso reduce el tiempo de latencia de inicio del ciclo."
          ]
        }
      ],
      keyTakeaway: "Una cena óptima libre de azúcares y rica en L-Triptófano y Magnesio actúa como el mejor pasaporte bioquímico para el descanso reparador de tus neuronas."
    },
    {
      id: 3,
      title: "La Arquitectura del Sueño",
      subtitle: "Fases REM y No-REM Desmitificadas",
      badge: "Módulo 3",
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      readingTime: "6 min de lectura",
      color: "from-purple-500/10 to-purple-500/5",
      intro: "El sueño nocturno no es un estado plano de inconsciencia. Consiste en una sofisticada procesión rítmica de ciclos de 90 minutos que modulan de manera dinámica la función inmune, la consolidación cognitiva y la limpieza metabólica.",
      sections: [
        {
          title: "Las Fases No-REM: Restauración Física Profunda (Estadio N3)",
          content: "Durante el sueño de ondas lentas o fase N3, el cerebro apaga casi por completo su red neuronal externa. La actividad eléctrica consiste en pulsos sincronizados de alta amplitud y baja frecuencia (ondas Delta 0.5 a 4Hz).",
          bulletPoints: [
            "Soporte Inmunitario: Es cuando se liberan citocinas proinflamatorias y linfocitos de memoria.",
            "Desintoxicación Glinfática: El fluido cerebroespinal fluye a mayor velocidad eliminando los depósitos tóxicos de beta-amiloide acumulados.",
            "Reparación Celular: Se acelera la regeneración del tejido muscular y la síntesis de proteínas reguladoras circadianas."
          ]
        },
        {
          title: "La Fase REM: El Procesamiento Emocional Integrativo",
          content: "La fase REM (Movimiento Ocular Rápido) ocurre principalmente durante la segunda mitad de la noche. El cerebro experimenta una activación metabólica deslumbrante, similar al estado de vigilia diurno, pero con una tonacidad muscular totalmente inhibida (atonía muscular).",
          bulletPoints: [
            "Consolidación de Memoria: El hipocampo transfiere esquemas y aprendizajes a la neocorteza.",
            "Regulación Psicológica: El cerebro elimina la carga emocional de eventos tensos vividos.",
            "Creatividad Incremental: Se generan nuevas sinapsis cruzadas y asociaciones cognitivas inesperadas."
          ]
        },
        {
          title: "La Consistencia del Sueño y el Jet Lag Social",
          content: "Despertarse tarde los fines de semana descalibra los osciladores térmicos y hormonales diurnos. Esto genera el denominado 'jet lag social', un desajuste cronobiológico equivalente a viajar tres husos horarios cada semana.",
          bulletPoints: [
            "Mantener horarios consistentes de despertar e inicio estabiliza la liberación pulsátil de cortisol.",
            "Permite acoplar los ritmos ultradianos de energía para evitar fatigas vespertinas inexplicables.",
            "Dormir de más debilita la 'presión homeostática de sueño' necesaria para la noche posterior."
          ]
        }
      ],
      keyTakeaway: "Un descanso balanceado requiere salvaguardar tanto la profundidad física del sueño N3 (primera mitad de la noche) como el filtrado psicológico del sueño REM (segunda mitad)."
    },
    {
      id: 4,
      title: "Atmósfera Sensorial",
      subtitle: "Disposición Térmica y Sonido Blanco",
      badge: "Módulo 4",
      icon: <Volume2 className="w-5 h-5 text-amber-500" />,
      readingTime: "5 min de lectura",
      color: "from-amber-500/10 to-amber-500/5",
      intro: "La 'cueva circadiana' es el entorno óptimo que simula las condiciones naturales del sueño primitivo humano. El cerebro humano primitivo se preparaba para dormir bajo picos de temperatura decrecientes y total oscuridad nocturna.",
      sections: [
        {
          title: "Termorregulación y la Temperatura Crítica Nocturna",
          content: "Para dormir placenteramente, el cuerpo debe bajar de temperatura de forma central. Si la habitación está demasiado calurosa, el flujo sanguíneo no logra disipar el calor corporal periférico, forzando despertares a mitad de la noche y reduciendo drásticamente la duración del sueño N3.",
          bulletPoints: [
            "Temperatura ideal: La ciencia médica recomienda mantener el cuarto entre 16°C y 19°C.",
            "Un baño templado estimula la vasodilatación periférica ayudando a acelerar el enfriamiento central del cuerpo.",
            "Evita el uso de ropa sintética que retiene humedad e impide la transpiración natural."
          ]
        },
        {
          title: "Sincronización Sináptica por Ondas Binaurales",
          content: "El cerebro sintoniza su frecuencia basándose en pulsos rítmicos externos (fenómeno de arrastre cerebral). Al escuchar frecuencias binaurales bajas con audífonos (ej. canal izquierdo a 100Hz y canal derecho a 104Hz), la mente sintetiza una frecuencia fantasma de 4Hz.",
          bulletPoints: [
            "Estimula la transición rápida de ondas cerebrales Beta diurnas a ondas Theta de 4-8Hz.",
            "Ondas Delta binaurales (0.5 a 4Hz) refuerzan la profundidad estructural de la fase de sueño N3.",
            "Mejora los síntomas ansiosos silenciando la hiperactividad que mantiene al cerebro en estado de alerta constante."
          ]
        },
        {
          title: "Filtros de Luz Azul en el Entorno Digital Nocturno",
          content: "La luz procedente de pantallas inhibe de inmediato los niveles de melatonina debido a que impacta el fotorreceptor de melanopsina. Si es obligatorio trabajar de noche, el uso de filtros es vital.",
          bulletPoints: [
            "Utiliza gafas con bloqueo de luz azul real de espectro alto (más de 85% de filtro azul).",
            "Configura luces rojas o ámbar que no emiten luz de espectro de onda corta menor a 500nm.",
            "Mejora la elasticidad de acomodación ocular y reduce la fatiga visual de la corteza cerebral anterior."
          ]
        }
      ],
      keyTakeaway: "Al simular las condiciones primitivas de una cueva fresca, completamente oscura y silenciosa, desarmas los sensores protectores del sistema nervioso vegetativo."
    }
  ];

  const quizQuestions: Question[] = [
    {
      id: 1,
      text: "¿Por qué es crucial la regla de detener la ingesta de alimentos sólidos 3 horas antes de acostarse?",
      options: [
        "Para lograr bajar de peso sin esfuerzo durante la fase REM.",
        "Permite que el estómago complete su digestión y baje la temperatura corporal central facilitando la inducción al sueño profundo.",
        "Para acelerar la presión homeostática acumulada por esfuerzo diurno exclusivamente.",
        "Sirve de forma exclusiva para incrementar el cortisol cerebral rápidamente."
      ],
      correctIdx: 1,
      explanation: "El estómago necesita un aproximado de 180 minutos para su vaciado completo. La digestión activa retiene el calor en el tracto abdominal, lo que impide que la temperatura corporal central descienda 1.2°C; esta baja térmica es un gatillo imprescindible para sincronizar los ciclos de descanso cerebral."
    },
    {
      id: 2,
      text: "¿Cuál es la función biológica del aminoácido esencial L-Triptófano en el cerebro nocturno?",
      options: [
        "Incrementar las ondas de estrés Beta de alta frecuencia en la corteza occipital.",
        "Inhibir la absorción de nutrientes y neurotransmisores GABA periféricos.",
        "Actuar como el precursor directo para la síntesis secuencial de Serotonina y Melatonina.",
        "Saturar el sistema circulatorio con azúcares y picos glucémicos severos."
      ],
      correctIdx: 2,
      explanation: "El L-Triptófano es hidroxilado y descarboxilado en el cerebro para dar origen a la Serotonina (neurotransmisor de la calma y el humor) y luego es convertido en Melatonina, la hormona esencial reguladora de los ciclos circadianos y el descanso."
    },
    {
      id: 3,
      text: "¿Qué ocurre biológicamente en la glándula pineal ante la exposición a la luz azul (celulares, pantallas)?",
      options: [
        "Se incrementa de forma óptima la secreción pulsátil de melatonina.",
        "Las células de melanopsina retinales detectan la onda y mandan señales al NSQ para cesar inmediatamente la síntesis de melatonina.",
        "Se acelera de forma integral la digestión hepática y estomacal periférica.",
        "No tiene impacto sobre el reloj maestro ya que este es gobernado puramente por la temperatura."
      ],
      correctIdx: 1,
      explanation: "La luz de espectro azul (rango de 450-485nm) es leída por receptores especiales (melanopsina) en las células ganglionares de la retina. Al recibir esta onda, interpretan que es plena luz de día y ordenan cortar la síntesis de melatonina al instante."
    },
    {
      id: 4,
      text: "¿Qué característica eléctrica y metabólica define a la Fase REM del sueño?",
      options: [
        "Predominio absoluto de ondas Delta con nula actividad cerebral y alta tensión en extremidades corporales.",
        "Actividad cerebral metabólica intensa con ondas rápidas parecidas al estado de vigilia, acompañada de atonía muscular absoluta.",
        "Reducción total de la circulación de fluido cerebroespinal en los nervios motores del hipocampo.",
        "Un estado físico rígido permanente sin actividad ocular de ningún tipo."
      ],
      correctIdx: 1,
      explanation: "En la fase REM (Movimiento Ocular Rápido) el cerebro procesa de forma activa información emocional y consolida memorias. Presenta un alto consumo meta-hormonal y actividad eléctrica rápida, combinada con la 'atonía muscular', un estado protector de baja tensión que impide representar físicamente los sueños."
    },
    {
      id: 5,
      text: "Se define como 'Jet Lag Social' circadiano a...",
      options: [
        "Un desfase cronobiológico causado por diferencias drásticas e inconsistencias de hábitos de sueño entre días laborables y fines de semana.",
        "El retraso en el despegue de vuelos comerciales intercontinentales nocturnos.",
        "La fobia a socializar debido al insomnio crónico recurrente.",
        "La desconexión metabólica por falta de minerales en la microbiota digestiva únicamente."
      ],
      correctIdx: 0,
      explanation: "Cambiar drásticamente las horas de despertar e ir a acostarse los fines de semana (ej: levantarse 4 horas más tarde de lo habitual) descalibra por completo los osciladores hormonales y el reloj maestro del NSQ, produciendo un efecto de desajuste similar al de un viaje transoceánico."
    }
  ];

  const currentModule = modules.find(m => m.id === activeModuleId) || modules[0];

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setQuizHistory([]);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerIdx(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIdx === null || isAnswerSubmitted) return;
    
    setIsAnswerSubmitted(true);
    const correct = selectedAnswerIdx === quizQuestions[currentQuestionIdx].correctIdx;
    if (correct) {
      setScore(prev => prev + 1);
    }
    setQuizHistory(prev => [...prev, { qIdx: currentQuestionIdx, userAns: selectedAnswerIdx }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswerIdx(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentQuestionIdx(0);
    setSelectedAnswerIdx(null);
    setIsAnswerSubmitted(false);
  };

  const totalModulesCount = modules.length;
  const completedCount = completedModules.length;
  const eLearningProgressPercentage = Math.round((completedCount / totalModulesCount) * 100);

  return (
    <div id="elearning-tab-view" className="space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* Education Header Banner */}
      <section className="bg-gradient-to-br from-white via-white to-primary-container/20 rounded-[2.5rem] p-6 sm:p-8 border border-indigo-150 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <GraduationCap className="w-48 h-48 text-primary" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex py-1 px-3 bg-[#818cf8]/10 border border-primary/20 rounded-full text-[10px] text-primary gap-1.5 items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-bold uppercase tracking-wider">Academia de Bio-Higiene</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              E-Learning Científico
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Descubre las bases científicas de la optimización del biorritmo. Información sintetizada directamente del prestigioso programa de higiene celular y cronobiología nocturna.
            </p>
          </div>

          {/* Module completions progress ring card */}
          <div className="bg-white border border-indigo-100 shadow-sm p-5 rounded-3xl flex items-center gap-4 flex-shrink-0 w-full sm:w-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="4.5" 
                  strokeDasharray="176" 
                  strokeDashoffset={176 - (176 * eLearningProgressPercentage) / 100}
                  className="transition-all duration-700 stroke-linecap-round"
                />
              </svg>
              <span className="text-xs font-mono font-extrabold text-[#4f46e5]">{eLearningProgressPercentage}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#51637a] uppercase tracking-wider">Plan de Estudios</p>
              <h4 className="text-text-primary font-bold text-base mt-0.5">{completedCount} de {totalModulesCount}</h4>
              <p className="text-[10px] text-[#22c55e] font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Módulos acreditados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left side modules list, Right side detailed reading content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left hand modules selector index rail */}
        <section className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2 pl-1 mb-1">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#51637a] font-mono">Índice del Curso</span>
          </div>

          <div className="space-y-3">
            {modules.map((m) => {
              const isActive = activeModuleId === m.id;
              const isCompleted = completedModules.includes(m.id);
              return (
                <div
                  id={`module-step-item-${m.id}`}
                  key={m.id}
                  onClick={() => setActiveModuleId(m.id)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between gap-3 bg-white ${
                    isActive 
                      ? "border-primary ring-2 ring-primary/10 shadow-sm"
                      : "border-indigo-100 hover:border-primary/20 hover:bg-slate-50/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-primary-container text-primary" : "bg-slate-100 text-text-muted"
                    }`}>
                      {m.icon}
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#64748b] block opacity-85">
                        {m.badge} • {m.readingTime}
                      </span>
                      <h4 className={`text-xs sm:text-sm font-bold tracking-tight mt-0.5 ${isActive ? "text-primary" : "text-text-primary"}`}>
                        {m.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    id={`module-check-switch-${m.id}`}
                    type="button"
                    title="Marcar como leído"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModuleCompletion(m.id);
                    }}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isCompleted 
                        ? "bg-[#22c55e] border-transparent text-white" 
                        : "border-indigo-200 hover:border-primary bg-white text-transparent hover:text-primary/20"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick PDF resources simulation */}
          <div className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h5 className="text-xs uppercase tracking-wider font-bold text-text-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Material Médico Acreditado</span>
            </h5>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Consigue las guías clínicas completas del protocolo en PDF para impresión física o visualización móvil.
            </p>
            <div className="divide-y divide-indigo-50/50">
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary">Secuencia Descompresión 321.pdf</span>
                <button
                  id="dl-pdf-decompression"
                  onClick={() => handleDownloadPdf("321")}
                  className="p-1.5 hover:bg-primary-container rounded-full text-primary transition-all"
                  title="Descargar PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary">Crononutrición y Neurociencias.pdf</span>
                <button
                  id="dl-pdf-crononutrition"
                  onClick={() => handleDownloadPdf("crononutrition")}
                  className="p-1.5 hover:bg-primary-container rounded-full text-primary transition-all"
                  title="Descargar PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulating downloading animation */}
            {downloadingPdfId && (
              <div className="bg-primary-container/20 p-2 text-[10px] text-primary rounded-xl flex items-center gap-2 border border-primary/10 animate-pulse">
                <span>⚡ Descargando y sincronizando con tu dispositivo...</span>
              </div>
            )}
            {downloadComplete && (
              <div className="bg-emerald-50 p-2 text-[10px] text-emerald-700 rounded-xl flex items-center gap-1.5 border border-emerald-100">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>¡Documentación médica almacenada con éxito!</span>
              </div>
            )}
          </div>
        </section>

        {/* Right hand content reading block */}
        <section className="md:col-span-8 bg-white border border-indigo-100 rounded-[2rem] p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/60 pb-4">
            <div>
              <span className="text-[10px] font-bold text-white bg-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs mb-2 inline-block">
                {currentModule.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
                {currentModule.title}
              </h3>
              <p className="text-xs text-text-muted uppercase tracking-widest font-mono font-semibold mt-1">
                {currentModule.subtitle} • {currentModule.readingTime}
              </p>
            </div>
            
            <button
              id="module-action-unlocked-done"
              onClick={() => markModuleComplete(currentModule.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1 ${
                completedModules.includes(currentModule.id)
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-primary text-white hover:brightness-105"
              }`}
            >
              {completedModules.includes(currentModule.id) ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Acreditado ✓</span>
                </>
              ) : (
                <span>Marcar módulo como estudiado</span>
              )}
            </button>
          </div>

          {/* Module Intro */}
          <div className="p-4 bg-slate-50 border border-indigo-100/50 rounded-2xl">
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed italic">
              &ldquo;{currentModule.intro}&rdquo;
            </p>
          </div>

          {/* Detailed Content Sections */}
          <div className="space-y-6">
            {currentModule.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2.5">
                <h4 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-indigo-250 rounded-full inline-block" />
                  <span>{sec.title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {sec.content}
                </p>
                {sec.bulletPoints && (
                  <ul className="list-none pl-1.5 space-y-2">
                    {sec.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-primary leading-normal">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* If Module 1, show hormonal curves chart identical to user's original schema */}
            {currentModule.id === 1 && (
              <div id="hormone-chart-container" className="border border-indigo-100 bg-slate-50/50 rounded-2xl p-5 lg:p-6 space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/50 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Dinámica Hormonal Circadiana</span>
                    </h5>
                    <p className="text-[11px] text-text-muted">La contraposición entre el Cortisol (alerta) y la Melatonina (reposo)</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold font-mono">
                    <span className="flex items-center gap-1.5 text-amber-500">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> CORTISOL
                    </span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" /> MELATONINA
                    </span>
                  </div>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hormonalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCortisol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMelatonin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3730A3" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#3730A3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white border border-indigo-100 p-3 rounded-xl shadow-md text-xs space-y-1 backdrop-blur-md">
                                <p className="font-extrabold text-text-primary text-[10px] uppercase tracking-wider">{data.time} hrs</p>
                                <p className="text-amber-600 font-medium">Cortisol: <span className="font-bold font-mono">{data.cortisol}%</span></p>
                                <p className="text-primary font-medium">Melatonina: <span className="font-bold font-mono">{data.melatonin}%</span></p>
                                {data.note && (
                                  <p className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50 mt-1 max-w-[200px] leading-tight">
                                    {data.note}
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Area type="monotone" dataKey="cortisol" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCortisol)" />
                      <Area type="monotone" dataKey="melatonin" stroke="#3730A3" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMelatonin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-text-muted text-center italic leading-relaxed">
                  * Gráfico interactivo: El cruce de curvas se favorece limitando ruidos biológicos (cena copiosa, pantallas y estrés laboral) en las horas previas.
                </p>
              </div>
            )}
          </div>

          {/* Module Key Takeaway Banner */}
          <div className="p-4 bg-primary-container rounded-2xl border border-primary/10 text-xs flex gap-3">
            <span className="text-xl">💡</span>
            <div className="space-y-0.5">
              <strong className="text-primary font-bold uppercase tracking-wider block font-mono text-[9px]">Concepto Crítico Clave</strong>
              <p className="text-text-primary leading-relaxed">{currentModule.keyTakeaway}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-indigo-100/60 text-xs text-text-muted font-semibold">
            <span>Siguiente Módulo: {modules.find(m => m.id === (currentModule.id === 4 ? 1 : currentModule.id + 1))?.title}</span>
            <button
              id="module-btn-next-lesson"
              onClick={() => {
                const nextId = currentModule.id === 4 ? 1 : currentModule.id + 1;
                setActiveModuleId(nextId);
                // scroll to top of reader section smoothly
                const itemEl = document.querySelector("#elearning-tab-view");
                if (itemEl) {
                  itemEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-primary font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Avanzar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

      </div>

      {/* Sleep Sciences Certification interactive Challenge and Quiz Section */}
      <section className="bg-gradient-to-br from-[#818cf8]/5 via-[#4f46e5]/5 to-transparent border border-indigo-150 rounded-[2.5rem] p-6 sm:p-8 space-y-6">
        
        {!quizStarted ? (
          <div className="text-center max-w-2xl mx-auto space-y-5 py-4">
            <div className="w-16 h-16 rounded-3xl bg-primary-container border border-primary/25 flex items-center justify-center text-primary mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Examen de Certificación Circadiana
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Pon a prueba tus conocimientos en neurofisiología, crononutrición y el protocolo de descompresión nocturna. Si respondes de manera correcta las **{quizQuestions.length} preguntas**, obtendrás un diploma digital descargable con tu nombre.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <button
                id="start-certification-exam-btn"
                onClick={handleStartQuiz}
                className="px-8 py-3.5 rounded-full bg-[#4f46e5] text-white font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-150 cursor-pointer"
              >
                Comenzar Examen de Suficiencia
              </button>
              
              <div className="text-[11px] text-text-muted font-bold font-mono bg-white border border-indigo-100 rounded-full px-4 py-1.5">
                🎯 {quizQuestions.length} Reactivos • Requiere 100% de Aciertos
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Header Quiz Progress */}
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-text-primary">
                  {!quizFinished ? `Pregunta ${currentQuestionIdx + 1} de ${quizQuestions.length}` : "Evaluación Finalizada"}
                </span>
              </div>
              <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + (quizFinished ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {!quizFinished ? (
              <div className="space-y-5">
                {/* Question Text */}
                <h4 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
                  {quizQuestions[currentQuestionIdx].text}
                </h4>

                {/* Multiple choice options list */}
                <div className="grid grid-cols-1 gap-3">
                  {quizQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswerIdx === oIdx;
                    let optionStyle = "border-indigo-100 bg-white hover:border-primary/30 hover:bg-slate-50/20";
                    
                    if (isAnswerSubmitted) {
                      const isCorrectAnswer = oIdx === quizQuestions[currentQuestionIdx].correctIdx;
                      if (isCorrectAnswer) {
                        optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900";
                      } else if (isSelected) {
                        optionStyle = "border-red-500 bg-red-50 text-red-900";
                      } else {
                        optionStyle = "border-indigo-100/40 bg-white/40 text-text-muted opacity-50";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-primary ring-2 ring-primary/20 bg-primary-container/30 text-primary font-medium";
                    }

                    return (
                      <button
                        id={`quiz-option-${currentQuestionIdx}-${oIdx}`}
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(oIdx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all focus:outline-none flex justify-between items-center ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerSubmitted && oIdx === quizQuestions[currentQuestionIdx].correctIdx && (
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                        )}
                        {isAnswerSubmitted && isSelected && oIdx !== quizQuestions[currentQuestionIdx].correctIdx && (
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Feedback Description when submitted */}
                {isAnswerSubmitted && (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block font-mono">Respuesta Razonada</span>
                    <p className="text-xs text-text-primary leading-relaxed">
                      {quizQuestions[currentQuestionIdx].explanation}
                    </p>
                  </div>
                )}

                {/* Footer Exam Controls */}
                <div className="flex justify-end gap-3 pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      id="submit-exam-answer"
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswerIdx === null}
                      className="px-6 py-3 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
                    >
                      Verificar Respuesta
                    </button>
                  ) : (
                    <button
                      id="advance-exam-step"
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentQuestionIdx === quizQuestions.length - 1 ? "Terminar Examen" : "Siguiente Pregunta"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                
                {/* Result graphic badge */}
                {score === quizQuestions.length ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <Check className="w-8 h-8 stroke-[3px]" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 font-mono block">Examen Aprobado • 100% Calificación</span>
                      <h4 className="text-2xl font-black text-text-primary tracking-tight">
                        ¡Felicidades, Egresado Circadiano!
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Has contestado de manera perfecta todas las evaluaciones. Tu cerebro domina las claves circadianas que rigen el descanso.
                      </p>
                    </div>

                    {/* High fidelity interactive Sleep Certificate Mockup Card */}
                    <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xl ring-4 ring-indigo-50/20 relative overflow-hidden text-center my-6">
                      <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                        <Award className="w-32 h-32 text-primary" />
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-indigo-50 pb-3 mb-4">
                        <span className="text-[9px] uppercase font-bold text-[#818cf8] font-mono tracking-widest">Sleep Now® Academia</span>
                        <GraduationCap className="w-5 h-5 text-indigo-500" />
                      </div>

                      <div className="space-y-4">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#64748b] block font-mono">DIPLOMA AL ESTUDIANTE</span>
                        <h5 className="text-xl font-bold text-[#4f46e5] capitalize tracking-tight select-all">
                          {localStorage.getItem("insomnia_user") ? JSON.parse(localStorage.getItem("insomnia_user") || "").name : "Alex Rivera"}
                        </h5>
                        <p className="text-[11px] text-text-muted leading-relaxed max-w-xs mx-auto">
                          Acreditado formalmente por su dominio de la <strong>Regla 3-2-1-0</strong>, leyes de <strong>Crononutrición Celular</strong> y el análisis de oscilaciones profundas de descanso en ondas Delta.
                        </p>

                        <div className="pt-4 border-t border-indigo-50 flex justify-between items-end text-[9px] font-mono text-text-muted">
                          <div className="text-left">
                            <p className="font-semibold block text-[#4f46e5]">CÓDIGO DE VALIDACIÓN</p>
                            <span className="uppercase text-text-primary">INS-0-ACAD-E98</span>
                          </div>
                          <div>
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">Firmado ✓</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        id="retake-quiz-exam-passed"
                        onClick={resetQuiz}
                        className="px-6 py-3 rounded-full border border-indigo-200 bg-white hover:bg-slate-50 text-text-primary font-bold text-xs uppercase tracking-wider active:scale-95 transition-all text-center cursor-pointer"
                      >
                        Reiniciar Evaluador
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                      <RotateCcw className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-extrabold text-text-primary tracking-tight">
                        Puntaje: {score} de {quizQuestions.length} Aciertos
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Para recibir tu acreditación e insignia debes contestar con el **100% de efectividad**. Repasa los módulos del curso y vuelve a intentarlo tantas veces como consideres oportuno.
                      </p>
                    </div>
                    
                    <button
                      id="retry-exam-challenge"
                      onClick={handleStartQuiz}
                      className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Intentar de Nuevo
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </section>

    </div>
  );
}
