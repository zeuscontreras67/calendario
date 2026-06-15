"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Settings2, X, Trash2, Loader2 } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HOURS_KEY = "horario_visible_hours_v1";

const orderVal = (h) => (h === 0 ? 24 : h); // medianoche cierra el día
function hourLabel(h) {
  const ampm = h < 12 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:00 ${ampm}`;
}
function defaultHours() {
  const v = {};
  for (let h = 0; h < 24; h++) v[h] = h >= 8 || h === 0; // 8am–12am
  return v;
}

export default function Schedule({ userId }) {
  const [notes, setNotes] = useState({}); // "day-hour" -> content
  const [visible, setVisible] = useState(defaultHours());
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {day, hour}
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Cargar preferencias de horas visibles (local) y notas (BD)
  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem(HOURS_KEY);
    if (stored) setVisible(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!userId || !supabase) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notes")
        .select("day,hour,content")
        .eq("user_id", userId);
      if (!error && data) {
        const map = {};
        data.forEach((r) => (map[`${r.day}-${r.hour}`] = r.content));
        setNotes(map);
      }
      setLoading(false);
    })();
  }, [userId]);

  const hrs = useMemo(
    () =>
      Object.keys(visible)
        .filter((h) => visible[h])
        .map(Number)
        .sort((a, b) => orderVal(a) - orderVal(b)),
    [visible]
  );

  function persistHours(v) {
    setVisible(v);
    localStorage.setItem(HOURS_KEY, JSON.stringify(v));
  }
  const toggleHour = (h) => persistHours({ ...visible, [h]: !visible[h] });
  const setAll = (on) => {
    const v = {};
    for (let h = 0; h < 24; h++) v[h] = on;
    persistHours(v);
  };

  function openCell(day, hour) {
    setEditing({ day, hour });
    setDraft(notes[`${day}-${hour}`] || "");
  }

  async function save() {
    if (!editing) return;
    const { day, hour } = editing;
    const key = `${day}-${hour}`;
    const content = draft.trim();
    setSaving(true);
    try {
      if (content) {
        await supabase
          .from("notes")
          .upsert(
            { user_id: userId, day, hour, content },
            { onConflict: "user_id,day,hour" }
          );
        setNotes((n) => ({ ...n, [key]: content }));
      } else {
        await supabase.from("notes").delete().match({ user_id: userId, day, hour });
        setNotes((n) => {
          const c = { ...n };
          delete c[key];
          return c;
        });
      }
      setEditing(null);
    } catch (e) {
      alert("No se pudo guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeNote() {
    if (!editing) return;
    const { day, hour } = editing;
    setSaving(true);
    await supabase.from("notes").delete().match({ user_id: userId, day, hour });
    setNotes((n) => {
      const c = { ...n };
      delete c[`${day}-${hour}`];
      return c;
    });
    setSaving(false);
    setEditing(null);
  }

  return (
    <div>
      {/* Config de horas */}
      <div className="mb-4">
        <button
          onClick={() => setShowConfig((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-brand-500"
        >
          <Settings2 className="h-4 w-4" /> Configurar horas visibles
        </button>

        {showConfig && (
          <div className="glass mt-3 rounded-xl p-4">
            <p className="mb-3 text-xs text-slate-400">
              Marca las horas que quieres ver. Las desmarcadas se ocultan (no se borran tus notas).
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 24 }, (_, h) => (
                <label
                  key={h}
                  className={`cursor-pointer select-none rounded-lg border px-2.5 py-1 text-xs transition ${
                    visible[h]
                      ? "border-brand-500 bg-brand-600/20 text-brand-100"
                      : "border-slate-700 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-1 align-middle accent-brand-500"
                    checked={!!visible[h]}
                    onChange={() => toggleHour(h)}
                  />
                  {hourLabel(h)}
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <SmallBtn onClick={() => setAll(true)}>Mostrar todas</SmallBtn>
              <SmallBtn onClick={() => persistHours(defaultHours())}>
                Predeterminado (8am–12am)
              </SmallBtn>
              <SmallBtn onClick={() => setAll(false)}>Ocultar todas</SmallBtn>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-auto rounded-2xl border border-slate-800">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando tu horario…
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-800 p-2 text-xs">Hora</th>
                {DAYS.map((d) => (
                  <th key={d} className="bg-slate-800 p-2 text-xs font-semibold">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hrs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-sm text-slate-400">
                    No hay horas visibles. Abre “Configurar horas visibles”.
                  </td>
                </tr>
              )}
              {hrs.map((h) => (
                <tr key={h}>
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-slate-800 p-2 text-[11px] font-semibold text-slate-400">
                    {hourLabel(h)}
                  </td>
                  {DAYS.map((d, di) => {
                    const txt = notes[`${di}-${h}`] || "";
                    return (
                      <td
                        key={di}
                        onClick={() => openCell(di, h)}
                        className={`h-12 min-w-[96px] cursor-pointer border border-slate-800 align-top transition ${
                          txt ? "bg-brand-700/40 hover:bg-brand-600/50" : "hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="line-clamp-3 p-1.5 text-left text-[10px] leading-tight text-slate-200">
                          {txt}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <div className="glass w-full max-w-md rounded-2xl p-6 glow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Pendientes</h3>
                <p className="text-sm text-brand-300">
                  {DAYS[editing.day]} · {hourLabel(editing.hour)}
                </p>
              </div>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe lo que tienes que hacer, notas extra, etc."
              className="mt-4 min-h-[140px] w-full rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-sm outline-none focus:border-brand-500"
            />
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={removeNote}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" /> Borrar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand-500"
    >
      {children}
    </button>
  );
}
