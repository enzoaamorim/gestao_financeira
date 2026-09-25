import { useMemo, useState } from "react";
import { useHabits } from "../../context/HabitsContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { AgendaTaskForm } from "../../components/habits/AgendaTaskForm";
import { formatDate } from "../../lib/format";
import type { AgendaTask } from "../../lib/agendaTypes";
import clsx from "clsx";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Agenda() {
  const { agendaTasks, toggleAgendaTask, deleteAgendaTask } = useHabits();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaTask | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<AgendaTask | undefined>(undefined);
  const [showDone, setShowDone] = useState(false);

  const today = todayKey();

  const { overdue, dueToday, upcoming, done } = useMemo(() => {
    const overdue = agendaTasks.filter((t) => !t.done && t.date < today);
    const dueToday = agendaTasks.filter((t) => !t.done && t.date === today);
    const upcoming = agendaTasks.filter((t) => !t.done && t.date > today);
    const done = agendaTasks.filter((t) => t.done).sort((a, b) => b.date.localeCompare(a.date));
    return { overdue, dueToday, upcoming, done };
  }, [agendaTasks, today]);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(t: AgendaTask) {
    setEditing(t);
    setFormOpen(true);
  }

  function renderTask(t: AgendaTask, variant: "overdue" | "today" | "upcoming" | "done") {
    return (
      <div
        key={t.id}
        className={clsx(
          "group flex items-center gap-3 rounded-xl border border-border p-3",
          variant === "overdue" && "border-pink/30 bg-pink/5",
          variant === "today" && "border-teal/30 bg-teal/5",
        )}
      >
        <button
          onClick={() => toggleAgendaTask(t.id)}
          aria-label={t.done ? "Marcar como pendente" : "Marcar como feito"}
          className={clsx(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
            t.done ? "border-teal bg-teal text-bg" : "border-border text-transparent hover:border-muted",
          )}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <p className={clsx("truncate text-sm font-medium", t.done && "text-muted line-through")}>{t.title}</p>
          <p
            className={clsx(
              "text-xs",
              variant === "overdue" ? "font-semibold text-pink" : "text-subtle",
            )}
          >
            {formatDate(t.date)}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
          <button
            onClick={() => openEdit(t)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Editar"
          >
            ✎
          </button>
          <button
            onClick={() => setDeleteTarget(t)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-pink/10 hover:text-pink"
            aria-label="Excluir"
          >
            🗑
          </button>
        </div>
      </div>
    );
  }

  const hasAnyPending = overdue.length + dueToday.length + upcoming.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="mt-1 text-sm text-muted">Suas tarefas e lembretes</p>
        </div>
        <Button onClick={openNew}>+ Nova tarefa</Button>
      </div>

      <Card className="space-y-6">
        {!hasAnyPending ? (
          <p className="py-10 text-center text-sm text-subtle">Nenhuma tarefa pendente. Adicione uma acima.</p>
        ) : (
          <>
            {overdue.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-pink">Atrasadas</p>
                {overdue.map((t) => renderTask(t, "overdue"))}
              </div>
            )}
            {dueToday.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal">Hoje</p>
                {dueToday.map((t) => renderTask(t, "today"))}
              </div>
            )}
            {upcoming.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Em breve</p>
                {upcoming.map((t) => renderTask(t, "upcoming"))}
              </div>
            )}
          </>
        )}
      </Card>

      {done.length > 0 && (
        <Card className="space-y-3">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-semibold"
          >
            Concluídas ({done.length})
            <span className="text-muted">{showDone ? "▲" : "▼"}</span>
          </button>
          {showDone && <div className="space-y-2">{done.map((t) => renderTask(t, "done"))}</div>}
        </Card>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Editar tarefa" : "Nova tarefa"}>
        <AgendaTaskForm initial={editing} onDone={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== undefined}
        title="Excluir tarefa"
        description={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Essa ação não pode ser desfeita.`}
        onConfirm={() => deleteAgendaTask(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </div>
  );
}
