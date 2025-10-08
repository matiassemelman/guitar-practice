/**
 * API Route para gestionar sesiones de práctica.
 *
 * GET  /api/sessions - Lista todas las sesiones con filtros opcionales
 * POST /api/sessions - Crea una nueva sesión
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeQueryOne, getRowCount } from '@/lib/db';
import {
  validateAndTransform,
  validateTechnicalFocus,
  validateISODate,
  validateDateRange,
} from '@/lib/validation';
import { generateInsight } from '@/lib/insights';
import {
  type SessionRow,
  type SessionInsertParams,
  rowToSession,
  inputToInsertParams,
  buildInsertQuery,
  buildSelectQuery,
  type SelectQueryOptions,
} from '@/types/database';
import {
  type Session,
  type CreateSessionInput,
  type GetSessionsResponse,
  type CreateSessionResponse,
  createSuccessResponse,
  createErrorResponse,
  ApiErrorCode,
  isTechnicalFocus,
} from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sessions
 *
 * Query params opcionales:
 * - technicalFocus: Filtrar por foco técnico
 * - dateFrom: Fecha inicio (ISO 8601)
 * - dateTo: Fecha fin (ISO 8601)
 * - limit: Límite de resultados (default: 50)
 * - offset: Offset para paginación (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parsear query parameters
    const technicalFocus = searchParams.get('technicalFocus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validar parámetros
    if (technicalFocus) {
      const validation = validateTechnicalFocus(technicalFocus);
      if (!validation.isValid) {
        return NextResponse.json(
          createErrorResponse(
            ApiErrorCode.INVALID_INPUT,
            validation.errors.join('; ')
          ),
          { status: 400 }
        );
      }
    }

    if (dateFrom || dateTo) {
      const dateValidation = validateDateRange(dateFrom, dateTo);
      if (!dateValidation.isValid) {
        return NextResponse.json(
          createErrorResponse(
            ApiErrorCode.INVALID_INPUT,
            dateValidation.errors.join('; ')
          ),
          { status: 400 }
        );
      }
    }

    // Parsear limit y offset
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INVALID_INPUT,
          'Limit must be between 1 and 100'
        ),
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INVALID_INPUT,
          'Offset must be non-negative'
        ),
        { status: 400 }
      );
    }

    // Construir opciones de query
    const queryOptions: SelectQueryOptions = {
      limit,
      offset,
      orderBy: 'created_at',
      orderDirection: 'DESC',
    };

    if (technicalFocus && isTechnicalFocus(technicalFocus)) {
      queryOptions.technicalFocus = technicalFocus;
    }

    if (dateFrom) {
      queryOptions.dateFrom = dateFrom;
    }

    if (dateTo) {
      queryOptions.dateTo = dateTo;
    }

    // Construir y ejecutar query
    const { sql, values } = buildSelectQuery(queryOptions);
    const rows = await executeQuery<SessionRow>(sql, values);

    // Obtener total count (sin limit/offset) para paginación
    let whereClause = '';
    const countParams: unknown[] = [];
    let paramIndex = 1;

    if (queryOptions.technicalFocus) {
      whereClause = `technical_focus = $${paramIndex}`;
      countParams.push(queryOptions.technicalFocus);
      paramIndex++;
    }

    if (queryOptions.dateFrom) {
      if (whereClause) whereClause += ' AND ';
      whereClause += `created_at >= $${paramIndex}`;
      countParams.push(queryOptions.dateFrom);
      paramIndex++;
    }

    if (queryOptions.dateTo) {
      if (whereClause) whereClause += ' AND ';
      whereClause += `created_at <= $${paramIndex}`;
      countParams.push(queryOptions.dateTo);
    }

    const total = await getRowCount(
      'sessions',
      whereClause || undefined,
      countParams
    );

    // Transformar rows a Sessions
    const sessions: Session[] = rows.map(rowToSession);

    const response: GetSessionsResponse = {
      sessions,
      total,
      hasMore: offset + sessions.length < total,
    };

    return NextResponse.json(createSuccessResponse(response), { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/sessions:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error al obtener sesiones de la base de datos'
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 *
 * Body: CreateSessionInput (JSON)
 * Retorna la sesión creada + mensaje de insight motivacional
 */
export async function POST(request: NextRequest) {
  try {
    // Parsear body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INVALID_INPUT,
          'Invalid JSON in request body'
        ),
        { status: 400 }
      );
    }

    // Validar y transformar input
    let validatedInput: CreateSessionInput;
    try {
      validatedInput = validateAndTransform(body);
    } catch (error) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.VALIDATION_ERROR,
          error instanceof Error ? error.message : 'Validation failed'
        ),
        { status: 400 }
      );
    }

    // Transformar a parámetros de DB
    const insertParams: SessionInsertParams = inputToInsertParams(validatedInput);

    // Construir query de INSERT
    const { sql, values } = buildInsertQuery(insertParams);

    // Ejecutar query
    const row = await executeQueryOne<SessionRow>(sql, values);

    // Transformar row a Session
    const session: Session = rowToSession(row);

    // Generar insight motivacional
    const insight = generateInsight(validatedInput);

    const response: CreateSessionResponse = {
      session,
      insight: insight.message + (insight.kaizen ? ` ${insight.kaizen}` : ''),
    };

    return NextResponse.json(createSuccessResponse(response), { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/sessions:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error al crear sesión en la base de datos'
      ),
      { status: 500 }
    );
  }
}
