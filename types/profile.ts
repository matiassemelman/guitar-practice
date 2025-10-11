/**
 * Tipos para el perfil de usuario del guitarrista.
 * Usado para personalizar el análisis de IA según nivel, objetivos y contexto.
 */

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExperienceUnit = 'days' | 'months' | 'years';

/**
 * Perfil de usuario completo (formato camelCase para frontend)
 */
export interface UserProfile {
  // Identificación
  id: number;

  // Datos técnicos básicos
  level: ExperienceLevel;
  experienceValue: number;
  experienceUnit: ExperienceUnit;

  // Objetivos y contexto
  mainGoal: string;
  currentChallenge?: string | null;

  // Información de práctica
  idealPracticeFrequency?: number | null; // días por semana (1-7)
  priorityTechniques?: string | null;

  // Flexibilidad futura
  additionalContext?: Record<string, any>;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos para crear o actualizar perfil (sin campos autogenerados)
 */
export interface CreateProfileInput {
  level: ExperienceLevel;
  experienceValue: number;
  experienceUnit: ExperienceUnit;
  mainGoal: string;
  currentChallenge?: string;
  idealPracticeFrequency?: number;
  priorityTechniques?: string;
  additionalContext?: Record<string, any>;
}

/**
 * Representación de perfil en base de datos (formato snake_case)
 */
export interface UserProfileRow {
  id: number;
  level: string;
  experience_value: number;
  experience_unit: string;
  main_goal: string;
  current_challenge: string | null;
  ideal_practice_frequency: number | null;
  priority_techniques: string | null;
  additional_context: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Helper: Convertir row de DB a UserProfile
 */
export function rowToProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    level: row.level as ExperienceLevel,
    experienceValue: row.experience_value,
    experienceUnit: row.experience_unit as ExperienceUnit,
    mainGoal: row.main_goal,
    currentChallenge: row.current_challenge,
    idealPracticeFrequency: row.ideal_practice_frequency,
    priorityTechniques: row.priority_techniques,
    additionalContext: row.additional_context || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Helper: Convertir CreateProfileInput a formato DB (snake_case)
 */
export function profileToRow(input: CreateProfileInput): Record<string, any> {
  return {
    level: input.level,
    experience_value: input.experienceValue,
    experience_unit: input.experienceUnit,
    main_goal: input.mainGoal,
    current_challenge: input.currentChallenge || null,
    ideal_practice_frequency: input.idealPracticeFrequency || null,
    priority_techniques: input.priorityTechniques || null,
    additional_context: input.additionalContext || {},
  };
}

/**
 * Helper: Generar descripción legible de experiencia
 */
export function formatExperience(value: number, unit: ExperienceUnit): string {
  const unitMap: Record<ExperienceUnit, string> = {
    days: value === 1 ? 'día' : 'días',
    months: value === 1 ? 'mes' : 'meses',
    years: value === 1 ? 'año' : 'años',
  };
  return `${value} ${unitMap[unit]}`;
}

/**
 * Helper: Traducir nivel a texto legible en español
 */
export function formatLevel(level: ExperienceLevel): string {
  const levelMap: Record<ExperienceLevel, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };
  return levelMap[level];
}
