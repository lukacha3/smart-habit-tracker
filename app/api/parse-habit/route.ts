import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 1. CONTROL DE ACCESO: Verificamos el pasaporte digital (Cookie) del usuario en el Servidor
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "No autorizado. Iniciá sesión." }, { status: 401 });
    }

    // 2. EXTRACCIÓN DEL BODY
    const body = await request.json();
    const { habit } = body;

    if (!habit || !habit.trim()) {
      return NextResponse.json({ error: "El texto del hábito no puede estar vacío." }, { status: 400 });
    }

    // 3. VARIABLE DE REFERENCIA TEMPORAL: Capturamos la fecha actual del servidor (Formato YYYY-MM-DD)
    // Esto es vital para que la IA entienda qué significa "hoy", "ayer" o "el lunes pasado"
    const currentDate = new Date().toISOString().split('T')[0];

    // 4. PIPELINE DE INTELIGENCIA ARTIFICIAL: Forzamos salida JSON estructurada
    const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `Sos el motor analítico de una aplicación de tracking de hábitos. Tu objetivo es parsear la oración en lenguaje natural del usuario.
              
              REGLA DE ORO: Si el texto del usuario NO describe una acción registrable, no tiene sentido, O contiene lenguaje vulgar, obsceno, sexual o insultos explícitos, debes establecer "es_valido" en false y rellenar el resto con datos por defecto.
    
    La fecha de HOY es estrictamente: ${currentDate}. 
    
    Debes retornar EXCLUSIVAMENTE un objeto JSON válido respetando esta interfaz:
    {
      "es_valido": booleano (true si es un hábito real, false si es texto irrelevante),
      "fecha": "String en formato YYYY-MM-DD",
      "categoria": "String de una sola palabra (ej: Salud, Ejercicio, Productividad, Estudio, General)",
      "cantidad": Número,
      "unidad": "String corto"
    }`
            },
            {
              role: "user",
              content: habit,
            },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.1,
          response_format: { type: "json_object" },
        });
    
        const rawContent = chatCompletion.choices[0]?.message?.content;
        if (!rawContent) {
          return NextResponse.json({ error: "La IA no generó una respuesta válida." }, { status: 500 });
        }
    
        // 5. VALIDACIÓN DEL CONTRATO DE DATOS
        const parsedData = JSON.parse(rawContent);
        const { es_valido, fecha, categoria, cantidad, unidad } = parsedData;
    
        // --- NUEVO BLOQUE DE REBOTE ---
        if (es_valido === false) {
          return NextResponse.json(
            { error: "El texto ingresado no parece ser un hábito o acción registrable." }, 
            { status: 400 }
          );
        }
        // ------------------------------
    
        if (!fecha || !categoria || cantidad === undefined || !unidad) {
          return NextResponse.json({ error: "Estructura semántica incompleta generada por la IA." }, { status: 422 });
        }

    // 6. PERSISTENCIA EN SUPABASE: Vinculamos el registro al ID del usuario activo
    const { error: dbError } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        fecha,
        categoria,
        cantidad: Number(cantidad),
        unidad,
        texto_original: habit,
      });

    if (dbError) {
      console.error("Error de inserción en Supabase:", dbError);
      return NextResponse.json({ error: "Error en la persistencia de datos." }, { status: 500 });
    }

    // Retornamos los datos limpios que se guardaron exitosamente
    return NextResponse.json({ success: true, data: parsedData });

  } catch (error) {
    console.error("Error crítico en /api/parse-habit:", error);
    return NextResponse.json({ error: "Error crítico al procesar la petición." }, { status: 500 });
  }
}