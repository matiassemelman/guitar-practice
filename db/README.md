# Base de Datos - Deliberate Guitar

Documentación del schema de PostgreSQL para el sistema de tracking de práctica deliberada de guitarra.

---

## Tabla de Contenidos

1. [Estructura de la Tabla](#estructura-de-la-tabla)
2. [Descripción de Campos](#descripción-de-campos)
3. [Tipos de Datos y Decisiones de Diseño](#tipos-de-datos-y-decisiones-de-diseño)
4. [Estructura de JSONB](#estructura-de-jsonb)
5. [Índices](#índices)
6. [Queries de Ejemplo](#queries-de-ejemplo)
7. [Instrucciones de Uso](#instrucciones-de-uso)

---

## Estructura de la Tabla

### Tabla `sessions`

```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  micro_objective TEXT NOT NULL,
  technical_focus VARCHAR(50) NOT NULL,
  duration_min INTEGER NOT NULL,
  bpm_target INTEGER,
  bpm_achieved INTEGER,
  perfect_takes INTEGER,
  quality_rating INTEGER,
  rpe INTEGER,
  mindset_checklist JSONB,
  reflection TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Descripción de Campos

### Campos Obligatorios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | Identificador único autoincremental para cada sesión |
| `created_at` | TIMESTAMPTZ | Timestamp de cuándo se registró la sesión (incluye zona horaria) |
| `micro_objective` | TEXT | Objetivo específico y medible de la sesión (ej: "Cambio limpio C→G a 60 bpm") |
| `technical_focus` | VARCHAR(50) | Categoría del foco técnico (ver valores permitidos abajo) |
| `duration_min` | INTEGER | Duración de la sesión en minutos (5, 10, 20, 30, 45 o 60) |

### Campos Opcionales (Métricas de Rendimiento)

| Campo | Tipo | Rango | Descripción |
|-------|------|-------|-------------|
| `bpm_target` | INTEGER | 1-300 | Tempo objetivo en beats por minuto |
| `bpm_achieved` | INTEGER | 1-300 | Tempo realmente logrado durante la práctica |
| `perfect_takes` | INTEGER | 0-3 | Número de ejecuciones perfectas (mide consistencia) |
| `quality_rating` | INTEGER | 1-5 | Calificación subjetiva de calidad (★) |
| `rpe` | INTEGER | 1-10 | Rate of Perceived Exertion (esfuerzo físico/mental percibido) |

### Campos Flexibles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `mindset_checklist` | JSONB | Checklist de hábitos Growth Mindset (ver estructura abajo) |
| `reflection` | TEXT | Nota breve de reflexión (típicamente una línea) |
| `updated_at` | TIMESTAMPTZ | Timestamp de última actualización (se actualiza automáticamente) |

---

## Tipos de Datos y Decisiones de Diseño

### `technical_focus` - VARCHAR(50)

**Valores permitidos:**
- `'Técnica'`
- `'Ritmo'`
- `'Limpieza'`
- `'Coordinación'`
- `'Repertorio'`

**Por qué VARCHAR en lugar de ENUM:**
- Los ENUMs en PostgreSQL son difíciles de modificar después de creados
- VARCHAR con CHECK constraint permite flexibilidad para agregar categorías futuras
- 50 caracteres es suficiente para posibles valores en español/inglés

### `duration_min` - INTEGER

**Valores permitidos:** `5, 10, 20, 30, 45, 60`

**Por qué estos valores:**
- Son los intervalos más comunes en práctica musical
- Evita que el usuario pierda tiempo decidiendo duración exacta
- Simplifica análisis de datos (buckets predefinidos)

**Por qué CHECK constraint:**
- Garantiza data integrity a nivel de base de datos
- Evita bugs por valores inválidos desde el frontend

### `bpm_target` / `bpm_achieved` - INTEGER

**Rango:** 1-300 BPM

**Por qué este rango:**
- 40-200 BPM cubre la mayoría de música práctica
- 1-300 da margen para casos extremos sin permitir valores absurdos
- NULL permitido porque no todas las prácticas son basadas en tempo

### `perfect_takes` - INTEGER (0-3)

**Por qué 0-3:**
- Basado en investigación de práctica deliberada
- 3+ repeticiones perfectas sugieren consolidación del skill
- Más de 3 es innecesario trackear para mejora

### `quality_rating` - INTEGER (1-5)

**Por qué escala 1-5:**
- Correlaciona con sistema de 5 estrellas (UI intuitivo)
- Suficiente granularidad sin ser abrumador
- Evita "choice paralysis" de escalas 1-10

### `rpe` - INTEGER (1-10)

**Rate of Perceived Exertion:**
- Escala estándar en deportes y ciencia del ejercicio
- Trackea fatiga mental/física para prevenir burnout
- Útil para identificar patrones de esfuerzo óptimo

### `mindset_checklist` - JSONB

**Por qué JSONB en lugar de columnas booleanas:**
- Flexibilidad: Fácil agregar/remover checks sin ALTER TABLE
- Performance: GIN index permite queries eficientes
- Storage: Más compacto que múltiples columnas booleanas
- Frontend-friendly: Se serializa/deserializa directamente con JSON

**Por qué JSONB sobre JSON:**
- JSONB es binario = más rápido para queries
- Soporta indexing (GIN)
- Ligeramente más lento en INSERT (despreciable para este caso)

### `created_at` / `updated_at` - TIMESTAMPTZ

**Por qué TIMESTAMPTZ en lugar de TIMESTAMP:**
- Almacena zona horaria (crucial si viajas)
- Permite queries correctas incluso cruzando cambios de horario
- Best practice en PostgreSQL moderno

---

## Estructura de JSONB

### Campo `mindset_checklist`

```json
{
  "warmed_up": true,
  "practiced_slow": true,
  "recorded_myself": false,
  "took_breaks": true,
  "reviewed_mistakes": true
}
```

**Campos del checklist:**

| Campo | Descripción | Growth Mindset Rationale |
|-------|-------------|--------------------------|
| `warmed_up` | ¿Calenté antes de practicar? | Prevención de lesiones, enfoque físico |
| `practiced_slow` | ¿Practiqué lento y controlado? | Calidad sobre velocidad, construcción de memoria muscular |
| `recorded_myself` | ¿Me grabé en audio/video? | Auto-evaluación objetiva, identificación de errores |
| `took_breaks` | ¿Hice pausas durante la sesión? | Consolidación de aprendizaje, prevención de fatiga |
| `reviewed_mistakes` | ¿Analicé mis errores específicamente? | Aprendizaje dirigido, corrección intencional |

**Flexibilidad futura:**

Podrías agregar campos adicionales como:
```json
{
  "warmed_up": true,
  "practiced_slow": true,
  "recorded_myself": false,
  "took_breaks": true,
  "reviewed_mistakes": true,
  "used_metronome": true,           // Nuevo campo
  "practiced_with_eyes_closed": false,  // Nuevo campo
  "notes": "Probé nueva técnica de picking"  // Metadata adicional
}
```

---

## Índices

### Índices Implementados

```sql
-- 1. Orden cronológico inverso (sesiones más recientes primero)
CREATE INDEX idx_sessions_created_at_desc
  ON sessions (created_at DESC);

-- 2. Filtrado por foco técnico
CREATE INDEX idx_sessions_technical_focus
  ON sessions (technical_focus);

-- 3. Índice compuesto para queries de fecha + foco
CREATE INDEX idx_sessions_created_focus
  ON sessions (created_at DESC, technical_focus);

-- 4. Índice parcial para tracking de BPM (solo valores no-null)
CREATE INDEX idx_sessions_bpm_achieved
  ON sessions (bpm_achieved)
  WHERE bpm_achieved IS NOT NULL;

-- 5. GIN index para queries JSONB
CREATE INDEX idx_sessions_mindset_checklist
  ON sessions USING GIN (mindset_checklist);
```

### Rationale de Cada Índice

**1. `idx_sessions_created_at_desc`**
- **Uso:** Timeline principal (sesiones más recientes primero)
- **Queries optimizadas:** `SELECT * FROM sessions ORDER BY created_at DESC LIMIT 20`
- **Trade-off:** Pequeño overhead en INSERT, gran mejora en lecturas

**2. `idx_sessions_technical_focus`**
- **Uso:** Filtrado por categoría ("Mostrar solo sesiones de Técnica")
- **Queries optimizadas:** `SELECT * FROM sessions WHERE technical_focus = 'Técnica'`

**3. `idx_sessions_created_focus`**
- **Uso:** Filtrado compuesto (fechas + foco)
- **Queries optimizadas:**
  ```sql
  SELECT * FROM sessions
  WHERE created_at >= '2025-10-01'
    AND technical_focus = 'Ritmo'
  ORDER BY created_at DESC
  ```
- **Nota:** PostgreSQL puede usar este índice incluso si solo filtras por `created_at`

**4. `idx_sessions_bpm_achieved` (Partial Index)**
- **Uso:** Tracking de evolución de tempo
- **Queries optimizadas:**
  ```sql
  SELECT bpm_achieved, created_at
  FROM sessions
  WHERE bpm_achieved IS NOT NULL
  ORDER BY created_at
  ```
- **Por qué parcial:** Ignora rows con `bpm_achieved = NULL`, ahorrando espacio (50%+ de sesiones no trackean BPM)

**5. `idx_sessions_mindset_checklist` (GIN Index)**
- **Uso:** Queries sobre checklist (ej: "sesiones donde practiqué lento")
- **Queries optimizadas:**
  ```sql
  SELECT * FROM sessions
  WHERE mindset_checklist @> '{"practiced_slow": true}'::jsonb
  ```
- **Trade-off:** GIN index es más grande pero permite queries complejas de JSONB

---

## Queries de Ejemplo

### 1. Insertar Nueva Sesión (Mínima)

```sql
INSERT INTO sessions (
  micro_objective,
  technical_focus,
  duration_min
) VALUES (
  'Arpeggio de Em con púa alternada',
  'Técnica',
  20
);
```

### 2. Insertar Sesión Completa

```sql
INSERT INTO sessions (
  micro_objective,
  technical_focus,
  duration_min,
  bpm_target,
  bpm_achieved,
  perfect_takes,
  quality_rating,
  rpe,
  mindset_checklist,
  reflection
) VALUES (
  'Clean C→G chord change at 60 bpm',
  'Técnica',
  20,
  60,
  55,
  2,
  4,
  6,
  '{"warmed_up": true, "practiced_slow": true, "recorded_myself": false, "took_breaks": true, "reviewed_mistakes": true}'::jsonb,
  'Necesito levantar menos el dedo índice durante el cambio'
);
```

### 3. Obtener Últimas 20 Sesiones

```sql
SELECT
  id,
  created_at,
  micro_objective,
  technical_focus,
  duration_min,
  quality_rating
FROM sessions
ORDER BY created_at DESC
LIMIT 20;
```

### 4. Filtrar por Foco Técnico

```sql
SELECT *
FROM sessions
WHERE technical_focus = 'Ritmo'
ORDER BY created_at DESC;
```

### 5. Filtrar por Rango de Fechas

```sql
SELECT *
FROM sessions
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 6. Estadísticas: Racha de Días (Últimos 7 Días)

```sql
SELECT COUNT(DISTINCT DATE(created_at)) AS streak
FROM sessions
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### 7. Estadísticas: Minutos Totales Esta Semana

```sql
SELECT SUM(duration_min) AS total_minutes
FROM sessions
WHERE created_at >= DATE_TRUNC('week', NOW());
```

### 8. Estadísticas: Calidad Promedio Semanal

```sql
SELECT ROUND(AVG(quality_rating)::numeric, 1) AS avg_quality
FROM sessions
WHERE quality_rating IS NOT NULL
  AND created_at >= DATE_TRUNC('week', NOW());
```

### 9. Evolución de BPM en el Tiempo

```sql
SELECT
  DATE(created_at) AS practice_date,
  micro_objective,
  bpm_target,
  bpm_achieved
FROM sessions
WHERE bpm_achieved IS NOT NULL
ORDER BY created_at ASC;
```

### 10. Query JSONB: Sesiones Donde Practiqué Lento

```sql
SELECT
  micro_objective,
  created_at,
  quality_rating
FROM sessions
WHERE mindset_checklist @> '{"practiced_slow": true}'::jsonb
ORDER BY created_at DESC;
```

### 11. Query JSONB: Contar Cuántas Veces Me Grabé

```sql
SELECT COUNT(*) AS times_recorded
FROM sessions
WHERE mindset_checklist @> '{"recorded_myself": true}'::jsonb;
```

### 12. Query JSONB: Extraer Valor de Checklist

```sql
SELECT
  micro_objective,
  mindset_checklist->>'warmed_up' AS warmed_up,
  mindset_checklist->>'practiced_slow' AS practiced_slow
FROM sessions
LIMIT 10;
```

### 13. Query Complejo: Best Sessions (Alta Calidad + Checklist Completo)

```sql
SELECT
  micro_objective,
  quality_rating,
  created_at,
  mindset_checklist
FROM sessions
WHERE quality_rating >= 4
  AND mindset_checklist @> '{"practiced_slow": true}'::jsonb
  AND mindset_checklist @> '{"reviewed_mistakes": true}'::jsonb
ORDER BY quality_rating DESC, created_at DESC
LIMIT 10;
```

### 14. Análisis: Correlación Entre Calentar y Calidad

```sql
SELECT
  mindset_checklist->>'warmed_up' AS warmed_up,
  ROUND(AVG(quality_rating)::numeric, 2) AS avg_quality,
  COUNT(*) AS session_count
FROM sessions
WHERE quality_rating IS NOT NULL
  AND mindset_checklist ? 'warmed_up'
GROUP BY mindset_checklist->>'warmed_up';
```

### 15. Full-Text Search en Objetivos

```sql
SELECT
  micro_objective,
  created_at,
  technical_focus
FROM sessions
WHERE micro_objective ILIKE '%acorde%'
ORDER BY created_at DESC;
```

---

## Instrucciones de Uso

### Setup Inicial en Neon

1. **Crear cuenta en Neon:** https://neon.tech
2. **Crear nuevo proyecto** en Neon dashboard
3. **Copiar connection string** (formato: `postgresql://user:pass@host/db`)
4. **Ir a SQL Editor** en Neon dashboard
5. **Ejecutar `db/init.sql`** para crear tabla e índices

### Variables de Entorno

Agregar a `.env.local`:

```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"
```

### Desarrollo Local

Para resetear la base de datos durante desarrollo:

```sql
-- En Neon SQL Editor:
-- Copia y pega el contenido de db/init.sql
```

### Testing de Conexión

Crear endpoint de test (`app/api/test/route.ts`):

```typescript
import { neon } from '@neondatabase/serverless';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const result = await sql`SELECT NOW() as current_time`;
  return Response.json(result[0]);
}
```

Verificar: `http://localhost:3000/api/test`

### Backup

Para exportar toda la data:

```sql
-- En Neon SQL Editor:
SELECT json_agg(sessions.*)
FROM sessions;
```

Copiar el resultado y guardarlo como `backup_YYYY-MM-DD.json`.

---

## Mejoras Futuras (Post-MVP)

**Posibles adiciones al schema:**

1. **Tabla `objective_templates`:**
   ```sql
   CREATE TABLE objective_templates (
     id SERIAL PRIMARY KEY,
     template_text TEXT NOT NULL,
     technical_focus VARCHAR(50),
     use_count INTEGER DEFAULT 0
   );
   ```

2. **Tabla `weekly_retrospectives`:**
   ```sql
   CREATE TABLE weekly_retros (
     id SERIAL PRIMARY KEY,
     week_start DATE NOT NULL,
     what_worked TEXT,
     next_experiment TEXT
   );
   ```

3. **Full-Text Search Index:**
   ```sql
   CREATE INDEX idx_sessions_objective_fts
     ON sessions
     USING GIN (to_tsvector('spanish', micro_objective));
   ```

4. **Materialized View para Stats:**
   ```sql
   CREATE MATERIALIZED VIEW weekly_stats AS
   SELECT
     DATE_TRUNC('week', created_at) AS week_start,
     COUNT(*) AS session_count,
     SUM(duration_min) AS total_minutes,
     AVG(quality_rating) AS avg_quality
   FROM sessions
   GROUP BY DATE_TRUNC('week', created_at);
   ```

---

## Mantenimiento

### Verificar Tamaño de Tabla

```sql
SELECT
  pg_size_pretty(pg_total_relation_size('sessions')) AS total_size,
  pg_size_pretty(pg_table_size('sessions')) AS table_size,
  pg_size_pretty(pg_indexes_size('sessions')) AS indexes_size;
```

### Ver Índices Activos

```sql
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'sessions';
```

### Estadísticas de Uso de Índices

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'sessions'
ORDER BY idx_scan DESC;
```

---

## Soporte

Para más información sobre PostgreSQL y Neon:

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Neon Docs:** https://neon.tech/docs
- **JSONB Best Practices:** https://www.postgresql.org/docs/current/datatype-json.html
- **PostgreSQL Index Types:** https://www.postgresql.org/docs/current/indexes-types.html

---

**Última actualización:** 2025-10-08
**Versión del schema:** 1.0.0
