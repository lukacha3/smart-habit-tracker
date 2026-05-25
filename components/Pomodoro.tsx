"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Brain, Coffee, AlertCircle } from "lucide-react";

export default function Pomodoro() {
  const [focusTime, setFocusTime] = useState(25);
  const [restTime, setRestTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"foco" | "descanso">("foco");
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio no soportado");
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      playBeep();
      if (mode === "foco") {
        setMode("descanso");
        setTimeLeft(restTime * 60);
      } else {
        setMode("foco");
        setTimeLeft(focusTime * 60);
        setIsActive(false);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, timeLeft, mode, restTime, focusTime]);

  useEffect(() => {
    if (!isActive) setTimeLeft((mode === "foco" ? focusTime : restTime) * 60);
  }, [focusTime, restTime, mode, isActive]);

  const toggleTimer = () => {
    if (!isActive) {
      if (restTime >= focusTime) {
        setErrorMsg("El descanso no puede ser mayor o igual al foco.");
        return;
      }
      setErrorMsg("");
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode("foco");
    setTimeLeft(focusTime * 60);
    setErrorMsg("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isFocus = mode === "foco";

  return (
    <div className={`w-full max-w-sm mx-auto mt-8 bg-white dark:bg-nord-1 border ${isFocus ? 'border-slate-200 dark:border-nord-3' : 'border-emerald-200 dark:border-nord-14'} rounded-3xl p-8 shadow-sm transition-colors duration-500`}>
      
      <div className="flex justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isFocus ? 'bg-slate-800 dark:bg-nord-10 dark:bg-nord-3 text-white dark:text-nord-6 shadow-md' : 'text-slate-400 dark:text-nord-3'}`}>
          <Brain size={16} /> Foco
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${!isFocus ? 'bg-emerald-500 dark:bg-nord-14 text-white dark:text-nord-0 shadow-md' : 'text-slate-400 dark:text-nord-3'}`}>
          <Coffee size={16} /> Descanso
        </div>
      </div>

      <div className="flex justify-center items-center mb-8">
        <span className={`text-7xl font-black tracking-tighter transition-colors duration-500 ${isFocus ? 'text-slate-800 dark:text-nord-4' : 'text-emerald-500 dark:text-nord-14'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={toggleTimer}
          className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105 active:scale-95 ${isFocus ? 'bg-slate-800 dark:bg-nord-10 dark:bg-nord-3' : 'bg-emerald-500 dark:bg-nord-14 dark:text-nord-0'}`}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>
        <button 
          onClick={resetTimer}
          disabled={isActive}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-slate-100 dark:bg-nord-2 text-slate-500 dark:text-nord-4 transition-colors hover:bg-slate-200 dark:hover:bg-nord-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-rose-500 dark:text-nord-11 bg-rose-50 dark:bg-nord-11/10 p-3 rounded-xl text-xs font-bold mb-6">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-nord-2">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-400 dark:text-nord-4 uppercase mb-2">Minutos Foco</label>
          <input 
            type="number" min="1" value={focusTime} onChange={(e) => setFocusTime(Number(e.target.value))} disabled={isActive}
            className="p-2 border border-slate-200 dark:border-nord-3 bg-white dark:bg-nord-1 text-slate-700 dark:text-nord-4 rounded-lg text-center font-bold focus:ring-2 focus:ring-slate-800 dark:focus:ring-nord-9 focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-400 dark:text-nord-4 uppercase mb-2">Minutos Descanso</label>
          <input 
            type="number" min="1" value={restTime} onChange={(e) => setRestTime(Number(e.target.value))} disabled={isActive}
            className="p-2 border border-slate-200 dark:border-nord-3 bg-white dark:bg-nord-1 text-slate-700 dark:text-nord-4 rounded-lg text-center font-bold focus:ring-2 focus:ring-slate-800 dark:focus:ring-nord-9 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

    </div>
  );
}