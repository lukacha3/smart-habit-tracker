"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Esto ataja el "Enter" para que no recargue la página
    setLoading(true);
    setMessage("");

    if (isLoginMode) {
        // MODO INICIAR SESIÓN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setMessage("Error: Credenciales inválidas. Revisá tu correo y contraseña.");
        } else {
            // Forzamos un redireccionamiento físico para vaciar y enviar las cookies limpias
            window.location.href = "/";
        }
    } else {
      // 2. LÓGICA DE REGISTRO (Para usar una sola vez)
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage("Error al registrar: " + error.message);
      } else {
        setMessage("¡Cuenta creada con éxito! Ahora podés iniciar sesión.");
        setIsLoginMode(true);
        setPassword(""); 
      }
    }
    
    setLoading(false);
  };

  return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-nord-1 rounded-lg shadow-md border border-gray-200">
          
          {/* Enlace de escape para volver a la página principal */}
          <Link 
            href="/" 
            className="text-sm text-black hover:text-gray-700 transition mb-4 inline-block font-semibold"
          >
            ← Volver al inicio
          </Link>
          
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {isLoginMode ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-nord-5 bg-white dark:bg-nord-1"
          required
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-nord-5 bg-white dark:bg-nord-1"
          required
        />
        
        {/* BOTÓN DINÁMICO: Cambia de color según el modo */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 text-white font-semibold rounded-md transition mt-2 disabled:bg-gray-400 ${
            isLoginMode 
              ? "bg-blue-600 dark:bg-nord-10 hover:bg-blue-700" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Procesando..." : (isLoginMode ? "Ingresar al Sistema" : "Registrarme")}
        </button>
        
        {message && (
          <p className={`text-center mt-4 text-sm font-medium p-2 rounded ${
            message.includes("Error") ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50"
          }`}>
            {message}
          </p>
        )}
      </form>

      <div className="mt-6 text-center border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-600 mb-2">
          {isLoginMode ? "¿No tenés una cuenta?" : "¿Ya tenés una cuenta?"}
        </p>
        
        {/* BOTÓN SECUNDARIO PARA CAMBIAR DE MODO */}
        <button
          type="button" // Le decimos que NO envíe el formulario, solo cambie la vista
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setMessage(""); 
          }}
          className={`font-semibold hover:underline ${
            isLoginMode ? "text-green-600" : "text-blue-600"
          }`}
        >
          {isLoginMode ? "Ir a Registrarse" : "Ir a Iniciar Sesión"}
        </button>
      </div>
    </div>
  );
}