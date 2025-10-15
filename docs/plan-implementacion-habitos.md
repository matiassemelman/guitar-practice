# Plan de Implementación: Sistema de Hábitos Diarios

**Fecha:** 2025-10-15
**Objetivo:** Implementar tracker de hábitos diarios independiente (warmup, acordes, clase) con visualización de calendario mensual.
**Tiempo estimado:** 6.5 - 9.5 horas

---

## 📋 CHECKLIST DE PROBLEMAS Y SOLUCIONES

| Problema Original | Solución en el Plan |
|-------------------|---------------------|
| ❌ No existe forma de trackear hábitos rutinarios (separados de sesiones de práctica) | ✅ Nueva tabla `daily_habits` + API + UI independientes |
| ❌ Usuario debe navegar entre secciones para ver su progreso diario | ✅ `DailyHabitsPanel` en la parte superior (siempre visible) |
| ❌ No hay visualización histórica de consistencia en hábitos | ✅ `HabitsCalendar` con heatmap mensual + estadísticas |
| ❌ Fricción para registrar hábitos rápidos (solo había formulario de sesiones complejas) | ✅ Checkboxes simples + guardado único con detalles opcionales |
| ❌ Sin motivación visual para mantener rachas | ✅ Dots de colores neon + estadísticas de racha actual |

---

## 🎯 FASES DE IMPLEMENTACIÓN

### **FASE 1: Base de Datos y Tipos TypeScript** ⏱️ 30-45 min

#### 1.1 Crear Migration de Base de Datos

**Archivo:** `/db/migrations/002_daily_habits.sql` (CREAR NUEVO)

```sql
-- Migration: Daily Habits Table
-- Created: 2025-10-15

CREATE TABLE IF NOT EXISTS daily_habits (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,

  -- Warmup (Escala Cromática)
  warmup_done BOOLEAN DEFAULT false,
  warmup_duration_min INTEGER,

  -- Cambio de Acordes
  chords_done BOOLEAN DEFAULT false,
  chords_duration_min INTEGER,
  chords_bpm INTEGER,
  chords_notes TEXT,

  -- Ver Clase
  class_done BOOLEAN DEFAULT false,
  class_duration_min INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para queries por fecha (optimización para GET /api/habits?date=X)
CREATE INDEX idx_daily_habits_date ON daily_habits(date);

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_habits_updated_at
BEFORE UPDATE ON daily_habits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Acción:** Ejecutar este SQL en Neon SQL Editor (https://console.neon.tech).

---

#### 1.2 Crear Tipos TypeScript

**Archivo:** `/types/habits.ts` (CREAR NUEVO)

```typescript
// ============================================
// DATABASE TYPES
// ============================================

