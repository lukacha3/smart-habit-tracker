import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Recibimos dinámicamente los campos a actualizar
    const { id, estado, hora_inicio, hora_fin } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el ID de la tarea" }, { status: 400 });
    }

    // Armamos un objeto limpio con lo que venga en la petición
    const updateData: any = {};
    if (estado !== undefined) updateData.estado = estado;
    if (hora_inicio !== undefined) updateData.hora_inicio = hora_inicio || null;
    if (hora_fin !== undefined) updateData.hora_fin = hora_fin || null;

    const { error: dbError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      console.error("Error actualizando tarea:", dbError);
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error crítico en /api/update-task:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}