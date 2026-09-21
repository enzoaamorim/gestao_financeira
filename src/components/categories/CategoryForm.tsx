import { useState } from "react";
import type { Category, TransactionType } from "../../lib/types";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";
import clsx from "clsx";

const colorOptions = ["#3ed9b0", "#f4577f", "#f4c744", "#8b7bf7", "#5fb0f0", "#9a9aa3"];

interface Props {
  initial?: Category;
  defaultType?: TransactionType;
  onDone: () => void;
}

export function CategoryForm({ initial, defaultType = "expense", onDone }: Props) {
  const { addCategory, updateCategory } = useFinance();

  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType);
  const [icon, setIcon] = useState(initial?.icon ?? "📦");
  const [color, setColor] = useState(initial?.color ?? colorOptions[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) return;

    const payload: Omit<Category, "id"> = { name: name.trim(), type, icon: icon.trim(), color };

    setSubmitting(true);
    setError(null);
    const result = initial ? await updateCategory(initial.id, payload) : await addCategory(payload);
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={clsx(
            "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
            type === "expense" ? "border-pink/60 bg-pink/10 text-pink" : "border-border text-muted",
          )}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={clsx(
            "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
            type === "income" ? "border-teal/60 bg-teal/10 text-teal" : "border-border text-muted",
          )}
        >
          Receita
        </button>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label className={labelClass}>Nome</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Educação"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Ícone</label>
          <input
            className={clsx(inputClass, "w-16 text-center text-lg")}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="📦"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Cor</label>
        <div className="flex gap-2">
          {colorOptions.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition-shadow"
              style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-pink">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar categoria"}
      </Button>
    </form>
  );
}