export interface DailyHabitsRow {
  id: number;
  date: string; // YYYY-MM-DD
  warmup_done: boolean;
  warmup_duration_min: number | null;
  chords_done: boolean;
  chords_duration_min: number | null;
  chords_bpm: number | null;
  chords_notes: string | null;
  class_done: boolean;
  class_duration_min: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// API TYPES
// ============================================

export interface HabitData {
  done: boolean;
  durationMin: number | null;
}

export interface ChordsHabitData extends HabitData {
  bpm: number | null;
  notes: string | null;
}

export interface DailyHabitsResponse {
  date: string; // YYYY-MM-DD
  warmup: HabitData;
  chords: ChordsHabitData;
  class: HabitData;
}

export interface DailyHabitsInput {
  date: string; // YYYY-MM-DD
  warmup: Partial<HabitData>;
  chords: Partial<ChordsHabitData>;
  class: Partial<HabitData>;
}

// ============================================
// CALENDAR TYPES
// ============================================

export interface MonthStats {
  warmupCount: number;
  chordsCount: number;
  classCount: number;
  totalDays: number;
  currentStreak: number;
}

export interface HabitsMonthResponse {
  month: string; // YYYY-MM
  days: DailyHabitsResponse[];
  stats: MonthStats;
}

// ============================================
// HELPERS
// ============================================

/**
 * Convierte una fila de DB a formato de respuesta API
 */
export function dbRowToApiResponse(row: DailyHabitsRow): DailyHabitsResponse {
  return {
    date: row.date,
    warmup: {
      done: row.warmup_done,
      durationMin: row.warmup_duration_min,
    },
    chords: {
      done: row.chords_done,
      durationMin: row.chords_duration_min,
      bpm: row.chords_bpm,
      notes: row.chords_notes,
    },
    class: {
      done: row.class_done,
      durationMin: row.class_duration_min,
    },
  };
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria local)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Crea estructura vacía de hábitos para un día sin datos
 */
export function createEmptyHabits(date: string): DailyHabitsResponse {
  return {
    date,
    warmup: { done: false, durationMin: null },
    chords: { done: false, durationMin: null, bpm: null, notes: null },
    class: { done: false, durationMin: null },
  };
}
```

---

### **FASE 2: API Routes para Hábitos del Día** ⏱️ 1-1.5 hrs

#### 2.1 Endpoint GET/POST `/api/habits`

**Archivo:** `/app/api/habits/route.ts` (CREAR NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  DailyHabitsRow,
  DailyHabitsInput,
  DailyHabitsResponse,
  dbRowToApiResponse,
  createEmptyHabits,
  getTodayDateString,
} from '@/types/habits';

// ============================================
// GET /api/habits?date=YYYY-MM-DD
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || getTodayDateString();

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const result = await query<DailyHabitsRow>(
      `SELECT * FROM daily_habits WHERE date = $1`,
      [dateParam]
    );

    // Si no hay datos para ese día, devolver estructura vacía
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: createEmptyHabits(dateParam),
      });
    }

    const data = dbRowToApiResponse(result.rows[0]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/habits
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body: DailyHabitsInput = await request.json();

    // Validación de input
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing date' },
        { status: 400 }
      );
    }

    // UPSERT: Insertar o actualizar si ya existe registro para esa fecha
    const result = await query<DailyHabitsRow>(
      `
      INSERT INTO daily_habits (
        date,
        warmup_done, warmup_duration_min,
        chords_done, chords_duration_min, chords_bpm, chords_notes,
        class_done, class_duration_min
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (date) DO UPDATE SET
        warmup_done = EXCLUDED.warmup_done,
        warmup_duration_min = EXCLUDED.warmup_duration_min,
        chords_done = EXCLUDED.chords_done,
        chords_duration_min = EXCLUDED.chords_duration_min,
        chords_bpm = EXCLUDED.chords_bpm,
        chords_notes = EXCLUDED.chords_notes,
        class_done = EXCLUDED.class_done,
        class_duration_min = EXCLUDED.class_duration_min,
        updated_at = NOW()
      RETURNING *
      `,
      [
        body.date,
        body.warmup?.done || false,
        body.warmup?.durationMin || null,
        body.chords?.done || false,
        body.chords?.durationMin || null,
        body.chords?.bpm || null,
        body.chords?.notes || null,
        body.class?.done || false,
        body.class?.durationMin || null,
      ]
    );

    const data = dbRowToApiResponse(result.rows[0]);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error saving habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save habits' },
      { status: 500 }
    );
  }
}
```

---

### **FASE 3: Componente DailyHabitsPanel** ⏱️ 2-3 hrs

#### 3.1 Crear Componente Principal

**Archivo:** `/app/components/DailyHabitsPanel.tsx` (CREAR NUEVO)

```typescript
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
```

---

#### 3.2 Integrar Panel en Página Principal

**Archivo:** `/app/page.tsx`

**MODIFICAR:** Agregar `<DailyHabitsPanel />` al inicio del componente principal (antes del layout de dos paneles).

**Buscar estas líneas:**
```typescript
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-magenta-400 glow-magenta">
        ⚡ Deliberate Guitar
      </h1>
```

**Agregar después del `<h1>`:**
```typescript
      {/* Panel de Hábitos Diarios - NUEVO */}
      <DailyHabitsPanel />

      {/* Layout de dos paneles (sesiones + stats) - EXISTENTE */}
```

**Importar componente al inicio del archivo:**
```typescript
import DailyHabitsPanel from './components/DailyHabitsPanel';
```

---

### **FASE 4: API Route para Calendario Mensual** ⏱️ 1 hr

#### 4.1 Endpoint GET `/api/habits/month`

**Archivo:** `/app/api/habits/month/route.ts` (CREAR NUEVO)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  DailyHabitsRow,
  HabitsMonthResponse,
  dbRowToApiResponse,
} from '@/types/habits';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month') || getCurrentMonth();

