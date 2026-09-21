export type TransactionType = "income" | "expense";

export type AccountType = "checking" | "savings" | "credit_card" | "cash";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Balance before any recorded transaction; current balance is derived at runtime. */
  initialBalance: number;
  color: string;
  /** Only for credit cards */
  limit?: number;
  closingDay?: number;
  dueDay?: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO date
  type: TransactionType;
  categoryId: string;
  accountId: string;
  note?: string;
}

export type BudgetPeriod = "monthly";

export interface Budget {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  color: string;
  icon: string;
}
