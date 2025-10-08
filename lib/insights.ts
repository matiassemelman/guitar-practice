/**
 * Generador de insights motivacionales basados en Growth Mindset + Kaizen.
 *
 * Estas funciones analizan una sesión guardada y generan mensajes
 * que celebran estrategias efectivas y sugieren micro-mejoras.
 */

import type { Session, CreateSessionInput } from '../types/session';
import {
  hadBPMProgress,
  countCompletedMindsetItems,
  isHighQualitySession,
} from './session-helpers';

/**
 * Tipo de insight basado en el aspecto destacado de la sesión.
 */
export type InsightType =
  | 'bpm_progress'
  | 'high_quality'
  | 'mindset_complete'
  | 'consistency'
  | 'slow_practice'
  | 'self_recording'
  | 'error_review'
  | 'effort_management'
  | 'general_encouragement';

/**
 * Estructura de un insight generado.
 */
export interface Insight {
  type: InsightType;
  message: string;
  kaizen?: string; // Sugerencia de micro-mejora para la próxima sesión
}

/**
 * Genera un insight motivacional basado en una sesión recién guardada.
 * Prioriza celebrar estrategias efectivas sobre resultados puros.
 */
export function generateInsight(input: CreateSessionInput): Insight {
  // Estrategia 1: Checklist de mindset completo (máxima prioridad)
  if (input.mindsetChecklist) {
    const completedItems = countCompletedMindsetItems(input.mindsetChecklist);

    if (completedItems === 5) {
      return {
        type: 'mindset_complete',
        message: '¡Práctica deliberada perfecta! Usaste todas las estrategias clave.',
        kaizen: 'Intenta mantener esta consistencia en la próxima sesión.',
      };
    }

    // Celebrar prácticas específicas efectivas
    if (input.mindsetChecklist.practicedSlow) {
      return {
        type: 'slow_practice',
        message: '¡Excelente decisión practicar lento! La velocidad llegará con la precisión.',
        kaizen: 'En la próxima sesión, intenta grabarte para detectar detalles que no notas en vivo.',
      };
    }

    if (input.mindsetChecklist.recorded) {
      return {
        type: 'self_recording',
        message: '¡Gran estrategia grabarte! La auto-observación es clave para mejorar.',
        kaizen: 'Al revisar la grabación, enfócate en UN aspecto específico a mejorar.',
      };
    }

    if (input.mindsetChecklist.reviewedMistakes) {
      return {
        type: 'error_review',
        message: '¡Perfecto! Revisar errores es lo que separa la práctica común de la deliberada.',
        kaizen: 'Identifica el patrón del error más frecuente y crea un micro-ejercicio para corregirlo.',
      };
    }
  }

  // Estrategia 2: Progreso en BPM (alcanzó o superó el objetivo)
  if (input.bpmTarget && input.bpmAchieved) {
    if (input.bpmAchieved >= input.bpmTarget) {
      const percentage = Math.round((input.bpmAchieved / input.bpmTarget) * 100);
      return {
        type: 'bpm_progress',
        message: `¡Objetivo alcanzado! (${percentage}% del target). Tu estrategia de práctica está funcionando.`,
        kaizen: 'Antes de subir BPM, consolida este nivel con 3 tomas perfectas consecutivas.',
      };
    }
  }

  // Estrategia 3: Alta calidad (4-5 estrellas)
  if (input.qualityRating && input.qualityRating >= 4) {
    return {
      type: 'high_quality',
      message: `¡Calidad excelente! (${input.qualityRating}★) Estás desarrollando estándares altos.`,
      kaizen: 'Para la próxima, establece un objetivo micro aún más específico.',
    };
  }

  // Estrategia 4: Manejo de esfuerzo (RPE moderado = práctica sostenible)
  if (input.rpe && input.rpe >= 4 && input.rpe <= 7) {
    return {
      type: 'effort_management',
      message: 'RPE en zona óptima. Estás practicando con esfuerzo desafiante pero sostenible.',
      kaizen: 'Mantén este nivel de esfuerzo para practicar de forma consistente sin burnout.',
    };
  }

  // Estrategia 6: Duración apropiada
  if (input.durationMin >= 20 && input.durationMin <= 45) {
    return {
      type: 'consistency',
      message: 'Duración ideal para práctica enfocada. La calidad supera a la cantidad.',
      kaizen: 'En la próxima sesión, divide el tiempo en bloques de 10 min con micro-pausas.',
    };
  }

  // Fallback: Mensaje general de aliento
  return {
    type: 'general_encouragement',
    message: '¡Sesión registrada! Cada repetición intencional te acerca a tu objetivo.',
    kaizen: 'Para la próxima: elige UNA estrategia del checklist de mindset y aplícala.',
  };
}

/**
 * Genera un insight "Kaizen del día" basado en múltiples sesiones recientes.
 * Identifica patrones y sugiere micro-experimentos.
 */
