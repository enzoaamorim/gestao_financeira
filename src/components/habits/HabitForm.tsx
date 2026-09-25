import { useState } from "react";
import type { Habit } from "../../lib/habitsTypes";
import { useHabits } from "../../context/HabitsContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";
import clsx from "clsx";

interface Props {
  initial?: Habit;
  onDone: () => void;
}

export function HabitForm({ initial, onDone }: Props) {
  const { addHabit, updateHabit } = useHabits();

  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "✅");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) return;

    const payload = { name: name.trim(), icon: icon.trim(), active: initial?.active ?? true };

    setSubmitting(true);
    setError(null);
    const result = initial ? await updateHabit(initial.id, payload) : await addHabit(payload);
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label className={labelClass}>Nome</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Ler 10 minutos"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Ícone</label>
          <input
            className={clsx(inputClass, "w-16 text-center text-lg")}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-pink">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar hábito"}
      </Button>
    </form>
  );
}
