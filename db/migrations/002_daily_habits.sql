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
