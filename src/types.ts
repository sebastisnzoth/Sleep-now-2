export interface SleepLog {
  id: string;
  dayNum: number;
  date: string;
  wakeEnergy: number; // 1 to 10
  complied321: boolean;
  notes: string;
  statusLabel: string; // "Óptimo", "Calma", "Ligero", "Zen"
  duration: string; // e.g. "8h 12m"
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface RecipeSuggestion {
  recipeName: string;
  ingredients: string[];
  preparation: string;
  benefits: string;
  idealTiming: string;
}

export interface UserProfile {
  name: string;
  memberSince: string;
  nightsOfCalm: number;
  consistencyRate: number; // e.g. 92
  currentStreak: number;
}
