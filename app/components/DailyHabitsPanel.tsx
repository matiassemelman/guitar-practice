'use client';

import { useState, useEffect } from 'react';
import { DailyHabitsResponse, HabitData, ChordsHabitData, getTodayDateString } from '@/types/habits';

interface HabitItemProps {
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  habitData: HabitData | ChordsHabitData;
  onUpdate: (data: Partial<HabitData | ChordsHabitData>) => void;
  type: 'warmup' | 'chords' | 'class';
}

function HabitItem({ title, icon, isExpanded, onToggleExpand, habitData, onUpdate, type }: HabitItemProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ done: e.target.checked });
  };

  const quickDurations = type === 'warmup' ? [5, 10] : type === 'chords' ? [5, 10, 15, 20] : [20];

  return (
    <div className="glass-card p-4 cursor-pointer hover:border-cyan-500/50 transition-all" onClick={onToggleExpand}>
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={habitData.done}
          onChange={handleCheckboxChange}
          className="w-6 h-6 accent-magenta-500"
        />
        <span className="text-2xl">{icon}</span>
        <span className="text-cyan-400 font-bold">{title}</span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 pl-9" onClick={(e) => e.stopPropagation()}>
          {/* Duración */}
          <div>
            <label className="text-gray-400 text-sm">Duración (min)</label>
            <div className="flex gap-2 mt-1">
              {quickDurations.map((min) => (
                <button
                  key={min}
                  onClick={() => onUpdate({ durationMin: min })}
                  className={`px-3 py-1 rounded ${
                    habitData.durationMin === min
                      ? 'bg-magenta-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {min}
                </button>
              ))}
              <input
                type="number"
                value={habitData.durationMin || ''}
                onChange={(e) => onUpdate({ durationMin: parseInt(e.target.value) || null })}
                placeholder="Otro"
                className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white"
              />
            </div>
          </div>

          {/* Campos específicos de Acordes */}
          {type === 'chords' && (
            <>
              <div>
                <label className="text-gray-400 text-sm">BPM (opcional)</label>
                <input
                  type="number"
                  value={(habitData as ChordsHabitData).bpm || ''}
                  onChange={(e) => onUpdate({ bpm: parseInt(e.target.value) || null })}
                  placeholder="Ej: 80"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white mt-1"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Notas</label>
                <textarea
                  value={(habitData as ChordsHabitData).notes || ''}
                  onChange={(e) => onUpdate({ notes: e.target.value || null })}
                  placeholder="Ej: C→G limpio a 80bpm"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white mt-1"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function DailyHabitsPanel() {
  const [habits, setHabits] = useState<DailyHabitsResponse | null>(null);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = getTodayDateString();

  // Fetch hábitos del día actual
  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/habits?date=${today}`);
      const json = await res.json();
      if (json.success) {
        setHabits(json.data);
      } else {
        setError('Error al cargar hábitos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!habits) return;

    try {
      setIsSaving(true);
      setError(null);
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habits),
      });
      const json = await res.json();
      if (json.success) {
        setHabits(json.data);
        // Opcional: mostrar toast de éxito
      } else {
        setError('Error al guardar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  const updateHabit = (key: 'warmup' | 'chords' | 'class', data: Partial<HabitData | ChordsHabitData>) => {
    if (!habits) return;
    setHabits({
      ...habits,
      [key]: { ...habits[key], ...data },
    });
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 mb-8">
        <div className="animate-pulse flex space-x-4">
          <div className="h-12 bg-gray-700 rounded w-1/3"></div>
          <div className="h-12 bg-gray-700 rounded w-1/3"></div>
          <div className="h-12 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (!habits) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-magenta-400 mb-4 glow-magenta">🎯 Hábitos de Hoy</h2>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <HabitItem
          title="Warmup"
          icon="🎵"
          isExpanded={expandedHabit === 'warmup'}
          onToggleExpand={() => setExpandedHabit(expandedHabit === 'warmup' ? null : 'warmup')}
          habitData={habits.warmup}
          onUpdate={(data) => updateHabit('warmup', data)}
          type="warmup"
        />
        <HabitItem
          title="Acordes"
          icon="🎸"
          isExpanded={expandedHabit === 'chords'}
          onToggleExpand={() => setExpandedHabit(expandedHabit === 'chords' ? null : 'chords')}
          habitData={habits.chords}
          onUpdate={(data) => updateHabit('chords', data)}
          type="chords"
        />
        <HabitItem
          title="Clase"
          icon="📚"
          isExpanded={expandedHabit === 'class'}
          onToggleExpand={() => setExpandedHabit(expandedHabit === 'class' ? null : 'class')}
          habitData={habits.class}
          onUpdate={(data) => updateHabit('class', data)}
          type="class"
        />
      </div>

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-magenta-500 to-pink-500 text-white font-bold py-3 px-6 rounded glow-magenta hover:from-magenta-600 hover:to-pink-600 transition-all disabled:opacity-50"
      >
        {isSaving ? 'Guardando...' : '💾 Guardar Día'}
      </button>
    </div>
  );
}
