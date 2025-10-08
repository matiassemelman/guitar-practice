'use client';

/**
 * EditSessionModal Component
 *
 * Modal para editar una sesión existente.
 * Reutiliza la misma estructura del SessionForm pero pre-poblado con datos.
 */

import { useState, useEffect, FormEvent } from 'react';
import type {
  Session,
  CreateSessionInput,
  TechnicalFocus,
  SessionDuration,
  MindsetChecklist
} from '@/types/session';
import { SESSION_CONSTANTS, DEFAULT_MINDSET_CHECKLIST } from '@/types/session';
import type { ApiResponse } from '@/types/api';

interface EditSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSessionModal({
  session,
  isOpen,
  onClose,
  onSuccess
}: EditSessionModalProps) {
  // Estados de campos
  const [microObjective, setMicroObjective] = useState('');
  const [technicalFocus, setTechnicalFocus] = useState<TechnicalFocus | ''>('');
  const [durationMin, setDurationMin] = useState<SessionDuration>(20);
  const [bpmTarget, setBpmTarget] = useState<string>('');
  const [bpmAchieved, setBpmAchieved] = useState<string>('');
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number>(5);
  const [mindsetChecklist, setMindsetChecklist] = useState<MindsetChecklist>(DEFAULT_MINDSET_CHECKLIST);
  const [reflection, setReflection] = useState('');

  // Estados UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de sesión cuando cambia
  useEffect(() => {
    if (session) {
      setMicroObjective(session.microObjective);
      setTechnicalFocus(session.technicalFocus);
      setDurationMin(session.durationMin);
      setBpmTarget(session.bpmTarget?.toString() || '');
      setBpmAchieved(session.bpmAchieved?.toString() || '');
      setQualityRating(session.qualityRating || null);
      setRpe(session.rpe || 5);
      setMindsetChecklist(session.mindsetChecklist || DEFAULT_MINDSET_CHECKLIST);
      setReflection(session.reflection || '');
      setError(null);
    }
  }, [session]);

  // Handler de submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session || !microObjective.trim() || !technicalFocus) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateSessionInput = {
        microObjective: microObjective.trim(),
        technicalFocus: technicalFocus as TechnicalFocus,
        durationMin,
      };

      if (bpmTarget) payload.bpmTarget = parseInt(bpmTarget);
      if (bpmAchieved) payload.bpmAchieved = parseInt(bpmAchieved);
      if (qualityRating !== null) payload.qualityRating = qualityRating;
      if (rpe) payload.rpe = rpe;

      const hasAnyMindsetItem = Object.values(mindsetChecklist).some(v => v === true);
      if (hasAnyMindsetItem) {
        payload.mindsetChecklist = mindsetChecklist;
      }

      if (reflection.trim()) payload.reflection = reflection.trim();

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<Session> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.success === false ? data.error.message : 'Error al actualizar la sesión');
      }

      // Éxito
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMindsetItem = (key: keyof MindsetChecklist) => {
    setMindsetChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getRPELabel = (value: number): string => {
    if (value <= 2) return 'Muy fácil';
    if (value <= 4) return 'Fácil';
    if (value <= 6) return 'Moderado';
    if (value <= 8) return 'Difícil';
    return 'Muy difícil';
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">
            Editar Sesión
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Objetivo Micro */}
          <div>
            <label htmlFor="edit-microObjective" className="block text-sm font-medium text-gray-300 mb-2">
              Objetivo Micro <span className="text-neon-pink">*</span>
            </label>
            <input
              id="edit-microObjective"
              type="text"
              value={microObjective}
              onChange={(e) => setMicroObjective(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-black/50 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
              maxLength={500}
            />
          </div>

          {/* Foco Técnico */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Foco Técnico <span className="text-neon-pink">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SESSION_CONSTANTS.VALID_FOCUSES.map((focus) => (
                <button
                  key={focus}
                  type="button"
                  onClick={() => setTechnicalFocus(focus)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    technicalFocus === focus
                      ? 'bg-gradient-to-r from-neon-magenta to-neon-cyan text-white glow-magenta'
                      : 'bg-black/50 text-gray-300 border border-gray-700 hover:border-neon-magenta'
                  }`}
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>

          {/* Duración */}
          <div>
            <label htmlFor="edit-durationMin" className="block text-sm font-medium text-gray-300 mb-2">
              Duración (minutos) <span className="text-neon-pink">*</span>
            </label>
            <input
              id="edit-durationMin"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
              min={SESSION_CONSTANTS.DURATION_RANGE.min}
              max={SESSION_CONSTANTS.DURATION_RANGE.max}
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
            />
          </div>

          {/* BPM */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-bpmTarget" className="block text-xs font-medium text-gray-400 mb-1">
                BPM Objetivo
              </label>
              <input
                id="edit-bpmTarget"
                type="number"
                value={bpmTarget}
                onChange={(e) => setBpmTarget(e.target.value)}
                min={SESSION_CONSTANTS.BPM_RANGE.min}
                max={SESSION_CONSTANTS.BPM_RANGE.max}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="edit-bpmAchieved" className="block text-xs font-medium text-gray-400 mb-1">
                BPM Logrado
              </label>
              <input
                id="edit-bpmAchieved"
                type="number"
                value={bpmAchieved}
                onChange={(e) => setBpmAchieved(e.target.value)}
                min={SESSION_CONSTANTS.BPM_RANGE.min}
                max={SESSION_CONSTANTS.BPM_RANGE.max}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
              />
            </div>
          </div>

          {/* Calidad */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Calidad (1-5 ★)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQualityRating(value)}
                  className={`text-3xl transition-transform hover:scale-110 ${
                    qualityRating && qualityRating >= value
                      ? 'text-neon-magenta drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]'
                      : 'text-gray-700'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* RPE */}
          <div>
            <label htmlFor="edit-rpe" className="block text-xs font-medium text-gray-400 mb-1">
              Esfuerzo Percibido (RPE): {rpe} - {getRPELabel(rpe)}
            </label>
            <input
              id="edit-rpe"
              type="range"
              min={SESSION_CONSTANTS.RPE_RANGE.min}
              max={SESSION_CONSTANTS.RPE_RANGE.max}
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
          </div>

          {/* Checklist de Mindset */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Checklist de Mindset
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-black/30 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={mindsetChecklist.warmedUp}
                  onChange={() => toggleMindsetItem('warmedUp')}
                  className="w-5 h-5 text-neon-cyan rounded focus:ring-2 focus:ring-neon-cyan bg-gray-800 border-gray-600"
                />
                <span className="text-sm text-gray-200">Calenté antes de practicar</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-black/30 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={mindsetChecklist.practicedSlow}
                  onChange={() => toggleMindsetItem('practicedSlow')}
                  className="w-5 h-5 text-neon-cyan rounded focus:ring-2 focus:ring-neon-cyan bg-gray-800 border-gray-600"
                />
                <span className="text-sm text-gray-200">Practiqué lento / a velocidad controlada</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-black/30 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={mindsetChecklist.recorded}
                  onChange={() => toggleMindsetItem('recorded')}
                  className="w-5 h-5 text-neon-cyan rounded focus:ring-2 focus:ring-neon-cyan bg-gray-800 border-gray-600"
                />
                <span className="text-sm text-gray-200">Me grabé para auto-evaluarme</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-black/30 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={mindsetChecklist.tookBreaks}
                  onChange={() => toggleMindsetItem('tookBreaks')}
                  className="w-5 h-5 text-neon-cyan rounded focus:ring-2 focus:ring-neon-cyan bg-gray-800 border-gray-600"
                />
                <span className="text-sm text-gray-200">Tomé pausas durante la sesión</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-black/30 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={mindsetChecklist.reviewedMistakes}
                  onChange={() => toggleMindsetItem('reviewedMistakes')}
                  className="w-5 h-5 text-neon-cyan rounded focus:ring-2 focus:ring-neon-cyan bg-gray-800 border-gray-600"
                />
                <span className="text-sm text-gray-200">Revisé y analicé mis errores</span>
              </label>
            </div>
          </div>

          {/* Reflexión */}
          <div>
            <label htmlFor="edit-reflection" className="block text-sm font-medium text-gray-300 mb-2">
              Reflexión
            </label>
            <input
              id="edit-reflection"
              type="text"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              maxLength={1000}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              ❌ {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-lg text-gray-300 border border-gray-700 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-cyan hover:glow-magenta hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
