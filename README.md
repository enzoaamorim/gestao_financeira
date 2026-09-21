# Amorim — Gestão Financeira

PWA de gestão financeira pessoal: controle de receitas e despesas, dashboard com gráficos, metas de economia, orçamento por categoria e gerenciamento de contas/cartões.

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
4. No painel do Supabase, abra o **SQL Editor**, cole todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste repositório e clique em **Run**. Isso cria as tabelas (`accounts`, `categories`, `transactions`, `budgets`, `goals`) já com as políticas de segurança (RLS) que garantem que cada usuário só acessa os próprios dados.
5. (Opcional, recomendado em desenvolvimento) Em **Authentication > Sign In / Providers > Email**, desative a exigência de confirmação por e-mail (**Confirm email**) para poder testar login logo após criar a conta, sem precisar clicar no link enviado por e-mail.

Pronto — ao rodar o app e criar uma conta pela tela de login, as categorias padrão são criadas automaticamente no primeiro acesso.

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

- `src/pages` — telas (Landing, Login, Dashboard, Transações, Contas, Metas)
- `src/components` — componentes de UI e formulários
- `src/context/AuthContext.tsx` — sessão e autenticação (Supabase Auth)
- `src/context/FinanceContext.tsx` — dados financeiros (Supabase Postgres)
- `src/lib` — tipos, categorias padrão e utilitários
- `supabase/schema.sql` — schema do banco (tabelas + RLS)

## Offline

O app é um PWA: depois de aberto uma vez com internet, o "shell" (telas, estilos, código) fica em cache e abre offline. Como os dados agora ficam no Supabase (pra sincronizar entre dispositivos e nunca serem perdidos), criar/editar transações exige conexão — só a navegação e visualização do que já foi carregado funcionam sem internet.
