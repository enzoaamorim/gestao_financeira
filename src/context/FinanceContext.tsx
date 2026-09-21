import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Account, Budget, Category, Goal, RecurringTransaction, Transaction } from "../lib/types";
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
  recurringFromRow,
  recurringToRow,
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
  recurringTransactions: RecurringTransaction[];
  loading: boolean;
  error: string | null;
  clearError: () => void;

  addCategory: (c: Omit<Category, "id">) => Promise<MutationResult>;
  updateCategory: (id: string, c: Omit<Category, "id">) => Promise<MutationResult>;
  deleteCategory: (id: string) => Promise<MutationResult>;

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

  addRecurring: (r: Omit<RecurringTransaction, "id">) => Promise<{ error: string | null; id: string | null }>;
  updateRecurring: (id: string, r: Omit<RecurringTransaction, "id">) => Promise<MutationResult>;
  deleteRecurring: (id: string) => Promise<MutationResult>;

  categoryById: (id: string) => Category | undefined;
  accountById: (id: string) => AccountWithBalance | undefined;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const NETWORK_ERROR_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

function friendlyError(err: unknown): string {
  if (err instanceof TypeError) return NETWORK_ERROR_MESSAGE;
  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "23503") {
    return "Essa categoria não pode ser excluída porque já tem transações associadas.";
  }
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
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [categoriesRes, accountsRes, transactionsRes, budgetsRes, goalsRes, recurringRes] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("accounts").select("*").order("created_at"),
          supabase.from("transactions").select("*").order("date", { ascending: false }),
          supabase.from("budgets").select("*"),
          supabase.from("goals").select("*"),
          supabase.from("recurring_transactions").select("*"),
        ]);

        for (const res of [categoriesRes, accountsRes, transactionsRes, budgetsRes, goalsRes, recurringRes]) {
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

        const loadedRecurring = (recurringRes.data ?? []).map(recurringFromRow);
        let loadedTransactions = (transactionsRes.data ?? []).map(transactionFromRow);

        // Gera a transação do mês atual para cada recorrência ativa que ainda não tem uma.
        const currentMonthKey = new Date().toISOString().slice(0, 7);
        const due = loadedRecurring.filter(
          (r) =>
            r.active &&
            !loadedTransactions.some((t) => t.recurringId === r.id && t.date.startsWith(currentMonthKey)),
        );

        if (due.length > 0) {
          const rows = due.map((r) =>
            transactionToRow({
              description: r.description,
              amount: r.amount,
              type: r.type,
              categoryId: r.categoryId,
              accountId: r.accountId,
              date: `${currentMonthKey}-${String(r.dayOfMonth).padStart(2, "0")}`,
              recurringId: r.id,
            }),
          );
          const { data: generated, error: genError } = await supabase.from("transactions").insert(rows).select();
          if (!genError && generated) {
            loadedTransactions = [...generated.map(transactionFromRow), ...loadedTransactions];
          }
        }

        if (cancelled) return;
        setCategories(loadedCategories);
        setAccounts((accountsRes.data ?? []).map(accountFromRow));
        setTransactions(loadedTransactions);
        setBudgets((budgetsRes.data ?? []).map(budgetFromRow));
        setGoals((goalsRes.data ?? []).map(goalFromRow));
        setRecurringTransactions(loadedRecurring);
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
    async function addCategory(c: Omit<Category, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("categories").insert(categoryToRow(c)).select().single();
        if (err) throw err;
        setCategories((prev) => [...prev, categoryFromRow(data)].sort((a, b) => a.name.localeCompare(b.name)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateCategory(id: string, c: Omit<Category, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("categories")
          .update(categoryToRow(c))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? categoryFromRow(data) : cat)).sort((a, b) => a.name.localeCompare(b.name)),
        );
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteCategory(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("categories").delete().eq("id", id);
        if (err) throw err;
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        setBudgets((prev) => prev.filter((budget) => budget.categoryId !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

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

    async function addRecurring(r: Omit<RecurringTransaction, "id">) {
      try {
        const { data, error: err } = await supabase
          .from("recurring_transactions")
          .insert(recurringToRow(r))
          .select()
          .single();
        if (err) throw err;
        const created = recurringFromRow(data);
        setRecurringTransactions((prev) => [...prev, created]);
        return { error: null, id: created.id };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message, id: null };
      }
    }

    async function updateRecurring(id: string, r: Omit<RecurringTransaction, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("recurring_transactions")
          .update(recurringToRow(r))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setRecurringTransactions((prev) => prev.map((rec) => (rec.id === id ? recurringFromRow(data) : rec)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteRecurring(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("recurring_transactions").delete().eq("id", id);
        if (err) throw err;
        setRecurringTransactions((prev) => prev.filter((rec) => rec.id !== id));
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
      recurringTransactions,
      loading,
      error,
      clearError: () => setError(null),

      addCategory,
      updateCategory,
      deleteCategory,

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
      addRecurring,
      updateRecurring,
      deleteRecurring,

      categoryById: (id) => categories.find((c) => c.id === id),
      accountById: (id) => accountsWithBalance.find((a) => a.id === id),
    };
  }, [categories, accountsWithBalance, transactions, budgets, goals, recurringTransactions, loading, error]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
