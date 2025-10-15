import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import {
  DailyHabitsRow,
  DailyHabitsInput,
  DailyHabitsResponse,
  dbRowToApiResponse,
  createEmptyHabits,
  getTodayDateString,
} from '@/types/habits';

// ============================================
// GET /api/habits?date=YYYY-MM-DD
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || getTodayDateString();

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const result = await executeQuery<DailyHabitsRow>(
      `SELECT * FROM daily_habits WHERE date = $1`,
      [dateParam]
    );

    // Si no hay datos para ese día, devolver estructura vacía
    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        data: createEmptyHabits(dateParam),
      });
    }

    const data = dbRowToApiResponse(result[0]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/habits
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body: DailyHabitsInput = await request.json();

    // Validación de input
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing date' },
        { status: 400 }
      );
    }

    // UPSERT: Insertar o actualizar si ya existe registro para esa fecha
    const result = await executeQuery<DailyHabitsRow>(
      `
      INSERT INTO daily_habits (
        date,
        warmup_done, warmup_duration_min,
        chords_done, chords_duration_min, chords_bpm, chords_notes,
        class_done, class_duration_min
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (date) DO UPDATE SET
        warmup_done = EXCLUDED.warmup_done,
        warmup_duration_min = EXCLUDED.warmup_duration_min,
        chords_done = EXCLUDED.chords_done,
        chords_duration_min = EXCLUDED.chords_duration_min,
        chords_bpm = EXCLUDED.chords_bpm,
        chords_notes = EXCLUDED.chords_notes,
        class_done = EXCLUDED.class_done,
        class_duration_min = EXCLUDED.class_duration_min,
        updated_at = NOW()
      RETURNING *
      `,
      [
        body.date,
        body.warmup?.done || false,
        body.warmup?.durationMin || null,
        body.chords?.done || false,
        body.chords?.durationMin || null,
        body.chords?.bpm || null,
        body.chords?.notes || null,
        body.class?.done || false,
        body.class?.durationMin || null,
      ]
    );

    const data = dbRowToApiResponse(result[0]);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error saving habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save habits' },
      { status: 500 }
    );
  }
}
