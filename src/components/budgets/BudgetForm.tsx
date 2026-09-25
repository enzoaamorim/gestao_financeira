import { useState } from "react";
import type { Budget } from "../../lib/types";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";

interface Props {
  initial?: Budget;
  onDone: () => void;
}

export function BudgetForm({ initial, onDone }: Props) {
  const { categories, budgets, addBudget, updateBudget } = useFinance();
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const usedCategoryIds = new Set(budgets.filter((b) => b.id !== initial?.id).map((b) => b.categoryId));
  const availableCategories = expenseCategories.filter(
    (c) => !usedCategoryIds.has(c.id) || c.id === initial?.categoryId,
  );

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? availableCategories[0]?.id ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!categoryId || Number.isNaN(value) || value <= 0) return;

    const category = categories.find((c) => c.id === categoryId);
    const payload: Omit<Budget, "id"> = {
      name: category?.name ?? "Orçamento",
      categoryId,
      amount: value,
      period: "monthly",
    };

    setSubmitting(true);
    setError(null);
    const result = initial ? await updateBudget(initial.id, payload) : await addBudget(payload);
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  if (availableCategories.length === 0 && !initial) {
    return <p className="text-sm text-muted">Todas as categorias de despesa já têm um orçamento.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Categoria</label>
        <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Limite mensal (R$)</label>
        <input
          className={inputClass}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
          required
        />
      </div>
      {error && <p className="text-sm text-pink">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar orçamento"}
      </Button>
    </form>
  );
}
