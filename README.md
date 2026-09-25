# Amorim

PWA pessoal com três módulos: **Finanças** (receitas, despesas, contas, orçamento e metas), **Treino** (rotinas, registro de treino, biblioteca de exercícios e progressão de carga) e **Hábitos** (checklist diário de hábitos com sequência de dias, meta de água e uma agenda de tarefas), com um seletor pra trocar entre eles.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Recharts (gráficos)
- Supabase (autenticação + banco de dados Postgres, com sincronização entre dispositivos)
- vite-plugin-pwa (instalável, abre offline como app)

## Configurando o Supabase

O app precisa de um projeto Supabase próprio para autenticação e armazenamento dos dados.

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e clique em **New Project**.
2. Depois que o projeto for criado, vá em **Project Settings > API** e copie:
   - **Project URL**
   - **anon public key**
3. Na raiz do repositório, copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os valores copiados.
4. No painel do Supabase, abra o **SQL Editor**, cole todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste repositório e clique em **Run**. Isso cria as tabelas do módulo financeiro (`accounts`, `categories`, `transactions`, `budgets`, `goals`) já com as políticas de segurança (RLS) que garantem que cada usuário só acessa os próprios dados.
5. Ainda no **SQL Editor**, rode também o [`supabase/schema_fitness.sql`](./supabase/schema_fitness.sql) — cria as tabelas do módulo de treino (`exercises`, `routines`, `routine_exercises`, `workout_sessions`, `workout_sets`) e já popula a biblioteca padrão de exercícios.
6. Rode também o [`supabase/schema_avatar.sql`](./supabase/schema_avatar.sql) — cria o bucket de armazenamento `avatars` (pra foto de perfil) com as políticas de acesso.
7. Rode também o [`supabase/schema_recurring.sql`](./supabase/schema_recurring.sql) — cria a tabela de transações recorrentes (assinaturas, aluguel, salário, etc).
8. Rode também o [`supabase/schema_habits.sql`](./supabase/schema_habits.sql) — cria as tabelas do módulo de Hábitos (`habits`, `habit_logs`, `water_logs`).
9. Rode também o [`supabase/schema_agenda.sql`](./supabase/schema_agenda.sql) — cria a tabela da agenda de tarefas (`agenda_tasks`), dentro do módulo Hábitos.
10. (Opcional, recomendado em desenvolvimento) Em **Authentication > Sign In / Providers > Email**, desative a exigência de confirmação por e-mail (**Confirm email**) para poder testar login logo após criar a conta, sem precisar clicar no link enviado por e-mail.

Pronto — ao rodar o app e criar uma conta pela tela de login, as categorias padrão (Finanças) já ficam disponíveis, e a biblioteca de exercícios (Treino) também.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

- `src/pages` — telas do módulo Finanças (Landing, Login, Dashboard, Transações, Contas, Metas, Categorias)
- `src/pages/fitness` — telas do módulo Treino (Dashboard, Registrar treino, Rotinas, Exercícios)
- `src/pages/habits` — telas do módulo Hábitos (Dashboard: checklist diário + meta de água; Agenda: tarefas com data)
- `src/components` — componentes de UI e formulários
- `src/context/AuthContext.tsx` — sessão e autenticação (Supabase Auth)
- `src/context/FinanceContext.tsx` — dados do módulo Finanças (Supabase Postgres)
- `src/context/WorkoutContext.tsx` — dados do módulo Treino (Supabase Postgres)
- `src/context/HabitsContext.tsx` — dados do módulo Hábitos (Supabase Postgres)
- `src/lib` — tipos, dados padrão e utilitários
- `supabase/schema.sql` — schema do módulo Finanças (tabelas + RLS)
- `supabase/schema_fitness.sql` — schema do módulo Treino (tabelas + RLS)
- `supabase/schema_avatar.sql` — bucket de storage para foto de perfil
- `supabase/schema_recurring.sql` — transações recorrentes (assinaturas, aluguel, etc)
- `supabase/schema_habits.sql` — schema do módulo Hábitos (tabelas + RLS)
- `supabase/schema_agenda.sql` — schema da agenda de tarefas (tabela + RLS)

## Offline

O app é um PWA: depois de aberto uma vez com internet, o "shell" (telas, estilos, código) fica em cache e abre offline. Como os dados agora ficam no Supabase (pra sincronizar entre dispositivos e nunca serem perdidos), criar/editar transações exige conexão — só a navegação e visualização do que já foi carregado funcionam sem internet.
