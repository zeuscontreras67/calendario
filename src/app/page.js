"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Sparkles, Clock, ShieldCheck, ArrowRight } from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Clock,
    title: "Tu semana en un vistazo",
    text: "Un horario visual donde cada hora de cada día es un espacio para tus pendientes.",
  },
  {
    icon: Sparkles,
    title: "IA que te entiende",
    text: "Pregunta en lenguaje natural y la IA encuentra qué tienes, cuándo y las notas extra.",
  },
  {
    icon: ShieldCheck,
    title: "Tus datos, seguros",
    text: "Cada usuario ve solo su información, guardada en la nube y sincronizada.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* fondo con glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 glow">
            <CalendarDays className="h-5 w-5" />
          </span>
          Horario<span className="text-brand-400">IA</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="text-slate-300 hover:text-white">
            Entrar
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-500"
          >
            Empezar gratis
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <motion.span
          variants={fade}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs text-brand-200"
        >
          <Sparkles className="h-3.5 w-3.5" /> Organiza tu semana con inteligencia artificial
        </motion.span>

        <motion.h1
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
          className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
        >
          Tu horario, <span className="text-brand-400">vivo e inteligente</span>.
        </motion.h1>

        <motion.p
          variants={fade}
          custom={2}
          initial="hidden"
          animate="show"
          className="mx-auto mt-5 max-w-2xl text-lg text-slate-300"
        >
          Escribe tus pendientes en cada hora del día y deja que la IA te diga qué
          tienes que hacer, cuándo y dónde. Simple, rápido y bonito.
        </motion.p>

        <motion.div
          variants={fade}
          custom={3}
          initial="hidden"
          animate="show"
          className="mt-9 flex items-center justify-center gap-3"
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-500 glow"
          >
            Crear mi horario
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/app"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-brand-500"
          >
            Ver demo
          </Link>
        </motion.div>

        {/* mockup flotante */}
        <motion.div
          variants={fade}
          custom={4}
          initial="hidden"
          animate="show"
          className="mt-16 animate-float"
        >
          <div className="glass mx-auto max-w-2xl rounded-2xl p-4 glow">
            <div className="grid grid-cols-4 gap-2 text-left text-[11px]">
              {["Lun", "Mar", "Mié", "Jue"].map((d) => (
                <div key={d} className="rounded-md bg-slate-800/70 px-2 py-1 text-center text-slate-400">
                  {d}
                </div>
              ))}
              {[
                "Examen mate 📘",
                "Gym 🏋️",
                "Entrega proyecto",
                "Libre",
                "Junta equipo",
                "Comida amigos",
                "Estudiar",
                "Cine 🎬",
              ].map((t, i) => (
                <div
                  key={i}
                  className={`rounded-md px-2 py-3 ${
                    i % 3 === 0 ? "bg-brand-600/40 text-brand-100" : "bg-slate-800/50 text-slate-300"
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fade}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="glass rounded-2xl p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600/20 text-brand-300">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        Hecho con Next.js + Supabase · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
