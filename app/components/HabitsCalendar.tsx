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
                {habits.chords.notes && <p className="italic">&quot;{habits.chords.notes}&quot;</p>}
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
