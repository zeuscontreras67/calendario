# HorarioIA 📅

Horario semanal inteligente. Cada hora de cada día es un espacio para tus
pendientes, y una IA (Google Gemini) responde preguntas sobre tu horario.

**Stack:** Next.js 14 · Tailwind CSS · Framer Motion · Supabase (PostgreSQL + Auth) · Gemini

---

## 1. Instalar

```bash
npm install
```

## 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y rellena los valores:

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  → en Supabase: **Settings → API**.
- `GEMINI_API_KEY`
  → gratis en https://aistudio.google.com/app/apikey

## 3. Crear la base de datos

1. Entra a https://supabase.com y crea un proyecto gratis.
2. Abre **SQL Editor → New query**.
3. Pega TODO el contenido de [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.

Esto crea:
- `profiles` → datos de cada cliente (se crea solo al registrarse).
- `notes` → cada nota ligada a **un día y una hora únicos** por usuario
  (`UNIQUE(user_id, day, hour)`).
- Reglas de seguridad (RLS): cada usuario solo ve y edita lo suyo.

> Tip: en Supabase → **Authentication → Providers → Email**, durante el
> desarrollo puedes desactivar "Confirm email" para entrar sin confirmar correo.

## 4. Correr en local

```bash
npm run dev
```

Abre http://localhost:3000

---

## Estructura

```
calendario/
├─ src/
│  ├─ app/
│  │  ├─ page.js            → Landing (marketing)
│  │  ├─ login/page.js      → Registro / inicio de sesión
│  │  ├─ app/page.js        → La app del horario (protegida)
│  │  └─ api/ask/route.js   → IA Gemini (server-side, key oculta)
│  ├─ components/
│  │  ├─ Schedule.jsx       → Tabla del horario + edición de celdas
│  │  └─ AskAI.jsx          → Caja de preguntas a la IA
│  └─ lib/supabaseClient.js → Conexión a Supabase
└─ supabase/schema.sql      → Esquema de la base de datos
```

---

## 5. Subir a GitHub

```bash
git add .
git commit -m "Primera versión: horario + IA"
# crea un repo vacío en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/calendario.git
git branch -M main
git push -u origin main
```

## 6. Desplegar (servidor en línea, gratis con Vercel)

1. Entra a https://vercel.com e inicia sesión con GitHub.
2. **Add New → Project** y elige el repo `calendario`.
3. En **Environment Variables** agrega las mismas 3 del `.env.local`.
4. **Deploy**. Vercel te da una URL pública.

> Importante: en Supabase → **Authentication → URL Configuration**, agrega la URL
> de Vercel a *Site URL* y *Redirect URLs*.

---

## Próximos pasos (rumbo a SaaS)

- Vista de calendario mensual.
- Planes de pago (Stripe) usando la columna `plan` de `profiles`.
- Recordatorios por correo / notificaciones.
- Compartir horarios entre usuarios.
```
