-- ============================================================
--  Esquema de base de datos · "calendario"
--  Pégalo en: Supabase > SQL Editor > New query > Run
-- ============================================================

-- ------------------------------------------------------------
-- 1) PERFILES (datos de los clientes)
--    Cada perfil está ligado a un usuario de Supabase Auth.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  plan        text not null default 'free',     -- free | pro | ... (para el SaaS)
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) NOTAS DEL HORARIO
--    Cada nota va ligada a UN día y UNA hora únicos por usuario.
--    day  = 0..6  (0 = Lunes ... 6 = Domingo)
--    hour = 0..23 (0 = 12am ... 23 = 11pm)
-- ------------------------------------------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  day         smallint not null check (day  >= 0 and day  <= 6),
  hour        smallint not null check (hour >= 0 and hour <= 23),
  content     text not null default '',
  urgency     text not null default 'media',   -- baja | media | alta
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
  -- Se permiten VARIOS pendientes por (usuario, día, hora)
);

create index if not exists notes_user_idx on public.notes (user_id);

-- ------------------------------------------------------------
-- 3) SEGURIDAD A NIVEL DE FILA (RLS)
--    Cada usuario solo puede ver/editar SUS propios datos.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.notes    enable row level security;

-- Perfiles
create policy "perfil: ver el mio"
  on public.profiles for select using (auth.uid() = id);
create policy "perfil: editar el mio"
  on public.profiles for update using (auth.uid() = id);
create policy "perfil: crear el mio"
  on public.profiles for insert with check (auth.uid() = id);

-- Notas
create policy "notas: ver las mias"
  on public.notes for select using (auth.uid() = user_id);
create policy "notas: insertar las mias"
  on public.notes for insert with check (auth.uid() = user_id);
create policy "notas: actualizar las mias"
  on public.notes for update using (auth.uid() = user_id);
create policy "notas: borrar las mias"
  on public.notes for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4) CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRARSE
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 5) MANTENER updated_at AL VUELO
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_touch on public.notes;
create trigger notes_touch
  before update on public.notes
  for each row execute function public.touch_updated_at();
