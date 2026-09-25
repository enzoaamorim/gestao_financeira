-- Amorim — transações recorrentes (Supabase / Postgres)
-- Rode este arquivo no SQL Editor do seu projeto Supabase DEPOIS do
-- supabase/schema.sql (módulo financeiro).

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text not null,
  amount numeric not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category_id uuid not null references public.categories (id) on delete restrict,
  account_id uuid not null references public.accounts (id) on delete cascade,
  day_of_month int not null check (day_of_month between 1 and 28),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_transactions enable row level security;

drop policy if exists "recurring_select_own" on public.recurring_transactions;
create policy "recurring_select_own" on public.recurring_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "recurring_insert_own" on public.recurring_transactions;
create policy "recurring_insert_own" on public.recurring_transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "recurring_update_own" on public.recurring_transactions;
create policy "recurring_update_own" on public.recurring_transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recurring_delete_own" on public.recurring_transactions;
create policy "recurring_delete_own" on public.recurring_transactions
  for delete using (auth.uid() = user_id);

-- Liga cada transação gerada automaticamente à recorrência que a criou.
-- Excluir a recorrência não apaga o histórico já gerado (só desliga a coluna).
alter table public.transactions
  add column if not exists recurring_id uuid references public.recurring_transactions (id) on delete set null;

create index if not exists transactions_recurring_idx on public.transactions (recurring_id);
