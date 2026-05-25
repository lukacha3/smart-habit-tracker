import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// LEER el ánimo del día
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !date) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const { data, error } = await supabase
      .from('moods')
      .select('nivel')
      .eq('user_id', user.id)
      .eq('fecha', date)
      .single(); // Esperamos un solo resultado o nada

    if (error && error.code !== 'PGRST116') { // Ignoramos el error de "no se encontraron filas"
      return NextResponse.json({ error: "Error leyendo mood" }, { status: 500 });
    }

    return NextResponse.json({ nivel: data?.nivel || null });
  } catch (e) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}

// GUARDAR o ACTUALIZAR el ánimo (Upsert)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { date, nivel } = await request.json();
    if (!date || !nivel) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const { error } = await supabase
      .from('moods')
      .upsert(
        { user_id: user.id, fecha: date, nivel: nivel },
        { onConflict: 'user_id, fecha' } // La clave para que pise el dato en lugar de duplicar
      );

    if (error) return NextResponse.json({ error: "Error guardando mood" }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}