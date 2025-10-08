-- ===========================================================================
-- Deliberate Guitar - Database Initialization Script
-- ===========================================================================
-- Use this script to initialize a fresh database or reset during development
-- ===========================================================================

-- Drop existing objects (development only - use with caution)
DROP TABLE IF EXISTS sessions CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ===========================================================================
-- Create Schema
-- ===========================================================================

-- Main table for practice sessions
CREATE TABLE sessions (
  -- Primary key and timestamp
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Required fields (core session data)
  micro_objective TEXT NOT NULL,
  technical_focus VARCHAR(50) NOT NULL
    CHECK (technical_focus IN ('Técnica', 'Ritmo', 'Limpieza', 'Coordinación', 'Repertorio')),
  duration_min INTEGER NOT NULL
    CHECK (duration_min IN (5, 10, 20, 30, 45, 60)),

  -- Optional performance metrics
  bpm_target INTEGER CHECK (bpm_target > 0 AND bpm_target <= 300),
  bpm_achieved INTEGER CHECK (bpm_achieved > 0 AND bpm_achieved <= 300),
  perfect_takes INTEGER CHECK (perfect_takes BETWEEN 0 AND 3),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),

  -- Flexible data structures (JSONB)
  mindset_checklist JSONB,

  -- Reflection notes
  reflection TEXT,

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- Indexes
-- ===========================================================================

CREATE INDEX idx_sessions_created_at_desc ON sessions (created_at DESC);
CREATE INDEX idx_sessions_technical_focus ON sessions (technical_focus);
CREATE INDEX idx_sessions_created_focus ON sessions (created_at DESC, technical_focus);
CREATE INDEX idx_sessions_bpm_achieved ON sessions (bpm_achieved)
  WHERE bpm_achieved IS NOT NULL;
CREATE INDEX idx_sessions_mindset_checklist ON sessions USING GIN (mindset_checklist);

-- ===========================================================================
-- Trigger Function for updated_at
-- ===========================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================================================
-- Sample Data (Optional - uncomment for testing)
-- ===========================================================================

-- INSERT INTO sessions (
--   micro_objective,
--   technical_focus,
--   duration_min,
--   bpm_target,
--   bpm_achieved,
--   perfect_takes,
--   quality_rating,
--   rpe,
--   mindset_checklist,
--   reflection
-- ) VALUES (
--   'Clean C→G chord change at 60 bpm',
--   'Técnica',
--   20,
--   60,
--   55,
--   2,
--   4,
--   6,
--   '{"warmed_up": true, "practiced_slow": true, "recorded_myself": false, "took_breaks": true, "reviewed_mistakes": true}'::jsonb,
--   'Necesito levantar menos el dedo índice durante el cambio'
-- );

-- INSERT INTO sessions (
--   micro_objective,
--   technical_focus,
--   duration_min,
--   quality_rating,
--   mindset_checklist,
--   reflection
-- ) VALUES (
--   'Arpegio de Am con púa alternada',
--   'Coordinación',
--   15,
--   3,
--   '{"warmed_up": true, "practiced_slow": true, "recorded_myself": true, "took_breaks": false, "reviewed_mistakes": true}'::jsonb,
--   'La grabación reveló que mi timing está inconsistente'
-- );

-- ===========================================================================
-- Verification Query
-- ===========================================================================

-- Run this to verify the table was created successfully:
-- SELECT
--   table_name,
--   column_name,
--   data_type,
--   is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'sessions'
-- ORDER BY ordinal_position;

-- ===========================================================================
-- End of Initialization Script
-- ===========================================================================
