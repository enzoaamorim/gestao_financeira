export interface Habit {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO date
}

export interface WaterLog {
  id: string;
  date: string; // ISO date
  amountMl: number;
}
