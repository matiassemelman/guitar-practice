-- ===========================================================================
-- Migration 002: Add User Profile Table
-- ===========================================================================
BEGIN;

-- Crear tabla solo si no existe
CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- Solo permite 1 registro

  -- Datos técnicos básicos
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  experience_value INTEGER NOT NULL CHECK (experience_value > 0),
  experience_unit VARCHAR(10) NOT NULL CHECK (experience_unit IN ('days', 'months', 'years')),

  -- Objetivos y contexto
  main_goal TEXT NOT NULL,
  current_challenge TEXT,

  -- Información de práctica
  ideal_practice_frequency INTEGER CHECK (ideal_practice_frequency BETWEEN 1 AND 7),
  priority_techniques TEXT,

  -- Flexibilidad futura
  additional_context JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at (reutiliza función existente)
CREATE TRIGGER user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Validar que trigger existe (para debugging)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    RAISE EXCEPTION 'Función update_updated_at_column no existe. Ejecutar init.sql primero.';
  END IF;
END $$;

COMMIT;
