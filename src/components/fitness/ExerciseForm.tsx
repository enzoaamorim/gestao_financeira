import { useState } from "react";
import type { Exercise } from "../../lib/fitnessTypes";
import { useWorkout } from "../../context/WorkoutContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";
import clsx from "clsx";

const muscleGroups = ["Peito", "Costas", "Pernas", "Ombro", "Bíceps", "Tríceps", "Abdômen", "Posterior", "Geral"];

interface Props {
  initial?: Exercise;
  onDone: () => void;
}

export function ExerciseForm({ initial, onDone }: Props) {
  const { addExercise, updateExercise } = useWorkout();

  const [name, setName] = useState(initial?.name ?? "");
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscleGroup ?? muscleGroups[0]);
  const [icon, setIcon] = useState(initial?.icon ?? "💪");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !icon.trim()) return;

    const payload = { name: name.trim(), muscleGroup, icon: icon.trim(), instructions: instructions.trim() || undefined };

    setSubmitting(true);
    setError(null);
    const result = initial ? await updateExercise(initial.id, payload) : await addExercise(payload);
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
            placeholder="Ex: Cadeira flexora"
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

      <div>
        <label className={labelClass}>Grupo muscular</label>
        <select className={inputClass} value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)}>
          {muscleGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Instruções (opcional)</label>
        <textarea
          className={clsx(inputClass, "min-h-24 resize-none")}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Como executar o movimento..."
        />
      </div>

      {error && <p className="text-sm text-pink">{error}</p>}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar exercício"}
      </Button>
    </form>
  );
}
