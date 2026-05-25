import Planner from "@/components/Planner";
import Pomodoro from "@/components/Pomodoro"; // <-- Importamos acá

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Tu Resumen Semanal
      </h1>
      <p className="text-lg text-slate-500 dark:text-nord-3 max-w-xl mx-auto border-2 border-dashed border-slate-200 dark:border-nord-2 p-8 rounded-2xl bg-slate-50">
        🏗️ Módulo de Estadísticas y Coach IA en construcción (Próximamente)
      </p>
    </div>
  );
}
