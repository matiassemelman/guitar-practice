/**
 * Funciones helper para trabajar con sesiones.
 *
 * Utilidades para formatear, transformar y calcular datos
 * relacionados con sesiones de práctica.
 */

import type {
  Session,
  MindsetChecklist,
  TechnicalFocus,
  SessionStats,
  BPMDataPoint,
} from '../types/session';

/**
 * Formatea una fecha ISO 8601 a un string legible.
 * @example formatDate('2025-10-08T15:30:00Z') => 'Oct 8, 2025'
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha ISO 8601 a un string de fecha y hora legible.
 * @example formatDateTime('2025-10-08T15:30:00Z') => 'Oct 8, 2025 3:30 PM'
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatea una fecha ISO 8601 a un string de tiempo relativo.
 * @example formatRelativeTime('2025-10-08T15:30:00Z') => 'hace 2 horas'
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'hace unos segundos';
  } else if (diffMins < 60) {
    return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(isoDate);
  }
}

/**
 * Formatea una duración en minutos a un string legible.
 * @example formatDuration(45) => '45 min'
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

/**
 * Calcula cuántos elementos del checklist de mindset están completos.
 */
export function countCompletedMindsetItems(
  checklist: MindsetChecklist | null | undefined
): number {
  if (!checklist) return 0;

  return Object.values(checklist).filter((value) => value === true).length;
}

/**
 * Calcula el porcentaje de completitud del checklist de mindset.
 */
export function getMindsetCompletionPercentage(
  checklist: MindsetChecklist | null | undefined
): number {
  const total = 5; // Total de items en el checklist
  const completed = countCompletedMindsetItems(checklist);
  return Math.round((completed / total) * 100);
}

/**
 * Obtiene el emoji correspondiente a una calificación de calidad (1-5).
 */
export function getQualityEmoji(rating: number | null | undefined): string {
  if (!rating) return '⭐';

  const emojis = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
  return emojis[rating - 1] || '⭐';
}

/**
 * Obtiene el emoji correspondiente al nivel de esfuerzo RPE (1-10).
 */
export function getRPEEmoji(rpe: number | null | undefined): string {
  if (!rpe) return '💪';

  if (rpe <= 3) return '😌'; // Fácil
  if (rpe <= 6) return '💪'; // Moderado
  if (rpe <= 8) return '😤'; // Difícil
  return '🔥'; // Muy difícil
}

/**
 * Obtiene el emoji correspondiente a un foco técnico.
 */
export function getTechnicalFocusEmoji(focus: TechnicalFocus): string {
  const emojiMap: Record<TechnicalFocus, string> = {
    Técnica: '🎸',
    Ritmo: '🥁',
    Limpieza: '✨',
    Coordinación: '🤝',
    Repertorio: '📚',
  };

  return emojiMap[focus] || '🎸';
}

/**
 * Obtiene un color CSS correspondiente a un foco técnico.
 */
export function getTechnicalFocusColor(focus: TechnicalFocus): string {
  const colorMap: Record<TechnicalFocus, string> = {
    Técnica: 'bg-blue-100 text-blue-800',
    Ritmo: 'bg-purple-100 text-purple-800',
    Limpieza: 'bg-green-100 text-green-800',
    Coordinación: 'bg-yellow-100 text-yellow-800',
    Repertorio: 'bg-pink-100 text-pink-800',
  };

  return colorMap[focus] || 'bg-gray-100 text-gray-800';
}

/**
 * Calcula si una sesión tuvo progreso en BPM (achieved >= target).
 */
export function hadBPMProgress(session: Session): boolean {
  if (!session.bpmTarget || !session.bpmAchieved) return false;
  return session.bpmAchieved >= session.bpmTarget;
}

/**
 * Calcula el porcentaje de logro de BPM (achieved / target * 100).
 */
export function getBPMProgressPercentage(session: Session): number | null {
  if (!session.bpmTarget || !session.bpmAchieved) return null;
  return Math.round((session.bpmAchieved / session.bpmTarget) * 100);
}

/**
 * Determina si una sesión fue de alta calidad (4-5 estrellas).
 */
export function isHighQualitySession(session: Session): boolean {
  return session.qualityRating !== null && session.qualityRating !== undefined && session.qualityRating >= 4;
}

/**
 * Calcula un "score" general de la sesión basado en múltiples factores.
 * Retorna un valor entre 0 y 100.
 */
