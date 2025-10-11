/**
 * Página principal de Deliberate Guitar.
 *
 * Layout de dos paneles (desktop-first):
 * - Panel superior: StatsPanel (full width)
 * - Panel izquierdo: SessionForm (sticky, registro rápido)
 * - Panel derecho: SessionsList (scrollable, timeline)
 *
 * Flujo de datos:
 * 1. Al montar → fetch inicial de sesiones
 * 2. Al crear sesión → callback onSuccess → refresh de lista
 * 3. Al actualizar lista → refresh automático de stats (porque StatsPanel hace su propio fetch)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import SessionForm from '@/app/components/SessionForm';
import SessionsList from '@/app/components/SessionsList';
import StatsPanel from '@/app/components/StatsPanel';
import EditSessionModal from '@/app/components/EditSessionModal';
import AIAnalysisModal from '@/app/components/AIAnalysisModal';
import ProfileModal from '@/app/components/ProfileModal';
import type { Session } from '@/types';
import type { ApiResponse, GetSessionsResponse } from '@/types/api';

export default function Home() {
  // Estado de sesiones
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Key para forzar re-render de StatsPanel (cuando se crea nueva sesión)
  const [statsKey, setStatsKey] = useState(0);

  // Estado del modal de edición
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estado del modal de análisis IA
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Estado del modal de perfil
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  /**
   * Fetch inicial de sesiones desde la API
   */
  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sessions');

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data: ApiResponse<GetSessionsResponse> = await response.json();

      if (data.success) {
        setSessions(data.data.sessions);
      } else {
        throw new Error(data.error.message);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar sesiones');
      // En caso de error, mostrar lista vacía
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch inicial al montar el componente
   */
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * Callback ejecutado cuando se crea exitosamente una sesión nueva.
   * Refresca la lista de sesiones y las estadísticas.
   */
  const handleSessionCreated = useCallback((sessionId: number) => {
    // Refresh de lista de sesiones
    fetchSessions();

    // Forzar refresh de StatsPanel cambiando su key
    setStatsKey(prev => prev + 1);
  }, [fetchSessions]);

  /**
   * Handler para editar sesión - abre el modal de edición
   */
  const handleSessionEdit = useCallback((session: Session) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  }, []);

  /**
   * Handler para cerrar el modal de edición
   */
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingSession(null);
  }, []);

  /**
   * Handler para cuando se edita exitosamente una sesión
   */
  const handleEditSuccess = useCallback(() => {
    fetchSessions();
    setStatsKey(prev => prev + 1);
  }, [fetchSessions]);

  /**
   * Handler para eliminar sesión con confirmación
   */
  const handleSessionDelete = useCallback(async (sessionId: number) => {
    // Confirmación antes de eliminar
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar esta sesión? Esta acción no se puede deshacer.'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Refresh de lista de sesiones y stats
        fetchSessions();
        setStatsKey(prev => prev + 1);
      } else {
        throw new Error(data.error.message);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      alert(
        `Error al eliminar sesión: ${err instanceof Error ? err.message : 'Error desconocido'}`
      );
    }
  }, [fetchSessions]);

  return (
    <main className="min-h-screen">
      {/* Container principal */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Deliberate Guitar
            </h1>
            <p className="text-gray-300">
              Tracking de práctica deliberada - Growth Mindset + Kaizen
            </p>
          </div>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-green text-black font-semibold hover:scale-[1.02] transition-all glow-cyan"
          >
            👤 Mi Perfil
          </button>
        </header>

        {/* StatsPanel - Full width arriba */}
        <section className="w-full">
          <StatsPanel
            key={statsKey}
            onRequestAIAnalysis={() => setAiModalOpen(true)}
          />
        </section>

        {/* Layout de dos paneles: Formulario (izq) + Lista (der) */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-6">

          {/* Panel izquierdo: SessionForm (sticky en desktop) */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <SessionForm onSuccess={handleSessionCreated} />
          </aside>

          {/* Panel derecho: SessionsList (scrollable) */}
          <section className="min-h-[600px]">
            {error ? (
              // Mensaje de error
              <div className="glass-card border-neon-pink/50 rounded-2xl p-6 text-center">
                <p className="text-red-400 mb-4">
                  ⚠️ {error}
                </p>
                <button
                  onClick={fetchSessions}
                  className="px-6 py-2 bg-gradient-to-r from-neon-pink to-neon-magenta text-white rounded-lg hover:glow-pink transition-all duration-300"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              // Lista de sesiones
              <SessionsList
                sessions={sessions}
                loading={isLoading}
                emptyMessage="¡Comienza tu práctica deliberada! Registra tu primera sesión usando el formulario de la izquierda."
                onSessionEdit={handleSessionEdit}
                onSessionDelete={handleSessionDelete}
              />
            )}
          </section>

        </div>

      </div>

      {/* Modal de edición */}
      <EditSessionModal
        session={editingSession}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </main>
  );
}
