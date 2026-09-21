import type { Account, Budget, Category, Goal, Transaction } from "./types";

export const seedCategories: Category[] = [
  { id: "cat-salario", name: "Salário", icon: "💼", color: "#3ed9b0", type: "income" },
  { id: "cat-freelance", name: "Freelance", icon: "💻", color: "#8b7bf7", type: "income" },
  { id: "cat-alimentacao", name: "Alimentação", icon: "🍔", color: "#f4577f", type: "expense" },
  { id: "cat-transporte", name: "Transporte", icon: "🚗", color: "#f4c744", type: "expense" },
  { id: "cat-moradia", name: "Moradia", icon: "🏠", color: "#3ed9b0", type: "expense" },
  { id: "cat-lazer", name: "Lazer", icon: "🎮", color: "#8b7bf7", type: "expense" },
  { id: "cat-saude", name: "Saúde", icon: "💊", color: "#5fb0f0", type: "expense" },
  { id: "cat-outros", name: "Outros", icon: "📦", color: "#9a9aa3", type: "expense" },
];

export const seedAccounts: Account[] = [
  { id: "acc-corrente", name: "Conta Corrente", type: "checking", balance: 4280.5, color: "#3ed9b0" },
  { id: "acc-poupanca", name: "Poupança", type: "savings", balance: 12500, color: "#8b7bf7" },
  {
    id: "acc-cartao",
    name: "Cartão Nubank",
    type: "credit_card",
    balance: -843.9,
    limit: 5000,
    closingDay: 28,
    dueDay: 5,
    color: "#f4577f",
  },
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const seedTransactions: Transaction[] = [
  { id: "t1", description: "Salário", amount: 6200, date: isoDaysAgo(3), type: "income", categoryId: "cat-salario", accountId: "acc-corrente" },
  { id: "t2", description: "Projeto freelance", amount: 1400, date: isoDaysAgo(10), type: "income", categoryId: "cat-freelance", accountId: "acc-corrente" },
  { id: "t3", description: "Aluguel", amount: 1800, date: isoDaysAgo(5), type: "expense", categoryId: "cat-moradia", accountId: "acc-corrente" },
  { id: "t4", description: "Supermercado", amount: 540, date: isoDaysAgo(2), type: "expense", categoryId: "cat-alimentacao", accountId: "acc-cartao" },
  { id: "t5", description: "Delivery de comida", amount: 42, date: isoDaysAgo(1), type: "expense", categoryId: "cat-alimentacao", accountId: "acc-cartao" },
  { id: "t6", description: "Uber", amount: 38.5, date: isoDaysAgo(1), type: "expense", categoryId: "cat-transporte", accountId: "acc-cartao" },
  { id: "t7", description: "Combustível", amount: 220, date: isoDaysAgo(6), type: "expense", categoryId: "cat-transporte", accountId: "acc-corrente" },
  { id: "t8", description: "Streaming", amount: 55.9, date: isoDaysAgo(8), type: "expense", categoryId: "cat-lazer", accountId: "acc-cartao" },
  { id: "t9", description: "Academia", amount: 120, date: isoDaysAgo(12), type: "expense", categoryId: "cat-saude", accountId: "acc-corrente" },
  { id: "t10", description: "Cinema", amount: 68, date: isoDaysAgo(15), type: "expense", categoryId: "cat-lazer", accountId: "acc-cartao" },
  { id: "t11", description: "Farmácia", amount: 89.3, date: isoDaysAgo(18), type: "expense", categoryId: "cat-saude", accountId: "acc-corrente" },
  { id: "t12", description: "Conta de luz", amount: 210, date: isoDaysAgo(20), type: "expense", categoryId: "cat-moradia", accountId: "acc-corrente" },
  { id: "t13", description: "Salário", amount: 6200, date: isoDaysAgo(33), type: "income", categoryId: "cat-salario", accountId: "acc-corrente" },
  { id: "t14", description: "Aluguel", amount: 1800, date: isoDaysAgo(35), type: "expense", categoryId: "cat-moradia", accountId: "acc-corrente" },
  { id: "t15", description: "Supermercado", amount: 610, date: isoDaysAgo(30), type: "expense", categoryId: "cat-alimentacao", accountId: "acc-cartao" },
  { id: "t16", description: "Transporte app", amount: 95, date: isoDaysAgo(28), type: "expense", categoryId: "cat-transporte", accountId: "acc-cartao" },
];

export const seedBudgets: Budget[] = [
  { id: "b1", name: "Alimentação", categoryId: "cat-alimentacao", amount: 800, period: "monthly" },
  { id: "b2", name: "Transporte", categoryId: "cat-transporte", amount: 350, period: "monthly" },
  { id: "b3", name: "Lazer", categoryId: "cat-lazer", amount: 250, period: "monthly" },
];

export const seedGoals: Goal[] = [
  { id: "g1", name: "Reserva de emergência", targetAmount: 20000, savedAmount: 12500, color: "#3ed9b0", icon: "🛟" },
  { id: "g2", name: "Viagem", targetAmount: 6000, savedAmount: 1800, color: "#f4c744", icon: "✈️" },
];
