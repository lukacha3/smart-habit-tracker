import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Verificamos quién está pidiendo los datos
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Traemos exclusivamente los hábitos de ese usuario, ordenados por los más nuevos
    const { data: habits, error: dbError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error("Error de DB:", dbError);
      return NextResponse.json({ error: "Error obteniendo los hábitos" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: habits });
    
  } catch (error) {
    console.error("Error crítico en /api/get-habits:", error);
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}