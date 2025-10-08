/**
 * Utilidades para formateo de fechas.
 *
 * Funciones helper para mostrar fechas en formatos amigables
 * y relativos al tiempo actual.
 */

/**
 * Formatea una fecha ISO a formato relativo amigable.
 *
 * Ejemplos de output:
 * - "Ahora" (menos de 1 min)
 * - "Hace 5 min" (menos de 1 hora)
 * - "Hace 3h" (menos de 24 horas)
 * - "Hoy 14:30" (hoy)
 * - "Ayer 09:15" (ayer)
 * - "Lun 10:00" (última semana)
 * - "15 Mar" (más antiguo)
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns String formateado de manera amigable
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  // Menos de 1 minuto
  if (diffMins < 1) return 'Ahora';

  // Menos de 1 hora
  if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  }

  // Menos de 24 horas
  if (diffHours < 24) {
    return `Hace ${diffHours}h`;
  }

  // Calcular días de diferencia
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / 86400000);

  const timeStr = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  // Hoy
  if (daysDiff === 0) return `Hoy ${timeStr}`;

  // Ayer
  if (daysDiff === 1) return `Ayer ${timeStr}`;

  // Última semana (2-6 días)
  if (daysDiff < 7) {
    const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${timeStr}`;
  }

  // Más antiguo - solo fecha
  const monthStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return monthStr;
}

/**
 * Formatea una fecha ISO a formato completo legible.
 *
 * Ejemplo: "Lunes, 15 de marzo de 2024 a las 14:30"
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns String formateado completo
 */
export function formatFullDate(isoDate: string): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Formatea una fecha ISO a formato corto.
 *
 * Ejemplo: "15/03/2024"
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns String formateado corto
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formatea solo la hora de una fecha ISO.
 *
 * Ejemplo: "14:30"
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns String con hora formateada
 */
export function formatTime(isoDate: string): string {
  const date = new Date(isoDate);

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Calcula la diferencia en días entre una fecha y ahora.
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns Número de días de diferencia (negativo si es futuro)
 */
export function daysSince(isoDate: string): number {
  const date = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.floor((today.getTime() - targetDate.getTime()) / 86400000);
}

/**
 * Verifica si una fecha es de hoy.
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns true si la fecha es de hoy
 */
export function isToday(isoDate: string): boolean {
  return daysSince(isoDate) === 0;
}

/**
 * Verifica si una fecha es de ayer.
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @returns true si la fecha es de ayer
 */
export function isYesterday(isoDate: string): boolean {
  return daysSince(isoDate) === 1;
}

/**
 * Verifica si una fecha está dentro de los últimos N días.
 *
 * @param isoDate - Fecha en formato ISO 8601 string
 * @param days - Número de días hacia atrás
 * @returns true si está dentro del rango
 */
export function isWithinDays(isoDate: string, days: number): boolean {
  const diff = daysSince(isoDate);
  return diff >= 0 && diff < days;
}

/**
 * Obtiene el inicio del día actual (00:00:00).
 *
 * @returns Date object del inicio del día actual
 */
export function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Obtiene el inicio de la semana actual (Lunes 00:00:00).
 *
 * @returns Date object del inicio de la semana actual
 */
export function getStartOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lunes = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Obtiene el inicio del mes actual (día 1 00:00:00).
 *
 * @returns Date object del inicio del mes actual
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
