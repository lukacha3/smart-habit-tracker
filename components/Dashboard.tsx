"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Habit = {
  id: string;
  categoria: string;
  cantidad: number;
  unidad: string;
};

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ejecutamos la búsqueda ni bien el componente aparece en pantalla
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const response = await fetch('/api/get-habits');
        if (response.ok) {
          const result = await response.json();
          setHabits(result.data);
        }
      } catch (error) {
        console.error("Error cargando hábitos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, []);

  // ESTADO VISUAL 1: Cargando datos
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-medium">Analizando tus estadísticas...</p>
      </div>
    );
  }

  // ESTADO VISUAL 2: Aún no hay datos en Supabase
  if (habits.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
        <span className="text-4xl mb-3">📊</span>
        <h3 className="text-lg font-bold text-gray-800">Tu tablero está vacío</h3>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Aún no tenés datos para mostrar. Registrá tu primer hábito usando el buscador de arriba y el gráfico se armará solo.
        </p>
      </div>
    );
  }

  // TRANSFORMACIÓN DE DATOS (Agrupar y sumar por categoría para el gráfico)
  const chartData = habits.reduce((acc: any[], habit) => {
    // Buscamos si la categoría ya existe en nuestro acumulador
    const existing = acc.find(item => item.name === habit.categoria);
    if (existing) {
      existing.cantidad += Number(habit.cantidad);
    } else {
      acc.push({ name: habit.categoria, cantidad: Number(habit.cantidad) });
    }
    return acc;
  }, []).sort((a, b) => b.cantidad - a.cantidad); // Ordenamos de mayor a menor

  // ESTADO VISUAL 3: Renderizado exitoso del gráfico
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Tus Hábitos por Categoría</h2>
      
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 14 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 13 }} />
            
            {/* Tooltip moderno al pasar el mouse */}
            <Tooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            
            <Bar 
              dataKey="cantidad" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} // Bordes redondeados arriba
              barSize={40}
              name="Frecuencia / Cantidad"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}