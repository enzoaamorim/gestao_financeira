import type { Habit, HabitLog, WaterLog } from "./habitsTypes";

export function habitFromRow(row: any): Habit {
  return { id: row.id, name: row.name, icon: row.icon, active: row.active };
}

export function habitToRow(h: Omit<Habit, "id">) {
  return { name: h.name, icon: h.icon, active: h.active };
}

export function habitLogFromRow(row: any): HabitLog {
  return { id: row.id, habitId: row.habit_id, date: row.date };
}

export function habitLogToRow(l: Omit<HabitLog, "id">) {
  return { habit_id: l.habitId, date: l.date };
}

export function waterLogFromRow(row: any): WaterLog {
  return { id: row.id, date: row.date, amountMl: row.amount_ml };
}

export function waterLogToRow(w: Omit<WaterLog, "id">) {
  return { date: w.date, amount_ml: w.amountMl };
}
