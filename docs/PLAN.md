# Plan de Desarrollo - Deliberate Guitar MVP

**Fecha de inicio:** 2025-10-08
**Tiempo estimado total:** 15-20 horas
**Estrategia:** Vertical Slice Híbrido (Infraestructura → End-to-End → Iteración)

---

## 🎯 Objetivo General

Construir "Deliberate Guitar" siguiendo la filosofía de **funcional primero, refinado después**, validando arquitectura completa lo antes posible.

---

## FASE 0: Fundamentos (2-3 horas)

### Setup Inicial
- [ ] **Paso 1:** Inicializar Next.js con TypeScript + Tailwind
  - Ejecutar: `npx create-next-app@latest guitar-practice --typescript --tailwind --app --no-src-dir`
  - Verificar: `npm run dev` muestra página de inicio

- [ ] **Paso 2:** Configurar Variables de Entorno
  - Crear cuenta en Neon (https://neon.tech)
  - Crear proyecto nuevo en Neon
  - Copiar connection string
  - Crear archivo `.env.local` con `DATABASE_URL`
  - Verificar que `.env.local` está en `.gitignore`

- [ ] **Paso 3:** Instalar Driver de Neon
  - Ejecutar: `npm install @neondatabase/serverless`

- [ ] **Paso 4:** Crear Schema de Base de Datos
  - Ir a Neon Dashboard → SQL Editor
  - Ejecutar SQL de creación de tabla `sessions`
  - Verificar que la tabla aparece en Neon

- [ ] **Paso 5:** Verificar Conexión DB
  - Crear `app/api/test/route.ts`
  - Probar endpoint `/api/test`
  - Verificar que retorna timestamp actual de la DB

**✅ Checkpoint Fase 0:** Infraestructura completa y verificada

---

## FASE 1: Vertical Slice Mínima (3-4 horas)

**Objetivo:** Guardar 1 sesión simple y verla en una lista

### Backend Básico
- [ ] **Paso 6:** Crear Tipos TypeScript
  - Crear archivo `types/session.ts`
  - Definir interfaces: `Session`, `CreateSessionInput`, type `TechnicalFocus`

- [ ] **Paso 7:** API Route para Sesiones
  - Crear `app/api/sessions/route.ts`
  - Implementar POST (guardar sesión)
  - Implementar GET (listar sesiones)
  - Probar con Postman/Thunder Client

### Frontend Básico
- [ ] **Paso 8:** Componente de Formulario Básico
  - Crear `app/components/SessionForm.tsx`
  - Campos: objetivo micro, foco técnico, duración
  - Selector rápido de duración (5/10/20/30/45/60 min)
  - Submit guarda vía API

- [ ] **Paso 9:** Componente de Lista de Sesiones
  - Crear `app/components/SessionsList.tsx`
  - Mostrar sesiones en orden cronológico
  - Formato: objetivo, foco, duración, fecha

- [ ] **Paso 10:** Página Principal con Layout de Dos Paneles
  - Modificar `app/page.tsx`
  - Layout: grid de 2 columnas
  - Izquierda: SessionForm
  - Derecha: SessionsList
  - Implementar refresh automático al guardar

**✅ Checkpoint Fase 1:** Puedo guardar sesiones y verlas aparecer automáticamente

---

## FASE 2: Refinamiento de Formulario (2-3 horas)

**Objetivo:** Completar todos los campos del formulario según spec

### Campos Opcionales de Rendimiento
- [ ] **Paso 11:** Agregar Inputs de BPM
  - BPM objetivo (input numérico)
  - BPM logrado (input numérico)
  - Actualizar tipos TypeScript
  - Actualizar API para aceptar estos campos

- [ ] **Paso 11b:** Selector de Tomas Perfectas
  - Implementar 3 círculos clicables (0-3)
  - Visual feedback del número seleccionado

- [ ] **Paso 11c:** Rating de Calidad
  - 5 estrellas clicables (1-5)
  - Visual feedback de estrellas llenas/vacías

- [ ] **Paso 11d:** Slider de Esfuerzo (RPE)
  - Slider 1-10
  - Label descriptivo del nivel

### Checklist y Reflexión
- [ ] **Paso 12:** Checklist de Mindset
  - 5 checkboxes: Calenté, Practiqué lento, Me grabé, Hice pausas, Revisé errores
  - Guardar como objeto JSONB
  - Actualizar API para campo `mindset_checklist`

- [ ] **Paso 13:** Campo de Reflexión
  - Input de texto de una línea
  - Placeholder: "Hoy aprendí que..."
  - Actualizar API para campo `reflection`

### Integración Completa
- [ ] **Paso 14:** Actualizar API para Todos los Campos
  - Modificar POST en `app/api/sessions/route.ts`
  - Aceptar todos los campos opcionales
  - Verificar que JSONB se guarda correctamente

**✅ Checkpoint Fase 2:** Formulario completo se siente rápido (<30s para completar)

---

## FASE 3: Estadísticas Básicas (2-3 horas)

**Objetivo:** Mostrar métricas motivadoras de progreso

### Backend de Stats
- [ ] **Paso 15:** Crear API de Estadísticas
  - Crear `app/api/stats/route.ts`
  - Query: Racha de días (últimos 7 días)
  - Query: Minutos totales esta semana
  - Query: Calidad promedio semanal
  - Retornar JSON con las 3 métricas

### Frontend de Stats
- [ ] **Paso 16:** Componente de Panel de Stats
  - Crear `app/components/StatsPanel.tsx`
  - Mostrar racha con emoji 🔥
  - Mostrar minutos de práctica semanal
  - Mostrar calidad promedio (estrellas)
  - Integrar en página principal (arriba del timeline)

**✅ Checkpoint Fase 3:** Stats calculan correctamente y motivan a continuar

---

## FASE 4: Features Adicionales (3-4 horas)

**Objetivo:** Completar experiencia de evolución y motivación

### Timeline Mejorado
- [ ] **Paso 17:** Implementar Filtros
  - Filtro por foco técnico (dropdown)
  - Filtro por rango de fechas (última semana / mes / todo)
  - Actualizar API para soportar query params
  - Actualizar SessionsList para usar filtros

### Feedback Inteligente
- [ ] **Paso 18:** Sistema de Insights Post-Guardado
  - Crear función que analice sesión guardada
  - Reglas de feedback según BPM, tomas, calidad
  - Mostrar mensaje motivador después de guardar
  - Alineado con Growth Mindset + Kaizen

### Visualización de Progreso
- [ ] **Paso 19:** Gráfico de Evolución de BPM
  - Instalar librería de charts (ej: recharts)
  - Crear componente `BPMChart.tsx`
  - Mostrar line chart de BPM achieved en el tiempo
  - Integrar en panel de evolución

**✅ Checkpoint Fase 4:** Todas las features del MVP están funcionales

---

## FASE 5: Deploy y Polish (1-2 horas)

**Objetivo:** App en producción, lista para uso diario

### Deploy
- [ ] **Paso 21:** Deploy a Vercel
  - Commit y push del código
  - Importar proyecto en Vercel
  - Configurar variable de entorno `DATABASE_URL`
  - Verificar deploy exitoso

### Testing en Producción
- [ ] **Paso 22:** Testing Manual Completo
  - Probar flujo completo: guardar → ver → filtrar
  - Verificar que stats calculan correctamente
  - Validar que formulario toma <30s
  - Verificar feedback inteligente funciona

### Polish Visual
- [ ] **Paso 23:** Refinamiento de UI
  - Ajustar paleta de colores (neutros, legibles)
  - Mejorar espaciado y tipografía
  - Agregar transiciones suaves
  - Verificar consistencia visual

**✅ Checkpoint Final:** App funcional en producción, lista para uso diario

---

## 📋 Checklist de Validación MVP

Antes de considerar el MVP completo, verificar:

- [ ] Puedo guardar una sesión con solo objetivo + foco + duración
- [ ] Puedo agregar todos los campos opcionales (BPM, tomas, calidad, RPE)
- [ ] El checklist de mindset guarda correctamente en JSONB
- [ ] Veo mis sesiones en orden cronológico inverso
- [ ] Las stats (racha, minutos, calidad) calculan correctamente
- [ ] Puedo filtrar sesiones por foco técnico
- [ ] Puedo filtrar sesiones por rango de fechas
- [ ] Recibo feedback motivador después de guardar
- [ ] El gráfico de BPM muestra evolución en el tiempo
- [ ] La app funciona en producción (Vercel + Neon)
- [ ] El formulario se completa en menos de 30 segundos
- [ ] El diseño visual es limpio y motivador
- [ ] No hay bugs críticos que impidan uso diario

---

## ⚠️ Trampas Comunes a Evitar

1. ❌ **No sobre-optimizar queries SQL temprano** → Si tienes <100 sesiones, queries simples son suficientes
2. ❌ **No agregar autenticación "por las dudas"** → El spec dice "uso personal, sin login"
3. ❌ **No usar librerías de componentes pesadas** → Mantén componentes nativos + Tailwind
4. ❌ **No implementar todas las features antes de validar las críticas** → Primero valida formulario rápido
5. ❌ **No ignorar los mensajes de feedback** → Son el corazón de la motivación intrínseca

---

## 🎯 Definición de "Terminado"

El MVP está terminado cuando:

1. ✅ Usas la app todos los días durante 1 semana sin frustraciones
2. ✅ El registro toma <30 segundos consistentemente
3. ✅ Te sientes motivado al ver tu progreso
4. ✅ No hay bugs críticos que impidan el uso diario

---

## 📊 Progreso General

**Fases Completadas:** 0/5
**Pasos Completados:** 0/23
**Progreso Total:** 0%

---

## 📝 Notas y Aprendizajes

_Espacio para registrar decisiones técnicas, problemas encontrados y soluciones durante el desarrollo_

### Decisiones Técnicas

### Problemas Encontrados

### Soluciones Implementadas

---

## 🔗 Referencias Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [Neon Docs](https://neon.tech/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vercel Deploy Docs](https://vercel.com/docs)
- Especificación del Producto: `docs/summary.md`
- Stack Tecnológico: `docs/tech-stack.md`
