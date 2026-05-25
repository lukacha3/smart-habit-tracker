import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Control de Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Extraemos la fecha de los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!dateParam) {
      return NextResponse.json(
        { error: "Falta el parámetro de fecha (?date=YYYY-MM-DD)" }, 
        { status: 400 }
      );
    }

    // 3. Consultamos a Supabase filtrando por usuario y fecha
    const { data: tasks, error: dbError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('fecha_objetivo', dateParam)
      .order('created_at', { ascending: true }); // Ordenamos por orden de creación

    if (dbError) {
      console.error("Error obteniendo tareas:", dbError);
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
    }

    // 4. Devolvemos el array JSON exitosamente
    return NextResponse.json({ success: true, data: tasks });
    
  } catch (error) {
    console.error("Error crítico en /api/get-tasks:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}