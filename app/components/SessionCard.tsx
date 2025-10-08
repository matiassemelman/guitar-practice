/**
 * Componente SessionCard - Tarjeta compacta para mostrar una sesión de práctica.
 *
 * Muestra el objetivo micro, foco técnico, duración, métricas y reflexión
 * de una sesión en un formato visual limpio y legible.
 */

import type { SessionCardProps } from '@/types';
import { formatRelativeDate } from '@/lib/date-utils';

/**
 * Mapeo de foco técnico a colores de badge.
 */
const FOCUS_COLORS: Record<string, string> = {
  'Técnica': 'bg-blue-100 text-blue-800',
  'Ritmo': 'bg-purple-100 text-purple-800',
  'Limpieza': 'bg-green-100 text-green-800',
  'Coordinación': 'bg-orange-100 text-orange-800',
  'Repertorio': 'bg-pink-100 text-pink-800',
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
  const badgeColor = FOCUS_COLORS[session.technicalFocus] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header: Fecha y foco técnico */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-gray-500">
          {formatRelativeDate(session.createdAt)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
          {session.technicalFocus}
        </span>
      </div>

      {/* Objetivo micro (destacado) */}
      <h3 className="text-base font-semibold text-gray-900 mb-3 leading-snug">
        {session.microObjective}
      </h3>

      {/* Duración y métricas */}
      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
        {/* Duración */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400">⏱</span>
          <span>{session.durationMin} min</span>
        </div>

        {/* BPM */}
        {(session.bpmTarget || session.bpmAchieved) && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">♪</span>
            <span>
              {session.bpmTarget && `${session.bpmTarget} bpm`}
              {session.bpmTarget && session.bpmAchieved && ' → '}
              {session.bpmAchieved && (
                <span className={session.bpmAchieved >= (session.bpmTarget || 0)
                  ? 'text-green-600 font-medium'
                  : 'text-orange-600'}>
                  {session.bpmAchieved} bpm
                </span>
              )}
            </span>
          </div>
        )}

        {/* Tomas perfectas */}
        {session.perfectTakes !== null && session.perfectTakes !== undefined && session.perfectTakes > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400">✓</span>
            <span>{session.perfectTakes}/3 tomas</span>
          </div>
        )}

        {/* Calidad */}
        {session.qualityRating && session.qualityRating > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 text-xs">
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
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-700 italic">
            &ldquo;{session.reflection}&rdquo;
          </p>
        </div>
      )}

      {/* Mindset checklist (si existe y tiene items marcados) */}
      {session.mindsetChecklist && Object.values(session.mindsetChecklist).some(v => v) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {session.mindsetChecklist.warmedUp && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                Calentó
              </span>
            )}
            {session.mindsetChecklist.practicedSlow && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                Lento
              </span>
            )}
            {session.mindsetChecklist.recorded && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                Grabación
              </span>
            )}
            {session.mindsetChecklist.tookBreaks && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                Pausas
              </span>
            )}
            {session.mindsetChecklist.reviewedMistakes && (
              <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                Revisó errores
              </span>
            )}
          </div>
        </div>
      )}

      {/* Acciones (edit/delete) - si se proporcionan handlers */}
      {(onEdit || onDelete) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(session)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(session.id)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
