"use client";

import { useState } from "react";

export default function HabitInput() {
  const [habitText, setHabitText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para el manejo de alertas dinámicas
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitText.trim()) return;

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Apuntamos al nuevo endpoint definitivo de procesamiento y persistencia
      const response = await fetch('/api/parse-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit: habitText }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Lanza el error directo al bloque catch si el servidor responde con códigos 4xx o 5xx
        throw new Error(result.error || "Ocurrió un error inesperado al procesar.");
      }

      // Alerta amigable de éxito mapeando los datos de la IA
      setSuccessMessage(
        `¡Hábito registrado! Categoría: ${result.data.categoria} (${result.data.cantidad} ${result.data.unidad})`
      );
      setHabitText(""); // Limpieza automática del campo tras éxito
      
    } catch (error: any) {
      console.error("Error en frontend:", error);
      setErrorMessage(error.message || "No se pudo establecer conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
      >
        <div className="relative flex-grow">
          <input
            type="text"
            value={habitText}
            onChange={(e) => setHabitText(e.target.value)}
            disabled={isLoading}
            placeholder="Ej: Estudié 3 horas de Java ayer a la noche..."
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 dark:text-nord-3 text-gray-900 dark:text-nord-5 bg-white dark:bg-nord-1"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !habitText.trim()}
          className="flex items-center justify-center min-w-[140px] p-4 bg-blue-600 dark:bg-nord-10 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            "Registrar"
          )}
        </button>
      </form>

      {/* Alerta amigable de Error */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium transition-all">
        {errorMessage}
        </div>
      )}

      {/* Alerta amigable de Éxito */}
      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium transition-all">
        {successMessage}
        </div>
      )}
    </div>
  );
}