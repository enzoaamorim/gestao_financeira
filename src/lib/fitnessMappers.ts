import type { Exercise, Routine, RoutineExercise, WorkoutSession, WorkoutSet } from "./fitnessTypes";

export function exerciseFromRow(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    icon: row.icon,
    instructions: row.instructions ?? undefined,
    custom: row.user_id != null,
  };
}

export function exerciseToRow(e: Omit<Exercise, "id" | "custom">) {
  return { name: e.name, muscle_group: e.muscleGroup, icon: e.icon, instructions: e.instructions ?? null };
}

export function routineFromRow(row: any): Routine {
  return { id: row.id, name: row.name };
}

export function routineToRow(r: Omit<Routine, "id">) {
  return { name: r.name };
}

export function routineExerciseFromRow(row: any): RoutineExercise {
  return {
    id: row.id,
    routineId: row.routine_id,
    exerciseId: row.exercise_id,
    orderIndex: row.order_index,
    targetSets: row.target_sets,
    targetReps: row.target_reps,
  };
}

export function routineExerciseToRow(re: Omit<RoutineExercise, "id">) {
  return {
    routine_id: re.routineId,
    exercise_id: re.exerciseId,
    order_index: re.orderIndex,
    target_sets: re.targetSets,
    target_reps: re.targetReps,
  };
}

export function workoutSessionFromRow(row: any): WorkoutSession {
  return { id: row.id, routineId: row.routine_id ?? undefined, date: row.date, notes: row.notes ?? undefined };
}

export function workoutSessionToRow(s: Omit<WorkoutSession, "id">) {
  return { routine_id: s.routineId ?? null, date: s.date, notes: s.notes ?? null };
}

export function workoutSetFromRow(row: any): WorkoutSet {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    reps: row.reps,
    weight: Number(row.weight),
  };
}

export function workoutSetToRow(s: Omit<WorkoutSet, "id">) {
  return {
    session_id: s.sessionId,
    exercise_id: s.exerciseId,
    set_number: s.setNumber,
    reps: s.reps,
    weight: s.weight,
  };
}
