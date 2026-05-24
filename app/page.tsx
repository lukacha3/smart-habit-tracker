import HabitInput from "@/components/HabitInput";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 pb-12">
      
      <div className="text-center mb-8 mt-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Seguí tu ritmo natural
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Escribí lo que hiciste hoy como si se lo contaras a un amigo. La inteligencia artificial se encarga de organizarlo.
        </p>
      </div>

      <HabitInput />
      
      {/* Acá renderizamos tu nuevo tablero analítico */}
      <Dashboard />

    </div>
  );
}