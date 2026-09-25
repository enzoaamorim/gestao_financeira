import type { AgendaTask } from "./agendaTypes";

export function agendaTaskFromRow(row: any): AgendaTask {
  return { id: row.id, title: row.title, date: row.date, done: row.done };
}

export function agendaTaskToRow(t: Omit<AgendaTask, "id">) {
  return { title: t.title, date: t.date, done: t.done };
}
