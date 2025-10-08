/**
 * API Route para operaciones sobre una sesión específica.
 *
 * GET    /api/sessions/[id] - Obtiene una sesión por ID
 * PUT    /api/sessions/[id] - Actualiza una sesión existente
 * DELETE /api/sessions/[id] - Elimina una sesión
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeQueryOne } from '@/lib/db';
import {
  validateAndTransform,
} from '@/lib/validation';
import {
  type SessionRow,
  type SessionInsertParams,
  rowToSession,
  inputToInsertParams,
} from '@/types/database';
import {
  type Session,
  type CreateSessionInput,
  createSuccessResponse,
  createErrorResponse,
  ApiErrorCode,
} from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sessions/[id]
 * Obtiene una sesión específica por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId) || sessionId < 1) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INVALID_INPUT,
          'ID de sesión inválido'
        ),
        { status: 400 }
      );
    }

    const sql = `
      SELECT
        id, micro_objective, technical_focus, duration_min,
        bpm_target, bpm_achieved, quality_rating, rpe,
        mindset_checklist, reflection, created_at
      FROM sessions
      WHERE id = $1
    `;

    const rows = await executeQuery<SessionRow>(sql, [sessionId]);

    if (rows.length === 0) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.SESSION_NOT_FOUND,
          'Sesión no encontrada'
        ),
        { status: 404 }
      );
    }

    const session: Session = rowToSession(rows[0]);

    return NextResponse.json(createSuccessResponse(session), { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/sessions/[id]:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error al obtener sesión de la base de datos'
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/sessions/[id]
 * Actualiza una sesión existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId) || sessionId < 1) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INVALID_INPUT,
          'ID de sesión inválido'
        ),
        { status: 400 }
      );
    }

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

    // Construir query de UPDATE
    const sql = `
      UPDATE sessions
      SET
        micro_objective = $1,
        technical_focus = $2,
        duration_min = $3,
        bpm_target = $4,
        bpm_achieved = $5,
        quality_rating = $6,
        rpe = $7,
        mindset_checklist = $8,
        reflection = $9
      WHERE id = $10
      RETURNING
        id, micro_objective, technical_focus, duration_min,
        bpm_target, bpm_achieved, quality_rating, rpe,
        mindset_checklist, reflection, created_at
    `;

    const values = [
      insertParams.micro_objective,
      insertParams.technical_focus,
      insertParams.duration_min,
      insertParams.bpm_target,
      insertParams.bpm_achieved,
      insertParams.quality_rating,
      insertParams.rpe,
      JSON.stringify(insertParams.mindset_checklist),
      insertParams.reflection,
      sessionId,
    ];

    const row = await executeQueryOne<SessionRow>(sql, values);

    // Transformar row a Session
    const session: Session = rowToSession(row);

    return NextResponse.json(createSuccessResponse(session), { status: 200 });
  } catch (error) {
    console.error('Error en PUT /api/sessions/[id]:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error al actualizar sesión en la base de datos'
      ),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions/[id]
 * Elimina una sesión específica
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId) || sessionId < 1) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.INVALID_INPUT,
          'ID de sesión inválido'
        ),
        { status: 400 }
      );
    }

    // Verificar que la sesión existe antes de eliminar
    const checkSql = 'SELECT id FROM sessions WHERE id = $1';
    const existingRows = await executeQuery<{ id: number }>(checkSql, [sessionId]);

    if (existingRows.length === 0) {
      return NextResponse.json(
        createErrorResponse(
          ApiErrorCode.SESSION_NOT_FOUND,
          'Sesión no encontrada'
        ),
        { status: 404 }
      );
    }

    // Eliminar sesión
    const deleteSql = 'DELETE FROM sessions WHERE id = $1';
    await executeQuery(deleteSql, [sessionId]);

    return NextResponse.json(
      createSuccessResponse({ deleted: true, id: sessionId }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/sessions/[id]:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error al eliminar sesión de la base de datos'
      ),
      { status: 500 }
    );
  }
}
