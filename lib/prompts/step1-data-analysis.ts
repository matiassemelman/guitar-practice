import type { Session } from '@/types/session';
import type { AnalysisType } from '@/types/ai-analysis';
import type { UserProfile } from '@/types/profile';
import { getPedagogicalContext } from './pedagogical-knowledge';
import { formatLevel, formatExperience } from '@/types/profile';

/**
 * Step 1: Data Analysis Prompt
 * Analiza datos de sesiones y genera métricas + patrones estructurados
 */
export function buildStep1Prompt(sessions: Session[], profile?: UserProfile | null): string {
  const sessionsJSON = JSON.stringify(sessions, null, 2);

  // Contexto del perfil (si existe)
  const profileContext = profile ? `
# PERFIL DEL GUITARRISTA
- Nivel: ${formatLevel(profile.level)} (${formatExperience(profile.experienceValue, profile.experienceUnit)} de experiencia)
- Objetivo principal: ${profile.mainGoal}
${profile.currentChallenge ? `- Desafío actual: ${profile.currentChallenge}` : ''}
${profile.idealPracticeFrequency ? `- Frecuencia ideal: ${profile.idealPracticeFrequency} días por semana` : ''}
${profile.priorityTechniques ? `- Técnicas prioritarias: ${profile.priorityTechniques}` : ''}
${profile.additionalContext && Object.keys(profile.additionalContext).length > 0 ? `\n## Contexto Adicional\n${JSON.stringify(profile.additionalContext, null, 2)}` : ''}

# CONTEXTO PEDAGÓGICO
${getPedagogicalContext(profile.level)}
` : '';

  return `
Sos un asistente experto en análisis de práctica musical deliberada.

${profileContext}

# TAREA
Analizá estas sesiones de práctica de guitarra y devolvé un análisis estructurado en JSON.

# DATOS DE SESIONES
${sessionsJSON}

# FORMATO DE RESPUESTA
Devolvé SOLO un objeto JSON válido (sin markdown, sin explicaciones) con esta estructura:

{
  "metrics": {
    "totalSessions": number,
    "avgDuration": number,
    "avgBPM": number | null,
    "avgQuality": number | null,
    "totalMinutes": number,
    "sessionsByFocus": { "Técnica": number, "Ritmo": number, ... },
    "mindsetCompletionRate": number (0-1)
  },
  "patterns": [
    {
      "type": "consistency" | "quality_trend" | "bpm_evolution" | "focus_distribution",
      "description": "descripción breve",
      "evidence": "datos específicos que lo soportan"
    }
  ],
  "trends": [
    {
      "metric": "BPM" | "calidad" | "duración" | "mindset",
      "direction": "up" | "down" | "stable",
      "details": "detalles específicos con números"
    }
  ],
  "correlations": [
    {
      "variables": ["variable1", "variable2"],
      "relationship": "descripción de la relación",
      "strength": "weak" | "moderate" | "strong"
    }
  ],
  "alerts": [
    {
      "severity": "info" | "warning" | "critical",
      "message": "mensaje específico"
    }
  ]
}

# INSTRUCCIONES CLAVE
1. Calculá métricas básicas con precisión matemática
2. Detectá patrones reales en los datos (no inventes)
3. Identificá tendencias temporales (comparando sesiones tempranas vs recientes)
4. Buscá correlaciones entre variables (ej: mindset vs calidad, BPM vs errores)
5. Generá alertas si detectás problemas pedagógicos (tensión, velocidad prematura, falta de descansos)
6. Mindset completion rate = promedio de checkboxes marcados por sesión
7. Si no hay datos suficientes para algún campo, usá null o array vacío

IMPORTANTE: Tu respuesta debe ser SOLO el JSON, sin texto adicional.
`.trim();
}
