import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { inputClass } from "../components/ui/fields";
import { TransactionForm } from "../components/transactions/TransactionForm";
import { RecurringManager } from "../components/transactions/RecurringManager";
import { formatCurrency, formatDate } from "../lib/format";
import type { Transaction } from "../lib/types";
import clsx from "clsx";

type TypeFilter = "all" | "income" | "expense";

export default function Transactions() {
  const { transactions, categories, accountById, deleteTransaction } = useFinance();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | undefined>(undefined);

  const months = useMemo(() => {
    const set = new Set(transactions.map((t) => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => typeFilter === "all" || t.type === typeFilter)
      .filter((t) => categoryFilter === "all" || t.categoryId === categoryFilter)
      .filter((t) => monthFilter === "all" || t.date.startsWith(monthFilter))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, typeFilter, categoryFilter, monthFilter]);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} transações encontradas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setRecurringOpen(true)}>
            🔁 Recorrências
          </Button>
          <Button onClick={openNew}>+ Nova transação</Button>
        </div>
      </div>

      <Card className="flex flex-wrap gap-3 !p-4">
        <div className="flex gap-1.5">
          {(["all", "income", "expense"] as TypeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                typeFilter === f ? "bg-ink text-bg" : "bg-surface-2 text-muted hover:text-ink",
              )}
            >
              {f === "all" ? "Todas" : f === "income" ? "Receitas" : "Despesas"}
            </button>
          ))}
        </div>
        <select
          className={clsx(inputClass, "w-auto")}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <select
          className={clsx(inputClass, "w-auto")}
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="all">Todos os períodos</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(`${m}-02`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>
      </Card>

      <Card className="!p-0">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-subtle">Nenhuma transação encontrada.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => {
              const cat = categories.find((c) => c.id === t.categoryId);
              const account = accountById(t.accountId);
              return (
                <li key={t.id} className="group flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-lg">
                      {cat?.icon ?? "📦"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {t.description} {t.recurringId && <span title="Recorrente">🔁</span>}
                      </p>
                      <p className="truncate text-xs text-subtle">
                        {cat?.name} · {account?.name} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={clsx(
                        "text-sm font-semibold",
                        t.type === "income" ? "text-teal" : "text-pink",
                      )}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </span>
                    <div className="hidden items-center gap-1 group-hover:flex">
                      <button
                        onClick={() => openEdit(t)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                        aria-label="Editar"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                        aria-label="Excluir"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar transação" : "Nova transação"}
      >
        <TransactionForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal open={recurringOpen} onClose={() => setRecurringOpen(false)} title="Transações recorrentes">
        <RecurringManager />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== undefined}
        title="Excluir transação"
        description={`Tem certeza que deseja excluir "${deleteTarget?.description}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => deleteTransaction(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
}
