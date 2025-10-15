// ============================================
// DATABASE TYPES
// ============================================

export interface DailyHabitsRow {
  id: number;
  date: string; // YYYY-MM-DD
  warmup_done: boolean;
  warmup_duration_min: number | null;
  chords_done: boolean;
  chords_duration_min: number | null;
  chords_bpm: number | null;
  chords_notes: string | null;
  class_done: boolean;
  class_duration_min: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// API TYPES
// ============================================

export interface HabitData {
  done: boolean;
  durationMin: number | null;
}

export interface ChordsHabitData extends HabitData {
  bpm: number | null;
  notes: string | null;
}

export interface DailyHabitsResponse {
  date: string; // YYYY-MM-DD
  warmup: HabitData;
  chords: ChordsHabitData;
  class: HabitData;
}

export interface DailyHabitsInput {
  date: string; // YYYY-MM-DD
  warmup: Partial<HabitData>;
  chords: Partial<ChordsHabitData>;
  class: Partial<HabitData>;
}

// ============================================
// CALENDAR TYPES
// ============================================

export interface MonthStats {
  warmupCount: number;
  chordsCount: number;
  classCount: number;
  totalDays: number;
  currentStreak: number;
}

export interface HabitsMonthResponse {
  month: string; // YYYY-MM
  days: DailyHabitsResponse[];
  stats: MonthStats;
}

// ============================================
// HELPERS
// ============================================

/**
 * Convierte una fila de DB a formato de respuesta API
 */
export function dbRowToApiResponse(row: DailyHabitsRow): DailyHabitsResponse {
  return {
    date: row.date,
    warmup: {
      done: row.warmup_done,
      durationMin: row.warmup_duration_min,
    },
    chords: {
      done: row.chords_done,
      durationMin: row.chords_duration_min,
      bpm: row.chords_bpm,
      notes: row.chords_notes,
    },
    class: {
      done: row.class_done,
      durationMin: row.class_duration_min,
    },
  };
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria local)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Crea estructura vacía de hábitos para un día sin datos
 */
export function createEmptyHabits(date: string): DailyHabitsResponse {
  return {
    date,
    warmup: { done: false, durationMin: null },
    chords: { done: false, durationMin: null, bpm: null, notes: null },
    class: { done: false, durationMin: null },
  };
}