export function calculateSessionScore(session: Session): number {
  let score = 0;
  let factors = 0;

  // Factor 1: Calidad (peso: 30%)
  if (session.qualityRating) {
    score += (session.qualityRating / 5) * 30;
    factors++;
  }

  // Factor 2: BPM Progress (peso: 25%)
  const bpmProgress = getBPMProgressPercentage(session);
  if (bpmProgress !== null) {
    score += Math.min(bpmProgress / 100, 1) * 25;
    factors++;
  }

  // Factor 3: Tomas perfectas (peso: 20%)
  if (session.perfectTakes !== null && session.perfectTakes !== undefined) {
    score += (session.perfectTakes / 3) * 20;
    factors++;
  }

  // Factor 4: Mindset checklist (peso: 25%)
  if (session.mindsetChecklist) {
    const mindsetPercent = getMindsetCompletionPercentage(session.mindsetChecklist);
    score += (mindsetPercent / 100) * 25;
    factors++;
  }

  // Si no hay factores, retornar 0
  if (factors === 0) return 0;

  return Math.round(score);
}

/**
 * Agrupa sesiones por fecha (día).
 */
export function groupSessionsByDate(
  sessions: Session[]
): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();

  for (const session of sessions) {
    const date = formatDate(session.createdAt);
    const existing = grouped.get(date) || [];
    grouped.set(date, [...existing, session]);
  }

  return grouped;
}

/**
 * Calcula el total de minutos de práctica de un array de sesiones.
 */
export function calculateTotalMinutes(sessions: Session[]): number {
  return sessions.reduce((total, session) => total + session.durationMin, 0);
}

/**
 * Calcula la calidad promedio de un array de sesiones.
 */
export function calculateAverageQuality(sessions: Session[]): number | null {
  const sessionsWithQuality = sessions.filter(
    (s) => s.qualityRating !== null && s.qualityRating !== undefined
  );

  if (sessionsWithQuality.length === 0) return null;

  const sum = sessionsWithQuality.reduce(
    (total, s) => total + (s.qualityRating || 0),
    0
  );

  return sum / sessionsWithQuality.length;
}

/**
 * Extrae datos de BPM de un array de sesiones para graficar.
 */
export function extractBPMData(sessions: Session[]): BPMDataPoint[] {
  return sessions
    .filter((s) => s.bpmTarget || s.bpmAchieved)
    .map((s) => ({
      date: s.createdAt,
      target: s.bpmTarget || null,
      achieved: s.bpmAchieved || null,
      microObjective: s.microObjective,
    }));
}

/**
 * Filtra sesiones por un rango de fechas.
 */
export function filterSessionsByDateRange(
  sessions: Session[],
  dateFrom: string,
  dateTo: string
): Session[] {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  return sessions.filter((session) => {
    const sessionDate = new Date(session.createdAt);
    return sessionDate >= from && sessionDate <= to;
  });
}

/**
 * Obtiene las sesiones de la última semana.
 */
export function getWeeklySessions(sessions: Session[]): Session[] {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  return sessions.filter((session) => {
    const sessionDate = new Date(session.createdAt);
    return sessionDate >= weekAgo;
  });
}

/**
 * Calcula la racha actual de días con práctica.
 * Retorna el número de días consecutivos (contando desde hoy hacia atrás).
 */
export function calculateCurrentStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;

  // Ordenar sesiones por fecha descendente
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Obtener días únicos con práctica
  const uniqueDays = new Set<string>();
  for (const session of sorted) {
    const date = new Date(session.createdAt);
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    uniqueDays.add(dayKey);
  }

  const daysArray = Array.from(uniqueDays).map((key) => {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month, day);
  });

  // Ordenar días descendentemente
  daysArray.sort((a, b) => b.getTime() - a.getTime());

  // Verificar si hay práctica hoy o ayer (la racha puede continuar)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDay = daysArray[0];
  if (mostRecentDay < yesterday) {
    return 0; // La racha se rompió
  }

  // Contar días consecutivos
  let streak = 1;
  for (let i = 1; i < daysArray.length; i++) {
    const current = daysArray[i];
    const previous = daysArray[i - 1];
    const diffDays = Math.floor(
      (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Obtiene un resumen de stats básicas de un array de sesiones.
 */
export function calculateBasicStats(sessions: Session[]): SessionStats {
  const weeklySessions = getWeeklySessions(sessions);

  return {
    currentStreak: calculateCurrentStreak(sessions),
    weeklyMinutes: calculateTotalMinutes(weeklySessions),
    weeklyAverageQuality: calculateAverageQuality(weeklySessions),
    weeklySessionCount: weeklySessions.length,
    totalSessions: sessions.length,
    totalMinutes: calculateTotalMinutes(sessions),
  };
}
