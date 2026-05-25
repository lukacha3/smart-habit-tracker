import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Recibimos la lista de IDs a eliminar
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Faltan los IDs de las tareas" }, { status: 400 });
    }

    // Borrado masivo usando el operador .in() de Supabase
    const { error: dbError } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id); // Doble verificación de seguridad

    if (dbError) {
      console.error("Error eliminando tareas:", dbError);
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error crítico en /api/delete-tasks:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}