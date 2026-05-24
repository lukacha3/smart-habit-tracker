"use client";

import { useState } from "react";

export default function HabitInput() {
    // 1. Nuestros estados (como si fueran atributos privados de una clase en Java)
    const [habitText, setHabitText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 2. El método que se ejecuta al mandar el formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!habitText.trim()) return;
      
        setIsLoading(true);
      
        try {
            // Le pegamos a nuestro propio backend de Next.js
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ habit: habitText }),
            });
      
            const data = await response.json();
            
            // Imprimimos la categoría que nos devolvió la IA en la consola
            console.log("Texto original:", habitText);
            console.log("Categoría detectada por Llama 3:", data.category);
      
            setHabitText("");
        } catch (error) {
            console.error("Falló la conexión con el servidor:", error);
        } finally {
            // Esto se ejecuta siempre, haya error o no, para destrabar el input
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-10">
            <form 
                onSubmit={handleSubmit} 
                // Usamos flex-col para celulares, y flex-row a partir de tablets (sm:)
                className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
            >
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={habitText}
                        onChange={(e) => setHabitText(e.target.value)}
                        disabled={isLoading}
                        placeholder="Ej: Salí a correr 5km hoy a la mañana..."
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 bg-white"
                        autoComplete="off"
                        />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !habitText.trim()}
                    className="flex items-center justify-center min-w-[140px] p-4 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                {isLoading ? (<>
                {/* Spinner SVG en línea de Tailwind */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                    Pensando...
                </>
                ) : ("Registrar")}
                </button>
            </form>
        </div>
    );
}