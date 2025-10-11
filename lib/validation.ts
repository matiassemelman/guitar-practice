/**
 * Funciones de validación para datos de sesiones.
 *
 * Valida inputs del usuario y datos de la base de datos
 * según las constraints definidas en el schema.
 */

import {
  type CreateSessionInput,
  type MindsetChecklist,
  type TechnicalFocus,
  type SessionDuration,
  SESSION_CONSTANTS,
  isTechnicalFocus,
  isSessionDuration,
} from '../types/session';

/**
 * Resultado de una validación.
 */
export interface ValidationResult {
  /** Indica si la validación fue exitosa */
  isValid: boolean;
  /** Array de mensajes de error (vacío si isValid = true) */
  errors: string[];
}

/**
 * Crea un resultado de validación exitoso.
 */
export function createValidResult(): ValidationResult {
  return {
    isValid: true,
    errors: [],
  };
}

/**
 * Crea un resultado de validación fallido.
 */
export function createInvalidResult(errors: string[]): ValidationResult {
  return {
    isValid: false,
    errors,
  };
}

/**
 * Valida que un string no esté vacío.
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string
): ValidationResult {
  if (typeof value !== 'string') {
    return createInvalidResult([`${fieldName} must be a string`]);
  }

  if (value.trim().length === 0) {
    return createInvalidResult([`${fieldName} cannot be empty`]);
  }

  return createValidResult();
}

/**
 * Valida que un objetivo micro sea válido.
 * - Debe ser string no vacío
 * - Longitud mínima: 5 caracteres
 * - Longitud máxima: 500 caracteres
 */
export function validateMicroObjective(value: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof value !== 'string') {
    errors.push('Micro objective must be a string');
    return createInvalidResult(errors);
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    errors.push('Micro objective cannot be empty');
  }

  if (trimmed.length < 5) {
    errors.push('Micro objective must be at least 5 characters long');
  }

  if (trimmed.length > 500) {
    errors.push('Micro objective must be at most 500 characters long');
  }

  return errors.length === 0 ? createValidResult() : createInvalidResult(errors);
}

/**
 * Valida que un foco técnico sea válido.
 */
export function validateTechnicalFocus(value: unknown): ValidationResult {
  if (!isTechnicalFocus(value)) {
    const validValues = SESSION_CONSTANTS.VALID_FOCUSES.join(', ');
    return createInvalidResult([
      `Technical focus must be one of: ${validValues}`,
    ]);
  }

  return createValidResult();
}

/**
 * Valida que una duración sea válida.
 */
export function validateDuration(value: unknown): ValidationResult {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return createInvalidResult(['Duration must be an integer']);
  }

  const { min, max } = SESSION_CONSTANTS.DURATION_RANGE;
  if (value < min || value > max) {
    return createInvalidResult([
      `Duration must be between ${min} and ${max} minutes`,
    ]);
  }

  return createValidResult();
}

/**
 * Valida que un valor BPM esté en rango válido.
 */
export function validateBPM(value: unknown, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return createValidResult(); // BPM es opcional
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return createInvalidResult([`${fieldName} must be an integer`]);
  }

  const { min, max } = SESSION_CONSTANTS.BPM_RANGE;
  if (value < min || value > max) {
    return createInvalidResult([
      `${fieldName} must be between ${min} and ${max}`,
    ]);
  }

  return createValidResult();
}


/**
 * Valida que la calificación de calidad esté en rango válido (1-5).
 */
export function validateQualityRating(value: unknown): ValidationResult {
  if (value === null || value === undefined) {
    return createValidResult(); // Campo opcional
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return createInvalidResult(['Quality rating must be an integer']);
  }

  const { min, max } = SESSION_CONSTANTS.QUALITY_RATING_RANGE;
  if (value < min || value > max) {
    return createInvalidResult([
      `Quality rating must be between ${min} and ${max} stars`,
    ]);
  }

  return createValidResult();
}

/**
 * Valida que el RPE esté en rango válido (1-10).
 */
export function validateRPE(value: unknown): ValidationResult {
  if (value === null || value === undefined) {
    return createValidResult(); // Campo opcional
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return createInvalidResult(['RPE must be an integer']);
  }

  const { min, max } = SESSION_CONSTANTS.RPE_RANGE;
  if (value < min || value > max) {
    return createInvalidResult([
      `RPE must be between ${min} and ${max}`,
    ]);
  }

  return createValidResult();
}

