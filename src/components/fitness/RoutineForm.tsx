import { useState } from "react";
import type { Routine } from "../../lib/fitnessTypes";
import { useWorkout } from "../../context/WorkoutContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";

interface Props {
  initial?: Routine;
  onDone: () => void;
}

export function RoutineForm({ initial, onDone }: Props) {
  const { addRoutine, updateRoutine } = useWorkout();
  const [name, setName] = useState(initial?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    const result = initial ? await updateRoutine(initial.id, { name: name.trim() }) : await addRoutine({ name: name.trim() });
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Nome da rotina</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Treino A - Peito e Tríceps"
          required
        />
      </div>
      {error && <p className="text-sm text-pink">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar rotina"}
      </Button>
    </form>
  );
}
