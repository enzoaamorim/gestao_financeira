import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Account, Budget, Category, Goal, Transaction } from "../lib/types";
import { seedAccounts, seedBudgets, seedCategories, seedGoals, seedTransactions } from "../lib/seed";
import { loadState, saveState } from "../lib/storage";
import { makeId } from "../lib/id";

interface FinanceState {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

interface FinanceContextValue extends FinanceState {
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, a: Omit<Account, "id">) => void;
  deleteAccount: (id: string) => void;

  addBudget: (b: Omit<Budget, "id">) => void;
  updateBudget: (id: string, b: Omit<Budget, "id">) => void;
  deleteBudget: (id: string) => void;

  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, g: Omit<Goal, "id">) => void;
  deleteGoal: (id: string) => void;

  categoryById: (id: string) => Category | undefined;
  accountById: (id: string) => Account | undefined;
}

const defaultState: FinanceState = {
  categories: seedCategories,
  accounts: seedAccounts,
  transactions: seedTransactions,
  budgets: seedBudgets,
  goals: seedGoals,
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(() => loadState(defaultState));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo<FinanceContextValue>(() => {
    const applyAccountDelta = (accounts: Account[], accountId: string, delta: number) =>
      accounts.map((a) => (a.id === accountId ? { ...a, balance: a.balance + delta } : a));

    const signedAmount = (t: { type: Transaction["type"]; amount: number }) =>
      t.type === "income" ? t.amount : -t.amount;

    return {
      ...state,

      addTransaction: (t) =>
        setState((s) => ({
          ...s,
          transactions: [{ ...t, id: makeId("t") }, ...s.transactions],
          accounts: applyAccountDelta(s.accounts, t.accountId, signedAmount(t)),
        })),

      updateTransaction: (id, t) =>
        setState((s) => {
          const previous = s.transactions.find((tx) => tx.id === id);
          let accounts = s.accounts;
          if (previous) {
            accounts = applyAccountDelta(accounts, previous.accountId, -signedAmount(previous));
          }
          accounts = applyAccountDelta(accounts, t.accountId, signedAmount(t));
          return {
            ...s,
            accounts,
            transactions: s.transactions.map((tx) => (tx.id === id ? { ...t, id } : tx)),
          };
        }),

      deleteTransaction: (id) =>
        setState((s) => {
          const previous = s.transactions.find((tx) => tx.id === id);
          const accounts = previous
            ? applyAccountDelta(s.accounts, previous.accountId, -signedAmount(previous))
            : s.accounts;
          return {
            ...s,
            accounts,
            transactions: s.transactions.filter((tx) => tx.id !== id),
          };
        }),

      addAccount: (a) =>
        setState((s) => ({ ...s, accounts: [...s.accounts, { ...a, id: makeId("acc") }] })),

      updateAccount: (id, a) =>
        setState((s) => ({
          ...s,
          accounts: s.accounts.map((acc) => (acc.id === id ? { ...a, id } : acc)),
        })),

      deleteAccount: (id) =>
        setState((s) => ({
          ...s,
          accounts: s.accounts.filter((acc) => acc.id !== id),
          transactions: s.transactions.filter((tx) => tx.accountId !== id),
        })),

      addBudget: (b) => setState((s) => ({ ...s, budgets: [...s.budgets, { ...b, id: makeId("b") }] })),

      updateBudget: (id, b) =>
        setState((s) => ({
          ...s,
          budgets: s.budgets.map((budget) => (budget.id === id ? { ...b, id } : budget)),
        })),

      deleteBudget: (id) =>
        setState((s) => ({ ...s, budgets: s.budgets.filter((budget) => budget.id !== id) })),

      addGoal: (g) => setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: makeId("g") }] })),

      updateGoal: (id, g) =>
        setState((s) => ({ ...s, goals: s.goals.map((goal) => (goal.id === id ? { ...g, id } : goal)) })),

      deleteGoal: (id) => setState((s) => ({ ...s, goals: s.goals.filter((goal) => goal.id !== id) })),

      categoryById: (id) => state.categories.find((c) => c.id === id),
      accountById: (id) => state.accounts.find((a) => a.id === id),
    };
  }, [state]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
