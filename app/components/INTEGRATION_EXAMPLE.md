# Ejemplo de Integración Completa

Este documento muestra cómo integrar los componentes de lista de sesiones y panel de estadísticas en una página de Next.js.

## Layout de Dos Paneles (Desktop-First)

```tsx
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { SessionForm, SessionsList, StatsPanel } from '@/app/components';
import type { Session, SessionStats } from '@/types';

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch inicial de sesiones
  useEffect(() => {
    fetchSessions();
  }, []);

  // Fetch inicial de stats
  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchSessions() {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/sessions?sortOrder=desc&limit=50');
      const data = await response.json();

      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }

  // Handler para cuando se crea una nueva sesión
  async function handleSessionCreated(sessionId: number) {
    // Refrescar ambas listas
    await Promise.all([
      fetchSessions(),
      fetchStats()
    ]);
  }

  // Handler para eliminar sesión
  async function handleSessionDelete(id: number) {
    if (!confirm('¿Seguro que deseas eliminar esta sesión?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refrescar datos
        await Promise.all([
          fetchSessions(),
          fetchStats()
        ]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error al eliminar sesión');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout de dos paneles */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1400px] mx-auto">

        {/* Panel Izquierdo: Formulario de Registro (fijo en desktop) */}
        <aside className="lg:w-[480px] lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Deliberate Guitar
            </h1>
            <SessionForm onSuccess={handleSessionCreated} />
          </div>
        </aside>

        {/* Panel Derecho: Timeline + Stats */}
        <main className="flex-1 space-y-6">
          {/* Panel de Estadísticas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <StatsPanel stats={stats} loading={loadingStats} />
          </div>

          {/* Lista de Sesiones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SessionsList
              sessions={sessions}
              loading={loadingSessions}
              emptyMessage="¡Comienza tu práctica deliberada!"
              onSessionDelete={handleSessionDelete}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
```

## Variante: Con Refresh Manual

```tsx
// app/practice/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { SessionsList, StatsPanel } from '@/app/components';
import type { Session, SessionStats } from '@/types';

export default function PracticePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch de datos con useCallback para reutilizar
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        fetch('/api/sessions?sortOrder=desc&limit=100'),
        fetch('/api/stats')
      ]);

      const [sessionsData, statsData] = await Promise.all([
        sessionsRes.json(),
        statsRes.json()
      ]);

      if (sessionsData.success) {
        setSessions(sessionsData.data.sessions);
      }

      if (statsData.success) {
        setStats(statsData.data.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con botón de refresh */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Evolución
          </h1>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Actualizando...' : 'Refrescar'}
          </button>
        </div>

        {/* Stats Panel */}
        <StatsPanel stats={stats} loading={loading} />

        {/* Sessions List */}
        <SessionsList sessions={sessions} loading={loading} />
      </div>
    </div>
  );
}
```

## Variante: Solo Stats (Dashboard Minimalista)

```tsx
// app/stats/page.tsx
import { StatsPanel } from '@/app/components';

export default function StatsPage() {
  // StatsPanel hace fetch automático si no se pasan props
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Panel de Estadísticas
        </h1>
        <StatsPanel />
      </div>
    </div>
  );
}
```

## Variante: Con Filtros (Próximamente)

```tsx
// app/sessions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { SessionsList } from '@/app/components';
import type { Session, TechnicalFocus, TimeRange } from '@/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFocus, setSelectedFocus] = useState<TechnicalFocus | 'all'>('all');
  const [selectedRange, setSelectedRange] = useState<TimeRange | 'all'>('all');

  useEffect(() => {
    fetchFilteredSessions();
  }, [selectedFocus, selectedRange]);

  async function fetchFilteredSessions() {
    setLoading(true);

    const params = new URLSearchParams();
    params.append('sortOrder', 'desc');

    if (selectedFocus !== 'all') {
      params.append('technicalFocus', selectedFocus);
    }

    // Calcular fechas según rango
    if (selectedRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      params.append('dateFrom', weekAgo.toISOString());
    } else if (selectedRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      params.append('dateFrom', monthAgo.toISOString());
    }

    try {
      const response = await fetch(`/api/sessions?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Historial de Sesiones
        </h1>

        {/* Filtros simples (placeholder - próximamente Filters component) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-4">
            {/* Filter por foco técnico */}
            <select
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value as TechnicalFocus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todos los focos</option>
              <option value="Técnica">Técnica</option>
              <option value="Ritmo">Ritmo</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Coordinación">Coordinación</option>
              <option value="Repertorio">Repertorio</option>
            </select>

            {/* Filter por rango de tiempo */}
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as TimeRange | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todo el tiempo</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>

        {/* Lista de sesiones filtradas */}
        <SessionsList sessions={sessions} loading={loading} />
      </div>
    </div>
  );
}
```

## Notas de Integración

### 1. Fetch Optimizado
- Usa `Promise.all()` para fetch paralelo de sesiones + stats
- Implementa `useCallback` para evitar re-renders innecesarios
- Considera agregar React Query o SWR para caché automático

### 2. Error Handling
- StatsPanel tiene error handling incorporado
- SessionsList muestra estado vacío automáticamente
- Agrega try-catch en fetch para producción

### 3. Loading States
- Todos los componentes soportan prop `loading`
- Skeleton loaders integrados para mejor UX
- Considera agregar suspense boundaries para SSR

### 4. Refresh Strategy
- Manual: Botón de refresh
- Auto: useEffect con intervalo
- On-demand: Callback después de crear/editar/eliminar sesión

### 5. Responsive Design
- Layout de dos paneles: flex-col en mobile, flex-row en desktop
- Panel izquierdo sticky en desktop para mejor accesibilidad
- Grid de stats se adapta automáticamente (1 col → 3 cols)

### 6. Performance
- Limita resultados con `limit` query param
- Implementa paginación infinita para muchas sesiones
- Considera virtualización para listas muy largas
