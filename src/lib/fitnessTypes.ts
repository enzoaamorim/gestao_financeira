export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  icon: string;
  instructions?: string;
  /** true when created by the current user; false for the shared default library (read-only). */
  custom: boolean;
}

export interface Routine {
  id: string;
  name: string;
}

export interface RoutineExercise {
  id: string;
  routineId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetReps: number;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  date: string; // ISO date
  notes?: string;
}

export interface WorkoutSet {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weight: number;
}
