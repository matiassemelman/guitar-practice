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
    <span className="text-neon-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.6)]">
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
    <div className="glass-card rounded-2xl p-4 animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
      <div className="h-8 bg-gray-600 rounded w-16"></div>
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

function StatCard({ label, value, emoji, subtext, color = 'text-gray-100', customContent }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 hover:glow-cyan transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-400">{label}</span>
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
            <div className="text-xs text-gray-400">
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
export default function StatsPanel({
  stats: initialStats,
  loading: initialLoading = false,
  onRequestAIAnalysis
}: StatsPanelProps) {
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
      <div className="glass-card border-red-500/50 rounded-2xl p-4 text-center">
        <p className="text-sm text-red-400">
          {error}
        </p>
        <button
          onClick={fetchStats}
          className="mt-2 text-sm text-red-400 hover:text-red-500 font-medium underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Estado sin datos
  if (!stats) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-300">
          No hay estadísticas disponibles aún.
        </p>
      </div>
    );
  }

  // Cálculo de color de racha
  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-neon-green';
    if (streak >= 3) return 'text-neon-yellow';
    return 'text-gray-100';
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
        <h2 className="text-lg font-semibold text-gray-100">
          Tu Progreso
        </h2>
        <p className="text-sm text-gray-300">
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
          color="text-neon-cyan"
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
                <div className="text-sm text-gray-300">
                  {stats.weeklyAverageQuality.toFixed(1)}/5.0 esta semana
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                Sin datos de calidad esta semana
              </div>
            )
          }
        />
      </div>

      {/* Stats adicionales (compactas) */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="glass-card rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-100">
            {stats.totalSessions}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Sesiones totales
          </div>
        </div>
        <div className="glass-card rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-100">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Tiempo total
          </div>
        </div>
      </div>

      {/* Mensaje motivador basado en stats */}
      {stats.currentStreak >= 3 && (
        <div className="mt-4 glass-card border-neon-green/50 rounded-lg p-3 text-center">
          <p className="text-sm text-green-300">
            🎉 ¡Excelente racha de {stats.currentStreak} días! La consistencia es la clave del progreso.
          </p>
        </div>
      )}

      {stats.weeklyMinutes >= 120 && (
        <div className="mt-4 glass-card border-neon-cyan/50 rounded-lg p-3 text-center">
          <p className="text-sm text-cyan-300">
            💪 ¡{stats.weeklyMinutes} minutos esta semana! Tu dedicación está dando frutos.
          </p>
        </div>
      )}

      {/* AI Analysis Button */}
      {onRequestAIAnalysis && (
        <div className="mt-6 pt-6 border-t border-neon-magenta/30">
          <button
            onClick={onRequestAIAnalysis}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-neon-purple via-neon-magenta to-neon-pink text-white font-bold hover:glow-magenta hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🤖</span>
            <span>Análisis Inteligente con IA</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Pedí insights profundos sobre tu progreso
          </p>
        </div>
      )}
    </div>
  );
}
