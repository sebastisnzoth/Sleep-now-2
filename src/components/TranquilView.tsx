import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Utensils, Zap, Shield, HelpCircle, Droplet, Coffee, ChefHat, RefreshCw } from "lucide-react";
import { RecipeSuggestion } from "../types";
import SleepSoundscape from "./SleepSoundscape";

export default function TranquilView() {
  const [loading, setLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<RecipeSuggestion | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<string>("");

  const feelings = ["Insomnio leve", "Siento pesadez", "Día muy activo", "Ansiedad nocturna"];

  const generateMeal = async (feelingVal?: string) => {
    setLoading(true);
    setRecipeResult(null);
    try {
      const response = await fetch("/api/dinner-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: feelingVal || selectedFeeling || "healthy" })
      });
      if (response.ok) {
        const data = await response.json();
        setRecipeResult(data);
      } else {
        throw new Error("API error");
      }
    } catch (e) {
      console.warn("Chef AI failed, using built-in guide.", e);
      // Fallback in case of server hitch
      setRecipeResult({
        recipeName: "Salmón al vapor con espárragos y nueces",
        ingredients: ["150g de filete de salmón fresco", "1 taza de espárragos trigueros", "1 cucharada de nueces picadas", "1 cucharadita de aceite de oliva", "Una pizca de sal marina"],
        preparation: "Cocina el salmón y los espárragos al vapor en un cesto durante 10-12 minutos. Sirve templado aderezado con aceite crudo y espolvoreando las nueces molidas.",
        benefits: "El Omega-3 y Zinc se complementan con el Magnesio de las nueces para ralentizar las funciones respiratorias preparando al sistema muscular para la quietud.",
        idealTiming: "3 Horas antes de dormir"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="tranquil-view" className="space-y-10 pb-16 animate-in fade-in duration-500">
      
      {/* Essential Copy Timing Header */}
      <section className="text-center space-y-3">
        <span className="text-[11px] text-primary tracking-[0.2em] uppercase font-semibold">Crononutrición Inteligente</span>
        <h2 className="text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">
          Ritmo Circadiano &amp; Digestión
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          Al caer la noche, tu metabolismo se ralentiza para priorizar la reparación de tejidos y la desintoxicación celular. Sincronizar tu ingesta alimentaria con tu reloj biológico es crucial para gozar de un descanso verdaderamente reparador.
        </p>
      </section>

      {/* Sleep Soundscape Studio Section */}
      <SleepSoundscape />

      {/* Nutrients Section (Bento Style Grid) */}
      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-primary ml-1">Nutrientes Esenciales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tryptophan card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-indigo-100 shadow-sm hover:border-primary/45 transition-colors group cursor-default">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary border border-primary/10">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-medium text-text-primary">Triptófano</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Aminoácido precursor esencial para sintetizar la melatonina y serotonina. Facilita el inicio natural del sueño.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-primary">
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">CENA TEMPRANA</span>
            </div>
          </div>

          {/* Magnesium card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-indigo-100 shadow-sm hover:border-primary/45 transition-colors group cursor-default">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-medium text-text-primary">Magnesio</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Relajante neuromuscular orgánico. Ayuda a inhibir receptores de estrés disminuyendo el cortisol en el plasma.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-indigo-500">
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">1-2H ANTES</span>
            </div>
          </div>

          {/* Zinc card */}
          <div className="bg-white rounded-2xl p-6 flex flex-col justify-between border border-indigo-100 shadow-sm hover:border-primary/45 transition-colors group cursor-default">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-medium text-text-primary">Zinc</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Estabilizador sináptico. Incrementa la duración y densidad de la fase del sueño REM y mejora de forma global el descanso.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-100/60 flex items-center gap-2 text-purple-650">
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">SUPLEMENTACIÓN DIARIA</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3-Hour Rule Visual Infographic */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-indigo-100 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            {/* Spinning/pulsing dotted border */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-primary/40 flex flex-col items-center justify-center bg-primary-container/40">
              <span className="text-4xl font-extrabold text-primary tracking-tight">3h</span>
              <span className="text-[9px] uppercase tracking-widest text-[#51637a] mt-1 font-mono">Cena previa</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 text-center md:text-left">
            <h3 className="text-2xl font-medium text-text-primary tracking-tight">La Regla de las 3 Horas</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Cenar al menos 180 minutos antes de acostarte permite que el estómago complete su proceso de vaciado y tu temperatura corporal central disminuya: una señal térmica crítica con la que el cerebro inicia el ciclo ideal de sueño profundo.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full bg-slate-50 text-xs text-primary border border-indigo-100 shadow-xs font-semibold">
                Digestión completa
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-xs text-primary border border-indigo-100 shadow-xs font-semibold">
                Baja temperatura corporal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hydration advice banner cards */}
      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-[0.15em] font-semibold text-primary ml-1">Plan de Hidratación Nocturna</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-indigo-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary flex-shrink-0 border border-primary/10">
              <Droplet className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h5 className="text-text-primary font-medium text-base">Bebe a Sorbos</h5>
              <p className="text-xs text-text-muted leading-relaxed">
                Evita grandes volúmenes de líquido 90 minutos antes de acostarte. Esto minimiza las interrupciones urinarias en mitad de las fases del sueño profundo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-indigo-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0 border border-orange-100">
              <Coffee className="w-6 h-6 text-orange-500" />
            </div>
            <div className="space-y-1">
              <h5 className="text-text-primary font-medium text-base">Cero Estimulantes</h5>
              <p className="text-xs text-text-muted leading-relaxed">
                La cafeína tiene una vida media de hasta 8 horas. Evítala categóricamente después de las 14:00 horas para salvaguardar tu secreción de adenosina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Meal Creator Section using Server-Side Gemini API */}
      <section className="bg-gradient-to-br from-white via-white to-primary-container/20 rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 relative overflow-hidden border border-indigo-150 shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ChefHat className="w-32 h-32 text-primary" />
        </div>

        <div className="text-center max-w-md space-y-2">
          <div className="inline-flex py-1 px-3 bg-primary-container border border-primary/25 rounded-full text-xs text-primary gap-1.5 items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">Asistente Culinario Circadiano</span>
          </div>
          <h3 className="text-2xl font-semibold text-text-primary tracking-tight">Cena de Diseño Neural</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Genera de forma instantánea una cena biológicamente equilibrada, libre de picos de glucosa y cargada de inductores hormonales del sueño profundo.
          </p>
        </div>

        {/* Emotion/Feeling selection chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {feelings.map((f) => (
            <button
              id={`meal-chip-${f.replace(/\s+/g, '-').toLowerCase()}`}
              key={f}
              onClick={() => {
                const newVal = selectedFeeling === f ? "" : f;
                setSelectedFeeling(newVal);
                generateMeal(newVal);
              }}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                selectedFeeling === f
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "bg-white text-text-primary hover:bg-slate-50 border border-indigo-100 shadow-xs"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="w-full max-w-lg flex flex-col items-center gap-4">
          <button
            id="suggestion-meal-generator"
            disabled={loading}
            onClick={() => generateMeal()}
            className="px-10 py-4 rounded-full bg-primary text-white font-bold shadow-md shadow-indigo-100 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Analizando biorritmo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-white text-white" />
                <span>Sugerir cena ideal</span>
              </>
            )}
          </button>

          {/* Result Block holds Gemini data securely or fallback */}
          <AnimatePresence mode="wait">
            {recipeResult && (
              <motion.div
                id="dinner-recommendation-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="w-full bg-white rounded-2xl p-6 border border-primary/30 space-y-4 shadow-md shadow-indigo-100/40"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary-container px-2 py-0.5 rounded border border-primary/20">
                      Receta Circadiana Recomendada
                    </span>
                    <h4 className="text-xl font-bold text-text-primary tracking-tight pt-1">
                      {recipeResult.recipeName}
                    </h4>
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold flex-shrink-0 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {recipeResult.idealTiming}
                  </span>
                </div>

                <div className="text-sm text-text-primary bg-slate-50 rounded-xl p-4 border border-indigo-100/60 space-y-2">
                  <p className="font-semibold text-text-primary flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span>Ingredientes necesarios</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-text-muted pl-1">
                    {recipeResult.ingredients.map((ing, idx) => (
                      <li key={idx} className="leading-relaxed">{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm space-y-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest block font-mono">Instrucciones de preparación</span>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {recipeResult.preparation}
                  </p>
                </div>

                <div className="p-4 bg-primary-container rounded-xl border border-primary/10 text-xs flex gap-3">
                  <span className="text-xl">✨</span>
                  <p className="text-text-primary leading-normal">
                    <strong>Beneficio Circadiano:</strong> {recipeResult.benefits}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

    </div>
  );
}
