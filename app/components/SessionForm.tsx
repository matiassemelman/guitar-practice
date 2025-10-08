'use client';

/**
 * SessionForm Component
 *
 * Formulario de registro rápido de sesiones de práctica de guitarra.
 * Diseñado para completarse en ≤30 segundos con UX optimizada.
 *
 * Features:
 * - Campos obligatorios: objetivo micro, foco técnico, duración
 * - Campos opcionales: BPM, tomas perfectas, calidad, RPE
 * - Checklist de mindset para práctica deliberada
 * - Feedback motivacional post-guardado
 */

import { useState, FormEvent } from 'react';
import type {
  CreateSessionInput,
  TechnicalFocus,
  SessionDuration,
  MindsetChecklist
} from '@/types/session';
import { SESSION_CONSTANTS, DEFAULT_MINDSET_CHECKLIST } from '@/types/session';
import { generateInsight } from '@/lib/insights';
import type { ApiResponse, CreateSessionResponse } from '@/types/api';

interface SessionFormProps {
  /** Callback ejecutado después de crear exitosamente una sesión */
  onSuccess?: (sessionId: number) => void;
}

export default function SessionForm({ onSuccess }: SessionFormProps) {
  // Estados de campos obligatorios
  const [microObjective, setMicroObjective] = useState('');
  const [technicalFocus, setTechnicalFocus] = useState<TechnicalFocus | ''>('');
  const [durationMin, setDurationMin] = useState<SessionDuration>(20);

  // Estados de campos opcionales de rendimiento
  const [bpmTarget, setBpmTarget] = useState<string>('');
  const [bpmAchieved, setBpmAchieved] = useState<string>('');
  const [perfectTakes, setPerfectTakes] = useState<number | null>(null);
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [rpe, setRpe] = useState<number>(5);

  // Estados de mindset y reflexión
  const [mindsetChecklist, setMindsetChecklist] = useState<MindsetChecklist>(DEFAULT_MINDSET_CHECKLIST);
  const [reflection, setReflection] = useState('');

  // Estados UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validación de campos requeridos
  const isFormValid = microObjective.trim().length >= 5 && technicalFocus !== '' && durationMin > 0;

  // Handler de submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Construir el payload
      const payload: CreateSessionInput = {
        microObjective: microObjective.trim(),
        technicalFocus: technicalFocus as TechnicalFocus,
        durationMin,
      };

      // Agregar campos opcionales solo si tienen valores
      if (bpmTarget) payload.bpmTarget = parseInt(bpmTarget);
      if (bpmAchieved) payload.bpmAchieved = parseInt(bpmAchieved);
      if (perfectTakes !== null) payload.perfectTakes = perfectTakes;
      if (qualityRating !== null) payload.qualityRating = qualityRating;
      if (rpe) payload.rpe = rpe;

      // Verificar si hay algún item del checklist seleccionado
      const hasAnyMindsetItem = Object.values(mindsetChecklist).some(v => v === true);
      if (hasAnyMindsetItem) {
        payload.mindsetChecklist = mindsetChecklist;
      }

      if (reflection.trim()) payload.reflection = reflection.trim();

      // Generar insight antes de enviar
      const insight = generateInsight(payload);

      // Enviar a la API
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<CreateSessionResponse> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.success === false ? data.error.message : 'Error al guardar la sesión');
      }

      // Éxito: mostrar insight y limpiar formulario
      if (data.success) {
        const insightMessage = data.data.insight || insight.message;
        const kaizenSuggestion = insight.kaizen;

        setSuccessMessage(
          `✅ ${insightMessage}${kaizenSuggestion ? `\n\n💡 ${kaizenSuggestion}` : ''}`
        );

        // Limpiar formulario
        resetForm();

        // Callback de éxito
        if (onSuccess) {
          onSuccess(data.data.session.id);
        }

        // Auto-ocultar mensaje después de 8 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 8000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setMicroObjective('');
    setTechnicalFocus('');
    setDurationMin(20);
    setBpmTarget('');
    setBpmAchieved('');
    setPerfectTakes(null);
    setQualityRating(null);
    setRpe(5);
    setMindsetChecklist(DEFAULT_MINDSET_CHECKLIST);
    setReflection('');
  };

  // Handlers de checklist de mindset
  const toggleMindsetItem = (key: keyof MindsetChecklist) => {
    setMindsetChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Labels descriptivos para RPE
  const getRPELabel = (value: number): string => {
    if (value <= 2) return 'Muy fácil';
    if (value <= 4) return 'Fácil';
    if (value <= 6) return 'Moderado';
    if (value <= 8) return 'Difícil';
    return 'Muy difícil';
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">
        Registrar Sesión
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Objetivo Micro (required) */}
        <div>
          <label htmlFor="microObjective" className="block text-sm font-medium text-gray-300 mb-2">
            Objetivo Micro <span className="text-neon-pink">*</span>
          </label>
          <input
            id="microObjective"
            type="text"
            value={microObjective}
            onChange={(e) => setMicroObjective(e.target.value)}
            placeholder="Ej: Cambio limpio de C a G a 60 bpm"
            className="w-full px-4 py-3 text-lg bg-black/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
            autoFocus
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-400">
            {microObjective.length}/500 caracteres
          </p>
        </div>

        {/* Foco Técnico (required) */}
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

        {/* Duración (required) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Duración <span className="text-neon-pink">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SESSION_CONSTANTS.VALID_DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setDurationMin(duration)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  durationMin === duration
                    ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white glow-cyan'
                    : 'bg-black/50 text-gray-300 border border-gray-700 hover:border-neon-cyan'
                }`}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        {/* Campos Opcionales de Rendimiento */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Métricas de Rendimiento (opcional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BPM Objetivo */}
            <div>
              <label htmlFor="bpmTarget" className="block text-xs font-medium text-gray-400 mb-1">
                BPM Objetivo
              </label>
              <input
                id="bpmTarget"
                type="number"
                value={bpmTarget}
                onChange={(e) => setBpmTarget(e.target.value)}
                placeholder="60"
                min={SESSION_CONSTANTS.BPM_RANGE.min}
                max={SESSION_CONSTANTS.BPM_RANGE.max}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
              />
            </div>

            {/* BPM Logrado */}
            <div>
              <label htmlFor="bpmAchieved" className="block text-xs font-medium text-gray-400 mb-1">
                BPM Logrado
              </label>
              <input
                id="bpmAchieved"
                type="number"
                value={bpmAchieved}
                onChange={(e) => setBpmAchieved(e.target.value)}
                placeholder="55"
                min={SESSION_CONSTANTS.BPM_RANGE.min}
                max={SESSION_CONSTANTS.BPM_RANGE.max}
                className="w-full px-3 py-2 bg-black/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
              />
            </div>
          </div>

          {/* Tomas Perfectas */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Tomas Perfectas (0-3)
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPerfectTakes(value)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                    perfectTakes === value
                      ? 'bg-gradient-to-br from-neon-green to-neon-cyan text-white scale-110 glow-cyan'
                      : 'bg-black/50 text-gray-300 border border-gray-700 hover:border-neon-green'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Rating de Calidad (estrellas) */}
          <div className="mt-4">
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

          {/* Slider RPE */}
          <div className="mt-4">
            <label htmlFor="rpe" className="block text-xs font-medium text-gray-400 mb-1">
              Esfuerzo Percibido (RPE): {rpe} - {getRPELabel(rpe)}
            </label>
            <input
              id="rpe"
              type="range"
              min={SESSION_CONSTANTS.RPE_RANGE.min}
              max={SESSION_CONSTANTS.RPE_RANGE.max}
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Fácil</span>
              <span>Difícil</span>
            </div>
          </div>
        </div>

        {/* Checklist de Mindset */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Checklist de Mindset (práctica deliberada)
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

        {/* Campo de Reflexión */}
        <div className="border-t border-gray-800 pt-6">
          <label htmlFor="reflection" className="block text-sm font-medium text-gray-300 mb-2">
            Reflexión (opcional)
          </label>
          <input
            id="reflection"
            type="text"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Hoy aprendí que..."
            maxLength={1000}
            className="w-full px-4 py-2 bg-black/50 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan transition-all duration-200"
          />
        </div>

        {/* Mensajes de Error/Éxito */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
            ❌ {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-neon-cyan/10 border border-neon-cyan/50 text-cyan-300 px-4 py-3 rounded-lg text-sm whitespace-pre-line backdrop-blur-sm glow-cyan">
            {successMessage}
          </div>
        )}

        {/* Botón Submit */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-300 ${
            !isFormValid || isLoading
              ? 'bg-gray-800 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-cyan hover:glow-magenta hover:scale-[1.02]'
          }`}
        >
          {isLoading ? 'Guardando...' : 'Guardar Sesión'}
        </button>
      </form>
    </div>
  );
}
