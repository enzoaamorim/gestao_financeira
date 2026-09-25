import { useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { Button } from "../ui/Button";
import { inputClass, labelClass } from "../ui/fields";

interface Props {
  routineId: string;
  nextOrderIndex: number;
  onDone: () => void;
}

export function AddRoutineExerciseForm({ routineId, nextOrderIndex, onDone }: Props) {
  const { exercises, addRoutineExercise } = useWorkout();
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [targetSets, setTargetSets] = useState("3");
  const [targetReps, setTargetReps] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sets = parseInt(targetSets, 10);
    const reps = parseInt(targetReps, 10);
    if (!exerciseId || Number.isNaN(sets) || sets <= 0 || Number.isNaN(reps) || reps <= 0) return;

    setSubmitting(true);
    setError(null);
    const result = await addRoutineExercise({
      routineId,
      exerciseId,
      orderIndex: nextOrderIndex,
      targetSets: sets,
      targetReps: reps,
    });
    setSubmitting(false);

    if (result.error) setError(result.error);
    else onDone();
  }

  if (exercises.length === 0) {
    return <p className="text-sm text-muted">Crie um exercício na biblioteca antes de adicionar à rotina.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Exercício</label>
        <select className={inputClass} value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.icon} {ex.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Séries</label>
          <input
            className={inputClass}
            value={targetSets}
            onChange={(e) => setTargetSets(e.target.value)}
            inputMode="numeric"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Repetições</label>
          <input
            className={inputClass}
            value={targetReps}
            onChange={(e) => setTargetReps(e.target.value)}
            inputMode="numeric"
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-pink">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Adicionando..." : "Adicionar à rotina"}
      </Button>
    </form>
  );
}
