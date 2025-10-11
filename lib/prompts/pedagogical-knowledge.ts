// Conocimiento pedagógico base para análisis de práctica de guitarra
export const PEDAGOGICAL_PRINCIPLES = {
  beginner: {
    technical: `
- Desarrollo de velocidad: incrementos de 5-10 BPM cuando se logra 3-5 repeticiones perfectas
- Economía de movimiento: menos tensión = más velocidad y resistencia
- Construcción de memoria muscular: repeticiones correctas > velocidad
- Curva de progreso típica:
  * Días 1-14: Conexión cerebro-dedos, lento pero normal
  * Semanas 3-8: Mejora exponencial si hay práctica consistente
  * Mes 3+: Plateau natural, necesita variación de estrategias
    `.trim(),

    alerts: `
ALERTAS CRÍTICAS (detectar y advertir):
- Tensión muscular: dolor en mano, muñeca, antebrazo → STOP y revisar técnica
- Práctica mecánica sin intención: muchas sesiones sin reflexión o mindset checklist incompleto
- Velocidad prematura: BPM sube pero quality_rating baja → frenar y consolidar
- Falta de descansos: sesiones >30min sin "hice pausas" checked → riesgo de lesión

PATRONES POSITIVOS (reforzar):
- Calentar antes de practicar
- Practicar lento con metrónomo
- Grabarse para autocorrección
- Hacer pausas regularmente
- Revisar errores específicos
    `.trim()
  }
};

export const TONE_GUIDELINES = {
  beginner: 'Lenguaje simple, enfoque en fundamentos, evitar jerga técnica avanzada. Celebrar cada pequeño progreso.'
};

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export function getPedagogicalContext(level: ExperienceLevel = 'beginner'): string {
  // Por ahora solo implementamos 'beginner' para MVP
  const principles = PEDAGOGICAL_PRINCIPLES.beginner;
  return `${principles.technical}\n\n${principles.alerts}`;
}
