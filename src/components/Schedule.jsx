"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Settings2, X, Trash2, Loader2, Plus, Smile } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS_KEY = "horario_visible_hours_v1";

const EMOJIS = ["📌", "📚", "🏋️", "⚽", "💼", "🎉", "🩺", "💊", "✈️", "🛒", "🎬", "☕", "📝", "🎂", "🐶", "❤️", "🔥", "⭐", "⏰", "🎓"];

// Niveles de urgencia y sus colores
const URG = {
  alta: {
    label: "Alta",
    dot: "bg-rose-500",
    chip: "border-l-rose-500 bg-rose-500/10 text-rose-50 hover:bg-rose-500/20",
    btn: "bg-rose-500 text-white",
    btnOff: "text-rose-300 border-rose-500/40",
  },
  media: {
    label: "Media",
    dot: "bg-amber-400",
    chip: "border-l-amber-400 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20",
    btn: "bg-amber-400 text-slate-900",
    btnOff: "text-amber-300 border-amber-400/40",
  },
  baja: {
    label: "Baja",
    dot: "bg-emerald-400",
    chip: "border-l-emerald-400 bg-emerald-400/10 text-emerald-50 hover:bg-emerald-400/20",
    btn: "bg-emerald-400 text-slate-900",
    btnOff: "text-emerald-300 border-emerald-400/40",
  },
};
const URG_ORDER = ["alta", "media", "baja"];

