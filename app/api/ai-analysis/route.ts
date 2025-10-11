import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { executeQuery } from '@/lib/db';
import type { AIAnalysisRequest, AnalysisType } from '@/types/ai-analysis';
import { extractJSON } from '@/types/ai-analysis';
import type { SessionRow } from '@/types/database';
import { rowToSession } from '@/types/database';
import type { UserProfileRow } from '@/types/profile';
import { rowToProfile } from '@/types/profile';
import { buildStep1Prompt } from '@/lib/prompts/step1-data-analysis';
import { buildStep2Prompt } from '@/lib/prompts/step2-insights';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper: Construir query SQL para obtener sesiones
function buildSessionsQuery(limit: number = 30) {
  return {
    sql: 'SELECT * FROM sessions ORDER BY created_at DESC LIMIT $1',
    params: [limit]
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validar request
    const body: AIAnalysisRequest = await request.json();
    const { analysisTypes, sessionLimit = 30 } = body;

    if (!analysisTypes || analysisTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Seleccioná al menos un tipo de análisis' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API key de IA no configurada' },
        { status: 500 }
      );
    }

    // 2. Obtener sesiones de la DB
    const { sql, params } = buildSessionsQuery(sessionLimit);
    const rows = await executeQuery<SessionRow>(sql, params);
    const sessions = rows.map(rowToSession);

    if (sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay sesiones para analizar' },
        { status: 400 }
      );
    }

    // 3. Obtener perfil de usuario (si existe)
    let profile = null;
    try {
      const profileSql = 'SELECT * FROM user_profile WHERE id = 1';
      const profileRows = await executeQuery<UserProfileRow>(profileSql, []);
      if (profileRows.length > 0) {
        profile = rowToProfile(profileRows[0]);
        console.log('✅ Perfil de usuario encontrado:', profile.level, profile.mainGoal);
      } else {
        console.log('ℹ️  No hay perfil de usuario, análisis será genérico');
      }
    } catch (error) {
      console.warn('⚠️  Error al obtener perfil, continuando sin personalización:', error);
      // Continuar sin perfil
    }

    // ========================================================================
    // PASO 1: Análisis de Datos (JSON estructurado)
    // ========================================================================
    const step1Prompt = buildStep1Prompt(sessions, profile);

    console.log('🔍 Paso 1: Analizando datos de sesiones...');

    const step1Completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: step1Prompt
      }],
      response_format: { type: 'json_object' }, // Forzar JSON
      max_tokens: 2048,
      temperature: 0.3, // Baja temp para análisis de datos
    });

    const step1Text = step1Completion.choices[0]?.message?.content || '';
    if (!step1Text) {
      throw new Error('No se recibió respuesta del Paso 1');
    }

    // Parsear JSON robusto
    let dataAnalysis;
    try {
      dataAnalysis = extractJSON(step1Text);
    } catch (error: any) {
      console.error('Error parseando JSON del Paso 1:', error);
      throw new Error(`Error parseando análisis de datos: ${error.message}`);
    }

    console.log('✅ Paso 1 completado');

    // ========================================================================
    // PASO 2: Generación de Insights (Markdown)
    // ========================================================================
    const step2Prompt = buildStep2Prompt(dataAnalysis, analysisTypes, profile);

    console.log('💡 Paso 2: Generando insights personalizados...');

    const step2Completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: step2Prompt
      }],
      max_tokens: 2048,
      temperature: 0.7, // Temp más alta para creatividad en insights
    });

    const insights = step2Completion.choices[0]?.message?.content || '';
    if (!insights) {
      throw new Error('No se recibió respuesta del Paso 2');
    }

    console.log('✅ Paso 2 completado');

    // 7. Retornar respuesta con ambos pasos
    return NextResponse.json({
      success: true,
      dataAnalysis,
      insights,
      sessionCount: sessions.length
    });

  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al procesar análisis'
      },
      { status: 500 }
    );
  }
}
