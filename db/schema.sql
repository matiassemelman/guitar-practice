-- ===========================================================================
-- Deliberate Guitar - Database Schema
-- ===========================================================================
-- PostgreSQL schema for tracking deliberate guitar practice sessions
-- Philosophy: Growth Mindset + Kaizen (continuous improvement)
-- ===========================================================================

-- Drop existing table if needed (development only)
-- Uncomment the following line if you need to reset the schema:
-- DROP TABLE IF EXISTS sessions CASCADE;

-- ===========================================================================
-- Main Table: sessions
-- ===========================================================================
-- Stores all practice session data including performance metrics,
-- mindset checklist, and reflection notes

CREATE TABLE sessions (
  -- Primary key and timestamp
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Required fields (core session data)
  micro_objective TEXT NOT NULL,
  technical_focus VARCHAR(50) NOT NULL
    CHECK (technical_focus IN ('Técnica', 'Ritmo', 'Limpieza', 'Coordinación', 'Repertorio')),
  duration_min INTEGER NOT NULL
    CHECK (duration_min >= 1 AND duration_min <= 300),

  -- Optional performance metrics
  bpm_target INTEGER CHECK (bpm_target > 0 AND bpm_target <= 300),
  bpm_achieved INTEGER CHECK (bpm_achieved > 0 AND bpm_achieved <= 300),
  perfect_takes INTEGER CHECK (perfect_takes BETWEEN 0 AND 3),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),

  -- Flexible data structures (JSONB)
  -- Expected structure for mindset_checklist:
  -- {
  --   "warmed_up": boolean,
  --   "practiced_slow": boolean,
  --   "recorded_myself": boolean,
  --   "took_breaks": boolean,
  --   "reviewed_mistakes": boolean
  -- }
  mindset_checklist JSONB,

  -- Reflection notes
  reflection TEXT,

  -- Metadata for future use
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- Indexes for Common Queries
-- ===========================================================================

-- Index for chronological queries (most recent sessions first)
CREATE INDEX idx_sessions_created_at_desc ON sessions (created_at DESC);

-- Index for filtering by technical focus
CREATE INDEX idx_sessions_technical_focus ON sessions (technical_focus);

-- Composite index for date range + focus queries
CREATE INDEX idx_sessions_created_focus ON sessions (created_at DESC, technical_focus);

-- Index for BPM progression tracking (only non-null values)
CREATE INDEX idx_sessions_bpm_achieved ON sessions (bpm_achieved)
  WHERE bpm_achieved IS NOT NULL;

-- GIN index for JSONB queries on mindset_checklist
CREATE INDEX idx_sessions_mindset_checklist ON sessions USING GIN (mindset_checklist);

-- ===========================================================================
-- Comments for Documentation
-- ===========================================================================

COMMENT ON TABLE sessions IS
  'Practice sessions for Deliberate Guitar tracking system. Follows Growth Mindset + Kaizen philosophy.';

COMMENT ON COLUMN sessions.id IS
  'Unique identifier for each practice session';

COMMENT ON COLUMN sessions.created_at IS
  'Timestamp when the session was logged (not necessarily when practice happened)';

COMMENT ON COLUMN sessions.micro_objective IS
  'Specific, measurable practice goal for this session (e.g., "Clean C→G chord change at 60 bpm")';

COMMENT ON COLUMN sessions.technical_focus IS
  'Category of practice focus. Valid values: Técnica, Ritmo, Limpieza, Coordinación, Repertorio';

COMMENT ON COLUMN sessions.duration_min IS
  'Session duration in minutes. Accepts any value from 1 to 300. UI suggests: 5, 10, 20, 30, 45, 60';

COMMENT ON COLUMN sessions.bpm_target IS
  'Target tempo in beats per minute (optional)';

COMMENT ON COLUMN sessions.bpm_achieved IS
  'Actual tempo achieved during practice (optional)';

COMMENT ON COLUMN sessions.perfect_takes IS
  'Number of perfect executions (0-3). Used to track consistency.';

COMMENT ON COLUMN sessions.quality_rating IS
  'Subjective quality rating from 1 (poor) to 5 (excellent)';

COMMENT ON COLUMN sessions.rpe IS
  'Rate of Perceived Exertion (1-10). Tracks mental/physical effort.';

COMMENT ON COLUMN sessions.mindset_checklist IS
  'JSONB object tracking Growth Mindset habits: warmed_up, practiced_slow, recorded_myself, took_breaks, reviewed_mistakes';

COMMENT ON COLUMN sessions.reflection IS
  'Brief reflection note (one-line is typical). E.g., "Hoy aprendí que..."';

COMMENT ON COLUMN sessions.updated_at IS
  'Last update timestamp (for future edit functionality)';

-- ===========================================================================
-- Trigger for Automatic updated_at
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
-- End of Schema
-- ===========================================================================
