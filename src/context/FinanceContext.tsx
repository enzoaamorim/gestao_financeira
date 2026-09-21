import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Account, Budget, Category, Goal, Transaction } from "../lib/types";
import { seedCategories } from "../lib/seed";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import {
  accountFromRow,
  accountToRow,
  budgetFromRow,
  budgetToRow,
  categoryFromRow,
  categoryToRow,
  goalFromRow,
  goalToRow,
  transactionFromRow,
  transactionToRow,
} from "../lib/supabaseMappers";

export type AccountWithBalance = Account & { balance: number };

type MutationResult = { error: string | null };

interface FinanceContextValue {
  categories: Category[];
  accounts: AccountWithBalance[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
  error: string | null;
  clearError: () => void;

  addTransaction: (t: Omit<Transaction, "id">) => Promise<MutationResult>;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => Promise<MutationResult>;
  deleteTransaction: (id: string) => Promise<MutationResult>;

  addAccount: (a: Omit<Account, "id">) => Promise<MutationResult>;
  updateAccount: (id: string, a: Omit<Account, "id">) => Promise<MutationResult>;
  deleteAccount: (id: string) => Promise<MutationResult>;

  addBudget: (b: Omit<Budget, "id">) => Promise<MutationResult>;
  updateBudget: (id: string, b: Omit<Budget, "id">) => Promise<MutationResult>;
  deleteBudget: (id: string) => Promise<MutationResult>;

  addGoal: (g: Omit<Goal, "id">) => Promise<MutationResult>;
  updateGoal: (id: string, g: Omit<Goal, "id">) => Promise<MutationResult>;
  deleteGoal: (id: string) => Promise<MutationResult>;

  categoryById: (id: string) => Category | undefined;
  accountById: (id: string) => AccountWithBalance | undefined;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

function friendlyError(err: unknown): string {
  if (err instanceof TypeError) return NETWORK_ERROR_MESSAGE;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "Ocorreu um erro inesperado.";
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [categoriesRes, accountsRes, transactionsRes, budgetsRes, goalsRes] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("accounts").select("*").order("created_at"),
          supabase.from("transactions").select("*").order("date", { ascending: false }),
          supabase.from("budgets").select("*"),
          supabase.from("goals").select("*"),
        ]);

        for (const res of [categoriesRes, accountsRes, transactionsRes, budgetsRes, goalsRes]) {
          if (res.error) throw res.error;
        }

        let loadedCategories = (categoriesRes.data ?? []).map(categoryFromRow);

        if (loadedCategories.length === 0) {
          const { data: seeded, error: seedError } = await supabase
            .from("categories")
            .insert(seedCategories.map(({ id: _id, ...c }) => categoryToRow(c)))
            .select();
          if (seedError) throw seedError;
          loadedCategories = (seeded ?? []).map(categoryFromRow);
        }

        if (cancelled) return;
        setCategories(loadedCategories);
        setAccounts((accountsRes.data ?? []).map(accountFromRow));
        setTransactions((transactionsRes.data ?? []).map(transactionFromRow));
        setBudgets((budgetsRes.data ?? []).map(budgetFromRow));
        setGoals((goalsRes.data ?? []).map(goalFromRow));
        setError(null);
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const accountsWithBalance = useMemo<AccountWithBalance[]>(() => {
    return accounts.map((a) => {
      const delta = transactions
        .filter((t) => t.accountId === a.id)
        .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
      return { ...a, balance: a.initialBalance + delta };
    });
  }, [accounts, transactions]);

  const value = useMemo<FinanceContextValue>(() => {
    async function addTransaction(t: Omit<Transaction, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("transactions")
          .insert(transactionToRow(t))
          .select()
          .single();
        if (err) throw err;
        setTransactions((prev) => [transactionFromRow(data), ...prev]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateTransaction(id: string, t: Omit<Transaction, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("transactions")
          .update(transactionToRow(t))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setTransactions((prev) => prev.map((tx) => (tx.id === id ? transactionFromRow(data) : tx)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteTransaction(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("transactions").delete().eq("id", id);
        if (err) throw err;
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addAccount(a: Omit<Account, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("accounts").insert(accountToRow(a)).select().single();
        if (err) throw err;
        setAccounts((prev) => [...prev, accountFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateAccount(id: string, a: Omit<Account, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("accounts")
          .update(accountToRow(a))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setAccounts((prev) => prev.map((acc) => (acc.id === id ? accountFromRow(data) : acc)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteAccount(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("accounts").delete().eq("id", id);
        if (err) throw err;
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
        setTransactions((prev) => prev.filter((tx) => tx.accountId !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addBudget(b: Omit<Budget, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("budgets").insert(budgetToRow(b)).select().single();
        if (err) throw err;
        setBudgets((prev) => [...prev, budgetFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateBudget(id: string, b: Omit<Budget, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("budgets")
          .update(budgetToRow(b))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setBudgets((prev) => prev.map((budget) => (budget.id === id ? budgetFromRow(data) : budget)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteBudget(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("budgets").delete().eq("id", id);
        if (err) throw err;
        setBudgets((prev) => prev.filter((budget) => budget.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addGoal(g: Omit<Goal, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("goals").insert(goalToRow(g)).select().single();
        if (err) throw err;
        setGoals((prev) => [...prev, goalFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateGoal(id: string, g: Omit<Goal, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("goals")
          .update(goalToRow(g))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setGoals((prev) => prev.map((goal) => (goal.id === id ? goalFromRow(data) : goal)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteGoal(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("goals").delete().eq("id", id);
        if (err) throw err;
        setGoals((prev) => prev.filter((goal) => goal.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    return {
      categories,
      accounts: accountsWithBalance,
      transactions,
      budgets,
      goals,
      loading,
      error,
      clearError: () => setError(null),

      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,

      categoryById: (id) => categories.find((c) => c.id === id),
      accountById: (id) => accountsWithBalance.find((a) => a.id === id),
    };
  }, [categories, accountsWithBalance, transactions, budgets, goals, loading, error]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
