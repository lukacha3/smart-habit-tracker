import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// OBTENER la nota de la fecha activa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !date) {
      return NextResponse.json({ error: "Faltan parámetros requeridos." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notes')
      .select('texto')
      .eq('user_id', user.id)
      .eq('fecha', date)
      .single();

    // PGRST116 significa que no hay filas (el usuario no escribió nada aún), devolvemos texto vacío
    if (error && error.code !== 'PGRST116') {
      console.error("Error leyendo nota:", error);
      return NextResponse.json({ error: "Error en la base de datos." }, { status: 500 });
    }

    return NextResponse.json({ texto: data?.texto || "" });
  } catch (error) {
    console.error("Error crítico en GET /api/notes:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

// GUARDAR O ACTUALIZAR la nota (Upsert)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { date, texto } = await request.json();

    if (!date) {
      return NextResponse.json({ error: "Falta la fecha objetivo." }, { status: 400 });
    }

    const { error } = await supabase
      .from('notes')
      .upsert(
        { 
          user_id: user.id, 
          fecha: date, 
          texto: texto || "", 
          updated_at: new Date().toISOString() 
        },
        { onConflict: 'user_id, fecha' }
      );

    if (error) {
      console.error("Error haciendo upsert de nota:", error);
      return NextResponse.json({ error: "Error al guardar el registro." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error crítico en POST /api/notes:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}