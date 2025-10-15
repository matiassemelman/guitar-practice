# Diseño del Tracker de Hábitos Diarios

## Sección 1: Arquitectura General

El sistema de hábitos diarios será **completamente independiente** del sistema de sesiones de práctica, con su propia tabla `daily_habits` en la base de datos. Esto permite mantener separados dos conceptos distintos: las **sesiones de práctica detalladas** (con objetivos micro específicos, análisis profundo) y los **hábitos rutinarios** (warmup, ejercicios de acordes, estudio de clases).

**Ubicación visual**: El tracker vivirá en el **panel superior de la aplicación**, integrado con o junto al `StatsPanel` actual. Esto lo hace inmediatamente visible al abrir la app, sin requerir navegación adicional. Consideramos dos opciones de layout:
- Opción A: Agregar una sección "Hábitos de Hoy" dentro del `StatsPanel` existente
- Opción B: Crear un nuevo componente `DailyHabitsPanel` que se posicione justo encima o al lado del `StatsPanel`

**Modelo de datos**: Nueva tabla `daily_habits` con estructura:
- `id` (SERIAL PRIMARY KEY)
- `date` (DATE NOT NULL, UNIQUE) - una fila por día
- `warmup_done` (BOOLEAN DEFAULT false)
- `warmup_duration_min` (INTEGER, nullable)
- `chords_done` (BOOLEAN DEFAULT false)
- `chords_duration_min` (INTEGER, nullable)
- `chords_bpm` (INTEGER, nullable)
- `chords_notes` (TEXT, nullable) - nota libre sobre el resultado
- `class_done` (BOOLEAN DEFAULT false)
- `class_duration_min` (INTEGER, nullable)
- `created_at`, `updated_at` (TIMESTAMPTZ)

Este diseño permite consultas rápidas tipo "dame los hábitos de hoy" con un solo SELECT por fecha, y mantiene los datos estructurados para análisis posterior (ej: "BPM promedio en ejercicios de acordes este mes").

---

## Sección 2: Interfaz de Usuario - Panel de Hábitos del Día

El componente `DailyHabitsPanel` se ubicará en la parte superior de la aplicación, mostrando los tres hábitos del día actual en un diseño compacto tipo checklist con estética cyberpunk.

**Diseño visual**: Card glassmorphism horizontal con 3 columnas (una por hábito), cada una con:
- **Estado colapsado** (default): Checkbox grande + ícono + nombre del hábito
- **Estado expandido**: Checkbox + campos específicos del hábito inline

**Interacción - Flujo de marcar rápido**:
1. Usuario ve los 3 hábitos con checkbox vacíos
2. Click en checkbox marca como completado (sin expandir)
3. Si quiere agregar detalles (duración, BPM, notas), click en cualquier parte de la card del hábito para expandir
4. Se muestran los campos adicionales inline
5. Llena los campos que desee
6. Click en "Guardar día" (botón único abajo) persiste todos los cambios

**Campos específicos por hábito**:

**Warmup (Escala Cromática)**:
- Checkbox: "Warmup completado"
- Duración: selector rápido [5, 10 min] o input custom

**Cambio de Acordes**:
- Checkbox: "Práctica de acordes completada"
- Duración: selector [5, 10, 15, 20 min] o custom
- BPM probado: input numérico (opcional)
- Resultado/Notas: textarea pequeño (ej: "C→G limpio a 60bpm")

**Ver Clase**:
- Checkbox: "Clase vista"
- Duración: selector [20 min] o custom

**Botón de guardado**: Un único botón "Guardar día" con glow effect al bottom del panel, que hace POST/PUT a `/api/habits` con todos los datos del día actual.

---

## Sección 3: Calendario de Visualización - Heatmap Mensual

El calendario mostrará el historial de hábitos completados en una vista mensual tipo heatmap, ubicado debajo del panel de hábitos del día o en una sección expandible.

**Componente**: `HabitsCalendar` - Grid de días del mes actual con navegación mensual (flechas prev/next).

**Diseño visual de cada celda del calendario**:
- Número del día
- 3 indicadores pequeños (dots/iconos) representando cada hábito
- Estados visuales por hábito:
  - **Completado**: Dot con color neon (warmup=cyan, acordes=magenta, clase=yellow)
  - **No completado**: Dot gris/transparente
  - **Día sin datos**: Celda con fondo más oscuro

**Interacción**:
- **Hover sobre celda**: Tooltip muestra resumen del día ("✓ Warmup (10min), ✓ Acordes (15min, 80bpm), ✗ Clase")
- **Click en celda**: Abre panel lateral o modal con detalles completos del día
  - Los 3 hábitos con todos sus datos (duración, BPM, notas)
  - Solo visualización (sin edición por ahora en MVP)
  - Botón "Cerrar" para volver al calendario

**Datos a visualizar**: El calendario hace un GET a `/api/habits?month=YYYY-MM` que devuelve un array de todos los días del mes con datos (días sin registro no aparecen en el response, se infieren como vacíos en el frontend).

**Estadísticas del mes** (opcional, mostrar arriba del calendario):
- "Este mes: 🔥 Warmup 15/30 días, 🎸 Acordes 12/30 días, 📚 Clase 10/30 días"
- Racha actual: "¡5 días consecutivos completando todos los hábitos!"

---

## Sección 4: API y Backend

