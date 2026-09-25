import { useState } from "react";
import { useHabits } from "../../context/HabitsContext";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { HabitForm } from "../../components/habits/HabitForm";
import { inputClass } from "../../components/ui/fields";
import { formatDate } from "../../lib/format";
import type { Habit } from "../../lib/habitsTypes";
import clsx from "clsx";

const HISTORY_DAYS = 21;

const quickAmounts = [
  { label: "+250ml", ml: 250 },
  { label: "+500ml", ml: 500 },
  { label: "+1L", ml: 1000 },
];

export default function HabitsDashboard() {
  const { habits, isDoneToday, habitStreak, habitHistory, toggleHabitToday, deleteHabit, todayWaterMl, addWaterLog } =
    useHabits();
  const { waterGoalMl, updateWaterGoal } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Habit | undefined>(undefined);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(waterGoalMl));
  const [addingWater, setAddingWater] = useState(false);

  const activeHabits = habits.filter((h) => h.active);
  const waterPct = (todayWaterMl / waterGoalMl) * 100;

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(h: Habit) {
    setEditing(h);
    setFormOpen(true);
  }

  async function handleQuickAdd(ml: number) {
    setAddingWater(true);
    await addWaterLog(ml);
    setAddingWater(false);
  }

  function startEditGoal() {
    setGoalInput(String(waterGoalMl));
    setEditingGoal(true);
  }

  async function handleSaveGoal() {
    const ml = parseInt(goalInput, 10);
    if (!ml || ml <= 0) return;
    await updateWaterGoal(ml);
    setEditingGoal(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <p className="mt-1 text-sm text-muted">Sua rotina diária e sua meta de água</p>
      </div>

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">💧 Água</p>
            {!editingGoal ? (
              <p className="mt-0.5 text-xs text-subtle">
                Meta diária: {waterGoalMl} ml{" "}
                <button onClick={startEditGoal} className="text-muted hover:text-ink" aria-label="Editar meta">
                  ✎
                </button>
              </p>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  className={clsx(inputClass, "w-24 !py-1")}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  min={100}
                  step={100}
                  autoFocus
                />
                <span className="text-xs text-subtle">ml</span>
                <button onClick={handleSaveGoal} className="text-xs font-semibold text-teal hover:underline">
                  Salvar
                </button>
                <button onClick={() => setEditingGoal(false)} className="text-xs text-muted hover:underline">
                  Cancelar
                </button>
              </div>
            )}
          </div>
          <p className="shrink-0 text-lg font-bold">
            {todayWaterMl}
            <span className="text-xs font-normal text-subtle"> / {waterGoalMl} ml</span>
          </p>
        </div>
        <ProgressBar value={waterPct} color="#5fb0f0" />
        <div className="flex gap-2">
          {quickAmounts.map((q) => (
            <Button key={q.ml} size="sm" variant="secondary" disabled={addingWater} onClick={() => handleQuickAdd(q.ml)}>
              {q.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Rotina de hoje</p>
          <Button size="sm" variant="secondary" onClick={openNew}>
            + Novo hábito
          </Button>
        </div>

        {activeHabits.length === 0 ? (
          <p className="py-10 text-center text-sm text-subtle">Nenhum hábito ainda. Crie o primeiro acima.</p>
        ) : (
          <div className="space-y-2">
            {activeHabits.map((h) => {
              const done = isDoneToday(h.id);
              const streak = habitStreak(h.id);
              const history = habitHistory(h.id, HISTORY_DAYS);
              return (
                <div
                  key={h.id}
                  className={clsx(
                    "group rounded-xl border border-border p-3 transition-colors",
                    done && "border-teal/30 bg-teal/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabitToday(h.id)}
                      aria-label={done ? "Marcar como não feito" : "Marcar como feito"}
                      className={clsx(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
                        done ? "border-teal bg-teal text-bg" : "border-border text-transparent hover:border-muted",
                      )}
                    >
                      ✓
                    </button>
                    <span className="text-base">{h.icon}</span>
                    <p className={clsx("flex-1 truncate text-sm font-medium", done && "text-muted line-through")}>
                      {h.name}
                    </p>
                    {streak > 0 && <span className="shrink-0 text-xs font-semibold text-yellow">🔥 {streak}</span>}
                    <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
                      <button
                        onClick={() => openEdit(h)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
                        aria-label="Editar"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setDeleteTarget(h)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
                        aria-label="Excluir"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-[3px] pl-9" aria-label={`Histórico dos últimos ${HISTORY_DAYS} dias`}>
                    {history.map((d) => (
                      <span
                        key={d.date}
                        title={`${formatDate(d.date)} · ${d.done ? "feito" : "não feito"}`}
                        className={clsx(
                          "h-2.5 w-2.5 rounded-sm",
                          d.done ? "bg-teal" : "bg-surface-2",
                        )}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar hábito" : "Novo hábito"}>
        <HabitForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== undefined}
        title="Excluir hábito"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Seu histórico de dias marcados também será apagado.`}
        onConfirm={() => deleteHabit(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
}