    // Validar formato YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { success: false, error: 'Invalid month format. Use YYYY-MM.' },
        { status: 400 }
      );
    }

    // Query: Obtener todos los días del mes con datos
    const result = await query<DailyHabitsRow>(
      `
      SELECT * FROM daily_habits
      WHERE date >= $1::date AND date < ($1::date + INTERVAL '1 month')
      ORDER BY date DESC
      `,
      [`${monthParam}-01`]
    );

    const days = result.rows.map(dbRowToApiResponse);

    // Calcular estadísticas
    const stats = calculateMonthStats(result.rows);

    const response: HabitsMonthResponse = {
      month: monthParam,
      days,
      stats,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error fetching month habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch month habits' },
      { status: 500 }
    );
  }
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function calculateMonthStats(rows: DailyHabitsRow[]) {
  const warmupCount = rows.filter((r) => r.warmup_done).length;
  const chordsCount = rows.filter((r) => r.chords_done).length;
  const classCount = rows.filter((r) => r.class_done).length;

  // Total de días con al menos un hábito registrado
  const totalDays = rows.length;

  // Calcular racha actual (días consecutivos con los 3 hábitos completos desde hoy)
  const today = new Date().toISOString().split('T')[0];
  const sortedRows = [...rows].sort((a, b) => b.date.localeCompare(a.date)); // Más reciente primero

  let currentStreak = 0;
  for (const row of sortedRows) {
    if (row.date > today) continue; // Ignorar fechas futuras
    if (row.warmup_done && row.chords_done && row.class_done) {
      currentStreak++;
    } else {
      break; // Se rompe la racha
    }
  }

  return {
    warmupCount,
    chordsCount,
    classCount,
    totalDays,
    currentStreak,
  };
}
```

---

### **FASE 5: Componente HabitsCalendar** ⏱️ 2-3 hrs

#### 5.1 Crear Componente de Calendario

**Archivo:** `/app/components/HabitsCalendar.tsx` (CREAR NUEVO)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { HabitsMonthResponse, DailyHabitsResponse } from '@/types/habits';

interface DayCellProps {
  dayNumber: number;
  habits: DailyHabitsResponse | null;
  onClick: () => void;
}

function DayCell({ dayNumber, habits, onClick }: DayCellProps) {
  const isEmpty = !habits;

  return (
    <div
      onClick={onClick}
      className={`aspect-square p-2 rounded cursor-pointer transition-all ${
        isEmpty
          ? 'bg-gray-900/30 hover:bg-gray-800/50'
          : 'glass-card hover:border-cyan-500/70'
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">{dayNumber}</div>
      {!isEmpty && (
        <div className="flex gap-1 justify-center">
          {/* Warmup dot */}
          <div
            className={`w-2 h-2 rounded-full ${
              habits.warmup.done ? 'bg-cyan-400 glow-cyan' : 'bg-gray-700'
            }`}
          />
          {/* Chords dot */}
          <div
            className={`w-2 h-2 rounded-full ${
              habits.chords.done ? 'bg-magenta-400 glow-magenta' : 'bg-gray-700'
            }`}
          />
          {/* Class dot */}
          <div
            className={`w-2 h-2 rounded-full ${
              habits.class.done ? 'bg-yellow-400 glow-yellow' : 'bg-gray-700'
            }`}
          />
        </div>
      )}
    </div>
  );
}

interface DayDetailModalProps {
  habits: DailyHabitsResponse;
  onClose: () => void;
}

