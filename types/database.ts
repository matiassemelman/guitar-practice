/**
 * Tipos para el mapeo entre la base de datos y la aplicación.
 *
 * Define estructuras para representar filas de la DB
 * y funciones de transformación entre formatos.
 */

import type {
  Session,
  CreateSessionInput,
  MindsetChecklist,
  TechnicalFocus,
  SessionDuration,
} from './session';

/**
 * Representación de una fila de la tabla `sessions` tal como viene de PostgreSQL.
 * Los nombres de columnas están en snake_case (formato DB).
 */
export interface SessionRow {
  id: number;
  created_at: string;
  micro_objective: string;
  technical_focus: string;
  duration_min: number;
  bpm_target: number | null;
  bpm_achieved: number | null;
  perfect_takes: number | null;
  quality_rating: number | null;
  rpe: number | null;
  mindset_checklist: MindsetChecklist | null;
  reflection: string | null;
}

/**
 * Tipo para los parámetros de INSERT en la tabla sessions.
 */
export interface SessionInsertParams {
  micro_objective: string;
  technical_focus: string;
  duration_min: number;
  bpm_target?: number;
  bpm_achieved?: number;
  perfect_takes?: number;
  quality_rating?: number;
  rpe?: number;
  mindset_checklist?: MindsetChecklist;
  reflection?: string;
}

/**
 * Transforma una fila de DB (snake_case) a un objeto Session (camelCase).
 */
export function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    createdAt: row.created_at,
    microObjective: row.micro_objective,
    technicalFocus: row.technical_focus as TechnicalFocus,
    durationMin: row.duration_min as SessionDuration,
    bpmTarget: row.bpm_target,
    bpmAchieved: row.bpm_achieved,
    perfectTakes: row.perfect_takes,
    qualityRating: row.quality_rating,
    rpe: row.rpe,
    mindsetChecklist: row.mindset_checklist,
    reflection: row.reflection,
  };
}

/**
 * Transforma un CreateSessionInput a parámetros de INSERT para la DB.
 */
export function inputToInsertParams(
  input: CreateSessionInput
): SessionInsertParams {
  const params: SessionInsertParams = {
    micro_objective: input.microObjective,
    technical_focus: input.technicalFocus,
    duration_min: input.durationMin,
  };

  // Agregar campos opcionales solo si están presentes
  if (input.bpmTarget !== undefined) {
    params.bpm_target = input.bpmTarget;
  }

  if (input.bpmAchieved !== undefined) {
    params.bpm_achieved = input.bpmAchieved;
  }

  if (input.perfectTakes !== undefined) {
    params.perfect_takes = input.perfectTakes;
  }

  if (input.qualityRating !== undefined) {
    params.quality_rating = input.qualityRating;
  }

  if (input.rpe !== undefined) {
    params.rpe = input.rpe;
  }

  if (input.mindsetChecklist !== undefined) {
    params.mindset_checklist = input.mindsetChecklist;
  }

  if (input.reflection !== undefined) {
    params.reflection = input.reflection;
  }

  return params;
}

/**
 * Construye una query SQL de INSERT con placeholders.
 * Retorna tanto el SQL como el array de valores.
 */
