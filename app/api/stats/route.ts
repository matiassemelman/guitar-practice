/**
 * API Route para obtener estadísticas agregadas de las sesiones.
 *
 * GET /api/stats - Retorna métricas clave:
 *   - Racha de días consecutivos (últimos 7 días)
 *   - Total de minutos esta semana
 *   - Calidad promedio semanal
 *   - Total de sesiones
 *   - Total de minutos de todos los tiempos
 */

import { NextResponse } from 'next/server';
import { executeQuery, executeQueryOneOrNull } from '@/lib/db';
import {
  type WeeklyStatsRow,
  parseWeeklyStats,
  buildWeeklyStatsQuery,
  buildStreakQuery,
} from '@/types/database';
import {
  type SessionStats,
  type GetStatsResponse,
  createSuccessResponse,
  createErrorResponse,
  ApiErrorCode,
} from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Calcula la racha actual de días consecutivos con práctica.
 * @param practiceDates Array de fechas de práctica (formato YYYY-MM-DD) ordenadas DESC
 * @returns Número de días consecutivos con práctica hasta hoy
 */
function calculateStreak(practiceDates: string[]): number {
  if (practiceDates.length === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  for (const dateStr of practiceDates) {
    const practiceDate = new Date(dateStr);
    practiceDate.setHours(0, 0, 0, 0);

    // Calcular diferencia en días
    const diffTime = currentDate.getTime() - practiceDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Si la fecha de práctica coincide con la fecha esperada
    if (diffDays === 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > 0) {
      // Si hay un gap, la racha se rompe
      break;
    }
  }

  return streak;
}

/**
 * GET /api/stats
 *
 * Retorna estadísticas agregadas:
 * - currentStreak: Días consecutivos con práctica
 * - weeklyMinutes: Total de minutos esta semana
 * - weeklyAverageQuality: Calidad promedio (1-5★) esta semana
 * - weeklySessionCount: Número de sesiones esta semana
 * - totalSessions: Total de sesiones de todos los tiempos
 * - totalMinutes: Total de minutos de todos los tiempos
 */
export async function GET() {
  try {
    // Query 1: Estadísticas semanales
    const weeklyStatsSql = buildWeeklyStatsQuery();
    const weeklyStatsRow = await executeQueryOneOrNull<WeeklyStatsRow>(
      weeklyStatsSql
    );
    const weeklyStats = parseWeeklyStats(weeklyStatsRow || undefined);

    // Query 2: Racha de días consecutivos
    const streakSql = buildStreakQuery();
    const streakRows = await executeQuery<{ practice_date: string }>(streakSql);
    const practiceDates = streakRows.map((row) => row.practice_date);
    const currentStreak = calculateStreak(practiceDates);

    // Query 3: Estadísticas totales de todos los tiempos
    const totalStatsSql = `
      SELECT
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_min), 0) as total_minutes
      FROM sessions
    `;
    const totalStatsRow = await executeQueryOneOrNull<{
      total_sessions: string;
      total_minutes: string;
    }>(totalStatsSql);

    const totalSessions = totalStatsRow
      ? parseInt(totalStatsRow.total_sessions, 10)
      : 0;
    const totalMinutes = totalStatsRow
      ? parseInt(totalStatsRow.total_minutes, 10)
      : 0;

    // Construir respuesta
    const stats: SessionStats = {
      currentStreak,
      weeklyMinutes: weeklyStats.totalMinutes,
      weeklyAverageQuality: weeklyStats.avgQuality,
      weeklySessionCount: weeklyStats.sessionCount,
      totalSessions,
      totalMinutes,
    };

    const response: GetStatsResponse = {
      stats,
    };

    return NextResponse.json(createSuccessResponse(response), { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/stats:', error);

    return NextResponse.json(
      createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        error instanceof Error
          ? error.message
          : 'Error al obtener estadísticas de la base de datos'
      ),
      { status: 500 }
    );
  }
}
