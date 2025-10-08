/**
 * Componente StatsPanel - Panel de estadísticas motivadoras.
 *
 * Muestra 3 métricas clave en formato horizontal de dashboard:
 * 1. Racha de días consecutivos (últimos 7 días)
 * 2. Minutos practicados esta semana
 * 3. Calidad promedio (estrellas visuales)
 */

'use client';

import { useEffect, useState } from 'react';
import type { SessionStats } from '@/types';
import type { StatsPanelProps } from '@/types';

/**
 * Renderiza estrellas visuales para calidad promedio.
 */
function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <span className="text-yellow-500">
      {'★'.repeat(fullStars)}
      {hasHalfStar && '⯨'}
      {'☆'.repeat(emptyStars)}
    </span>
  );
}

/**
 * Skeleton loader para una métrica.
 */
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-16"></div>
    </div>
  );
}

/**
 * Componente de una tarjeta de métrica individual.
 */
interface StatCardProps {
  label: string;
  value: string | number;
  emoji: string;
  subtext?: string;
  color?: string;
  customContent?: React.ReactNode;
}

function StatCard({ label, value, emoji, subtext, color = 'text-gray-900', customContent }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-2xl">{emoji}</span>
      </div>
      {customContent ? (
        customContent
      ) : (
        <>
          <div className={`text-3xl font-bold ${color} mb-1`}>
            {value}
          </div>
          {subtext && (
            <div className="text-xs text-gray-500">
              {subtext}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Componente StatsPanel.
 * Panel horizontal con 3 métricas clave de motivación y progreso.
 */
export default function StatsPanel({ stats: initialStats, loading: initialLoading = false }: StatsPanelProps) {
  const [stats, setStats] = useState<SessionStats | null>(initialStats ?? null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  // Fetch de stats si no se pasan como prop
  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [initialStats]);

  async function fetchStats() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stats');

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
      } else {
        throw new Error(data.error?.message || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }

  // Estado de loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-sm text-red-800">
          {error}
        </p>
        <button
          onClick={fetchStats}
          className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Estado sin datos
  if (!stats) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-600">
          No hay estadísticas disponibles aún.
        </p>
      </div>
    );
  }

  // Cálculo de color de racha
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-orange-600';
    return 'text-gray-900';
  };

  // Cálculo de texto de minutos
  const getMinutesSubtext = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours >= 2) {
      return `${hours}h ${minutes % 60}min esta semana`;
    }
    return 'esta semana';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Tu Progreso
        </h2>
        <p className="text-sm text-gray-600">
          Celebrando cada paso en tu camino de práctica deliberada
        </p>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Racha de días */}
        <StatCard
          label="Racha de días"
          value={stats.currentStreak}
          emoji="🔥"
          subtext={stats.currentStreak === 1 ? 'día consecutivo' : 'días consecutivos'}
          color={getStreakColor(stats.currentStreak)}
        />

        {/* Minutos esta semana */}
        <StatCard
          label="Minutos practicados"
          value={stats.weeklyMinutes}
          emoji="⏱️"
          subtext={getMinutesSubtext(stats.weeklyMinutes)}
          color="text-blue-600"
        />

        {/* Calidad promedio */}
        <StatCard
          label="Calidad promedio"
          value=""
          emoji="⭐"
          customContent={
            stats.weeklyAverageQuality && stats.weeklyAverageQuality > 0 ? (
              <div>
                <div className="text-2xl mb-1">
                  {renderStars(stats.weeklyAverageQuality)}
                </div>
                <div className="text-sm text-gray-600">
                  {stats.weeklyAverageQuality.toFixed(1)}/5.0 esta semana
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Sin datos de calidad esta semana
              </div>
            )
          }
        />
      </div>

      {/* Stats adicionales (compactas) */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalSessions}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Sesiones totales
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Tiempo total
          </div>
        </div>
      </div>

      {/* Mensaje motivador basado en stats */}
      {stats.currentStreak >= 3 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-sm text-green-800">
            🎉 ¡Excelente racha de {stats.currentStreak} días! La consistencia es la clave del progreso.
          </p>
        </div>
      )}

      {stats.weeklyMinutes >= 120 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-800">
            💪 ¡{stats.weeklyMinutes} minutos esta semana! Tu dedicación está dando frutos.
          </p>
        </div>
      )}
    </div>
  );
}
