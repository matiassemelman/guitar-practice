/**
 * Componente SessionsList - Lista de sesiones en orden cronológico inverso.
 *
 * Muestra todas las sesiones en formato de timeline, con la más reciente arriba.
 * Incluye estados de loading y mensaje cuando no hay sesiones.
 */

'use client';

import type { SessionsListProps } from '@/types';
import SessionCard from './SessionCard';

/**
 * Skeleton loader para una tarjeta de sesión.
 */
function SessionCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
      <div className="flex gap-3">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

/**
 * Componente de estado vacío con mensaje motivador.
 */
function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">🎸</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message || '¡Comienza tu práctica deliberada!'}
      </h3>
      <p className="text-gray-600 max-w-md">
        Cada sesión es una oportunidad para crecer. Registra tu primera práctica
        y comienza a construir tu racha de progreso.
      </p>
      <div className="mt-6 text-sm text-gray-500 space-y-1">
        <p>💡 Define un objetivo micro específico</p>
        <p>🎯 Enfócate en calidad, no cantidad</p>
        <p>📈 Celebra cada pequeña mejora</p>
      </div>
    </div>
  );
}

/**
 * Componente SessionsList.
 * Muestra una lista de sesiones en orden cronológico inverso (más reciente arriba).
 */
export default function SessionsList({
  sessions,
  loading = false,
  emptyMessage,
  onSessionEdit,
  onSessionDelete,
}: SessionsListProps) {
  // Estado de loading
  if (loading) {
    return (
      <div className="space-y-4">
        <SessionCardSkeleton />
        <SessionCardSkeleton />
        <SessionCardSkeleton />
      </div>
    );
  }

  // Estado vacío
  if (!sessions || sessions.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  // Lista de sesiones
  return (
    <div className="space-y-4">
      {/* Header opcional con contador */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Timeline de Práctica
        </h2>
        <span className="text-sm text-gray-500">
          {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
        </span>
      </div>

      {/* Timeline de tarjetas */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onEdit={onSessionEdit}
            onDelete={onSessionDelete}
            compact={true}
          />
        ))}
      </div>

      {/* Footer motivador */}
      {sessions.length >= 5 && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            🔥 ¡{sessions.length} sesiones registradas! Cada práctica te acerca a tu objetivo.
          </p>
        </div>
      )}
    </div>
  );
}
