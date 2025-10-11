import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { UserProfileRow, CreateProfileInput } from '@/types/profile';
import { rowToProfile, profileToRow } from '@/types/profile';
import {
  validateExperienceLevel,
  validateExperienceUnit,
  validateMainGoal,
  validateExperienceValue,
  validatePracticeFrequency,
} from '@/lib/validation';

/**
 * GET /api/profile
 * Obtiene el perfil de usuario (solo puede haber 1)
 */
export async function GET(request: NextRequest) {
  try {
    const sql = 'SELECT * FROM user_profile WHERE id = 1';
    const rows = await executeQuery<UserProfileRow>(sql, []);

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        profile: null,
      });
    }

    const profile = rowToProfile(rows[0]);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al obtener perfil',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile
 * Crea o actualiza el perfil (UPSERT)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parsear body
    const body = await request.json();

    // 2. Validar campos obligatorios
    const level = validateExperienceLevel(body.level);
    const experienceValue = validateExperienceValue(body.experienceValue);
    const experienceUnit = validateExperienceUnit(body.experienceUnit);
    const mainGoal = validateMainGoal(body.mainGoal);

    // 3. Validar campos opcionales
    const practiceFrequency = validatePracticeFrequency(body.idealPracticeFrequency);

    // 4. Construir input validado
    const input: CreateProfileInput = {
      level,
      experienceValue,
      experienceUnit,
      mainGoal,
      currentChallenge: body.currentChallenge || undefined,
      idealPracticeFrequency: practiceFrequency ?? undefined,
      priorityTechniques: body.priorityTechniques || undefined,
      additionalContext: body.additionalContext || {},
    };

    // 5. Convertir a formato DB
    const dbData = profileToRow(input);

    // 6. UPSERT en DB (INSERT ... ON CONFLICT UPDATE)
    const sql = `
      INSERT INTO user_profile (
        id, level, experience_value, experience_unit, main_goal,
        current_challenge, ideal_practice_frequency, priority_techniques,
        additional_context
      )
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        level = EXCLUDED.level,
        experience_value = EXCLUDED.experience_value,
        experience_unit = EXCLUDED.experience_unit,
        main_goal = EXCLUDED.main_goal,
        current_challenge = EXCLUDED.current_challenge,
        ideal_practice_frequency = EXCLUDED.ideal_practice_frequency,
        priority_techniques = EXCLUDED.priority_techniques,
        additional_context = EXCLUDED.additional_context,
        updated_at = NOW()
      RETURNING *
    `;

    const params = [
      dbData.level,
      dbData.experience_value,
      dbData.experience_unit,
      dbData.main_goal,
      dbData.current_challenge,
      dbData.ideal_practice_frequency,
      dbData.priority_techniques,
      JSON.stringify(dbData.additional_context),
    ];

    const rows = await executeQuery<UserProfileRow>(sql, params);
    const profile = rowToProfile(rows[0]);

    return NextResponse.json({
      success: true,
      profile,
      message: 'Perfil guardado exitosamente',
    });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al guardar perfil',
      },
      { status: 400 }
    );
  }
}
