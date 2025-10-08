# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

**IMPORTANTE**: Todas las respuestas y explicaciones deben ser en español. El código, nombres de variables, funciones, comentarios técnicos y documentación de código deben estar en inglés.

## Descripción del Proyecto

**Deliberate Guitar** es una aplicación web personal para tracking de práctica deliberada de guitarra, enfocada en la filosofía Growth Mindset + Kaizen. Desktop-first, usuario único, sin autenticación.

### Filosofía Central
- **Práctica Deliberada**: Intención → Atención → Corrección → Evolución
- **Growth Mindset**: Celebrar estrategias efectivas, no solo resultados
- **Kaizen**: Pequeñas mejoras diarias, progreso compuesto

## Stack Tecnológico

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Componentes**: Nativos + utilidades ligeras (sin librerías pesadas)
- **Gestión de datos**: fetch + estado local
- **Backend**: Vercel Serverless Functions
- **SQL**: Queries directas (sin ORM, 0 dependencias)
- **Base de datos**: Neon (PostgreSQL serverless) con driver `@neondatabase/serverless`
- **Deploy**: Vercel

### Variables de Entorno
- `DATABASE_URL`: String de conexión a Neon PostgreSQL

## Arquitectura

### Layout de Dos Paneles
- **Panel Izquierdo**: Registro Rápido de Sesión de Práctica (siempre visible)
- **Panel Derecho**: Línea de Tiempo de Evolución + Estadísticas

### Modelo de Datos (tabla sessions)
Campos principales a capturar por sesión de práctica:
- Objetivo micro (texto, requerido)
- Foco técnico (enum: Técnica | Ritmo | Limpieza | Coordinación | Repertorio)
- Duración (5/10/20/30/45/60 min)
- Datos de rendimiento (opcionales): BPM objetivo/logrado, tomas perfectas (0-3), calidad (1-5★), RPE (1-10)
- Checklist de mindset (flags booleanos): calenté, practiqué lento, me grabé, hice pausas, revisé errores
- Reflexión breve (texto)
- Timestamp

Se puede usar columnas `jsonb` para datos flexibles como checklist de mindset, errores, correcciones.

### Modelo de Seguridad (Uso Personal)
- Sin sistema de autenticación de usuarios
- Acceso por URL
- Sin rate limiting (innecesario para uso personal)
- Exportación a JSON para backup

## Requerimientos Clave de UX

### Registro de Sesión (objetivo: completar en ≤30s)
1. Input de texto grande para objetivo micro con sugerencias de autocompletado
2. Chips de foco técnico (selección única)
3. Selector rápido de duración
4. Métricas de rendimiento opcionales (BPM, tomas, calidad, esfuerzo)
5. Checklist de mindset tap-friendly
6. Campo de reflexión de una línea
7. **Al Guardar**: Mostrar mensaje breve de insight alineado con Growth Mindset + Kaizen

### Pantalla de Evolución
- Línea de tiempo cronológica de tarjetas de sesión (compactas)
- Filtros: rango de fechas, foco técnico, tags
- Panel de stats: racha de días, minutos de práctica semanales, gráfico de evolución de BPM, calidad promedio (★)

### Configuración
- Plantillas de objetivos (ej: "Cambio de acorde limpio C→G a 60 bpm")
- Exportar/descargar JSON
- Preferencias de UI (orden de chips, etc.)

## Principios de UI/UX

- **Desktop-first**: Panel izquierdo fijo (registro) + panel derecho (evolución)
- **Minimalista**: Sin ruido visual, colores neutros, tipografía legible
- **Feedback positivo**: Mensajes breves enfocados en estrategia después de guardar
- **Baja fricción**: Sin modales, menús ocultos o complejidad
- **Motivación intrínseca**: Mostrar métricas de proceso (calidad, correcciones), no solo velocidad/cantidad

### Elementos de Diseño Psicológico
- Elogiar estrategias efectivas en insights post-guardado
- "Kaizen del día": sugerir micro-ajuste para la próxima sesión
- Retro semanal (2 preguntas): "¿Qué funcionó? / ¿Qué micro-experimento probarás?"

## Comandos de Desarrollo

**Nota**: El proyecto está en etapa inicial; los comandos a continuación son placeholder para cuando comience la implementación.

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Formatear
npm run format
```

## Notas sobre Schema de Base de Datos

Usar queries SQL directas (sin ORM) para mantener dependencias mínimas. Estructura de ejemplo:

```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  micro_objective TEXT NOT NULL,
  technical_focus VARCHAR(50) NOT NULL,
  duration_min INTEGER NOT NULL,
  bpm_target INTEGER,
  bpm_achieved INTEGER,
  perfect_takes INTEGER CHECK (perfect_takes BETWEEN 0 AND 3),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  mindset_checklist JSONB,
  reflection TEXT
);
```
