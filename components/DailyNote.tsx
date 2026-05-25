"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Save, Check, Loader2, AlertCircle } from "lucide-react";

type DailyNoteProps = {
  selectedDate: Date;
};

export default function DailyNote({ selectedDate }: DailyNoteProps) {
  const [texto, setTexto] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");

  // Escucha el cambio de fecha en el calendario para limpiar o cargar la nota
  useEffect(() => {
    const fetchNote = async () => {
      setTexto("");
      setSaveStatus("idle");
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      
      try {
        const res = await fetch(`/api/notes?date=${dateParam}`);
        if (res.ok) {
          const data = await res.json();
          setTexto(data.texto || "");
        }
      } catch (error) {
        console.error("Error buscando nota diaria:", error);
      }
    };

    fetchNote();
  }, [selectedDate]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    const dateParam = format(selectedDate, "yyyy-MM-dd");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateParam, texto }),
      });

      if (res.ok) {
        setSaveStatus("saved");
        // Removemos el aviso de éxito después de 3 segundos para limpiar la UI
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Error persistiendo nota:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-nord-2 flex flex-col gap-3 transition-colors">
      
      {/* Cabecera del área de texto */}
      <div className="flex justify-between items-center">
        <label 
          htmlFor="daily-reflection" 
          className="text-xs font-bold text-slate-400 dark:text-nord-4 uppercase tracking-wider"
        >
          Bitácora & Reflexión del Día
        </label>
        
        {/* Feedbacks de estado */}
        {saveStatus === "saved" && (
          <span className="text-xs font-bold text-emerald-600 dark:text-nord-14 flex items-center gap-1 animate-in fade-in duration-300">
            <Check size={14} /> Pensamiento guardado
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs font-bold text-rose-500 dark:text-nord-11 flex items-center gap-1 animate-in shake duration-300">
            <AlertCircle size={14} /> Error al sincronizar
          </span>
        )}
      </div>

      {/* Editor de Texto Libre */}
      <div className="relative">
        <textarea
          id="daily-reflection"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Cómo estuvo tu día? Escribí acá tus ideas, bloqueos, victorias o lo que aprendiste..."
          rows={4}
          className="w-full p-4 border border-slate-200 dark:border-nord-3 rounded-xl bg-slate-50 dark:bg-nord-0 text-slate-800 dark:text-nord-4 placeholder-slate-400 dark:placeholder-nord-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-nord-9 resize-y transition-all min-h-[120px]"
        />
      </div>

      {/* Acción de Guardado */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 bg-slate-800 dark:bg-nord-10 hover:bg-slate-700 dark:hover:bg-nord-9 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:bg-slate-400 dark:disabled:bg-nord-2 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save size={14} />
              Guardar reflexión
            </>
          )}
        </button>
      </div>

    </div>
  );
}