function DayDetailModal({ habits, onClose }: DayDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass-card p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-magenta-400 mb-4">📅 {habits.date}</h3>

        <div className="space-y-4">
          {/* Warmup */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span>{habits.warmup.done ? '✅' : '❌'}</span>
              <span className="text-cyan-400 font-bold">Warmup</span>
            </div>
            {habits.warmup.done && habits.warmup.durationMin && (
              <p className="text-gray-400 text-sm pl-6">{habits.warmup.durationMin} min</p>
            )}
          </div>

          {/* Chords */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span>{habits.chords.done ? '✅' : '❌'}</span>
              <span className="text-magenta-400 font-bold">Acordes</span>
            </div>
            {habits.chords.done && (
              <div className="text-gray-400 text-sm pl-6">
                {habits.chords.durationMin && <p>{habits.chords.durationMin} min</p>}
                {habits.chords.bpm && <p>BPM: {habits.chords.bpm}</p>}
                {habits.chords.notes && <p className="italic">"{habits.chords.notes}"</p>}
              </div>
            )}
          </div>

          {/* Class */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span>{habits.class.done ? '✅' : '❌'}</span>
              <span className="text-yellow-400 font-bold">Clase</span>
            </div>
            {habits.class.done && habits.class.durationMin && (
              <p className="text-gray-400 text-sm pl-6">{habits.class.durationMin} min</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default function HabitsCalendar() {
  const [monthData, setMonthData] = useState<HabitsMonthResponse | null>(null);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [selectedDay, setSelectedDay] = useState<DailyHabitsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMonthData();
  }, [currentMonth]);

  const fetchMonthData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/habits/month?month=${currentMonth}`);
      const json = await res.json();
      if (json.success) {
        setMonthData(json.data);
      }
    } catch (err) {
      console.error('Error fetching month data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1); // month-2 porque JS Date usa 0-index
    setCurrentMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    setCurrentMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  // Generar grid de días del mes
  const daysInMonth = monthData ? generateMonthGrid(currentMonth, monthData.days) : [];

  if (isLoading) {
    return (
      <div className="glass-card p-6 mb-8">
        <div className="animate-pulse h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!monthData) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPrevMonth} className="text-cyan-400 hover:text-cyan-300 text-2xl">
          ←
        </button>
        <h2 className="text-2xl font-bold text-cyan-400 glow-cyan">
          📊 {formatMonthTitle(currentMonth)}
        </h2>
        <button onClick={goToNextMonth} className="text-cyan-400 hover:text-cyan-300 text-2xl">
          →
        </button>
      </div>

      {/* Estadísticas del mes */}
      <div className="glass-card p-4 mb-4">
        <div className="flex justify-around text-sm">
          <div>
            <span className="text-cyan-400">🎵 Warmup:</span> {monthData.stats.warmupCount}/{monthData.stats.totalDays}
          </div>
          <div>
            <span className="text-magenta-400">🎸 Acordes:</span> {monthData.stats.chordsCount}/{monthData.stats.totalDays}
          </div>
          <div>
            <span className="text-yellow-400">📚 Clase:</span> {monthData.stats.classCount}/{monthData.stats.totalDays}
          </div>
        </div>
        {monthData.stats.currentStreak > 0 && (
          <p className="text-center mt-2 text-magenta-400 font-bold">
            🔥 {monthData.stats.currentStreak} días de racha!
          </p>
        )}
      </div>

      {/* Calendario grid */}
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 font-bold">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, idx) => (
          <DayCell
            key={idx}
            dayNumber={day.dayNumber}
            habits={day.habits}
            onClick={() => day.habits && setSelectedDay(day.habits)}
          />
        ))}
      </div>

      {/* Modal de detalles del día */}
      {selectedDay && <DayDetailModal habits={selectedDay} onClose={() => setSelectedDay(null)} />}
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthTitle(month: string): string {
  const [year, monthNum] = month.split('-');
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
}

function generateMonthGrid(month: string, days: DailyHabitsResponse[]): Array<{ dayNumber: number; habits: DailyHabitsResponse | null }> {
  const [year, monthNum] = month.split('-').map(Number);
  const firstDay = new Date(year, monthNum - 1, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  // Crear mapa de días con datos
  const daysMap = new Map<number, DailyHabitsResponse>();
  days.forEach((d) => {
    const dayNum = parseInt(d.date.split('-')[2]);
    daysMap.set(dayNum, d);
  });

  const grid: Array<{ dayNumber: number; habits: DailyHabitsResponse | null }> = [];

  // Agregar celdas vacías al inicio (días de la semana anterior)
  for (let i = 0; i < firstDay; i++) {
    grid.push({ dayNumber: 0, habits: null });
  }

  // Agregar días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push({
      dayNumber: day,
      habits: daysMap.get(day) || null,
    });
  }

  return grid;
}
```

---

#### 5.2 Integrar Calendario en Página Principal

**Archivo:** `/app/page.tsx`

**MODIFICAR:** Agregar `<HabitsCalendar />` debajo del `<DailyHabitsPanel />`.

**Buscar:**
```typescript
      <DailyHabitsPanel />

      {/* Layout de dos paneles (sesiones + stats) - EXISTENTE */}
```

**Agregar después de `<DailyHabitsPanel />`:**
```typescript
      <DailyHabitsPanel />

      {/* Calendario de Hábitos - NUEVO */}
      <HabitsCalendar />

      {/* Layout de dos paneles (sesiones + stats) - EXISTENTE */}
```

**Importar componente al inicio del archivo:**
```typescript
import HabitsCalendar from './components/HabitsCalendar';
```

---

#### 5.3 Agregar Clase de Utilidad para Glow Yellow

**Archivo:** `/app/globals.css`

**MODIFICAR:** Agregar nueva clase `.glow-yellow` al final del archivo (si no existe).

**Buscar:**
```css
.glow-pink {
  box-shadow: 0 0 20px rgba(255, 0, 170, 0.5);
}
```

**Agregar después:**
```css
.glow-yellow {
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.5);
}
```

---

### **FASE 6: Testing y Ajustes Finales** ⏱️ 1 hr

#### 6.1 Checklist de Testing

- [ ] **DB Migration:** Ejecutar SQL en Neon y verificar que tabla `daily_habits` existe
- [ ] **API GET /api/habits:** Hacer request con Postman/curl y verificar estructura de respuesta
- [ ] **API POST /api/habits:** Crear/actualizar hábitos y verificar UPSERT funciona
- [ ] **API GET /api/habits/month:** Verificar que devuelve datos del mes y estadísticas correctas
- [ ] **UI - DailyHabitsPanel:**
  - [ ] Checkboxes funcionan
  - [ ] Expansión de hábitos muestra campos
  - [ ] Selectores de duración funcionan
  - [ ] Campos de BPM y notas en acordes funcionan
  - [ ] Botón "Guardar Día" persiste cambios
  - [ ] Loading skeleton aparece mientras carga
  - [ ] Errores se muestran correctamente
- [ ] **UI - HabitsCalendar:**
  - [ ] Grid de días se renderiza correctamente
  - [ ] Dots de colores reflejan estado de hábitos
  - [ ] Navegación prev/next mes funciona
  - [ ] Click en día abre modal con detalles
  - [ ] Estadísticas del mes son correctas
  - [ ] Racha se calcula bien
- [ ] **Integración:**
  - [ ] Layout no se rompe (DailyHabitsPanel y HabitsCalendar no afectan paneles existentes)
  - [ ] Responsive funciona en desktop
  - [ ] Colores cyberpunk son consistentes

#### 6.2 Comandos de Testing

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Servidor de desarrollo
npm run dev
```

**Testing manual en navegador:**
1. Ir a `http://localhost:3000`
2. Marcar los 3 hábitos, agregar duraciones, BPM, notas
3. Hacer click en "Guardar Día"
4. Refrescar página y verificar que datos persisten
5. Navegar calendario, hacer click en días con datos, verificar modal
6. Cambiar mes y verificar que datos se actualizan

---

## 🎯 TRACKER DE PROGRESO

### Fase 1: DB + Tipos ⏱️ 30-45 min
- [ ] Crear `/db/migrations/002_daily_habits.sql`
- [ ] Ejecutar migration en Neon SQL Editor
- [ ] Crear `/types/habits.ts` con todos los tipos y helpers
- [ ] Verificar compilación TypeScript (`npx tsc --noEmit`)

### Fase 2: API Routes ⏱️ 1-1.5 hrs
- [ ] Crear `/app/api/habits/route.ts` (GET + POST)
- [ ] Testear GET con Postman/curl (día con datos + día vacío)
- [ ] Testear POST con datos completos
- [ ] Testear UPSERT (crear → actualizar mismo día)

### Fase 3: DailyHabitsPanel ⏱️ 2-3 hrs
- [ ] Crear `/app/components/DailyHabitsPanel.tsx`
- [ ] Implementar componente `HabitItem` con expansión
- [ ] Conectar con API (fetch + POST)
- [ ] Agregar loading states y error handling
- [ ] Integrar en `/app/page.tsx`
- [ ] Testear flujo completo en navegador

### Fase 4: API Calendario ⏱️ 1 hr
- [ ] Crear `/app/api/habits/month/route.ts`
- [ ] Implementar query SQL para mes completo
- [ ] Implementar cálculo de estadísticas + racha
- [ ] Testear con Postman/curl

### Fase 5: HabitsCalendar ⏱️ 2-3 hrs
- [ ] Crear `/app/components/HabitsCalendar.tsx`
- [ ] Implementar componente `DayCell` con dots de colores
- [ ] Implementar navegación prev/next mes
- [ ] Implementar `DayDetailModal`
- [ ] Agregar clase `.glow-yellow` en `globals.css`
- [ ] Integrar en `/app/page.tsx`
- [ ] Testear flujo completo en navegador

### Fase 6: Testing Final ⏱️ 1 hr
- [ ] Ejecutar checklist completo de testing (sección 6.1)
- [ ] Ajustar colores/espaciado si es necesario
- [ ] Verificar responsive
- [ ] Commit final

---

## 📊 RESUMEN EJECUTIVO

**Total de archivos nuevos:** 5
- `/db/migrations/002_daily_habits.sql`
- `/types/habits.ts`
- `/app/api/habits/route.ts`
- `/app/api/habits/month/route.ts`
- `/app/components/DailyHabitsPanel.tsx`
- `/app/components/HabitsCalendar.tsx`

**Total de archivos modificados:** 2
- `/app/page.tsx` (agregar imports + componentes)
- `/app/globals.css` (agregar `.glow-yellow`)

**Líneas de código estimadas:** ~800 líneas (sin contar comentarios)

**Tiempo estimado total:** 6.5 - 9.5 horas

**Dependencias nuevas:** Ninguna (solo tipos TypeScript + componentes React nativos)
