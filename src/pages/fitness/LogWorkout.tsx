import { useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { RestTimer } from "../../components/fitness/RestTimer";
import { inputClass, labelClass } from "../../components/ui/fields";
import { formatDate } from "../../lib/format";
import type { WorkoutSession } from "../../lib/fitnessTypes";
import clsx from "clsx";

interface DraftSet {
  reps: string;
  weight: string;
}

interface DraftExercise {
  exerciseId: string;
  sets: DraftSet[];
}

export default function LogWorkout() {
  const { exercises, routines, routineExercises, sessions, sets, exerciseById, addSession, addSet, deleteSession } =
    useWorkout();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [routineId, setRoutineId] = useState("");
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [pickExerciseId, setPickExerciseId] = useState(exercises[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkoutSession | undefined>(undefined);

  function applyRoutine(id: string) {
    setRoutineId(id);
    setSuccess(null);
    if (!id) {
      setDraft([]);
      return;
    }
    const items = routineExercises
      .filter((re) => re.routineId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    setDraft(
      items.map((re) => ({
        exerciseId: re.exerciseId,
        sets: Array.from({ length: re.targetSets }, () => ({ reps: String(re.targetReps), weight: "" })),
      })),
    );
  }

  function addExerciseToDraft() {
    if (!pickExerciseId || draft.some((d) => d.exerciseId === pickExerciseId)) return;
    setDraft((prev) => [...prev, { exerciseId: pickExerciseId, sets: [{ reps: "", weight: "" }] }]);
  }

  function removeExercise(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function addSetRow(index: number) {
    setDraft((prev) =>
      prev.map((d, i) => (i === index ? { ...d, sets: [...d.sets, { reps: "", weight: "" }] } : d)),
    );
  }

  function removeSetRow(exIndex: number, setIndex: number) {
    setDraft((prev) =>
      prev.map((d, i) => (i === exIndex ? { ...d, sets: d.sets.filter((_, si) => si !== setIndex) } : d)),
    );
  }

  function updateSet(exIndex: number, setIndex: number, field: keyof DraftSet, value: string) {
    setDraft((prev) =>
      prev.map((d, i) =>
        i === exIndex
          ? { ...d, sets: d.sets.map((s, si) => (si === setIndex ? { ...s, [field]: value } : s)) }
          : d,
      ),
    );
  }

  async function handleSave() {
    setError(null);
    setSuccess(null);

    const hasAnySet = draft.some((d) => d.sets.some((s) => s.reps.trim() !== ""));
    if (!hasAnySet) {
      setError("Registre pelo menos uma série com repetições preenchidas.");
      return;
    }

    setSubmitting(true);
    const sessionResult = await addSession({ routineId: routineId || undefined, date });
    if (sessionResult.error || !sessionResult.id) {
      setSubmitting(false);
      setError(sessionResult.error ?? "Não foi possível criar a sessão de treino.");
      return;
    }

    const sessionId = sessionResult.id;
    const results = await Promise.all(
      draft.flatMap((d, exIdx) =>
        d.sets
          .filter((s) => s.reps.trim() !== "")
          .map((s, setIdx) =>
            addSet({
              sessionId,
              exerciseId: d.exerciseId,
              setNumber: setIdx + 1,
              reps: parseInt(s.reps, 10) || 0,
              weight: parseFloat(s.weight.replace(",", ".")) || 0,
            }).then((r) => ({ ...r, exIdx })),
          ),
      ),
    );
    setSubmitting(false);

    const failed = results.find((r) => r.error);
    if (failed) {
      setError(failed.error);
      return;
    }

    setSuccess("Treino registrado com sucesso!");
    setDraft([]);
    setRoutineId("");
  }

  const recentSessions = [...sessions].slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Registrar treino</h1>
        <p className="mt-1 text-sm text-muted">Escolha uma rotina ou monte um treino livre</p>
      </div>

      <RestTimer />

      <Card className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Data</label>
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Rotina</label>
            <select className={inputClass} value={routineId} onChange={(e) => applyRoutine(e.target.value)}>
              <option value="">Treino livre</option>
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {exercises.length > 0 && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className={labelClass}>Adicionar exercício</label>
              <select className={inputClass} value={pickExerciseId} onChange={(e) => setPickExerciseId(e.target.value)}>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.icon} {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" variant="secondary" onClick={addExerciseToDraft}>
              + Adicionar
            </Button>
          </div>
        )}

        {draft.length === 0 ? (
          <p className="text-sm text-subtle">Nenhum exercício no treino ainda.</p>
        ) : (
          <div className="space-y-5">
            {draft.map((d, exIdx) => {
              const ex = exerciseById(d.exerciseId);
              return (
                <div key={d.exerciseId} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <span>{ex?.icon}</span> {ex?.name ?? "Exercício"}
                    </p>
                    <button
                      onClick={() => removeExercise(exIdx)}
                      className="text-xs text-muted hover:text-pink"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="space-y-2">
                    {d.sets.map((s, setIdx) => (
                      <div key={setIdx} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-subtle">#{setIdx + 1}</span>
                        <input
                          className={clsx(inputClass, "w-24")}
                          placeholder="Kg"
                          inputMode="decimal"
                          value={s.weight}
                          onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                        />
                        <span className="text-xs text-subtle">x</span>
                        <input
                          className={clsx(inputClass, "w-20")}
                          placeholder="Reps"
                          inputMode="numeric"
                          value={s.reps}
                          onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                        />
                        <button
                          onClick={() => removeSetRow(exIdx, setIdx)}
                          className="ml-auto text-xs text-muted hover:text-pink"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSetRow(exIdx)}
                    className="mt-2 text-xs font-semibold text-teal hover:underline"
                  >
                    + Série
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-pink">{error}</p>}
        {success && <p className="text-sm text-teal">{success}</p>}

        <Button className="w-full" onClick={handleSave} disabled={submitting || draft.length === 0}>
          {submitting ? "Salvando..." : "Salvar treino"}
        </Button>
      </Card>

      <Card>
        <p className="mb-4 text-sm font-semibold">Últimos treinos</p>
        {recentSessions.length === 0 ? (
          <p className="text-sm text-subtle">Nenhum treino registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s) => {
              const routine = routines.find((r) => r.id === s.routineId);
              const setCount = sets.filter((st) => st.sessionId === s.id).length;
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{routine?.name ?? "Treino livre"}</p>
                    <p className="text-xs text-subtle">
                      {formatDate(s.date)} · {setCount} séries
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                    aria-label="Excluir"
                  >
                    🗑
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleteTarget !== undefined}
        title="Excluir treino"
        description={`Tem certeza que deseja excluir o treino de ${deleteTarget ? formatDate(deleteTarget.date) : ""}? Todas as séries registradas nele também serão excluídas.`}
        onConfirm={() => deleteSession(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
}
