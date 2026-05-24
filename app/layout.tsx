import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// Importamos el conector del backend y tu nuevo botón
import { createClient } from "@/utils/supabase/server";
import LogoutButton from "@/components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Habit Tracker",
  description: "Registra tus hábitos con lenguaje natural",
};

// Fijate que le agregamos la palabra "async" acá
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 1. Instanciamos el cliente de backend y le preguntamos a Supabase por el usuario
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        
        {/* === NAVBAR === */}
        <nav className="w-full p-4 bg-white shadow-sm flex justify-between items-center">
          
          {/* Transformamos el título estático en un enlace a la raíz "/" */}
          <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-800 transition">
            Habit Tracker
          </Link>
          
          {/* Lógica condicional del usuario (esto queda igual) */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">{user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Iniciar Sesión
            </Link>
          )}
          
        </nav>

        {/* === CONTENEDOR CENTRAL === */}
        <main className="max-w-4xl mx-auto p-4 mt-8">
          {children}
        </main>

      </body>
    </html>
  );
}