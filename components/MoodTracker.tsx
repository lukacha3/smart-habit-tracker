"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type MoodTrackerProps = {
  selectedDate: Date;
};

const MOODS = [
  { nivel: 1, emoji: "😫", label: "Agotado" },
  { nivel: 2, emoji: "😕", label: "Malo" },
  { nivel: 3, emoji: "😐", label: "Normal" },
  { nivel: 4, emoji: "🙂", label: "Bien" },
  { nivel: 5, emoji: "🤩", label: "Excelente" },
];

export default function MoodTracker({ selectedDate }: MoodTrackerProps) {
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cada vez que cambia el día en el calendario, buscamos el ánimo
  useEffect(() => {
    const fetchMood = async () => {
      setCurrentMood(null);
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      try {
        const res = await fetch(`/api/mood?date=${dateParam}`);
        if (res.ok) {
          const { nivel } = await res.json();
          setCurrentMood(nivel);
        }
      } catch (error) {
        console.error("Error buscando mood:", error);
      }
    };
    fetchMood();
  }, [selectedDate]);

  // Al hacer clic, actualizamos la UI y disparamos a la base de datos
  const handleMoodSelect = async (nivel: number) => {
    setCurrentMood(nivel); // Actualización optimista
    setIsLoading(true);
    const dateParam = format(selectedDate, "yyyy-MM-dd");

    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateParam, nivel }),
      });
    } catch (error) {
      console.error("Error guardando mood:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <span className="text-xs font-bold text-slate-400 dark:text-nord-4 uppercase tracking-wider">
        Energía del día
      </span>
      <div className="flex gap-2">
        {MOODS.map((mood) => {
          const isSelected = currentMood === mood.nivel;
          return (
            <button
              key={mood.nivel}
              onClick={() => handleMoodSelect(mood.nivel)}
              disabled={isLoading}
              title={mood.label}
              className={`
                text-2xl p-2 rounded-xl transition-all duration-300 transform
                ${isSelected 
                  ? 'bg-slate-200 dark:bg-nord-2 scale-110 shadow-sm border border-slate-300 dark:border-nord-3' 
                  : 'bg-slate-50 dark:bg-nord-0 border border-slate-100 dark:border-nord-1 hover:bg-slate-100 dark:hover:bg-nord-1 opacity-60 hover:opacity-100'
                }
              `}
            >
              <span className={isSelected ? "" : "grayscale"}>{mood.emoji}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}