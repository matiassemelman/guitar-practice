import type { DataAnalysisResult, AnalysisType } from '@/types/ai-analysis';
import type { UserProfile } from '@/types/profile';
import { getPedagogicalContext, TONE_GUIDELINES } from './pedagogical-knowledge';
import { formatLevel, formatExperience } from '@/types/profile';

/**
 * Step 2: Insights Generation Prompt
 * Genera insights personalizados basados en el análisis de datos del Paso 1
 */
export function buildStep2Prompt(
  dataAnalysis: DataAnalysisResult,
  analysisTypes: AnalysisType[],
  profile?: UserProfile | null
): string {
  const dataJSON = JSON.stringify(dataAnalysis, null, 2);
  const level = profile?.level || 'beginner';
  const pedagogicalContext = getPedagogicalContext(level);

  // Mapeo de analysisTypes a instrucciones específicas
  const analysisInstructions = analysisTypes.map(type => {
    switch (type) {
      case 'patterns':
        return '- PATRONES: Explicá los patrones detectados en los datos y qué significan para el progreso del guitarrista';
      case 'strengths':
        return '- FORTALEZAS: Celebrá las estrategias efectivas que está usando (enfoque Growth Mindset)';
      case 'weaknesses':
        return '- ÁREAS DE MEJORA: Señalá oportunidades de crecimiento con tono constructivo';
      case 'experiments':
        return '- MICRO-EXPERIMENTOS: Sugerí 2-3 experimentos Kaizen concretos y específicos para probar en las próximas sesiones';
      case 'plateau':
        return '- ANÁLISIS DE ESTANCAMIENTO: Si detectás plateau, explicá por qué ocurre y cómo superarlo';
      case 'progression':
        return '- PROGRESO: Analizá la evolución temporal en BPM, calidad y consistencia';
      default:
        return '';
    }
  }).filter(Boolean).join('\n');

  // Personalización según perfil
  const personalizationContext = profile ? `
# PERFIL DEL GUITARRISTA
- Nivel: ${formatLevel(profile.level)} (${formatExperience(profile.experienceValue, profile.experienceUnit)} de experiencia)
- Objetivo principal: ${profile.mainGoal}
${profile.currentChallenge ? `- Desafío actual: ${profile.currentChallenge}` : ''}
${profile.idealPracticeFrequency ? `- Frecuencia ideal: ${profile.idealPracticeFrequency} días por semana` : ''}
${profile.priorityTechniques ? `- Técnicas prioritarias: ${profile.priorityTechniques}` : ''}
${profile.additionalContext && Object.keys(profile.additionalContext).length > 0 ? `\n## Contexto Adicional\n${JSON.stringify(profile.additionalContext, null, 2)}\n*Considerá este contexto al dar recomendaciones.*` : ''}

**IMPORTANTE**:
- Todos tus insights deben estar alineados con el objetivo principal del guitarrista
- Si el análisis de datos muestra algo relevante al desafío actual, mencionalo específicamente
- Ajustá el nivel de complejidad de tus recomendaciones según el nivel de experiencia
- Usá el tono apropiado: ${TONE_GUIDELINES.beginner}
${profile.additionalContext && Object.keys(profile.additionalContext).length > 0 ? '- Tené en cuenta el contexto adicional del guitarrista al hacer recomendaciones' : ''}
` : `
**IMPORTANTE**:
- Como no hay perfil de usuario, brindá un análisis general pero útil
- Asumí nivel principiante para el tono y complejidad de recomendaciones
`;

  return `
Sos un coach de guitarra experto en práctica deliberada y Growth Mindset.

# CONTEXTO PEDAGÓGICO
${pedagogicalContext}

${personalizationContext}

# ANÁLISIS DE DATOS (Paso 1)
${dataJSON}

# TAREA
Generá insights personalizados en base al análisis de datos. El usuario solicitó estos tipos de análisis:
${analysisInstructions}

# FORMATO DE RESPUESTA
Devolvé tu respuesta en Markdown con esta estructura:

## 📊 Resumen de Datos
[Breve resumen de las métricas clave: sesiones totales, minutos, promedios]

## [Secciones según analysisTypes solicitados]
[Contenido personalizado para cada tipo de análisis pedido]

## 🎯 Próximos Pasos
[2-3 acciones concretas recomendadas]

# ESTILO DE COMUNICACIÓN
- Usá VOSEO ARGENTINO (vos, tenés, practicás, etc.)
- Lenguaje simple y directo
- Celebrá estrategias efectivas, no solo resultados
- Datos específicos > generalidades
- Tono motivador pero honesto
- Evitá jerga técnica avanzada

# REGLAS IMPORTANTES
1. Basá tus insights 100% en los datos reales del análisis
2. NO inventes datos o patrones que no existan
3. Si hay alertas críticas, mencionálas con claridad
4. Reforzá el mindset checklist cuando esté bien usado
5. Sugerí micro-experimentos concretos y accionables
6. Usá números específicos de las métricas

Generá el análisis ahora en Markdown:
`.trim();
}
