import HabitInput from "@/components/HabitInput";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Seguí tu ritmo natural
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Escribí lo que hiciste hoy.
        </p>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          Nosotros nos encargamos de organizarlo.
        </p>
      </div>

      {/* Acá montamos el componente que acabamos de crear */}
      <HabitInput />

    </div>
  );
}