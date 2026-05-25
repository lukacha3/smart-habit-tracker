import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prompt, fechaSeleccionada } = await request.json();

    if (!prompt || !fechaSeleccionada) {
      return NextResponse.json({ error: "Faltan datos para planificar." }, { status: 400 });
    }

    // 1. PIPELINE DE IA: Ahora con extracción de horarios
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Sos un procesador de datos estricto. Tu único objetivo es extraer tareas de un texto y formatearlas.

REGLAS ABSOLUTAS:
1. PRECISIÓN: Mantén las cantidades, unidades y palabras exactas. NO resumas información útil.
2. AGRUPACIÓN: Si hay repeticiones (ej: "hacer X 3 veces"), crea UNA SOLA tarea y pon la cantidad en el título.
3. RECHAZO DE VULGARIDAD: Si hay lenguaje vulgar o insultos, establece "es_valido" en false y deja el array vacío. NUNCA inventes tareas para censurar.
4. CERO ALUCINACIONES: Extrae solo lo que está explícito.
5. EXTRACCIÓN DE HORARIOS: Si el texto indica horas explícitas (ej: "de 10 a 14", "de 9 am a 1 pm"), debes extraer esos valores y convertirlos a formato 24 horas "HH:MM" (ej: "10:00" y "14:00"). Si solo da una hora de inicio ("a las 15"), extrae hora_inicio="15:00" y hora_fin=null. Si no hay horarios mencionados explícitamente, usa null.

Debes retornar EXCLUSIVAMENTE un objeto JSON:
{
  "es_valido": booleano,
  "tareas": [
    {
      "titulo": "String exacto de la acción a realizar",
      "duracion_estimada": Número o null,
      "duracion_tipo": "fija" o "flexible",
      "hora_inicio": "String en formato HH:MM o null",
      "hora_fin": "String en formato HH:MM o null"
    }
  ]
}`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const rawContent = chatCompletion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: "Fallo en la generación de IA." }, { status: 500 });
    }

    const parsedData = JSON.parse(rawContent);

    if (parsedData.es_valido === false || !parsedData.tareas || parsedData.tareas.length === 0) {
      return NextResponse.json(
        { error: "El texto no parece contener tareas o planes concretos." }, 
        { status: 400 }
      );
    }

    // 3. PREPARACIÓN DE DATOS PARA SUPABASE
    const tareasParaInsertar = parsedData.tareas.map((tarea: any) => {
      // Supabase acepta "14:00", pero nos aseguramos de que el formato no rompa la BD
      const hInicio = tarea.hora_inicio ? `${tarea.hora_inicio}:00`.replace('::00', ':00') : null;
      const hFin = tarea.hora_fin ? `${tarea.hora_fin}:00`.replace('::00', ':00') : null;

      return {
        user_id: user.id,
        titulo: tarea.titulo,
        duracion_estimada: tarea.duracion_estimada,
        duracion_tipo: tarea.duracion_tipo,
        hora_inicio: hInicio,
        hora_fin: hFin,
        fecha_objetivo: fechaSeleccionada,
        estado: 'pendiente'
      };
    });

    // 4. INSERCIÓN EN BASE DE DATOS
    const { error: dbError } = await supabase
      .from('tasks')
      .insert(tareasParaInsertar);

    if (dbError) {
      console.error("Error insertando tareas planificadas:", dbError);
      return NextResponse.json({ error: "Error guardando la planificación." }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: tareasParaInsertar.length });

  } catch (error) {
    console.error("Error crítico en /api/plan-day:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}