export function generateKaizenSuggestion(recentSessions: Session[]): string {
  if (recentSessions.length === 0) {
    return 'Comienza con sesiones cortas (20 min) y un objetivo micro específico.';
  }

  // Analizar patrones en las últimas sesiones
  const totalMindsetItems = recentSessions.reduce((sum, session) => {
    return sum + countCompletedMindsetItems(session.mindsetChecklist);
  }, 0);

  const avgMindsetItems = totalMindsetItems / recentSessions.length;

  // Si el checklist de mindset es bajo, sugerir mejora
  if (avgMindsetItems < 2) {
    return 'Micro-experimento: En tu próxima sesión, prueba practicar lento (50% del tempo objetivo) durante 10 minutos.';
  }

  // Si no se graban, sugerir grabación
  const recordingSessions = recentSessions.filter(
    (s) => s.mindsetChecklist?.recorded
  ).length;
  if (recordingSessions === 0) {
    return 'Micro-experimento: Graba solo 2 minutos de tu próxima práctica y escúchala con ojos cerrados.';
  }

  // Si no revisan errores, sugerir análisis
  const errorReviewSessions = recentSessions.filter(
    (s) => s.mindsetChecklist?.reviewedMistakes
  ).length;
  if (errorReviewSessions < recentSessions.length / 2) {
    return 'Micro-experimento: Identifica tu error #1 más frecuente y crea un ejercicio de 5 min para corregirlo.';
  }

  // Si no tienen progreso claro en BPM
  const bpmSessions = recentSessions.filter((s) => s.bpmTarget && s.bpmAchieved);
  if (bpmSessions.length > 0) {
    const progressSessions = bpmSessions.filter(hadBPMProgress).length;
    const progressRate = progressSessions / bpmSessions.length;

    if (progressRate < 0.5) {
      return 'Micro-experimento: Reduce tu BPM objetivo en 10-20% y enfócate en 3 tomas perfectas antes de subir tempo.';
    }
  }

  // Si todo está bien, sugerir refinamiento
  return 'Micro-experimento: Elige el aspecto más débil de tu ejecución y dedica 10 min solo a eso en la próxima sesión.';
}

/**
 * Genera mensajes de celebración para hitos específicos.
 */
export function generateMilestoneMessage(
  milestone: 'first_session' | 'streak_7' | 'streak_30' | 'total_hours_10' | 'total_hours_50'
): string {
  const messages: Record<typeof milestone, string> = {
    first_session: '¡Primera sesión registrada! El viaje de 10,000 horas comienza con una repetición intencional.',
    streak_7: '🔥 ¡7 días de práctica consecutiva! Estás construyendo un hábito sólido.',
    streak_30: '🔥🔥 ¡30 días de racha! La consistencia es la clave del progreso compuesto.',
    total_hours_10: '⏱️ ¡10 horas de práctica deliberada! Cada minuto cuenta cuando es intencional.',
    total_hours_50: '⏱️ ¡50 horas de práctica deliberada! Estás en el camino hacia la maestría.',
  };

  return messages[milestone];
}

/**
 * Analiza una sesión y retorna el aspecto más destacado para celebrar.
 */
export function identifyHighlight(input: CreateSessionInput): InsightType {
  const insight = generateInsight(input);
  return insight.type;
}

/**
 * Genera un mensaje de reflexión semanal con 2 preguntas Kaizen.
 */
export function generateWeeklyReflection(): {
  question1: string;
  question2: string;
} {
  return {
    question1: '¿Qué estrategia de práctica funcionó mejor esta semana?',
    question2: '¿Qué micro-experimento probarás en la próxima semana?',
  };
}

/**
 * Genera sugerencias de objetivos micro basados en patrones comunes.
 */
export const OBJECTIVE_TEMPLATES: string[] = [
  'Cambio limpio de C a G a 60 bpm',
  'Escala pentatónica menor en 3 cuerdas a 80 bpm',
  'Patrón de fingerpicking Travis a 70 bpm sin errores',
  'Acorde de F con cejilla limpio (5 notas sonando)',
  'Hammer-on y pull-off en 1ª y 2ª cuerda a 100 bpm',
  'Ritmo de strumming con palm mute a 120 bpm',
  'Transición G → D → Em → C sin pausas',
  'Solo de [canción] compases 1-4 a 60% tempo',
  'Arpeggio de Am con alternate picking a 90 bpm',
  'Bend de tono completo (2nd fret, 3ª cuerda) afinado',
];

/**
 * Filtra sugerencias de objetivos basadas en el foco técnico seleccionado.
 */
export function filterObjectiveSuggestions(
  technicalFocus: string,
  searchTerm: string = ''
): string[] {
  let filtered = OBJECTIVE_TEMPLATES;

  // Filtrar por foco técnico (en el futuro, con más templates)
  // Por ahora retornamos todas

  // Filtrar por término de búsqueda
  if (searchTerm.length >= 2) {
    filtered = filtered.filter((objective) =>
      objective.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  return filtered;
}
