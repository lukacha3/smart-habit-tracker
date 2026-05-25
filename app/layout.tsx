import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

import { createClient } from "@/utils/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { ThemeProvider } from "@/components/ThemeProvider"; // <-- Importamos proveedor
import ThemeToggle from "@/components/ThemeToggle"; // <-- Importamos botón

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Habit Tracker",
  description: "Registra tus hábitos con lenguaje natural",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2563eb", 
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es" suppressHydrationWarning>
      {/* Agregamos las clases dark:bg-nord-0 y dark:text-nord-4 para el tema general */}
      <body className={`${inter.className} transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="bg-gray-50 dark:bg-nord-0 text-gray-900 dark:text-nord-4 min-h-screen overflow-hidden">
          
          <nav className="w-full h-16 px-6 bg-white dark:bg-nord-1 border-b border-slate-200 dark:border-nord-2 shadow-sm flex justify-between items-center shrink-0 z-20 relative transition-colors duration-300">
            
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-nord-8 hover:text-blue-800 dark:hover:text-nord-9 transition">
              Habit Tracker
            </Link>
            
            <div className="flex items-center gap-4">
              {/* === ACÁ VA EL BOTÓN DEL TEMA === */}
              <ThemeToggle />

              {user ? (
                <>
                  <span className="text-sm font-medium text-gray-600 dark:text-nord-4">{user.email}</span>
                  <LogoutButton />
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="px-4 py-2 bg-blue-600 dark:bg-nord-10 text-white rounded-md hover:bg-blue-700 dark:hover:bg-nord-9 transition"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </nav>

          <div className="flex w-full h-[calc(100vh-4rem)]">
            
            {user && <Sidebar />}

            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-nord-0 p-6 transition-colors duration-300">
              <div className="max-w-5xl mx-auto">
                {children}
              </div>
            </main>

          </div>
          </div>
        </ThemeProvider>

      </body>
    </html>
  );
}