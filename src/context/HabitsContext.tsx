import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Habit, HabitLog, WaterLog } from "../lib/habitsTypes";
import type { AgendaTask } from "../lib/agendaTypes";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { computeStreak } from "../lib/streak";
import {
  habitFromRow,
  habitToRow,
  habitLogFromRow,
  habitLogToRow,
  waterLogFromRow,
  waterLogToRow,
} from "../lib/habitsMappers";
import { agendaTaskFromRow, agendaTaskToRow } from "../lib/agendaMappers";

type MutationResult = { error: string | null };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

interface HabitsContextValue {
  habits: Habit[];
  habitLogs: HabitLog[];
  waterLogs: WaterLog[];
  loading: boolean;
  error: string | null;
  clearError: () => void;

  addHabit: (h: Omit<Habit, "id">) => Promise<MutationResult>;
  updateHabit: (id: string, h: Omit<Habit, "id">) => Promise<MutationResult>;
  deleteHabit: (id: string) => Promise<MutationResult>;

  isDoneToday: (habitId: string) => boolean;
  habitStreak: (habitId: string) => number;
  habitHistory: (habitId: string, days: number) => { date: string; done: boolean }[];
  toggleHabitToday: (habitId: string) => Promise<MutationResult>;

  todayWaterMl: number;
  addWaterLog: (amountMl: number) => Promise<MutationResult>;
  deleteWaterLog: (id: string) => Promise<MutationResult>;

  agendaTasks: AgendaTask[];
  pendingAgendaTasks: AgendaTask[];
  addAgendaTask: (t: Omit<AgendaTask, "id" | "done">) => Promise<MutationResult>;
  updateAgendaTask: (id: string, t: Omit<AgendaTask, "id">) => Promise<MutationResult>;
  deleteAgendaTask: (id: string) => Promise<MutationResult>;
  toggleAgendaTask: (id: string) => Promise<MutationResult>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

function friendlyError(err: unknown): string {
  if (err instanceof TypeError) return NETWORK_ERROR_MESSAGE;
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "Ocorreu um erro inesperado.";
}

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [agendaTasks, setAgendaTasks] = useState<AgendaTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [habitsRes, habitLogsRes, waterLogsRes, agendaTasksRes] = await Promise.all([
          supabase.from("habits").select("*").order("created_at"),
          supabase.from("habit_logs").select("*"),
          supabase.from("water_logs").select("*").order("created_at"),
          supabase.from("agenda_tasks").select("*").order("date"),
        ]);

        for (const res of [habitsRes, habitLogsRes, waterLogsRes, agendaTasksRes]) {
          if (res.error) throw res.error;
        }

        if (cancelled) return;
        setHabits((habitsRes.data ?? []).map(habitFromRow));
        setHabitLogs((habitLogsRes.data ?? []).map(habitLogFromRow));
        setWaterLogs((waterLogsRes.data ?? []).map(waterLogFromRow));
        setAgendaTasks((agendaTasksRes.data ?? []).map(agendaTaskFromRow));
        setError(null);
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<HabitsContextValue>(() => {
    async function addHabit(h: Omit<Habit, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("habits").insert(habitToRow(h)).select().single();
        if (err) throw err;
        setHabits((prev) => [...prev, habitFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateHabit(id: string, h: Omit<Habit, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("habits")
          .update(habitToRow(h))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setHabits((prev) => prev.map((x) => (x.id === id ? habitFromRow(data) : x)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteHabit(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("habits").delete().eq("id", id);
        if (err) throw err;
        setHabits((prev) => prev.filter((x) => x.id !== id));
        setHabitLogs((prev) => prev.filter((x) => x.habitId !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    function isDoneToday(habitId: string): boolean {
      const today = todayKey();
      return habitLogs.some((l) => l.habitId === habitId && l.date === today);
    }

    function habitStreak(habitId: string): number {
      return computeStreak(habitLogs.filter((l) => l.habitId === habitId).map((l) => l.date));
    }

    function habitHistory(habitId: string, days: number): { date: string; done: boolean }[] {
      const doneDates = new Set(habitLogs.filter((l) => l.habitId === habitId).map((l) => l.date));
      const result: { date: string; done: boolean }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const date = d.toISOString().slice(0, 10);
        result.push({ date, done: doneDates.has(date) });
      }
      return result;
    }

    async function toggleHabitToday(habitId: string): Promise<MutationResult> {
      const today = todayKey();
      const existing = habitLogs.find((l) => l.habitId === habitId && l.date === today);
      try {
        if (existing) {
          const { error: err } = await supabase.from("habit_logs").delete().eq("id", existing.id);
          if (err) throw err;
          setHabitLogs((prev) => prev.filter((l) => l.id !== existing.id));
        } else {
          const { data, error: err } = await supabase
            .from("habit_logs")
            .insert(habitLogToRow({ habitId, date: today }))
            .select()
            .single();
          if (err) throw err;
          setHabitLogs((prev) => [...prev, habitLogFromRow(data)]);
        }
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addWaterLog(amountMl: number): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("water_logs")
          .insert(waterLogToRow({ date: todayKey(), amountMl }))
          .select()
          .single();
        if (err) throw err;
        setWaterLogs((prev) => [...prev, waterLogFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteWaterLog(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("water_logs").delete().eq("id", id);
        if (err) throw err;
        setWaterLogs((prev) => prev.filter((w) => w.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    const todayWaterMl = waterLogs
      .filter((w) => w.date === todayKey())
      .reduce((sum, w) => sum + w.amountMl, 0);

    async function addAgendaTask(t: Omit<AgendaTask, "id" | "done">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("agenda_tasks")
          .insert(agendaTaskToRow({ ...t, done: false }))
          .select()
          .single();
        if (err) throw err;
        setAgendaTasks((prev) =>
          [...prev, agendaTaskFromRow(data)].sort((a, b) => a.date.localeCompare(b.date)),
        );
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateAgendaTask(id: string, t: Omit<AgendaTask, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("agenda_tasks")
          .update(agendaTaskToRow(t))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setAgendaTasks((prev) =>
          prev.map((x) => (x.id === id ? agendaTaskFromRow(data) : x)).sort((a, b) => a.date.localeCompare(b.date)),
        );
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteAgendaTask(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("agenda_tasks").delete().eq("id", id);
        if (err) throw err;
        setAgendaTasks((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function toggleAgendaTask(id: string): Promise<MutationResult> {
      const task = agendaTasks.find((t) => t.id === id);
      if (!task) return { error: null };
      return updateAgendaTask(id, { title: task.title, date: task.date, done: !task.done });
    }

    const pendingAgendaTasks = agendaTasks.filter((t) => !t.done && t.date <= todayKey());

    return {
      habits,
      habitLogs,
      waterLogs,
      loading,
      error,
      clearError: () => setError(null),

      addHabit,
      updateHabit,
      deleteHabit,

      isDoneToday,
      habitStreak,
      habitHistory,
      toggleHabitToday,

      todayWaterMl,
      addWaterLog,
      deleteWaterLog,

      agendaTasks,
      pendingAgendaTasks,
      addAgendaTask,
      updateAgendaTask,
      deleteAgendaTask,
      toggleAgendaTask,
    };
  }, [habits, habitLogs, waterLogs, agendaTasks, loading, error]);

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within a HabitsProvider");
  return ctx;
}
