import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Exercise, Routine, RoutineExercise, WorkoutSession, WorkoutSet } from "../lib/fitnessTypes";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";
import {
  exerciseFromRow,
  exerciseToRow,
  routineExerciseFromRow,
  routineExerciseToRow,
  routineFromRow,
  routineToRow,
  workoutSessionFromRow,
  workoutSessionToRow,
  workoutSetFromRow,
  workoutSetToRow,
} from "../lib/fitnessMappers";

type MutationResult = { error: string | null };

interface WorkoutContextValue {
  exercises: Exercise[];
  routines: Routine[];
  routineExercises: RoutineExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
  loading: boolean;
  error: string | null;
  clearError: () => void;

  addExercise: (e: Omit<Exercise, "id" | "custom">) => Promise<MutationResult>;
  updateExercise: (id: string, e: Omit<Exercise, "id" | "custom">) => Promise<MutationResult>;
  deleteExercise: (id: string) => Promise<MutationResult>;

  addRoutine: (r: Omit<Routine, "id">) => Promise<MutationResult>;
  updateRoutine: (id: string, r: Omit<Routine, "id">) => Promise<MutationResult>;
  deleteRoutine: (id: string) => Promise<MutationResult>;

  addRoutineExercise: (re: Omit<RoutineExercise, "id">) => Promise<MutationResult>;
  updateRoutineExercise: (id: string, re: Omit<RoutineExercise, "id">) => Promise<MutationResult>;
  deleteRoutineExercise: (id: string) => Promise<MutationResult>;

  addSession: (s: Omit<WorkoutSession, "id">) => Promise<{ error: string | null; id: string | null }>;
  deleteSession: (id: string) => Promise<MutationResult>;

  addSet: (s: Omit<WorkoutSet, "id">) => Promise<MutationResult>;
  deleteSet: (id: string) => Promise<MutationResult>;

  exerciseById: (id: string) => Exercise | undefined;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

const NETWORK_ERROR_MESSAGE = "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

function friendlyError(err: unknown): string {
  if (err instanceof TypeError) return NETWORK_ERROR_MESSAGE;
  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === "23503") {
    return "Esse item não pode ser excluído porque está em uso em outro registro.";
  }
  if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return "Ocorreu um erro inesperado.";
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [exercisesRes, routinesRes, routineExercisesRes, sessionsRes, setsRes] = await Promise.all([
          supabase.from("exercises").select("*").order("name"),
          supabase.from("routines").select("*").order("created_at"),
          supabase.from("routine_exercises").select("*").order("order_index"),
          supabase.from("workout_sessions").select("*").order("date", { ascending: false }),
          supabase.from("workout_sets").select("*"),
        ]);

        for (const res of [exercisesRes, routinesRes, routineExercisesRes, sessionsRes, setsRes]) {
          if (res.error) throw res.error;
        }

        if (cancelled) return;
        setExercises((exercisesRes.data ?? []).map(exerciseFromRow));
        setRoutines((routinesRes.data ?? []).map(routineFromRow));
        setRoutineExercises((routineExercisesRes.data ?? []).map(routineExerciseFromRow));
        setSessions((sessionsRes.data ?? []).map(workoutSessionFromRow));
        setSets((setsRes.data ?? []).map(workoutSetFromRow));
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

  const value = useMemo<WorkoutContextValue>(() => {
    async function addExercise(e: Omit<Exercise, "id" | "custom">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("exercises").insert(exerciseToRow(e)).select().single();
        if (err) throw err;
        setExercises((prev) => [...prev, exerciseFromRow(data)].sort((a, b) => a.name.localeCompare(b.name)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateExercise(id: string, e: Omit<Exercise, "id" | "custom">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("exercises")
          .update(exerciseToRow(e))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setExercises((prev) =>
          prev.map((x) => (x.id === id ? exerciseFromRow(data) : x)).sort((a, b) => a.name.localeCompare(b.name)),
        );
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteExercise(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("exercises").delete().eq("id", id);
        if (err) throw err;
        setExercises((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addRoutine(r: Omit<Routine, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("routines").insert(routineToRow(r)).select().single();
        if (err) throw err;
        setRoutines((prev) => [...prev, routineFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateRoutine(id: string, r: Omit<Routine, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("routines")
          .update(routineToRow(r))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setRoutines((prev) => prev.map((x) => (x.id === id ? routineFromRow(data) : x)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteRoutine(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("routines").delete().eq("id", id);
        if (err) throw err;
        setRoutines((prev) => prev.filter((x) => x.id !== id));
        setRoutineExercises((prev) => prev.filter((x) => x.routineId !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addRoutineExercise(re: Omit<RoutineExercise, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("routine_exercises")
          .insert(routineExerciseToRow(re))
          .select()
          .single();
        if (err) throw err;
        setRoutineExercises((prev) => [...prev, routineExerciseFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function updateRoutineExercise(id: string, re: Omit<RoutineExercise, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase
          .from("routine_exercises")
          .update(routineExerciseToRow(re))
          .eq("id", id)
          .select()
          .single();
        if (err) throw err;
        setRoutineExercises((prev) => prev.map((x) => (x.id === id ? routineExerciseFromRow(data) : x)));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteRoutineExercise(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("routine_exercises").delete().eq("id", id);
        if (err) throw err;
        setRoutineExercises((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addSession(s: Omit<WorkoutSession, "id">): Promise<{ error: string | null; id: string | null }> {
      try {
        const { data, error: err } = await supabase
          .from("workout_sessions")
          .insert(workoutSessionToRow(s))
          .select()
          .single();
        if (err) throw err;
        const session = workoutSessionFromRow(data);
        setSessions((prev) => [session, ...prev]);
        return { error: null, id: session.id };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message, id: null };
      }
    }

    async function deleteSession(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("workout_sessions").delete().eq("id", id);
        if (err) throw err;
        setSessions((prev) => prev.filter((x) => x.id !== id));
        setSets((prev) => prev.filter((x) => x.sessionId !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function addSet(s: Omit<WorkoutSet, "id">): Promise<MutationResult> {
      try {
        const { data, error: err } = await supabase.from("workout_sets").insert(workoutSetToRow(s)).select().single();
        if (err) throw err;
        setSets((prev) => [...prev, workoutSetFromRow(data)]);
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    async function deleteSet(id: string): Promise<MutationResult> {
      try {
        const { error: err } = await supabase.from("workout_sets").delete().eq("id", id);
        if (err) throw err;
        setSets((prev) => prev.filter((x) => x.id !== id));
        return { error: null };
      } catch (err) {
        const message = friendlyError(err);
        setError(message);
        return { error: message };
      }
    }

    return {
      exercises,
      routines,
      routineExercises,
      sessions,
      sets,
      loading,
      error,
      clearError: () => setError(null),

      addExercise,
      updateExercise,
      deleteExercise,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      addRoutineExercise,
      updateRoutineExercise,
      deleteRoutineExercise,
      addSession,
      deleteSession,
      addSet,
      deleteSet,

      exerciseById: (id) => exercises.find((x) => x.id === id),
    };
  }, [exercises, routines, routineExercises, sessions, sets, loading, error]);

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within a WorkoutProvider");
  return ctx;
}
