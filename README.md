# Amorim — Gestão Financeira

PWA de gestão financeira pessoal: controle de receitas e despesas, dashboard com gráficos, metas de economia, orçamento por categoria e gerenciamento de contas/cartões.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Recharts (gráficos)
- vite-plugin-pwa (instalável, funciona offline)
- Dados salvos em `localStorage` (sem backend/servidor)

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

- `src/pages` — telas (Landing, Dashboard, Transações, Contas, Metas)
- `src/components` — componentes de UI e formulários
- `src/context/FinanceContext.tsx` — estado global e persistência
- `src/lib` — tipos, dados iniciais (seed) e utilitários
