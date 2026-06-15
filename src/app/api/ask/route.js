import { NextResponse } from "next/server";

// Llama a Google Gemini desde el SERVIDOR.
// La API key vive en process.env.GEMINI_API_KEY y nunca se expone al navegador.
export async function POST(req) {
  try {
    const { question, context } = await req.json();
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en el servidor (.env.local)." },
        { status: 500 }
      );
    }
    if (!question?.trim()) {
      return NextResponse.json({ error: "Escribe una pregunta." }, { status: 400 });
    }

    const prompt = `Eres un asistente que responde preguntas sobre el horario semanal del usuario.
Usa ÚNICAMENTE la información del horario de abajo. Si algo no está, dilo claramente.
Cuando respondas, indica el día, la hora, qué se tiene que hacer y cualquier nota extra relevante.
Responde en español, breve y claro.

HORARIO DEL USUARIO:
${context || "(El horario está vacío.)"}

PREGUNTA: ${question}`;

    // Probamos varios modelos: si uno no tiene cupo gratis (limit 0) o no existe,
    // pasamos al siguiente. El primero que responda gana.
    const models = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-flash-latest",
    ];

    let lastError = "No se pudo obtener respuesta de la IA.";
    for (const model of models) {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` +
        encodeURIComponent(key);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await res.json();

      if (!data.error) {
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (answer) return NextResponse.json({ answer, model });
      } else {
        lastError = data.error.message;
        // 429 (cupo) o 404 (modelo no disponible) -> intentar el siguiente modelo
        const code = data.error.code;
        if (code !== 429 && code !== 404) break;
      }
    }

    return NextResponse.json({ error: lastError }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
