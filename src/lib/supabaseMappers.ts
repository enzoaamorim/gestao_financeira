import type { Account, Budget, Category, Goal, Transaction } from "./types";

export function categoryFromRow(row: any): Category {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color, type: row.type };
}

export function categoryToRow(c: Omit<Category, "id">) {
  return { name: c.name, icon: c.icon, color: c.color, type: c.type };
}

export function accountFromRow(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    initialBalance: Number(row.initial_balance),
    color: row.color,
    limit: row.limit != null ? Number(row.limit) : undefined,
    closingDay: row.closing_day ?? undefined,
    dueDay: row.due_day ?? undefined,
  };
}

export function accountToRow(a: Omit<Account, "id">) {
  return {
    name: a.name,
    type: a.type,
    initial_balance: a.initialBalance,
    color: a.color,
    limit: a.limit ?? null,
    closing_day: a.closingDay ?? null,
    due_day: a.dueDay ?? null,
  };
}

export function transactionFromRow(row: any): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    type: row.type,
    categoryId: row.category_id,
    accountId: row.account_id,
    note: row.note ?? undefined,
  };
}

export function transactionToRow(t: Omit<Transaction, "id">) {
  return {
    description: t.description,
    amount: t.amount,
    date: t.date,
    type: t.type,
    category_id: t.categoryId,
    account_id: t.accountId,
    note: t.note ?? null,
  };
}

export function budgetFromRow(row: any): Budget {
  return { id: row.id, name: row.name, categoryId: row.category_id, amount: Number(row.amount), period: row.period };
}

export function budgetToRow(b: Omit<Budget, "id">) {
  return { name: b.name, category_id: b.categoryId, amount: b.amount, period: b.period };
}

export function goalFromRow(row: any): Goal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    savedAmount: Number(row.saved_amount),
    deadline: row.deadline ?? undefined,
    color: row.color,
    icon: row.icon,
  };
}

export function goalToRow(g: Omit<Goal, "id">) {
  return {
    name: g.name,
    target_amount: g.targetAmount,
    saved_amount: g.savedAmount,
    deadline: g.deadline ?? null,
    color: g.color,
    icon: g.icon,
  };
}
