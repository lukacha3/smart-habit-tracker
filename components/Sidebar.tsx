"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Timer, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Estadísticas", path: "/", icon: <BarChart3 size={20} /> },
    { name: "Planificador", path: "/planner", icon: <Calendar size={20} /> },
    { name: "Pomodoro", path: "/pomodoro", icon: <Timer size={20} /> },
  ];

  return (
    <aside 
      className={`relative bg-slate-50 dark:bg-nord-0 border-r border-slate-200 dark:border-nord-2 transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} min-h-[calc(100vh-4rem)]`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white dark:bg-nord-1 border border-slate-200 dark:border-nord-3 text-slate-500 dark:text-nord-4 rounded-full p-1 shadow-sm hover:bg-slate-100 dark:hover:bg-nord-2 transition-colors z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-slate-800 dark:bg-nord-10 dark:bg-nord-3 text-white dark:text-nord-6 shadow-md' 
                  : 'text-slate-600 dark:text-nord-4 hover:bg-slate-200/50 dark:hover:bg-nord-1 hover:text-slate-900 dark:hover:text-nord-6'
              }`}
              title={isCollapsed ? item.name : ""}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              
              {!isCollapsed && (
                <span className="font-semibold text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}