/**
 * Valida que el checklist de mindset tenga la estructura correcta.
 */
export function validateMindsetChecklist(value: unknown): ValidationResult {
  if (value === null || value === undefined) {
    return createValidResult(); // Campo opcional
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return createInvalidResult(['Mindset checklist must be an object']);
  }

  const checklist = value as Record<string, unknown>;
  const errors: string[] = [];

  const requiredFields: (keyof MindsetChecklist)[] = [
    'warmedUp',
    'practicedSlow',
    'recorded',
    'tookBreaks',
    'reviewedMistakes',
  ];

  for (const field of requiredFields) {
    if (!(field in checklist)) {
      errors.push(`Mindset checklist missing required field: ${field}`);
    } else if (typeof checklist[field] !== 'boolean') {
      errors.push(`Mindset checklist field ${field} must be a boolean`);
    }
  }

  return errors.length === 0 ? createValidResult() : createInvalidResult(errors);
}

/**
 * Valida que una reflexión sea válida (si está presente).
 */
export function validateReflection(value: unknown): ValidationResult {
  if (value === null || value === undefined) {
    return createValidResult(); // Campo opcional
  }

  if (typeof value !== 'string') {
    return createInvalidResult(['Reflection must be a string']);
  }

  if (value.length > 1000) {
    return createInvalidResult(['Reflection must be at most 1000 characters long']);
  }

  return createValidResult();
}

/**
 * Valida un input completo de creación de sesión.
 */
export function validateCreateSessionInput(
  input: unknown
): ValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return createInvalidResult(['Input must be an object']);
  }

  const data = input as Record<string, unknown>;
  const allErrors: string[] = [];

  // Validar campos obligatorios
  const microObjectiveResult = validateMicroObjective(data.microObjective);
  if (!microObjectiveResult.isValid) {
    allErrors.push(...microObjectiveResult.errors);
  }

  const technicalFocusResult = validateTechnicalFocus(data.technicalFocus);
  if (!technicalFocusResult.isValid) {
    allErrors.push(...technicalFocusResult.errors);
  }

  const durationResult = validateDuration(data.durationMin);
  if (!durationResult.isValid) {
    allErrors.push(...durationResult.errors);
  }

  // Validar campos opcionales (solo si están presentes)
  if ('bpmTarget' in data) {
    const bpmTargetResult = validateBPM(data.bpmTarget, 'BPM target');
    if (!bpmTargetResult.isValid) {
      allErrors.push(...bpmTargetResult.errors);
    }
  }

  if ('bpmAchieved' in data) {
    const bpmAchievedResult = validateBPM(data.bpmAchieved, 'BPM achieved');
    if (!bpmAchievedResult.isValid) {
      allErrors.push(...bpmAchievedResult.errors);
    }
  }

  if ('qualityRating' in data) {
    const qualityRatingResult = validateQualityRating(data.qualityRating);
    if (!qualityRatingResult.isValid) {
      allErrors.push(...qualityRatingResult.errors);
    }
  }

  if ('rpe' in data) {
    const rpeResult = validateRPE(data.rpe);
    if (!rpeResult.isValid) {
      allErrors.push(...rpeResult.errors);
    }
  }

  if ('mindsetChecklist' in data) {
    const checklistResult = validateMindsetChecklist(data.mindsetChecklist);
    if (!checklistResult.isValid) {
      allErrors.push(...checklistResult.errors);
    }
  }

  if ('reflection' in data) {
    const reflectionResult = validateReflection(data.reflection);
    if (!reflectionResult.isValid) {
      allErrors.push(...reflectionResult.errors);
    }
  }

  return allErrors.length === 0
    ? createValidResult()
    : createInvalidResult(allErrors);
}

/**
 * Sanitiza un string removiendo espacios extra y caracteres peligrosos.
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Transforma un input raw en un CreateSessionInput válido.
 * Sanitiza strings y normaliza valores opcionales.
 */