export function buildInsertQuery(
  params: SessionInsertParams
): { sql: string; values: unknown[] } {
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: unknown[] = [];

  let paramIndex = 1;

  // Añadir cada campo presente a la query
  for (const [key, value] of Object.entries(params)) {
    columns.push(key);
    placeholders.push(`$${paramIndex}`);

    // Convertir objetos a JSON para campos JSONB
    if (key === 'mindset_checklist' && value !== undefined) {
      values.push(JSON.stringify(value));
    } else {
      values.push(value);
    }

    paramIndex++;
  }

  const sql = `
    INSERT INTO sessions (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  return { sql, values };
}

/**
 * Construye una query SQL de SELECT con filtros opcionales.
 */
export interface SelectQueryOptions {
  technicalFocus?: TechnicalFocus;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'duration_min' | 'quality_rating';
  orderDirection?: 'ASC' | 'DESC';
}

export function buildSelectQuery(
  options: SelectQueryOptions = {}
): { sql: string; values: unknown[] } {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Construir condiciones WHERE
  if (options.technicalFocus) {
    conditions.push(`technical_focus = $${paramIndex}`);
    values.push(options.technicalFocus);
    paramIndex++;
  }

  if (options.dateFrom) {
    conditions.push(`created_at >= $${paramIndex}`);
    values.push(options.dateFrom);
    paramIndex++;
  }

  if (options.dateTo) {
    conditions.push(`created_at <= $${paramIndex}`);
    values.push(options.dateTo);
    paramIndex++;
  }

  // Construir query base
  let sql = 'SELECT * FROM sessions';

  // Agregar WHERE si hay condiciones
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Agregar ORDER BY
  const orderBy = options.orderBy || 'created_at';
  const orderDirection = options.orderDirection || 'DESC';
  sql += ` ORDER BY ${orderBy} ${orderDirection}`;

  // Agregar LIMIT y OFFSET
  if (options.limit) {
    sql += ` LIMIT $${paramIndex}`;
    values.push(options.limit);
    paramIndex++;
  }

  if (options.offset) {
    sql += ` OFFSET $${paramIndex}`;
    values.push(options.offset);
    paramIndex++;
  }

  return { sql, values };
}

/**
 * Query para obtener estadísticas semanales.
 */
export function buildWeeklyStatsQuery(): string {
  return `
    SELECT
      COUNT(*) as session_count,
      SUM(duration_min) as total_minutes,
      AVG(quality_rating) as avg_quality
    FROM sessions
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `;
}

/**
 * Query para obtener la racha actual (días consecutivos con práctica).
 */
export function buildStreakQuery(): string {
  return `
    SELECT DISTINCT DATE(created_at) as practice_date
    FROM sessions
    ORDER BY practice_date DESC
  `;
}

/**
 * Query para obtener datos de evolución de BPM.
 */
export function buildBPMEvolutionQuery(
  options: {
    dateFrom?: string;
    dateTo?: string;
    technicalFocus?: TechnicalFocus;
    limit?: number;
  } = {}
): { sql: string; values: unknown[] } {
  const conditions: string[] = ['(bpm_target IS NOT NULL OR bpm_achieved IS NOT NULL)'];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (options.dateFrom) {
    conditions.push(`created_at >= $${paramIndex}`);
    values.push(options.dateFrom);
    paramIndex++;
  }

  if (options.dateTo) {
    conditions.push(`created_at <= $${paramIndex}`);
    values.push(options.dateTo);
    paramIndex++;
  }

  if (options.technicalFocus) {
    conditions.push(`technical_focus = $${paramIndex}`);
    values.push(options.technicalFocus);
    paramIndex++;
  }

  let sql = `
    SELECT
      created_at,
      bpm_target,
      bpm_achieved,
      micro_objective
    FROM sessions
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at ASC
  `;

  if (options.limit) {
    sql += ` LIMIT $${paramIndex}`;
    values.push(options.limit);
  }

  return { sql, values };
}

/**
 * Tipo para los resultados de stats semanales de la DB.
 */
export interface WeeklyStatsRow {
  session_count: string; // PostgreSQL COUNT retorna string
  total_minutes: string | null; // SUM puede ser null
  avg_quality: string | null; // AVG puede ser null
}

/**
 * Transforma una fila de weekly stats a números útiles.
 */
export function parseWeeklyStats(row: WeeklyStatsRow | undefined): {
  sessionCount: number;
  totalMinutes: number;
  avgQuality: number | null;
} {
  if (!row) {
    return {
      sessionCount: 0,
      totalMinutes: 0,
      avgQuality: null,
    };
  }

  return {
    sessionCount: parseInt(row.session_count, 10) || 0,
    totalMinutes: parseInt(row.total_minutes || '0', 10) || 0,
    avgQuality: row.avg_quality ? parseFloat(row.avg_quality) : null,
  };
}
