import { useMemo, useState } from "react";
import { useWorkout } from "../../context/WorkoutContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { inputClass } from "../../components/ui/fields";
import { ExerciseForm } from "../../components/fitness/ExerciseForm";
import type { Exercise } from "../../lib/fitnessTypes";
import clsx from "clsx";

export default function Exercises() {
  const { exercises, deleteExercise } = useWorkout();
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | undefined>(undefined);
  const [expanded, setExpanded] = useState<string | null>(null);

  const muscleGroups = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.muscleGroup))).sort(),
    [exercises],
  );

  const filtered = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) &&
      (muscleFilter === "all" || e.muscleGroup === muscleFilter),
  );

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(e: Exercise) {
    setEditing(e);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Exercícios</h1>
          <p className="mt-1 text-sm text-muted">Biblioteca padrão + os seus exercícios customizados</p>
        </div>
        <Button onClick={openNew}>+ Novo exercício</Button>
      </div>

      <Card className="flex flex-wrap gap-3 !p-4">
        <input
          className={clsx(inputClass, "max-w-xs")}
          placeholder="Buscar exercício..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={clsx(inputClass, "w-auto")} value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}>
          <option value="all">Todos os grupos</option>
          {muscleGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-subtle">Nenhum exercício encontrado.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <Card key={e.id} className="group !p-4">
              <div className="flex items-start justify-between">
                <button
                  className="flex flex-1 items-center gap-3 text-left"
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-base">
                    {e.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-subtle">{e.muscleGroup}</p>
                  </div>
                </button>
                {e.custom && (
                  <div className="hidden items-center gap-1 group-hover:flex">
                    <button
                      onClick={() => openEdit(e)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                      aria-label="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteExercise(e.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                      aria-label="Excluir"
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
              {expanded === e.id && e.instructions && (
                <p className="mt-3 border-t border-border pt-3 text-xs text-muted">{e.instructions}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Editar exercício" : "Novo exercício"}
      >
        <ExerciseForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
