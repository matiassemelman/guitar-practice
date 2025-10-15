-- ===========================================================================
-- Migration: Allow flexible duration values (1-300 minutes)
-- ===========================================================================
-- Esta migración cambia el constraint de duration_min de valores discretos
-- (5, 10, 20, 30, 45, 60) a un rango continuo (1-300).
--
-- IMPORTANTE: Ejecutar esto en Neon SQL Editor (https://console.neon.tech)
-- ===========================================================================

-- Paso 1: Eliminar el constraint restrictivo actual
ALTER TABLE sessions
DROP CONSTRAINT sessions_duration_min_check;

-- Paso 2: Agregar nuevo constraint con rango flexible
ALTER TABLE sessions
ADD CONSTRAINT sessions_duration_min_check
CHECK (duration_min >= 1 AND duration_min <= 300);

-- Verificación: Confirmar que el constraint fue actualizado
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'sessions'::regclass
AND conname = 'sessions_duration_min_check';

-- ===========================================================================
-- Resultado esperado:
-- conname                        | pg_get_constraintdef
-- ------------------------------+------------------------------------------
-- sessions_duration_min_check   | CHECK ((duration_min >= 1) AND (duration_min <= 300))
-- ===========================================================================
