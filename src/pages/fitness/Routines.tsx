import { useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { RoutineForm } from "../../components/fitness/RoutineForm";
import { AddRoutineExerciseForm } from "../../components/fitness/AddRoutineExerciseForm";
import type { Routine } from "../../lib/fitnessTypes";

export default function Routines() {
  const { routines, routineExercises, exerciseById, deleteRoutine, deleteRoutineExercise } = useWorkout();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | undefined>(undefined);
  const [addExerciseFor, setAddExerciseFor] = useState<string | null>(null);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(r: Routine) {
    setEditing(r);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rotinas</h1>
          <p className="mt-1 text-sm text-muted">Monte seus treinos fixos (Treino A, B, C...)</p>
        </div>
        <Button onClick={openNew}>+ Nova rotina</Button>
      </div>

      {routines.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-subtle">Nenhuma rotina criada ainda.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {routines.map((r) => {
            const items = routineExercises
              .filter((re) => re.routineId === r.id)
              .sort((a, b) => a.orderIndex - b.orderIndex);
            const isOpen = expanded === r.id;

            return (
              <Card key={r.id} className="!p-0">
                <button
                  className="flex w-full items-center justify-between px-5 py-4"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div className="text-left">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-subtle">{items.length} exercícios</p>
                  </div>
                  <span className="text-muted">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="space-y-3 border-t border-border px-5 py-4">
                    {items.length === 0 ? (
                      <p className="text-sm text-subtle">Nenhum exercício nessa rotina ainda.</p>
                    ) : (
                      items.map((re) => {
                        const ex = exerciseById(re.exerciseId);
                        return (
                          <div key={re.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-sm">
                                {ex?.icon ?? "💪"}
                              </span>
                              <p className="text-sm">{ex?.name ?? "Exercício removido"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-subtle">
                                {re.targetSets}x{re.targetReps}
                              </span>
                              <button
                                onClick={() => deleteRoutineExercise(re.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                                aria-label="Remover"
                              >
                                🗑
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="secondary" onClick={() => setAddExerciseFor(r.id)}>
                        + Exercício
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
                        ✎ Renomear
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteRoutine(r.id)}>
                        Excluir rotina
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Renomear rotina" : "Nova rotina"}>
        <RoutineForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal open={addExerciseFor !== null} onClose={() => setAddExerciseFor(null)} title="Adicionar exercício">
        {addExerciseFor && (
          <AddRoutineExerciseForm
            routineId={addExerciseFor}
            nextOrderIndex={routineExercises.filter((re) => re.routineId === addExerciseFor).length}
            onDone={() => setAddExerciseFor(null)}
          />
        )}
      </Modal>
    </div>
  );
}
