"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, supabaseReady } from "@/lib/supabaseClient";
import Schedule from "@/components/Schedule";
import AskAI from "@/components/AskAI";
import ThreeBackground from "@/components/ThreeBackground";
import { CalendarDays, LogOut, Loader2 } from "lucide-react";

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabaseReady) {
      setChecking(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace("/login");
      } else {
        setUser(data.user);
      }
      setChecking(false);
    });
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-400">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando…
        </span>
      </main>
    );
  }

  if (!supabaseReady) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="glass max-w-md rounded-2xl p-8">
          <h1 className="text-xl font-bold">Falta configurar Supabase</h1>
          <p className="mt-2 text-sm text-slate-400">
            Crea el archivo <code className="text-brand-300">.env.local</code> con tus llaves
            (mira el README) y reinicia el servidor.
          </p>
          <Link href="/" className="mt-4 inline-block text-brand-400 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Capa 1: halos de color (lo más al fondo) */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute -top-32 left-1/4 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[130px] animate-blob" />
        <div
          className="absolute bottom-0 right-1/4 h-[380px] w-[380px] translate-x-1/2 rounded-full bg-fuchsia-500/12 blur-[130px] animate-blob"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Capa 2: objeto 3D animado */}
      <ThreeBackground />

      {/* Capa 3: cuadrícula blueprint */}
      <div className="grid-overlay pointer-events-none fixed inset-0 -z-10" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600">
            <CalendarDays className="h-5 w-5" />
          </span>
          Horario<span className="text-brand-400">IA</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-400 sm:inline">{user?.email}</span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-slate-300 transition hover:border-red-500 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <h1 className="mb-1 bg-gradient-to-r from-white to-brand-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
        Tu horario
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        Toca cualquier casilla para añadir pendientes con emoji y color según su urgencia. Se guarda solo en tu cuenta.
      </p>

      <Schedule userId={user.id} />

      <div className="mt-6">
        <AskAI userId={user.id} />
      </div>
      </div>
    </main>
  );
}
