"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sparkles, Loader2 } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
function hourLabel(h) {
  const ampm = h < 12 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:00 ${ampm}`;
}

export default function AskAI({ userId }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      // Trae las notas del usuario y arma el contexto
      const { data } = await supabase
        .from("notes")
        .select("day,hour,content,urgency")
        .eq("user_id", userId);
      const context =
        (data || [])
          .filter((r) => r.content?.trim())
          .map(
            (r) =>
              `- ${DAYS[r.day]}, ${hourLabel(r.hour)} [urgencia ${r.urgency || "media"}]: ${r.content.replace(/\n/g, " ")}`
          )
          .join("\n") || "(El horario está vacío.)";

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, context }),
      });
      const json = await res.json();
      setAnswer(json.answer || json.error || "No recibí respuesta.");
    } catch (e) {
      setAnswer("Error de conexión: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-brand-300">
        <Sparkles className="h-4 w-4" /> Pregúntale a la IA sobre tu horario
      </h2>
      <div className="mt-3 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ej: ¿Qué tengo el lunes? ¿A qué hora es el examen?"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <button
          onClick={ask}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Preguntar
        </button>
      </div>
      {answer && (
        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
          {answer}
        </div>
      )}
    </div>
  );
}
