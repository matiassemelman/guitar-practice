/**
 * Tipos para las respuestas de la API y manejo de errores.
 *
 * Define la estructura de las respuestas de los endpoints
 * y tipos de errores estándar.
 */

import type {
  Session,
  CreateSessionInput,
  SessionStats,
  SessionFilters,
  BPMDataPoint,
} from './session';

/**
 * Estructura base de respuesta exitosa de la API.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Estructura base de respuesta de error de la API.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    /** Código de error legible por máquina */
    code: string;
    /** Mensaje de error legible por humano */
    message: string;
    /** Detalles adicionales del error (opcional) */
    details?: unknown;
  };
}

/**
 * Union type de todas las respuestas posibles de la API.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Códigos de error estándar de la API.
 */
export enum ApiErrorCode {
  // Errores de validación (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Errores de recursos (404)
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',

  // Errores de base de datos (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',

  // Errores genéricos (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Respuesta de POST /api/sessions (crear sesión).
 */
export interface CreateSessionResponse {
  /** Sesión recién creada */
  session: Session;
  /** Mensaje de insight motivacional (Growth Mindset + Kaizen) */
  insight?: string;
}

/**
 * Respuesta de GET /api/sessions (listar sesiones).
 */
export interface GetSessionsResponse {
  /** Array de sesiones */
  sessions: Session[];
  /** Total de sesiones (sin aplicar limit/offset) */
  total: number;
  /** Indica si hay más resultados disponibles */
  hasMore: boolean;
}

/**
 * Respuesta de GET /api/sessions/[id] (obtener sesión individual).
 */
export interface GetSessionResponse {
  session: Session;
}

/**
 * Respuesta de DELETE /api/sessions/[id] (eliminar sesión).
 */
export interface DeleteSessionResponse {
  /** ID de la sesión eliminada */
  id: number;
  /** Mensaje de confirmación */
  message: string;
}

/**
 * Respuesta de GET /api/stats (obtener estadísticas).
 */
export interface GetStatsResponse {
  stats: SessionStats;
}

/**
 * Respuesta de GET /api/stats/bpm (obtener datos de evolución de BPM).
 */
export interface GetBPMDataResponse {
  /** Array de puntos de datos para el gráfico */
  data: BPMDataPoint[];
}

/**
 * Query parameters para GET /api/sessions.
 */
export interface GetSessionsQueryParams extends SessionFilters {
  /** Ordenar por fecha (asc/desc) */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query parameters para GET /api/stats/bpm.
 */
export interface GetBPMDataQueryParams {
  /** Fecha desde (ISO 8601) */
  dateFrom?: string;
  /** Fecha hasta (ISO 8601) */
  dateTo?: string;
  /** Foco técnico (para filtrar) */
  technicalFocus?: string;
  /** Límite de puntos de datos */
  limit?: number;
}

/**
 * Request body para POST /api/sessions.
 */
export type CreateSessionRequestBody = CreateSessionInput;

/**
 * Helper type para extraer el tipo de data de una respuesta exitosa.
 */
export type ExtractApiData<T> = T extends ApiSuccessResponse<infer D> ? D : never;

/**
 * Type guard para verificar si una respuesta es exitosa.
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard para verificar si una respuesta es un error.
 */
export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Crea una respuesta exitosa estándar.
 */
export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Crea una respuesta de error estándar.
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Configuración de fetch para las llamadas a la API.
 */
export interface FetchConfig extends RequestInit {
  /** Timeout en milisegundos (opcional) */
  timeout?: number;
}

/**
 * Opciones para retry de requests fallidos.
 */
export interface RetryOptions {
  /** Número máximo de reintentos */
  maxRetries: number;
  /** Delay entre reintentos en ms */
  retryDelay: number;
  /** Códigos de status HTTP que deben reintentar */
  retryOn: number[];
}

// AI Analysis API types
export type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AnalysisType
} from './ai-analysis';
