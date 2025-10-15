import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import {
  DailyHabitsRow,
  HabitsMonthResponse,
  dbRowToApiResponse,
} from '@/types/habits';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month') || getCurrentMonth();

    // Validar formato YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid month format. Use YYYY-MM.' },
        { status: 400 }
      );
    }

    // Query: Obtener todos los días del mes con datos
    const result = await executeQuery<DailyHabitsRow>(
      `
      SELECT * FROM daily_habits
      WHERE date >= $1::date AND date < ($1::date + INTERVAL '1 month')
      ORDER BY date DESC
      `,
      [`${monthParam}-01`]
    );

    const days = result.map(dbRowToApiResponse);

    // Calcular estadísticas
    const stats = calculateMonthStats(result);

    const response: HabitsMonthResponse = {
      month: monthParam,
      days,
      stats,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error fetching month habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch month habits' },
      { status: 500 }
    );
  }
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function calculateMonthStats(rows: DailyHabitsRow[]) {
  const warmupCount = rows.filter((r) => r.warmup_done).length;
  const chordsCount = rows.filter((r) => r.chords_done).length;
  const classCount = rows.filter((r) => r.class_done).length;

  // Total de días con al menos un hábito registrado
  const totalDays = rows.length;

  // Calcular racha actual (días consecutivos con los 3 hábitos completos desde hoy)
  const today = new Date().toISOString().split('T')[0];
  const sortedRows = [...rows].sort((a, b) => b.date.localeCompare(a.date)); // Más reciente primero

  let currentStreak = 0;
  for (const row of sortedRows) {
    if (row.date > today) continue; // Ignorar fechas futuras
    if (row.warmup_done && row.chords_done && row.class_done) {
      currentStreak++;
    } else {
      break; // Se rompe la racha
    }
  }

  return {
    warmupCount,
    chordsCount,
    classCount,
    totalDays,
    currentStreak,
  };
}
