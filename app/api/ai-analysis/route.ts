import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { executeQuery } from '@/lib/db';
import type { AIAnalysisRequest, AnalysisType } from '@/types/ai-analysis';
import type { SessionRow } from '@/types/database';
import { rowToSession } from '@/types/database';

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

// Helper: Preparar datos para el prompt (resumen inteligente)
function prepareDataForPrompt(sessions: any[]) {
  // Si hay <= 15 sesiones, enviar todas con detalles
  if (sessions.length <= 15) {
    return sessions.map(s => ({
      fecha: new Date(s.createdAt).toLocaleDateString('es-AR'),
      objetivo: s.microObjective,
      foco: s.technicalFocus,
      duracion: s.durationMin,
      bpm: s.bpmTarget && s.bpmAchieved ? `${s.bpmAchieved}/${s.bpmTarget}` : 'N/A',
      calidad: s.qualityRating ? `${s.qualityRating}★` : 'N/A',
      mindset: s.mindsetChecklist || {}
    }));
  }

  // Si hay > 15, enviar últimas 10 + resumen del resto
  const recent = sessions.slice(0, 10).map(s => ({
    fecha: new Date(s.createdAt).toLocaleDateString('es-AR'),
    objetivo: s.microObjective,
    foco: s.technicalFocus,
    duracion: s.durationMin,
    bpm: s.bpmTarget && s.bpmAchieved ? `${s.bpmAchieved}/${s.bpmTarget}` : 'N/A',
    calidad: s.qualityRating ? `${s.qualityRating}★` : 'N/A',
    mindset: s.mindsetChecklist || {}
  }));

  const older = sessions.slice(10);
  const summary = {
    totalSesiones: older.length,
    duracionPromedio: Math.round(
      older.reduce((sum, s) => sum + s.durationMin, 0) / older.length
    ),
    calidadPromedio: older.filter(s => s.qualityRating).length > 0
      ? (older.reduce((sum, s) => sum + (s.qualityRating || 0), 0) /
         older.filter(s => s.qualityRating).length).toFixed(1)
      : 'N/A',
    focosDistribucion: older.reduce((acc: any, s) => {
      acc[s.technicalFocus] = (acc[s.technicalFocus] || 0) + 1;
      return acc;
    }, {})
  };

  return { sesionesRecientes: recent, resumenAnteriores: summary };
}

// Helper: Construir prompt según tipos de análisis
function buildPrompt(types: AnalysisType[], data: any) {
  const intro = `Sos un coach experto en práctica deliberada de guitarra. Tu filosofía es Growth Mindset + Kaizen.

**TONO**: Voseo argentino (usá "vos", "tenés", "practicás"), motivador pero realista, profesional.

**DATOS DE PRÁCTICA**:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

**ANÁLISIS SOLICITADOS**: ${types.join(', ')}

Generá una respuesta en Markdown con las siguientes secciones:
`;

  const sections: string[] = [];

  if (types.includes('patterns')) {
    sections.push(`## 🔍 Patrones Detectados
Identificá tendencias en horarios, técnicas, correlaciones (ej: BPM vs calidad). Usá datos concretos.`);
  }

  if (types.includes('strengths')) {
    sections.push(`## ⭐ Fortalezas Observadas
Reconocé estrategias efectivas y hábitos positivos. Celebrá el esfuerzo (Growth Mindset).`);
  }

  if (types.includes('weaknesses')) {
    sections.push(`## 🎯 Áreas de Mejora
Señalá oportunidades de crecimiento con tacto. Enfocate en aprendizaje, no deficiencias.`);
  }

  if (types.includes('plateau')) {
    sections.push(`## 📊 Análisis de Progreso
Evaluá si hay estancamiento en BPM o calidad. Si lo hay, explicá posibles causas.`);
  }

  if (types.includes('experiments')) {
    sections.push(`## 🧪 Micro-Experimentos Kaizen
Proponé 2-3 estrategias concretas y específicas para próximas sesiones.`);
  }

  if (types.includes('progression')) {
    sections.push(`## 📈 Evaluación de Evolución
Analizá progreso en BPM, calidad y adherencia a mindset. Destacá mejoras.`);
  }

  return intro + '\n' + sections.join('\n\n') + '\n\n**Importante**: Basá cada insight en datos específicos del historial.';
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

    // 3. Preparar datos para el prompt
    const data = prepareDataForPrompt(sessions);

    // 4. Construir prompt
    const prompt = buildPrompt(analysisTypes, data);

    // 5. Llamar a OpenAI API (GPT-4o)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 2048,
      temperature: 0.7,
    });

    // 6. Extraer texto de respuesta
    const analysisText = completion.choices[0]?.message?.content || '';

    if (!analysisText) {
      throw new Error('No se recibió respuesta de la IA');
    }

    // 7. Retornar respuesta
    return NextResponse.json({
      success: true,
      analysis: analysisText,
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
