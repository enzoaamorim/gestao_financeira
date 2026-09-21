import { useState } from "react";
import type { Transaction, TransactionType } from "../../lib/types";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";
import clsx from "clsx";

interface Props {
  initial?: Transaction;
  onDone: () => void;
}

export function TransactionForm({ initial, onDone }: Props) {
  const { categories, accounts, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories.find((c) => c.type === type)?.id ?? "",
  );
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = categories.filter((c) => c.type === type);

  function handleTypeChange(next: TransactionType) {
    setType(next);
    const firstOfType = categories.find((c) => c.type === next);
    if (firstOfType) setCategoryId(firstOfType.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || Number.isNaN(value) || value <= 0 || !categoryId || !accountId) return;

    const payload = { description: description.trim(), amount: value, date, type, categoryId, accountId };

    setSubmitting(true);
    setError(null);
    const result = initial ? await updateTransaction(initial.id, payload) : await addTransaction(payload);
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={clsx(
            "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
            type === "expense" ? "border-pink/60 bg-pink/10 text-pink" : "border-border text-muted",
          )}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={clsx(
            "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
            type === "income" ? "border-teal/60 bg-teal/10 text-teal" : "border-border text-muted",
          )}
        >
          Receita
        </button>
      </div>

      <div>
        <label className={labelClass}>Descrição</label>
        <input
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Supermercado"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Valor (R$)</label>
          <input
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Data</label>
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Categoria</label>
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Conta</label>
          <select
            className={inputClass}
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-pink">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Adicionar transação"}
      </Button>
    </form>
  );
}