const orderVal = (h) => (h === 0 ? 24 : h);
function hourLabel(h) {
  const ampm = h < 12 ? "AM" : "PM";
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:00 ${ampm}`;
}
function defaultHours() {
  const v = {};
  for (let h = 0; h < 24; h++) v[h] = h >= 8 || h === 0;
  return v;
}

export default function Schedule({ userId }) {
  const [notes, setNotes] = useState({}); // "day-hour" -> [ {id, content, urgency} ]
  const [visible, setVisible] = useState(defaultHours());
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // {day, hour}

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
        .select("id,day,hour,content,urgency")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (!error && data) {
        const map = {};
        data.forEach((r) => {
          const k = `${r.day}-${r.hour}`;
          (map[k] = map[k] || []).push({ id: r.id, content: r.content, urgency: r.urgency || "media" });
        });
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

  const itemsFor = (d, h) => notes[`${d}-${h}`] || [];

  async function addItem(day, hour, content, urgency) {
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: userId, day, hour, content, urgency })
      .select("id,content,urgency")
      .single();
    if (error) {
      alert("No se pudo guardar: " + error.message);
      return;
    }
    setNotes((n) => {
      const k = `${day}-${hour}`;
      return { ...n, [k]: [...(n[k] || []), { id: data.id, content: data.content, urgency: data.urgency }] };
    });
  }

  async function updateItem(day, hour, id, fields) {
    setNotes((n) => {
      const k = `${day}-${hour}`;
      return { ...n, [k]: (n[k] || []).map((it) => (it.id === id ? { ...it, ...fields } : it)) };
    });
    await supabase.from("notes").update(fields).eq("id", id);
  }

  async function deleteItem(day, hour, id) {
    setNotes((n) => {
      const k = `${day}-${hour}`;
      return { ...n, [k]: (n[k] || []).filter((it) => it.id !== id) };
    });
    await supabase.from("notes").delete().eq("id", id);
  }

  return (
    <div>
      {/* Config de horas */}
      <div className="mb-4">
        <button
          onClick={() => setShowConfig((s) => !s)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-brand-500 hover:text-white"
        >
          <Settings2 className="h-4 w-4" /> Configurar horas visibles
        </button>

        <AnimatePresence>
          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
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
                          : "border-white/10 text-slate-400"
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
                  <SmallBtn onClick={() => persistHours(defaultHours())}>Predeterminado (8am–12am)</SmallBtn>
                  <SmallBtn onClick={() => setAll(false)}>Ocultar todas</SmallBtn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leyenda urgencia */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span>Urgencia:</span>
        {URG_ORDER.map((u) => (
          <span key={u} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${URG[u].dot}`} /> {URG[u].label}
          </span>
        ))}
      </div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-auto rounded-2xl border border-white/10 bg-slate-900/40 shadow-2xl shadow-brand-900/20 ring-1 ring-white/5"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando tu horario…
          </div>
        ) : (
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-800/90 p-2.5 text-xs font-semibold text-slate-300 backdrop-blur">
                  Hora
                </th>
                {DAYS.map((d, i) => (
                  <th
                    key={d}
                    className="bg-slate-800/90 p-2.5 text-xs font-semibold text-slate-200 backdrop-blur"
                  >
                    <span className="hidden sm:inline">{d}</span>
                    <span className="sm:hidden">{DAYS_SHORT[i]}</span>
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
                <tr key={h} className="group">
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-slate-800/80 p-2.5 text-[11px] font-semibold text-slate-400 backdrop-blur">
                    {hourLabel(h)}
                  </td>
                  {DAYS.map((d, di) => {
                    const items = itemsFor(di, h);
                    return (
                      <td
                        key={di}
                        onClick={() => setEditing({ day: di, hour: h })}
                        className="h-14 min-w-[104px] cursor-pointer border border-white/5 align-top transition hover:bg-white/[0.04]"
                      >
                        <div className="flex flex-col gap-1 p-1.5">
                          {items.slice(0, 4).map((it) => (
                            <div
                              key={it.id}
                              className={`truncate rounded-md border-l-[3px] px-1.5 py-1 text-[10px] leading-tight ${URG[it.urgency]?.chip || URG.media.chip}`}
                            >
                              {it.content}
                            </div>
                          ))}
                          {items.length > 4 && (
                            <span className="px-1 text-[9px] text-slate-400">+{items.length - 4} más</span>
                          )}
                          {items.length === 0 && (
                            <span className="pointer-events-none flex items-center gap-1 px-1 text-[10px] text-slate-600 opacity-0 transition group-hover:opacity-100">
                              <Plus className="h-3 w-3" /> agregar
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Modal de edición */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="glass w-full max-w-md rounded-2xl p-6 glow"
            >
              <CellEditor
                day={editing.day}
                hour={editing.hour}
                items={itemsFor(editing.day, editing.hour)}
                onAdd={addItem}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onClose={() => setEditing(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CellEditor({ day, hour, items, onAdd, onUpdate, onDelete, onClose }) {
  const [text, setText] = useState("");
  const [urgency, setUrgency] = useState("media");
  const [showEmojis, setShowEmojis] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const c = text.trim();
    if (!c) return;
    setSaving(true);
    await onAdd(day, hour, c, urgency);
    setText("");
    setUrgency("media");
    setShowEmojis(false);
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">Pendientes</h3>
          <p className="text-sm text-brand-300">
            {DAYS[day]} · {hourLabel(hour)}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 transition hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Lista de pendientes */}
      <div className="mb-4 max-h-56 space-y-2 overflow-auto pr-1">
        <AnimatePresence initial={false}>
          {items.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">Aún no hay pendientes. Agrega el primero 👇</p>
          )}
          {items.map((it) => (
            <motion.div
              key={it.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8, height: 0 }}
              className={`flex items-center gap-2 rounded-lg border-l-[3px] p-2 ${URG[it.urgency]?.chip || URG.media.chip}`}
            >
              <input
                value={it.content}
                onChange={(e) => onUpdate(day, hour, it.id, { content: e.target.value })}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <div className="flex items-center gap-1">
                {URG_ORDER.map((u) => (
                  <button
                    key={u}
                    title={`Urgencia ${URG[u].label}`}
                    onClick={() => onUpdate(day, hour, it.id, { urgency: u })}
                    className={`h-3.5 w-3.5 rounded-full ${URG[u].dot} transition ${
                      it.urgency === u ? "ring-2 ring-white/70" : "opacity-40 hover:opacity-80"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => onDelete(day, hour, it.id)}
                className="text-slate-400 transition hover:text-rose-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Nuevo pendiente */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Nuevo pendiente…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
          />
          <button
            onClick={() => setShowEmojis((s) => !s)}
            className="text-slate-400 transition hover:text-amber-300"
            title="Emojis"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex flex-wrap gap-1 border-t border-white/10 pt-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setText((t) => t + e)}
                    className="rounded-md p-1 text-lg transition hover:bg-white/10"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {URG_ORDER.map((u) => (
              <button
                key={u}
                onClick={() => setUrgency(u)}
                className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                  urgency === u ? URG[u].btn + " border-transparent" : "border-white/10 " + URG[u].btnOff
                }`}
              >
                {URG[u].label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand-500"
    >
      {children}
    </button>
  );
}
