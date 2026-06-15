import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente único para el navegador. Si faltan las llaves, avisamos en consola
// (la app sigue cargando para que puedas ver el diseño antes de configurar).
export const supabase =
  url && anon
    ? createClient(url, anon)
    : null;

export const supabaseReady = Boolean(url && anon);
