"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, supabaseReady } from "@/lib/supabaseClient";
import { CalendarDays, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!supabaseReady) {
      setMsg("⚠️ Falta configurar Supabase en .env.local (revisa el README).");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMsg("✅ Cuenta creada. Revisa tu correo si se pide confirmación, luego inicia sesión.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/app");
      }
    } catch (err) {
      setMsg("❌ " + (err.message || "Algo salió mal."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />

      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8 glow">
        <Link href="/" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          Horario<span className="text-brand-400">IA</span>
        </Link>

        <h1 className="text-2xl font-bold">
          {mode === "signin" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {mode === "signin"
            ? "Entra para ver tu horario."
            : "Empieza gratis en segundos."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <Field
              label="Nombre"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Tu nombre"
            />
          )}
          <Field
            label="Correo"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tucorreo@ejemplo.com"
            required
          />
          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>

        {msg && <p className="mt-4 text-sm text-slate-300">{msg}</p>}

        <p className="mt-6 text-center text-sm text-slate-400">
          {mode === "signin" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setMsg("");
              setMode(mode === "signin" ? "signup" : "signin");
            }}
            className="font-semibold text-brand-400 hover:underline"
          >
            {mode === "signin" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
      />
    </label>
  );
}
