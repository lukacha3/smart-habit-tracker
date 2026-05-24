import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// 1. Instanciamos el cliente. Como esto corre en el backend, es 100% seguro.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 2. Leemos qué nos mandó el Frontend
    const body = await request.json();
    const { habit } = body;

    if (!habit) {
      return NextResponse.json({ error: "Falta el texto del hábito" }, { status: 400 });
    }

    // 3. Le pedimos a Groq que use Llama 3 para analizar el texto
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Sos el cerebro de una app de hábitos. Tu tarea es leer el texto del usuario y clasificarlo en UNA SOLA PALABRA que represente la categoría (ej: Salud, Productividad, Estudio, Ejercicio, Social). No escribas nada más."
        },
        {
          role: "user",
          content: habit,
        },
      ],
      model: "llama-3.1-8b-instant", // Modelo súper rápido y liviano
      temperature: 0.3, // Temperatura baja para que sea preciso y poco creativo
    });

    // 4. Capturamos la respuesta y la mandamos de vuelta al Frontend
    const category = chatCompletion.choices[0]?.message?.content || "General";
    
    return NextResponse.json({ category });
    
  } catch (error) {
    console.error("Error en la IA:", error);
    return NextResponse.json({ error: "Error procesando el hábito" }, { status: 500 });
  }
}