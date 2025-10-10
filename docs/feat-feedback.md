# Feature: Coach IA con Feedback Inteligente

## Visión General

Sistema de análisis inteligente que complementa el feedback instantáneo basado en reglas existente. El usuario puede solicitar análisis profundos y personalizados de su práctica usando IA, con control total sobre qué tipo de insights quiere recibir en cada momento.

### Filosofía

- **Complementario, no reemplazo**: Las reglas existentes (`lib/insights.ts`) siguen dando feedback inmediato al guardar sesiones
- **Control del usuario**: La IA se activa solo cuando el usuario lo solicita manualmente
- **Análisis contextual completo**: La IA tiene acceso a todo el historial, estadísticas, y patrones a largo plazo
- **Growth Mindset + Kaizen**: Los análisis celebran estrategias efectivas y sugieren micro-experimentos, no solo critican

---

## Experiencia de Usuario (UX Flow)

### Ubicación
Botón **"✨ Análisis IA"** ubicado en el panel de estadísticas (panel derecho, arriba).

### Flujo Completo

1. **Trigger**: Usuario hace clic en el botón "✨ Análisis IA"

2. **Modal se abre**: Aparece un modal con glassmorphism cyberpunk que incluye:
   - Título: "Coach IA Personalizado"
   - Subtítulo: "Selecciona qué tipo de análisis querés recibir"
   - 5 checkboxes con descripciones breves de cada tipo de análisis
   - Botón "Generar Análisis" (deshabilitado si no hay checkboxes marcados)
   - Botón "Cancelar"

3. **Usuario selecciona**: Marca uno o más checkboxes según lo que necesite en ese momento

4. **Generación**: Usuario presiona "Generar Análisis"
   - Botón cambia a loading state (spinner + texto "Analizando...")
   - Los checkboxes se deshabilitan temporalmente

5. **Resultados**: El modal se expande o hace scroll para mostrar:
   - Secciones con los análisis solicitados
   - Formato markdown con títulos, listas, énfasis
   - Efectos de glow en secciones importantes (opcional)
   - Botón "Cerrar" o "X" para salir del modal

### Estados del Modal

- **Inicial**: Checkboxes + botón generar
- **Loading**: Spinner animado, mensaje "Tu coach está analizando tu práctica..."
- **Resultados**: Contenido generado + opción de cerrar
- **Error**: Mensaje de error + opción de reintentar

---

## Tipos de Análisis Disponibles

El usuario puede elegir uno o más de estos análisis mediante checkboxes:

### 1. ☐ Análisis de Patrones y Tendencias
**Descripción breve**: "¿Qué está funcionando y qué no en mi práctica?"

**Qué incluye**:
- Identificación de patrones positivos en las últimas sesiones (ej: "Tu calidad subió un 25% cuando practicás lento")
- Detección de tendencias negativas o estancamientos
- Correlaciones entre variables (BPM vs calidad, duración vs RPE, checklist vs progreso)
- Análisis de consistencia en el tiempo (días con mejor rendimiento, horarios, etc.)

---

### 2. ☐ Recomendaciones Personalizadas
**Descripción breve**: "¿Qué debería practicar a continuación?"

**Qué incluye**:
- Sugerencias de objetivos micro específicos basados en tu nivel actual
- Ejercicios concretos para áreas débiles identificadas
- Estrategias de práctica adaptadas a tu perfil (ej: si no te grabás, sugerencias de cómo empezar)
- Ajustes de BPM target basados en tu progreso histórico
- Micro-experimentos personalizados tipo Kaizen

---

### 3. ☐ Diagnóstico de Estancamiento
**Descripción breve**: "¿Por qué no estoy progresando en cierta área?"

**Qué incluye**:
- Análisis de por qué no hay mejora en BPM, calidad, o consistencia
- Identificación de cuellos de botella en tu práctica
- Comparación entre sesiones de alta vs baja calidad para detectar diferencias
- Sugerencias de cambios de estrategia específicos
- Hipótesis sobre qué probar en las próximas sesiones

---

### 4. ☐ Reporte de Progreso Narrativo
**Descripción breve**: "Un resumen motivacional de mi evolución"

**Qué incluye**:
- Narrativa estilo coach celebrando logros recientes
- Resumen de evolución desde la primera sesión o última semana/mes
- Reconocimiento de estrategias efectivas que estás aplicando
- Mensaje motivacional alineado con Growth Mindset
- Próximo hito a alcanzar y cómo llegar ahí

---

### 5. ☐ Análisis Completo (Todo lo anterior)
**Descripción breve**: "Quiero el análisis más profundo posible"

**Qué incluye**:
- Combinación de los 4 análisis anteriores
- Sección adicional de "Reflexión integradora" que conecta todos los insights
- Recomendación de foco principal para la próxima semana
- "Plan de acción Kaizen" con 3 micro-experimentos priorizados

---

## Formato de Presentación

### Estructura Visual

Los resultados se presentan en el modal con formato markdown procesado, incluyendo:

- **Títulos con emojis**: Para identificar cada sección rápidamente
- **Listas con bullets**: Para insights puntuales
- **Énfasis y negritas**: Para destacar hallazgos clave
- **Quotes/blockquotes**: Para mensajes motivacionales
- **Separadores visuales**: Entre secciones diferentes

### Ejemplo de Formato

