import { useState } from "react";
import { useFinance } from "../../context/FinanceContext";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import type { RecurringTransaction } from "../../lib/types";
import { formatCurrency } from "../../lib/format";
import clsx from "clsx";

export function RecurringManager() {
  const { recurringTransactions, categoryById, accountById, updateRecurring, deleteRecurring } = useFinance();
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | undefined>(undefined);

  if (recurringTransactions.length === 0) {
    return <p className="text-sm text-subtle">Nenhuma transação recorrente ainda.</p>;
  }

  function toggleActive(id: string, current: RecurringTransaction) {
    updateRecurring(id, {
      description: current.description,
      amount: current.amount,
      type: current.type,
      categoryId: current.categoryId,
      accountId: current.accountId,
      dayOfMonth: current.dayOfMonth,
      active: !current.active,
    });
  }

  return (
    <div className="space-y-3">
      {recurringTransactions.map((r) => {
        const cat = categoryById(r.categoryId);
        const account = accountById(r.accountId);
        return (
          <div
            key={r.id}
            className={clsx(
              "flex items-center justify-between rounded-xl border border-border p-3",
              !r.active && "opacity-50",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-base">
                {cat?.icon ?? "🔁"}
              </span>
              <div>
                <p className="text-sm font-medium">{r.description}</p>
                <p className="text-xs text-subtle">
                  Todo dia {r.dayOfMonth} · {account?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={clsx("text-sm font-semibold", r.type === "income" ? "text-teal" : "text-pink")}>
                {r.type === "income" ? "+" : "-"}
                {formatCurrency(r.amount)}
              </span>
              <button
                onClick={() => toggleActive(r.id, r)}
                className="text-xs font-semibold text-muted hover:text-ink"
                title={r.active ? "Pausar" : "Reativar"}
              >
                {r.active ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => setDeleteTarget(r)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                aria-label="Excluir"
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={deleteTarget !== undefined}
        title="Excluir recorrência"
        description={`Tem certeza que deseja excluir "${deleteTarget?.description}"? As transações já geradas não serão apagadas, mas nenhuma nova será criada.`}
        onConfirm={() => deleteRecurring(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
}
