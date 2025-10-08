/**
 * Componente SessionCard - Tarjeta compacta para mostrar una sesión de práctica.
 *
 * Muestra el objetivo micro, foco técnico, duración, métricas y reflexión
 * de una sesión en un formato visual limpio y legible.
 */

import type { SessionCardProps } from '@/types';
import { formatRelativeDate } from '@/lib/date-utils';

/**
 * Mapeo de foco técnico a colores de badge (Cyberpunk theme).
 */
const FOCUS_COLORS: Record<string, string> = {
  'Técnica': 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50',
  'Ritmo': 'bg-neon-purple/20 text-neon-purple border-neon-purple/50',
  'Limpieza': 'bg-neon-green/20 text-neon-green border-neon-green/50',
  'Coordinación': 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50',
  'Repertorio': 'bg-neon-pink/20 text-neon-pink border-neon-pink/50',
};

/**
 * Renderiza estrellas visuales para quality rating.
 */
function renderStars(rating: number): string {
  const fullStars = '★'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return fullStars + emptyStars;
}

/**
 * Componente SessionCard.
 * Tarjeta compacta que muestra los detalles de una sesión de práctica.
 */
export default function SessionCard({
  session,
  onEdit,
  onDelete,
  compact = true
}: SessionCardProps) {
  const badgeColor = FOCUS_COLORS[session.technicalFocus] || 'bg-gray-700/50 text-gray-300 border-gray-600';

  return (
    <div className="glass-card rounded-lg p-4 hover:glow-magenta transition-all duration-300">
      {/* Header: Fecha y foco técnico */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-gray-400">
          {formatRelativeDate(session.createdAt)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
          {session.technicalFocus}
        </span>
      </div>

      {/* Objetivo micro (destacado) */}
      <h3 className="text-base font-semibold text-gray-100 mb-3 leading-snug">
        {session.microObjective}
      </h3>

      {/* Duración y métricas */}
      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-300">
        {/* Duración */}
        <div className="flex items-center gap-1">
          <span className="text-neon-cyan">⏱</span>
          <span>{session.durationMin} min</span>
        </div>

        {/* BPM */}
        {(session.bpmTarget || session.bpmAchieved) && (
          <div className="flex items-center gap-1">
            <span className="text-neon-magenta">♪</span>
            <span>
              {session.bpmTarget && `${session.bpmTarget} bpm`}
              {session.bpmTarget && session.bpmAchieved && ' → '}
              {session.bpmAchieved && (
                <span className={session.bpmAchieved >= (session.bpmTarget || 0)
                  ? 'text-neon-green font-medium'
                  : 'text-neon-yellow'}>
                  {session.bpmAchieved} bpm
                </span>
              )}
            </span>
          </div>
        )}

        {/* Calidad */}
        {session.qualityRating && session.qualityRating > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-neon-yellow text-xs">
              {renderStars(session.qualityRating)}
            </span>
          </div>
        )}

        {/* RPE */}
        {session.rpe && session.rpe > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">RPE</span>
            <span>{session.rpe}/10</span>
          </div>
        )}
      </div>

      {/* Reflexión (si existe) */}
      {session.reflection && session.reflection.trim() && (
        <div className="mt-3 pt-3 border-t border-neon-magenta/30">
          <p className="text-sm text-gray-300 italic">
            &ldquo;{session.reflection}&rdquo;
          </p>
        </div>
      )}

      {/* Mindset checklist (si existe y tiene items marcados) */}
      {session.mindsetChecklist && Object.values(session.mindsetChecklist).some(v => v) && (
        <div className="mt-3 pt-3 border-t border-neon-cyan/30">
          <div className="flex flex-wrap gap-2">
            {session.mindsetChecklist.warmedUp && (
              <span className="text-xs bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 px-2 py-1 rounded">
                Calentó
              </span>
            )}
            {session.mindsetChecklist.practicedSlow && (
              <span className="text-xs bg-neon-green/10 text-neon-green border border-neon-green/50 px-2 py-1 rounded">
                Lento
              </span>
            )}
            {session.mindsetChecklist.recorded && (
              <span className="text-xs bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/50 px-2 py-1 rounded">
                Grabación
              </span>
            )}
            {session.mindsetChecklist.tookBreaks && (
              <span className="text-xs bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/50 px-2 py-1 rounded">
                Pausas
              </span>
            )}
            {session.mindsetChecklist.reviewedMistakes && (
              <span className="text-xs bg-neon-pink/10 text-neon-pink border border-neon-pink/50 px-2 py-1 rounded">
                Revisó errores
              </span>
            )}
          </div>
        </div>
      )}

      {/* Acciones (edit/delete) - si se proporcionan handlers */}
      {(onEdit || onDelete) && (
        <div className="mt-3 pt-3 border-t border-neon-magenta/30 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(session)}
              className="text-sm text-neon-cyan hover:text-neon-magenta font-medium transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(session.id)}
              className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