```
## 📊 Análisis de Patrones y Tendencias

### Patrones Positivos Detectados
- **Calidad superior cuando practicás lento**: Tus sesiones marcadas como "practiqué lento" tienen un 32% más de calidad promedio (4.2★ vs 3.2★)
- **Racha sostenida**: Llevás 12 días consecutivos practicando, tu mejor marca hasta ahora

### Áreas de Oportunidad
- **BPM estancado**: En las últimas 5 sesiones con foco "Técnica", tu BPM achieved se mantuvo en ~75-80. Posible meseta.

### Recomendación Clave
> Considerá reducir tu BPM target en 10-15% temporalmente y enfocarte en 3 tomas perfectas antes de volver a subir tempo.
```

---

## Principios de Diseño

### Tono de Voz
- **Cercano pero profesional**: Tuteá al usuario, usá lenguaje motivador sin ser infantil
- **Basado en datos**: Cada insight debe estar respaldado por datos específicos del historial
- **Accionable**: Siempre incluir próximos pasos concretos, no solo observaciones
- **Growth Mindset**: Celebrar esfuerzo y estrategias, no solo resultados

### Límites Éticos
- **No juzgar negativamente**: Evitar frases tipo "fallaste en..." o "estás haciendo mal..."
- **No comparaciones externas**: Solo comparar al usuario consigo mismo
- **No promesas irreales**: No sugerir que "en X días lograrás Y"
- **Respetar autonomía**: Sugerencias como opciones, no órdenes

---

## Casos de Uso Comunes

### Caso 1: Usuario Estancado en BPM
**Situación**: Usuario lleva 10 sesiones sin superar 85 bpm en un ejercicio específico.

**Análisis solicitado**: Diagnóstico de Estancamiento

**Output esperado**:
- Identificar que el usuario no está marcando "practiqué lento" en esas sesiones
- Sugerir reducir BPM a 70 y aplicar método de incrementos de 5 bpm
- Recomendar grabarse para identificar qué nota específica está causando el cuello de botella

---

### Caso 2: Usuario Buscando Motivación
**Situación**: Usuario practicó consistentemente toda la semana pero se siente desmotivado.

**Análisis solicitado**: Reporte de Progreso Narrativo

**Output esperado**:
- Celebrar racha de 7 días y minutos totales de la semana
- Resaltar mejora del 15% en calidad promedio respecto a semana anterior
- Mostrar que está aplicando más estrategias del checklist de mindset
- Mensaje motivacional sobre el valor del progreso compuesto

---

### Caso 3: Usuario Planeando Próxima Sesión
**Situación**: Usuario quiere optimizar su práctica pero no sabe en qué enfocarse.

**Análisis solicitado**: Recomendaciones Personalizadas

**Output esperado**:
- Sugerir foco técnico específico basado en áreas con menos práctica reciente
- Proponer 3 objetivos micro concretos adaptados a su nivel actual de BPM
- Recomendar checklist de mindset específico (ej: "grabate hoy")
- Sugerir duración óptima según su RPE histórico

---

### Caso 4: Revisión Semanal Completa
**Situación**: Usuario termina la semana y quiere un análisis integral.

**Análisis solicitado**: Análisis Completo

**Output esperado**:
- Patrones: mejores días/horarios, correlaciones detectadas
- Recomendaciones: 2-3 objetivos micro para próxima semana
- Diagnóstico: si hay estancamiento en alguna área
- Narrativa: celebración de logros + próximo hito
- Plan Kaizen: 3 micro-experimentos priorizados

---

## Consideraciones de Diseño Visual

### Estética Cyberpunk 2077
- Modal con `backdrop-blur` y transparencias
- Borders con glow effects (magenta/cyan según sección)
- Títulos con colores neon (#FF00FF, #00FFFF, #FFFF00)
- Fondo ultra oscuro con overlay semi-transparente
- Animaciones suaves al abrir/cerrar modal
- Scroll interno con scrollbar custom temático

### Responsive
- Desktop: Modal centrado, max-width 800px
- Mobile: Modal full-screen con padding reducido (futura implementación si se hace mobile)

---

## Métricas de Éxito

¿Cómo sabemos que esta feature está funcionando bien?

1. **Utilidad percibida**: Usuario solicita análisis al menos 1-2 veces por semana
2. **Accionabilidad**: Usuario implementa al menos 1 sugerencia del análisis
3. **Motivación**: Usuario reporta sentirse más motivado después de leer el análisis
4. **Precisión**: Los insights generados son relevantes y basados en datos reales
5. **Velocidad**: Tiempo de respuesta < 10 segundos en promedio

---

## Notas Adicionales

### Límite de Contexto
- La IA puede analizar historial completo, pero para usuarios con 500+ sesiones, considerar:
  - Enviar solo últimas 100 sesiones + agregados estadísticos de todo el historial
  - O permitir al usuario especificar rango temporal (último mes, últimos 3 meses, todo)

### Extensiones Futuras (Fuera de Scope Inicial)
- Análisis comparativo entre períodos (ej: "este mes vs mes pasado")
- Detección automática de situaciones que ameritan análisis IA (sin solicitarlo)
- Exportar análisis a PDF/markdown
- Historial de análisis previos generados
- Presets de análisis (ej: "Revisión semanal", "Diagnóstico express")

---

## Estado del Proyecto

- **Sistema de feedback actual**: ✅ Completado (`lib/insights.ts`)
- **Coach IA con análisis personalizados**: ⏳ Pendiente de implementación
