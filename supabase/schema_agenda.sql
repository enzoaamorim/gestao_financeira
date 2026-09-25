-- Amorim — agenda de tarefas (dentro do módulo Hábitos) (Supabase / Postgres)
-- Rode este arquivo no SQL Editor do seu projeto Supabase. Independente
-- dos outros módulos (não precisa rodar antes/depois de nenhum outro).

create table if not exists public.agenda_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  date date not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.agenda_tasks enable row level security;

drop policy if exists "agenda_tasks_select_own" on public.agenda_tasks;
create policy "agenda_tasks_select_own" on public.agenda_tasks
  for select using (auth.uid() = user_id);

drop policy if exists "agenda_tasks_insert_own" on public.agenda_tasks;
create policy "agenda_tasks_insert_own" on public.agenda_tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "agenda_tasks_update_own" on public.agenda_tasks;
create policy "agenda_tasks_update_own" on public.agenda_tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "agenda_tasks_delete_own" on public.agenda_tasks;
create policy "agenda_tasks_delete_own" on public.agenda_tasks
  for delete using (auth.uid() = user_id);

create index if not exists agenda_tasks_user_date_idx on public.agenda_tasks (user_id, date);
