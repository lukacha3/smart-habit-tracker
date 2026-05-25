"use client";

import { useState, useEffect } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek 
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2, CheckSquare, Square, Clock } from "lucide-react";
import MoodTracker from "./MoodTracker";
import DailyNote from "./DailyNote";

type Task = {
  id: string;
  titulo: string;
  estado: "pendiente" | "completado" | "fallado";
  fecha_objetivo: string;
  hora_inicio: string | null;
  hora_fin: string | null;
};

export default function Planner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [planText, setPlanText] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  const [checkedForDelete, setCheckedForDelete] = useState<string[]>([]);

  const [timePickerTask, setTimePickerTask] = useState<Task | null>(null);
  const [tempStartTime, setTempStartTime] = useState("");
  const [tempEndTime, setTempEndTime] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setCheckedForDelete([]);
      const dateParam = format(selectedDate, "yyyy-MM-dd");
      
      try {
        const response = await fetch(`/api/get-tasks?date=${dateParam}`);
        if (response.ok) {
          const result = await response.json();
          setTasks(result.data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.estado === "completado" ? "pendiente" : "completado";
    
    setTasks(currentTasks => 
      currentTasks.map(t => t.id === task.id ? { ...t, estado: newStatus } : t)
    );

    await fetch('/api/update-task', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, estado: newStatus }),
    });
  };

  const openTimeModal = (task: Task) => {
    setTimePickerTask(task);
    setTempStartTime(task.hora_inicio ? task.hora_inicio.substring(0, 5) : "");
    setTempEndTime(task.hora_fin ? task.hora_fin.substring(0, 5) : "");
  };

  const closeTimeModal = () => {
    setTimePickerTask(null);
  };

  const saveTimeConfig = async () => {
    if (!timePickerTask) return;
    
    const id = timePickerTask.id;
    const hInicio = tempStartTime ? `${tempStartTime}:00` : null;
    const hFin = tempEndTime ? `${tempEndTime}:00` : null;

    setTasks(currentTasks =>
      currentTasks.map(t => t.id === id ? { ...t, hora_inicio: hInicio, hora_fin: hFin } : t)
    );

    closeTimeModal();

    await fetch('/api/update-task', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, hora_inicio: hInicio, hora_fin: hFin }),
    });
  };

  const clearTimeConfig = async () => {
    setTempStartTime("");
    setTempEndTime("");
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planText.trim()) return;

    setIsPlanning(true);
    setFeedbackMsg({ text: "", type: "" });
    const dateParam = format(selectedDate, "yyyy-MM-dd");

    try {
      const response = await fetch('/api/plan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: planText, fechaSeleccionada: dateParam }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setFeedbackMsg({ text: `¡Se agregaron ${result.count} tareas!`, type: "success" });
      setPlanText("");
      
      const updatedTasks = await fetch(`/api/get-tasks?date=${dateParam}`);
      if (updatedTasks.ok) {
        const tasksData = await updatedTasks.json();
        setTasks(tasksData.data);
      }

    } catch (error: any) {
      setFeedbackMsg({ text: error.message || "Error al planificar.", type: "error" });
    } finally {
      setIsPlanning(false);
    }
  };

  const handleSelectForDelete = (id: string) => {
    setCheckedForDelete(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAllForDelete = () => {
    if (checkedForDelete.length === tasks.length) {
      setCheckedForDelete([]); 
    } else {
      setCheckedForDelete(tasks.map(t => t.id)); 
    }
  };

  const handleBulkDelete = async () => {
    if (checkedForDelete.length === 0) return;

    const savedTasksForRollback = [...tasks];
    const idsToDelete = [...checkedForDelete];

    setTasks(current => current.filter(t => !idsToDelete.includes(t.id)));
    setCheckedForDelete([]);

    try {
      const response = await fetch('/api/delete-tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (!response.ok) throw new Error("Error en servidor");
      
    } catch (error) {
      console.error(error);
      setTasks(savedTasksForRollback);
      setFeedbackMsg({ text: "Error al borrar registros.", type: "error" });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative text-slate-800 dark:text-nord-4">
      
      {/* CALENDARIO */}
      <div className="bg-slate-50 dark:bg-nord-1 border border-slate-200 dark:border-nord-2 rounded-2xl p-6 shadow-sm col-span-1 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-nord-2 rounded-full transition text-slate-600 dark:text-nord-4">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-slate-800 dark:text-nord-5 capitalize">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-nord-2 rounded-full transition text-slate-600 dark:text-nord-4">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 dark:text-nord-4">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={idx}
                onClick={() => onDateClick(day)}
                className={`
                  aspect-square flex items-center justify-center text-sm font-medium rounded-full transition-all
                  ${!isCurrentMonth ? "text-slate-300 dark:text-nord-3 opacity-40" : "text-slate-700 dark:text-nord-4"}
                  ${isSelected ? "bg-slate-800 dark:bg-nord-10 dark:bg-nord-3 text-white dark:text-nord-6 shadow-md hover:bg-slate-700" : "hover:bg-slate-200 dark:hover:bg-nord-2"}
                  ${isToday && !isSelected ? "border-2 border-slate-800 dark:border-nord-8 text-slate-800 dark:text-nord-8" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALLE DEL DÍA */}
      <div className="col-span-1 md:col-span-2 bg-white dark:bg-nord-1 border border-slate-200 dark:border-nord-2 rounded-2xl p-6 shadow-sm min-h-[400px] transition-colors duration-300">
              
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-nord-5 mb-1 capitalize">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </h3>
                <p className="text-slate-500 dark:text-nord-4 text-sm">Planificación del día</p>
            </div>
                
            <MoodTracker selectedDate={selectedDate} />
        </div>
        
        {/* INPUT DE INTENCIONES */}
        <form onSubmit={handlePlanSubmit} className="mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                disabled={isPlanning}
                placeholder="Ej: Me propongo estudiar 4 horas e ir al gym..."
                className="flex-grow p-3 border border-slate-300 dark:border-nord-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-nord-9 text-sm disabled:bg-slate-50 dark:disabled:bg-nord-2 text-slate-900 dark:text-nord-4 bg-white dark:bg-nord-1 transition-colors"
              />
              <button
                type="submit"
                disabled={isPlanning || !planText.trim()}
                className="px-6 bg-slate-800 dark:bg-nord-10 text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-slate-700 dark:hover:bg-nord-9 disabled:bg-slate-400 dark:disabled:bg-nord-2 transition min-w-[120px] flex justify-center items-center"
              >
                {isPlanning ? "Pensando..." : "Planificar"}
              </button>
            </div>
            {feedbackMsg.text && (
              <span className={`text-xs font-medium px-2 ${feedbackMsg.type === 'error' ? 'text-red-500 dark:text-nord-11' : 'text-emerald-600 dark:text-nord-14'}`}>
                {feedbackMsg.text}
              </span>
            )}
          </div>
        </form>

        {/* BARRA DE ACCIONES MASIVAS */}
        {tasks.length > 0 && (
          <div className="mb-4 flex justify-between items-center border-b border-slate-100 dark:border-nord-2 pb-3">
            <button
              onClick={handleSelectAllForDelete}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-nord-4 hover:text-slate-800 dark:hover:text-nord-6 transition bg-slate-50 dark:bg-nord-2 border border-slate-200 dark:border-nord-3 px-3 py-2 rounded-xl"
            >
              {checkedForDelete.length === tasks.length ? (
                <CheckSquare size={14} className="text-slate-700 dark:text-nord-5" />
              ) : (
                <Square size={14} />
              )}
              {checkedForDelete.length === tasks.length ? "Deseleccionar todo" : "Seleccionar todo"}
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={checkedForDelete.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-nord-11/10 border border-rose-200 dark:border-nord-11/20 hover:bg-rose-100 dark:hover:bg-nord-11/20 text-rose-700 dark:text-nord-11 text-xs font-bold rounded-xl shadow-sm transition disabled:bg-slate-50 dark:disabled:bg-nord-2 disabled:border-slate-100 dark:disabled:border-nord-2 disabled:text-slate-300 dark:disabled:text-nord-3"
            >
              <Trash2 size={14} />
              Eliminar seleccionadas ({checkedForDelete.length})
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-nord-0 rounded-xl w-full"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <span className="text-4xl mb-3 opacity-50">☕</span>
            <p className="text-slate-500 dark:text-nord-3 font-medium">No hay actividades planificadas para este día.</p>
          </div>
        ) : (
          /* GRID DE TAREAS */
          <div className="flex flex-col gap-3">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTaskStatus(task)}
                className={`
                  flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all gap-4
                  ${task.estado === 'completado' 
                    ? 'bg-slate-50 dark:bg-nord-0 border-slate-200 dark:border-nord-2 opacity-50' 
                    : 'bg-white dark:bg-nord-1 border-slate-200 dark:border-nord-2 hover:border-slate-300 dark:hover:border-nord-3 shadow-sm'}
                `}
              >
                <div className="flex items-center gap-4 flex-grow">
                  <div className="flex-shrink-0">
                    {task.estado === 'completado' ? (
                      <CheckCircle2 className="text-slate-800 dark:text-nord-14" size={24} />
                    ) : (
                      <Circle className="text-slate-300 dark:text-nord-3" size={24} />
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1 max-w-[65%]">
                    <span className={`text-base font-medium transition-all ${task.estado === 'completado' ? 'text-slate-500 dark:text-nord-3 line-through' : 'text-slate-800 dark:text-nord-5'}`}>
                      {task.titulo}
                    </span>
                  </div>
                </div>

                {/* BOTÓN INTERACTIVO PARA ABRIR EL MODAL */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    openTimeModal(task);
                  }}
                  className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl text-xs transition-colors
                    ${task.hora_inicio || task.hora_fin 
                      ? 'bg-slate-800 dark:bg-nord-10 dark:bg-nord-3 border-slate-800 dark:border-nord-3 text-white dark:text-nord-6 hover:bg-slate-700 dark:hover:bg-nord-2 shadow-sm' 
                      : 'bg-slate-50 dark:bg-nord-0 border-slate-200 dark:border-nord-2 text-slate-500 dark:text-nord-3 hover:bg-slate-100 dark:hover:bg-nord-2 hover:text-slate-800 dark:hover:text-nord-5'}
                  `}
                >
                  <Clock size={14} className={task.hora_inicio || task.hora_fin ? 'text-slate-200 dark:text-nord-5' : 'text-slate-400 dark:text-nord-3'} />
                  <span className="font-semibold mt-[1px]">
                    {task.hora_inicio || task.hora_fin 
                      ? `${task.hora_inicio ? task.hora_inicio.substring(0, 5) : "--:--"} a ${task.hora_fin ? task.hora_fin.substring(0, 5) : "--:--"}`
                      : "Asignar hora"
                    }
                  </span>
                </button>

                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectForDelete(task.id);
                  }}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-nord-2 rounded-lg transition"
                >
                  <input 
                    type="checkbox"
                    checked={checkedForDelete.includes(task.id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-rose-600 dark:text-nord-11 focus:ring-rose-500 border-slate-300 dark:border-nord-3 cursor-pointer accent-rose-600 dark:accent-nord-11"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === NUEVO DIARIO DIGITAL INTEGRADO AL FINAL DEL DÍA === */}
        <DailyNote selectedDate={selectedDate} />
      </div>

      {/* VENTANA EMERGENTE (MODAL) PARA HORARIOS */}
      {timePickerTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div 
            className="bg-white dark:bg-nord-1 rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all border border-slate-100 dark:border-nord-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-bold text-slate-800 dark:text-nord-5 mb-1">Configurar horario</h4>
            <p className="text-sm text-slate-500 dark:text-nord-3 mb-6 truncate">{timePickerTask.titulo}</p>

            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-slate-500 dark:text-nord-3 mb-2 uppercase tracking-wider">Hora Inicio</label>
                <input
                  type="time"
                  value={tempStartTime}
                  onChange={(e) => setTempStartTime(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-nord-3 rounded-xl bg-slate-50 dark:bg-nord-0 text-slate-800 dark:text-nord-4 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-nord-9 text-center text-lg"
                />
              </div>
              <span className="text-slate-300 dark:text-nord-3 mt-6 font-bold">-</span>
              <div className="flex flex-col flex-1">
                <label className="text-xs font-bold text-slate-500 dark:text-nord-3 mb-2 uppercase tracking-wider">Hora Fin</label>
                <input
                  type="time"
                  value={tempEndTime}
                  onChange={(e) => setTempEndTime(e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-nord-3 rounded-xl bg-slate-50 dark:bg-nord-0 text-slate-800 dark:text-nord-4 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-nord-9 text-center text-lg"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <button
                onClick={clearTimeConfig}
                className="text-xs font-bold text-slate-400 dark:text-nord-3 hover:text-rose-500 dark:hover:text-nord-11 transition"
              >
                Limpiar horas
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={closeTimeModal}
                  className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-nord-4 bg-slate-100 dark:bg-nord-2 hover:bg-slate-200 dark:hover:bg-nord-3 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveTimeConfig}
                  className="px-5 py-2 text-sm font-bold text-white bg-slate-800 dark:bg-nord-10 hover:bg-slate-700 dark:hover:bg-nord-9 rounded-xl shadow-sm transition"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}