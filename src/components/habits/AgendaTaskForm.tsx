import { useState } from "react";
import type { AgendaTask } from "../../lib/agendaTypes";
import { useHabits } from "../../context/HabitsContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";

interface Props {
  initial?: AgendaTask;
  onDone: () => void;
}

export function AgendaTaskForm({ initial, onDone }: Props) {
  const { addAgendaTask, updateAgendaTask } = useHabits();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setSubmitting(true);
    setError(null);
    const result = initial
      ? await updateAgendaTask(initial.id, { title: title.trim(), date, done: initial.done })
      : await addAgendaTask({ title: title.trim(), date });
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>O que precisa fazer?</label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Pagar conta de luz"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Data</label>
        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      {error && <p className="text-sm text-pink">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Adicionar tarefa"}
      </Button>
    </form>
  );
}
