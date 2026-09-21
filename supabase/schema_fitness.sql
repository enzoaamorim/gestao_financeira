-- Amorim — schema do módulo de Treino (Supabase / Postgres)
-- Rode este arquivo no SQL Editor do seu projeto Supabase DEPOIS de já ter
-- rodado o supabase/schema.sql (módulo financeiro).

create extension if not exists "pgcrypto";

-- EXERCISES ---------------------------------------------------------------
-- user_id nulo = exercício padrão (biblioteca global, visível pra todo mundo,
-- só editável por quem criou este schema). user_id preenchido = exercício
-- customizado, visível e editável só por quem criou.
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text not null default 'Geral',
  icon text not null default '💪',
  instructions text,
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "exercises_select_own_or_global" on public.exercises
  for select using (user_id is null or auth.uid() = user_id);
create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = user_id);
create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = user_id);

-- ROUTINES ------------------------------------------------------------------
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.routines enable row level security;

create policy "routines_select_own" on public.routines
  for select using (auth.uid() = user_id);
create policy "routines_insert_own" on public.routines
  for insert with check (auth.uid() = user_id);
create policy "routines_update_own" on public.routines
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routines_delete_own" on public.routines
  for delete using (auth.uid() = user_id);

-- ROUTINE_EXERCISES -----------------------------------------------------
create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_id uuid not null references public.routines (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  order_index int not null default 0,
  target_sets int not null default 3,
  target_reps int not null default 10,
  created_at timestamptz not null default now()
);

alter table public.routine_exercises enable row level security;

create policy "routine_exercises_select_own" on public.routine_exercises
  for select using (auth.uid() = user_id);
create policy "routine_exercises_insert_own" on public.routine_exercises
  for insert with check (auth.uid() = user_id);
create policy "routine_exercises_update_own" on public.routine_exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "routine_exercises_delete_own" on public.routine_exercises
  for delete using (auth.uid() = user_id);

create index if not exists routine_exercises_routine_idx on public.routine_exercises (routine_id, order_index);

-- WORKOUT_SESSIONS --------------------------------------------------------
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  routine_id uuid references public.routines (id) on delete set null,
  date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workout_sessions enable row level security;

create policy "workout_sessions_select_own" on public.workout_sessions
  for select using (auth.uid() = user_id);
create policy "workout_sessions_insert_own" on public.workout_sessions
  for insert with check (auth.uid() = user_id);
create policy "workout_sessions_update_own" on public.workout_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sessions_delete_own" on public.workout_sessions
  for delete using (auth.uid() = user_id);

create index if not exists workout_sessions_user_date_idx on public.workout_sessions (user_id, date desc);

-- WORKOUT_SETS --------------------------------------------------------------
create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  set_number int not null default 1,
  reps int not null,
  weight numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.workout_sets enable row level security;

create policy "workout_sets_select_own" on public.workout_sets
  for select using (auth.uid() = user_id);
create policy "workout_sets_insert_own" on public.workout_sets
  for insert with check (auth.uid() = user_id);
create policy "workout_sets_update_own" on public.workout_sets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout_sets_delete_own" on public.workout_sets
  for delete using (auth.uid() = user_id);

create index if not exists workout_sets_session_idx on public.workout_sets (session_id);
create index if not exists workout_sets_exercise_idx on public.workout_sets (user_id, exercise_id, created_at);

-- BIBLIOTECA PADRÃO DE EXERCÍCIOS --------------------------------------
-- Inserida uma única vez com user_id nulo (visível para todos os usuários).
insert into public.exercises (user_id, name, muscle_group, icon, instructions)
select null, name, muscle_group, icon, instructions
from (values
  ('Supino reto', 'Peito', '🏋️', 'Deite no banco, pegada um pouco mais larga que os ombros, desça a barra até o peito e empurre para cima.'),
  ('Supino inclinado', 'Peito', '🏋️', 'Banco inclinado a 30-45°, mesma execução do supino reto, foco na porção superior do peitoral.'),
  ('Crucifixo', 'Peito', '💪', 'Deitado, braços levemente flexionados, abra e feche os braços em arco controlando o peso.'),
  ('Agachamento livre', 'Pernas', '🦵', 'Pés na largura dos ombros, desça flexionando quadril e joelhos mantendo a coluna neutra.'),
  ('Leg press', 'Pernas', '🦵', 'Sentado no aparelho, empurre a plataforma estendendo as pernas sem travar os joelhos.'),
  ('Cadeira extensora', 'Pernas', '🦵', 'Sentado, estenda os joelhos elevando o peso, controle a descida.'),
  ('Levantamento terra', 'Posterior', '🏋️', 'Pés na largura do quadril, pegue a barra e estenda quadril e joelhos mantendo a coluna reta.'),
  ('Puxada frontal', 'Costas', '🤸', 'Puxe a barra em direção ao peito mantendo o tronco levemente inclinado para trás.'),
  ('Remada curvada', 'Costas', '🤸', 'Tronco inclinado à frente, puxe a barra em direção ao abdômen.'),
  ('Desenvolvimento com halteres', 'Ombro', '💪', 'Sentado ou em pé, empurre os halteres para cima até estender os braços.'),
  ('Elevação lateral', 'Ombro', '💪', 'Em pé, eleve os halteres lateralmente até a altura dos ombros.'),
  ('Rosca direta', 'Bíceps', '💪', 'Em pé, flexione os cotovelos elevando a barra sem balançar o tronco.'),
  ('Tríceps corda', 'Tríceps', '💪', 'Puxe a corda para baixo estendendo os cotovelos, mantendo os braços junto ao corpo.'),
  ('Abdominal supra', 'Abdômen', '🔥', 'Deitado, flexione o tronco em direção aos joelhos contraindo o abdômen.'),
  ('Prancha', 'Abdômen', '🔥', 'Apoie antebraços e pontas dos pés, mantenha o corpo alinhado e reto pelo tempo determinado.')
) as defaults(name, muscle_group, icon, instructions)
where not exists (
  select 1 from public.exercises e where e.user_id is null and e.name = defaults.name
);
