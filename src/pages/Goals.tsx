import { useMemo, useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ProgressBar } from "../components/ui/ProgressBar";
import { BudgetForm } from "../components/budgets/BudgetForm";
import { GoalForm } from "../components/goals/GoalForm";
import { formatCurrency } from "../lib/format";
import type { Budget, Goal } from "../lib/types";

export default function Goals() {
  const { budgets, goals, transactions, categoryById, deleteBudget, deleteGoal } = useFinance();

  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  const [deleteBudgetTarget, setDeleteBudgetTarget] = useState<Budget | undefined>(undefined);
  const [deleteGoalTarget, setDeleteGoalTarget] = useState<Goal | undefined>(undefined);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonthKey))
      .forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount));
    return map;
  }, [transactions, currentMonthKey]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Metas e orçamento</h1>
        <p className="mt-1 text-sm text-muted">Defina limites de gasto e acompanhe suas metas de economia</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orçamento mensal</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingBudget(undefined);
              setBudgetFormOpen(true);
            }}
          >
            + Novo orçamento
          </Button>
        </div>

        {budgets.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-subtle">Nenhum orçamento criado ainda.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
              const category = categoryById(b.categoryId);
              const spent = spentByCategory.get(b.categoryId) ?? 0;
              const pct = (spent / b.amount) * 100;
              return (
                <Card key={b.id} className="group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-base">
                        {category?.icon ?? "📦"}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{b.name}</p>
                        <p className="text-xs text-subtle">Limite mensal</p>
                      </div>
                    </div>
                    <div className="hidden items-center gap-1 group-hover:flex">
                      <button
                        onClick={() => {
                          setEditingBudget(b);
                          setBudgetFormOpen(true);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setDeleteBudgetTarget(b)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <ProgressBar value={pct} color={category?.color} />
                    <div className="flex justify-between text-xs">
                      <span className={pct > 100 ? "font-semibold text-pink" : "text-muted"}>
                        {formatCurrency(spent)} gastos
                      </span>
                      <span className="text-subtle">de {formatCurrency(b.amount)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Metas de economia</h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setEditingGoal(undefined);
              setGoalFormOpen(true);
            }}
          >
            + Nova meta
          </Button>
        </div>

        {goals.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-subtle">Nenhuma meta criada ainda.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => {
              const pct = (g.savedAmount / g.targetAmount) * 100;
              return (
                <Card key={g.id} className="group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-base"
                        style={{ backgroundColor: `${g.color}22` }}
                      >
                        {g.icon}
                      </span>
                      <p className="text-sm font-semibold">{g.name}</p>
                    </div>
                    <div className="hidden items-center gap-1 group-hover:flex">
                      <button
                        onClick={() => {
                          setEditingGoal(g);
                          setGoalFormOpen(true);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setDeleteGoalTarget(g)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <ProgressBar value={pct} color={g.color} />
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-ink">{formatCurrency(g.savedAmount)}</span>
                      <span className="text-subtle">de {formatCurrency(g.targetAmount)}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={budgetFormOpen}
        onClose={() => setBudgetFormOpen(false)}
        title={editingBudget ? "Editar orçamento" : "Novo orçamento"}
      >
        <BudgetForm initial={editingBudget} onDone={() => setBudgetFormOpen(false)} />
      </Modal>

      <Modal
        open={goalFormOpen}
        onClose={() => setGoalFormOpen(false)}
        title={editingGoal ? "Editar meta" : "Nova meta"}
      >
        <GoalForm initial={editingGoal} onDone={() => setGoalFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteBudgetTarget !== undefined}
        title="Excluir orçamento"
        description={`Tem certeza que deseja excluir o orçamento "${deleteBudgetTarget?.name}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => deleteBudget(deleteBudgetTarget!.id)}
        onCancel={() => setDeleteBudgetTarget(undefined)}
      />

      <ConfirmDialog
        open={deleteGoalTarget !== undefined}
        title="Excluir meta"
        description={`Tem certeza que deseja excluir a meta "${deleteGoalTarget?.name}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => deleteGoal(deleteGoalTarget!.id)}
        onCancel={() => setDeleteGoalTarget(undefined)}
      />
    </div>
  );
}
