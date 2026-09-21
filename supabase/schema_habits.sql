-- Amorim — módulo de Hábitos (Supabase / Postgres)
-- Rode este arquivo no SQL Editor do seu projeto Supabase. Independente
-- dos outros módulos (não precisa rodar antes/depois de nenhum outro).

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  icon text not null default '✅',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;

drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own" on public.habits
  for select using (auth.uid() = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid() = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own" on public.habits
  for delete using (auth.uid() = user_id);

-- Um registro por hábito marcado como feito em um dia. A ausência de
-- registro para (habit_id, date) significa "não feito" naquele dia.
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  unique (habit_id, date)
);

alter table public.habit_logs enable row level security;

drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own" on public.habit_logs
  for select using (auth.uid() = user_id);

drop policy if exists "habit_logs_insert_own" on public.habit_logs;
create policy "habit_logs_insert_own" on public.habit_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "habit_logs_delete_own" on public.habit_logs;
create policy "habit_logs_delete_own" on public.habit_logs
  for delete using (auth.uid() = user_id);

create index if not exists habit_logs_habit_date_idx on public.habit_logs (habit_id, date);

-- Cada copo/quantidade de água registrada vira uma linha; o total do dia
-- é a soma das linhas daquele dia.
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  amount_ml int not null check (amount_ml > 0),
  created_at timestamptz not null default now()
);

alter table public.water_logs enable row level security;

drop policy if exists "water_logs_select_own" on public.water_logs;
create policy "water_logs_select_own" on public.water_logs
  for select using (auth.uid() = user_id);

drop policy if exists "water_logs_insert_own" on public.water_logs;
create policy "water_logs_insert_own" on public.water_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "water_logs_delete_own" on public.water_logs;
create policy "water_logs_delete_own" on public.water_logs
  for delete using (auth.uid() = user_id);

create index if not exists water_logs_user_date_idx on public.water_logs (user_id, date);
