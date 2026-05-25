import HabitInput from "@/components/HabitInput";
import Dashboard from "@/components/Dashboard";
import Planner from "@/components/Planner";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 pb-12">
      
      <div className="text-center mb-8 mt-4">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Sigue tu ritmo natural
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Escribe lo que quieres hacer hoy.
        </p> 
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          La IA se encargara de organizarlo.
        </p>
      </div>

      <Planner />
      
      {/* <HabitInput /> */}
      {/* Acá renderizamos tu nuevo tablero analítico */}
      {/* <Dashboard /> */}

    </div>
  );
}