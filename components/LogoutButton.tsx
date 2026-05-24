"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut(); // Borra la sesión en Supabase y la Cookie
    router.refresh(); // Le avisa a Next.js que recargue la vista
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100 transition border border-red-200"
    >
      Cerrar Sesión
    </button>
  );
}