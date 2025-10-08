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
- **Estética Cyberpunk 2077**: Colores neon (magenta #FF00FF, cyan #00FFFF, yellow #FFFF00, pink #FF00AA) sobre fondos ultra oscuros con glassmorphism
- **Glassmorphism**: Cards con backdrop-blur, transparencias y borders luminosos con glow effects
- **Feedback positivo**: Mensajes breves enfocados en estrategia después de guardar
- **Baja fricción**: Sin modales, menús ocultos o complejidad
- **Motivación intrínseca**: Mostrar métricas de proceso (calidad, correcciones), no solo velocidad/cantidad

### Elementos de Diseño Psicológico
- Elogiar estrategias efectivas en insights post-guardado
- "Kaizen del día": sugerir micro-ajuste para la próxima sesión
- Retro semanal (2 preguntas): "¿Qué funcionó? / ¿Qué micro-experimento probarás?"

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Testing de API (después de configurar .env.local)
./test-api.sh
```

## Estructura del Proyecto

```
/home/matias/projects/guitar-practice/
├── app/
│   ├── api/
│   │   ├── test/route.ts           # Endpoint de verificación de DB
│   │   ├── sessions/route.ts       # GET/POST sesiones
│   │   └── stats/route.ts          # GET estadísticas
│   ├── components/
│   │   ├── SessionForm.tsx         # Formulario de registro (panel izquierdo)
│   │   ├── SessionsList.tsx        # Timeline de sesiones (panel derecho)
│   │   ├── SessionCard.tsx         # Tarjeta individual de sesión
│   │   └── StatsPanel.tsx          # Panel de estadísticas
│   ├── page.tsx                    # Página principal (layout de 2 paneles)
│   ├── layout.tsx                  # Layout raíz
│   └── globals.css                 # Estilos globales
├── lib/
│   ├── db.ts                       # Cliente de PostgreSQL + helpers
│   ├── validation.ts               # Validación de inputs
│   ├── insights.ts                 # Generador de mensajes Growth Mindset
│   ├── session-helpers.ts          # Funciones helper para sesiones
│   └── date-utils.ts               # Formateo de fechas
├── types/
│   ├── session.ts                  # Tipos de sesiones
│   ├── database.ts                 # Tipos de DB + query builders
│   ├── api.ts                      # Tipos de API responses
│   └── ui.ts                       # Tipos de componentes
├── db/
│   ├── schema.sql                  # Schema con comentarios
│   ├── init.sql                    # Script de inicialización
│   └── README.md                   # Documentación de DB
└── .env.local                      # Variables de entorno (no versionado)
```

## Base de Datos

### Setup Inicial

1. **Crear proyecto en Neon**: https://console.neon.tech
2. **Copiar connection string** del dashboard de Neon
3. **Actualizar `.env.local`**:
   ```bash
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```
4. **Ejecutar schema**: Copiar contenido de `/db/init.sql` y ejecutar en Neon SQL Editor

### Schema de Base de Datos

Tabla `sessions` con:
- Campos obligatorios: `micro_objective`, `technical_focus`, `duration_min`
- Campos opcionales de rendimiento: BPM, tomas perfectas, calidad, RPE
- `mindset_checklist` JSONB: checklist flexible de 5 hábitos
- `reflection` TEXT: reflexión de una línea
- Índices optimizados para queries comunes (timeline, filtros, stats)

Ver `/db/schema.sql` para schema completo con comentarios y `/db/README.md` para documentación detallada.

## API Routes

### GET /api/test
Verifica conexión a base de datos.

### GET /api/sessions
Lista sesiones con filtros opcionales.
- Query params: `technicalFocus`, `dateFrom`, `dateTo`, `limit`, `offset`
- Returns: Array de sesiones + total count

### POST /api/sessions
Crea nueva sesión de práctica.
- Body: `CreateSessionInput`
- Returns: Sesión creada + insight motivacional

### GET /api/stats
Obtiene estadísticas agregadas.
- Returns: Racha de días, minutos semanales, calidad promedio, totales

## Estado Actual

### ✅ Completado (MVP ~85%)
- Backend completo (DB client + API routes)
- Componentes React (formulario, lista, stats)
- Layout de dos paneles integrado
- Sistema de insights Growth Mindset + Kaizen
- Validación completa de datos
- Loading states y error handling
- **Diseño visual Cyberpunk 2077** con paleta neon y glassmorphism completo

### ⏳ Pendiente
- Filtros por foco técnico y rango de fechas
- Gráfico de evolución de BPM
- Plantillas de objetivos (autocompletado)
- Exportación a JSON
- Deploy a Vercel

## Notas de Implementación

- **Sin ORM**: Queries SQL directas con escape de parámetros manual
- **Driver Neon**: Usa `@neondatabase/serverless` con queries interpoladas
- **TypeScript estricto**: Todos los archivos tipados, cero `any` excepto workarounds necesarios
- **Componentes "use client"**: Formulario y página principal (necesitan interactividad)
- **Fetch directo**: Sin librerías de data fetching (React Query, SWR, etc.)
- **Tailwind inline**: Sin archivos CSS de componentes separados
- **Sistema de diseño**: Paleta cyberpunk definida en `globals.css` con `@theme` (Tailwind v4), 4 utility classes custom (`.glass-card`, `.glow-magenta`, `.glow-cyan`, `.glow-pink`)
