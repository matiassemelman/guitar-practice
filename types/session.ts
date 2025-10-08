/**
 * Tipos principales para las sesiones de práctica de guitarra.
 *
 * Estos tipos representan el modelo de datos central de la aplicación,
 * siguiendo la filosofía de práctica deliberada y Growth Mindset.
 */

/**
 * Enfoque técnico de la sesión de práctica.
 * Define el área principal en la que se centra la práctica.
 */
export type TechnicalFocus =
  | 'Técnica'
  | 'Ritmo'
  | 'Limpieza'
  | 'Coordinación'
  | 'Repertorio';

/**
 * Duración de sesión en minutos.
 * Puede ser cualquier número positivo.
 */
export type SessionDuration = number;

/**
 * Checklist de mindset para práctica deliberada.
 * Cada campo representa una estrategia efectiva de práctica.
 */
export interface MindsetChecklist {
  /** ¿Realizó calentamiento antes de la práctica? */
  warmedUp: boolean;
  /** ¿Practicó a velocidad lenta/controlada? */
  practicedSlow: boolean;
  /** ¿Se grabó para auto-evaluación? */
  recorded: boolean;
  /** ¿Tomó pausas durante la sesión? */
  tookBreaks: boolean;
  /** ¿Revisó y analizó sus errores? */
  reviewedMistakes: boolean;
}

/**
 * Representación completa de una sesión de práctica.
 * Corresponde al registro en la tabla `sessions` de la base de datos.
 */
export interface Session {
  /** ID único de la sesión */
  id: number;
  /** Timestamp de creación (ISO 8601 string) */
  createdAt: string;

  // Campos obligatorios
  /** Objetivo específico de la sesión (ej: "Cambio limpio de C a G a 60 bpm") */
  microObjective: string;
  /** Área técnica de enfoque */
  technicalFocus: TechnicalFocus;
  /** Duración de la sesión en minutos */
  durationMin: SessionDuration;

  // Métricas de rendimiento (opcionales)
  /** BPM objetivo planificado */
  bpmTarget?: number | null;
  /** BPM realmente alcanzado */
  bpmAchieved?: number | null;
  /** Calificación de calidad subjetiva (1-5 estrellas) */
  qualityRating?: number | null;
  /** Rating of Perceived Exertion - esfuerzo percibido (1-10) */
  rpe?: number | null;

  // Mindset y reflexión
  /** Checklist de estrategias de práctica deliberada */
  mindsetChecklist?: MindsetChecklist | null;
  /** Reflexión breve post-sesión */
  reflection?: string | null;
}

/**
 * Datos necesarios para crear una nueva sesión.
 * Versión sin ID ni timestamp, usada en el formulario de registro.
 */
export interface CreateSessionInput {
  // Campos obligatorios
  microObjective: string;
  technicalFocus: TechnicalFocus;
  durationMin: SessionDuration;

  // Campos opcionales
  bpmTarget?: number;
  bpmAchieved?: number;
  qualityRating?: number;
  rpe?: number;
  mindsetChecklist?: MindsetChecklist;
  reflection?: string;
}

/**
 * Datos para actualizar una sesión existente.
 * Todos los campos son opcionales excepto el ID.
 */
export interface UpdateSessionInput {
  id: number;
  microObjective?: string;
  technicalFocus?: TechnicalFocus;
  durationMin?: SessionDuration;
  bpmTarget?: number | null;
  bpmAchieved?: number | null;
  qualityRating?: number | null;
  rpe?: number | null;
  mindsetChecklist?: MindsetChecklist | null;
  reflection?: string | null;
}

/**
 * Estadísticas calculadas de las sesiones.
 * Usadas para mostrar progreso y motivación.
 */
export interface SessionStats {
  /** Número de días consecutivos con práctica (últimos 7 días) */
  currentStreak: number;
  /** Total de minutos practicados esta semana */
  weeklyMinutes: number;
  /** Calificación promedio de calidad (1-5) esta semana */
  weeklyAverageQuality: number | null;
  /** Total de sesiones registradas esta semana */
  weeklySessionCount: number;
  /** Total de sesiones de todos los tiempos */
  totalSessions: number;
  /** Total de minutos de todos los tiempos */
  totalMinutes: number;
}

/**
 * Punto de datos para el gráfico de evolución de BPM.
 */
export interface BPMDataPoint {
  /** Fecha de la sesión (ISO 8601 string) */
  date: string;
  /** BPM objetivo */
  target?: number | null;
  /** BPM alcanzado */
  achieved?: number | null;
  /** Objetivo micro de la sesión (para tooltip) */
  microObjective: string;
}

/**
 * Parámetros de filtro para consultar sesiones.
 */
export interface SessionFilters {
  /** Filtrar por foco técnico */
  technicalFocus?: TechnicalFocus;
  /** Filtrar desde fecha (ISO 8601 string) */
  dateFrom?: string;
  /** Filtrar hasta fecha (ISO 8601 string) */
  dateTo?: string;
  /** Límite de resultados */
  limit?: number;
  /** Offset para paginación */
  offset?: number;
}

/**
 * Opciones de rango de tiempo para filtros rápidos.
 */
export type TimeRange = 'week' | 'month' | 'all';

/**
 * Constantes del sistema.
 */
export const SESSION_CONSTANTS = {
  /** Focos técnicos válidos */
  VALID_FOCUSES: ['Técnica', 'Ritmo', 'Limpieza', 'Coordinación', 'Repertorio'] as const,
  /** Rango válido de BPM */
  BPM_RANGE: { min: 20, max: 400 } as const,
  /** Rango válido de duración en minutos */
  DURATION_RANGE: { min: 1, max: 300 } as const,
  /** Rango válido de calificación de calidad */
  QUALITY_RATING_RANGE: { min: 1, max: 5 } as const,
  /** Rango válido de RPE */
  RPE_RANGE: { min: 1, max: 10 } as const,
} as const;

/**
 * Type guard para verificar si un string es un TechnicalFocus válido.
 */
export function isTechnicalFocus(value: unknown): value is TechnicalFocus {
  return typeof value === 'string' &&
    SESSION_CONSTANTS.VALID_FOCUSES.includes(value as TechnicalFocus);
}

/**
 * Type guard para verificar si un número es una duración válida.
 */
export function isSessionDuration(value: unknown): value is SessionDuration {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= SESSION_CONSTANTS.DURATION_RANGE.min &&
    value <= SESSION_CONSTANTS.DURATION_RANGE.max;
}

/**
 * Checklist de mindset con valores por defecto (todos falsos).
 */
export const DEFAULT_MINDSET_CHECKLIST: MindsetChecklist = {
  warmedUp: false,
  practicedSlow: false,
  recorded: false,
  tookBreaks: false,
  reviewedMistakes: false,
};
