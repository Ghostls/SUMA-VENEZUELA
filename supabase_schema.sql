-- SUMA VENEZUELA · Esquema Supabase
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text not null,
  last_name text not null,
  cedula text not null,
  email text not null,
  phone text not null,
  gender text not null check (gender in ('M','F')),
  age int not null,
  state text not null,
  club text not null,
  category text not null,
  level text not null,
  payment_status text default 'pendiente' check (payment_status in ('pendiente','verificado')),
  registration_status text default 'activo' check (registration_status in ('activo','anulado')),
  notes text
);

alter table public.participants enable row level security;

-- Inscripción pública (insert) y lectura pública para el dashboard en vivo
create policy "public insert" on public.participants for insert with check (true);
create policy "public read" on public.participants for select using (true);
-- Update: temporalmente abierto para el panel admin con PIN.
-- TODO producción: restringir a rol admin con Supabase Auth.
create policy "public update" on public.participants for update using (true);

-- Realtime
alter publication supabase_realtime add table public.participants;
