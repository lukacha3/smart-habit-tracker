"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita el error de hidratación en SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl transition-all duration-300 bg-slate-100 dark:bg-nord-0 text-slate-500 dark:text-nord-3 hover:bg-slate-200 dark:hover:bg-nord-2 dark:bg-nord-1 dark:text-nord-4 dark:hover:bg-nord-2 border border-slate-200 dark:border-nord-3"
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}