export function transformToCreateSessionInput(
  input: Record<string, unknown>
): CreateSessionInput {
  const transformed: CreateSessionInput = {
    microObjective: sanitizeString(input.microObjective as string),
    technicalFocus: input.technicalFocus as TechnicalFocus,
    durationMin: input.durationMin as SessionDuration,
  };

  // Agregar campos opcionales solo si están presentes y no son null/undefined
  if (input.bpmTarget != null) {
    transformed.bpmTarget = input.bpmTarget as number;
  }

  if (input.bpmAchieved != null) {
    transformed.bpmAchieved = input.bpmAchieved as number;
  }

  if (input.qualityRating != null) {
    transformed.qualityRating = input.qualityRating as number;
  }

  if (input.rpe != null) {
    transformed.rpe = input.rpe as number;
  }

  if (input.mindsetChecklist != null) {
    transformed.mindsetChecklist = input.mindsetChecklist as MindsetChecklist;
  }

  if (input.reflection != null) {
    transformed.reflection = sanitizeString(input.reflection as string);
  }

  return transformed;
}

/**
 * Valida y transforma un input en un solo paso.
 * Retorna el input transformado o lanza un error con los mensajes de validación.
 */
export function validateAndTransform(
  input: unknown
): CreateSessionInput {
  const validationResult = validateCreateSessionInput(input);

  if (!validationResult.isValid) {
    const errorMessage = validationResult.errors.join('; ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }

  return transformToCreateSessionInput(input as Record<string, unknown>);
}

/**
 * Valida una fecha ISO 8601.
 */
export function validateISODate(value: unknown, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return createValidResult(); // Fecha es opcional en la mayoría de casos
  }

  if (typeof value !== 'string') {
    return createInvalidResult([`${fieldName} must be a string`]);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return createInvalidResult([`${fieldName} must be a valid ISO 8601 date`]);
  }

  return createValidResult();
}

/**
 * Valida un rango de fechas (from debe ser anterior a to).
 */
export function validateDateRange(
  dateFrom: unknown,
  dateTo: unknown
): ValidationResult {
  const fromResult = validateISODate(dateFrom, 'Date from');
  if (!fromResult.isValid) return fromResult;

  const toResult = validateISODate(dateTo, 'Date to');
  if (!toResult.isValid) return toResult;

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom as string);
    const to = new Date(dateTo as string);

    if (from > to) {
      return createInvalidResult(['Date from must be before date to']);
    }
  }

  return createValidResult();
}

// ============================================================================
// Profile Validators
// ============================================================================

import type { ExperienceLevel, ExperienceUnit } from '@/types/profile';

/**
 * Valida que el nivel de experiencia sea válido.
 */
export function validateExperienceLevel(level: unknown): ExperienceLevel {
  const validLevels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];
  if (typeof level !== 'string' || !validLevels.includes(level as ExperienceLevel)) {
    throw new Error(`Nivel inválido. Debe ser: ${validLevels.join(', ')}`);
  }
  return level as ExperienceLevel;
}

/**
 * Valida que la unidad de experiencia sea válida.
 */
export function validateExperienceUnit(unit: unknown): ExperienceUnit {
  const validUnits: ExperienceUnit[] = ['days', 'months', 'years'];
  if (typeof unit !== 'string' || !validUnits.includes(unit as ExperienceUnit)) {
    throw new Error(`Unidad inválida. Debe ser: ${validUnits.join(', ')}`);
  }
  return unit as ExperienceUnit;
}

/**
 * Valida que el objetivo principal sea válido.
 */
export function validateMainGoal(goal: unknown): string {
  if (typeof goal !== 'string' || goal.trim().length === 0) {
    throw new Error('Objetivo principal es obligatorio');
  }
  if (goal.length > 500) {
    throw new Error('Objetivo no puede exceder 500 caracteres');
  }
  return goal.trim();
}

/**
 * Valida que el valor de experiencia sea válido.
 */
export function validateExperienceValue(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error('Valor de experiencia debe ser un número entero positivo');
  }
  return value;
}

/**
 * Valida que la frecuencia ideal de práctica sea válida (1-7 días).
 */
export function validatePracticeFrequency(freq: unknown): number | null {
  if (freq === null || freq === undefined) {
    return null;
  }
  if (typeof freq !== 'number' || !Number.isInteger(freq) || freq < 1 || freq > 7) {
    throw new Error('Frecuencia de práctica debe estar entre 1 y 7 días por semana');
  }
  return freq;
}
