'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, ExperienceLevel, ExperienceUnit, CreateProfileInput } from '@/types/profile';
import { formatLevel, formatExperience } from '@/types/profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function ProfileModal({ isOpen, onClose, onSave }: ProfileModalProps) {
  // Estado
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form state
  const [level, setLevel] = useState<ExperienceLevel>('beginner');
  const [experienceValue, setExperienceValue] = useState<number>(1);
  const [experienceUnit, setExperienceUnit] = useState<ExperienceUnit>('months');
  const [mainGoal, setMainGoal] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState('');
  const [idealPracticeFrequency, setIdealPracticeFrequency] = useState<number>(3);
  const [priorityTechniques, setPriorityTechniques] = useState('');

  // Cargar perfil al abrir
  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (data.success && data.profile) {
        const p = data.profile;
        setProfile(p);
        setLevel(p.level);
        setExperienceValue(p.experienceValue);
        setExperienceUnit(p.experienceUnit);
        setMainGoal(p.mainGoal);
        setCurrentChallenge(p.currentChallenge || '');
        setIdealPracticeFrequency(p.idealPracticeFrequency || 3);
        setPriorityTechniques(p.priorityTechniques || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mainGoal.trim()) {
      setError('El objetivo principal es obligatorio');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const input: CreateProfileInput = {
        level,
        experienceValue,
        experienceUnit,
        mainGoal: mainGoal.trim(),
        currentChallenge: currentChallenge.trim() || undefined,
        idealPracticeFrequency,
        priorityTechniques: priorityTechniques.trim() || undefined,
      };

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al guardar perfil');
      }

      if (onSave) onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm p-6 border-b border-neon-cyan/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neon-cyan">
              👤 Mi Perfil de Guitarrista
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-neon-cyan transition-colors"
              disabled={saving}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Ayudá al Coach IA a personalizar tu feedback según tu nivel y objetivos
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {loading && (
            <div className="text-center py-8 text-gray-400">
              Cargando perfil...
            </div>
          )}

          {!loading && (
            <>
              {/* Nivel de experiencia */}
              <div>
                <label className="block text-sm font-semibold text-neon-magenta mb-2">
                  Nivel de Experiencia *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        level === lvl
                          ? 'border-neon-magenta bg-neon-magenta/10 glow-magenta'
                          : 'border-gray-700 bg-black/50 hover:border-neon-cyan'
                      }`}
                    >
                      <div className="font-semibold text-gray-100">{formatLevel(lvl)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempo de experiencia */}
              <div>
                <label className="block text-sm font-semibold text-neon-magenta mb-2">
                  Tiempo de Experiencia *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={experienceValue}
                    onChange={(e) => setExperienceValue(parseInt(e.target.value) || 1)}
                    className="flex-1 px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-neon-cyan"
                  />
                  <select
                    value={experienceUnit}
                    onChange={(e) => setExperienceUnit(e.target.value as ExperienceUnit)}
                    className="px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-neon-cyan"
                  >
                    <option value="days">Días</option>
                    <option value="months">Meses</option>
                    <option value="years">Años</option>
                  </select>
                </div>
              </div>

              {/* Objetivo principal */}
              <div>
                <label className="block text-sm font-semibold text-neon-magenta mb-2">
                  Objetivo Principal *
                </label>
                <input
                  type="text"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="Ej: Dominar acordes abiertos con cambios limpios"
                  maxLength={500}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
                />
                <div className="text-xs text-gray-500 mt-1">{mainGoal.length}/500</div>
              </div>

              {/* Desafío actual */}
              <div>
                <label className="block text-sm font-semibold text-neon-cyan mb-2">
                  Desafío Actual (opcional)
                </label>
                <input
                  type="text"
                  value={currentChallenge}
                  onChange={(e) => setCurrentChallenge(e.target.value)}
                  placeholder="Ej: Me cuesta cambiar del acorde C a G sin pausas"
                  maxLength={500}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {/* Frecuencia ideal de práctica */}
              <div>
                <label className="block text-sm font-semibold text-neon-cyan mb-2">
                  Frecuencia Ideal: {idealPracticeFrequency} días por semana
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={idealPracticeFrequency}
                  onChange={(e) => setIdealPracticeFrequency(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 día</span>
                  <span>7 días</span>
                </div>
              </div>

              {/* Técnicas prioritarias */}
              <div>
                <label className="block text-sm font-semibold text-neon-cyan mb-2">
                  Técnicas Prioritarias (opcional)
                </label>
                <input
                  type="text"
                  value={priorityTechniques}
                  onChange={(e) => setPriorityTechniques(e.target.value)}
                  placeholder="Ej: Finger picking, barre chords, alternate picking"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-400">
                  ⚠️ {error}
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm p-6 border-t border-neon-cyan/30">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 px-6 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-green text-black font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
            >
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