**Endpoints necesarios**:

### `GET /api/habits?date=YYYY-MM-DD`
Obtiene los hábitos de un día específico (default: hoy).

**Query params**:
- `date` (opcional): Fecha en formato ISO (YYYY-MM-DD). Si no se provee, usa fecha actual.

**Response**:
```json
{
  "success": true,
  "data": {
    "date": "2025-10-15",
    "warmup": {
      "done": true,
      "durationMin": 10
    },
    "chords": {
      "done": true,
      "durationMin": 15,
      "bpm": 80,
      "notes": "C→G limpio a 80bpm"
    },
    "class": {
      "done": false,
      "durationMin": null
    }
  }
}
```

Si no hay registro para ese día, devuelve estructura con todos los campos en `false`/`null`.

### `POST /api/habits` o `PUT /api/habits`
Guarda/actualiza los hábitos del día.

**Request body**:
```json
{
  "date": "2025-10-15",
  "warmup": { "done": true, "durationMin": 10 },
  "chords": { "done": true, "durationMin": 15, "bpm": 80, "notes": "..." },
  "class": { "done": false, "durationMin": null }
}
```

**Lógica**: Usa UPSERT (INSERT ... ON CONFLICT UPDATE) para crear o actualizar registro según si ya existe uno para esa fecha.

**Response**: Devuelve el registro guardado con el mismo formato que GET.

### `GET /api/habits/month?month=YYYY-MM`
Obtiene todos los hábitos de un mes completo para el calendario.

**Query params**:
- `month` (opcional): Mes en formato YYYY-MM. Default: mes actual.

**Response**:
```json
{
  "success": true,
  "data": {
    "month": "2025-10",
    "days": [
      {
        "date": "2025-10-01",
        "warmup": { "done": true, "durationMin": 10 },
        "chords": { "done": false, "durationMin": null, "bpm": null, "notes": null },
        "class": { "done": true, "durationMin": 20 }
      },
      // ... más días con datos
    ],
    "stats": {
      "warmupCount": 15,
      "chordsCount": 12,
      "classCount": 10,
      "totalDays": 30,
      "currentStreak": 5
    }
  }
}
```

**Implementación**: Query SQL que filtra por mes y mapea los campos de la tabla a la estructura JSON esperada.

---

## Sección 5: Plan de Implementación

### **Fase 1: Base de datos y tipos TypeScript** (estimado: 30-45 min)

1. **Crear migration de DB**:
   - Archivo `db/migrations/002_daily_habits.sql`
   - Tabla `daily_habits` con estructura definida en Sección 1
   - Índice único en `date`
   - Trigger `updated_at` automático

2. **Tipos TypeScript**:
   - Archivo `types/habits.ts`
   - Interfaces: `DailyHabits`, `HabitData`, `HabitsMonthResponse`, etc.
   - Type guards y constantes

### **Fase 2: API Routes** (estimado: 1-1.5 hrs)

3. **Endpoint `GET /api/habits`**:
   - Archivo `app/api/habits/route.ts`
   - Implementar query con parámetro `date`
   - Mapeo de columnas DB → JSON response

4. **Endpoint `POST /api/habits`** (mismo archivo):
   - Validación de input
   - UPSERT con `ON CONFLICT (date) DO UPDATE`
   - Response con datos guardados

5. **Endpoint `GET /api/habits/month`**:
   - Archivo `app/api/habits/month/route.ts`
   - Query SQL con filtro de mes
   - Cálculo de estadísticas (counts, streak)

### **Fase 3: Componente DailyHabitsPanel** (estimado: 2-3 hrs)

6. **Estructura base del componente**:
   - Archivo `app/components/DailyHabitsPanel.tsx`
   - Estado local para los 3 hábitos
   - Fetch inicial de datos del día actual
   - Función `handleSave` con POST/PUT

7. **UI de cada hábito**:
   - Sub-componente `HabitItem.tsx` (reutilizable)
   - Estados colapsado/expandido
   - Checkbox + campos específicos según tipo de hábito
   - Animaciones de transición

8. **Integración en layout principal**:
   - Actualizar `app/page.tsx`
   - Agregar `DailyHabitsPanel` arriba del `StatsPanel`
   - Callback para refresh cuando se guarda

### **Fase 4: Calendario HabitsCalendar** (estimado: 2-3 hrs)

9. **Componente de calendario**:
   - Archivo `app/components/HabitsCalendar.tsx`
   - Grid de 7x5 (semanas x días)
   - Navegación prev/next mes
   - Fetch de datos del mes

10. **Celda de día**:
    - Sub-componente `DayCell.tsx`
    - 3 dots con colores según estado
    - Tooltip en hover
    - Click handler para modal de detalle

11. **Modal de detalles del día**:
    - Componente `DayDetailModal.tsx`
    - Mostrar los 3 hábitos con todos sus datos
    - Solo lectura (sin edición en MVP)

### **Fase 5: Testing y pulido** (estimado: 1 hr)

12. **Testing manual**:
    - Crear/editar hábitos
    - Navegación de calendario
    - Verificar datos en DB
    - Responsive (desktop-first pero revisar mobile)

13. **Ajustes visuales**:
    - Colores cyberpunk coherentes
    - Glassmorphism y glow effects
    - Animaciones smooth

**Tiempo total estimado: 6.5-9.5 horas**
