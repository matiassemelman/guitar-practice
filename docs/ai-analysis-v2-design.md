# AI Analysis V2 - Diseño y Especificación Completa

## 🎯 Objetivo

Mejorar significativamente la calidad del análisis de IA mediante:
1. **Personalización**: Perfil de guitarrista que contextualiza el análisis
2. **Profundidad**: Análisis multi-paso para insights más accionables
3. **Conocimiento pedagógico**: Principios de práctica de guitarra incorporados
4. **Transparencia**: Mostrar análisis de datos + insights personalizados

## 📋 Contexto del Usuario

- **Nivel actual**: Principiante (5 días de práctica)
- **Necesidad**: Fundamentos sólidos, prevención de vicios, motivación Growth Mindset + Kaizen
- **Uso**: Herramienta personal (single-user, sin autenticación)

---

## 🏗️ Arquitectura de la Solución

### 1. Perfil de Guitarrista

#### 1.1 Modelo de Datos

Nueva tabla `user_profile`:

```sql
CREATE TABLE user_profile (
  id SERIAL PRIMARY KEY,

  -- Datos técnicos básicos
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  experience_value INTEGER NOT NULL,
  experience_unit VARCHAR(10) NOT NULL CHECK (experience_unit IN ('days', 'months', 'years')),

  -- Objetivos y contexto
  main_goal TEXT NOT NULL,
  current_challenge TEXT,

  -- Información de práctica
  ideal_practice_frequency INTEGER, -- días por semana
  priority_techniques TEXT, -- texto libre

  -- Flexibilidad futura
  additional_context JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Nota**: Tabla con un solo registro (single-user app). Se puede usar UPSERT para actualizar.

#### 1.2 Campos del Perfil

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `level` | Enum | Nivel técnico | 'beginner' |
| `experience_value` | Number | Valor de experiencia | 5 |
| `experience_unit` | Enum | Unidad de tiempo | 'days' |
| `main_goal` | Text | Objetivo principal a largo plazo | "Dominar acordes abiertos con cambios limpios" |
| `current_challenge` | Text | Frustración/desafío actual | "Me cuesta cambiar del acorde C a G sin pausas" |
| `ideal_practice_frequency` | Number | Días por semana ideal | 5 |
| `priority_techniques` | Text | Técnicas del mes (texto libre) | "Cambios de acordes, ritmo con púa" |
| `additional_context` | JSONB | Info adicional flexible | `{"musical_style": "rock", "guitar_type": "electric"}` |

#### 1.3 API Routes

**GET /api/profile**
- Returns: Perfil del usuario o `null` si no existe
- Response: `{ success: true, profile: UserProfile | null }`

**POST /api/profile**
- Body: `CreateProfileInput`
- Comportamiento: UPSERT (crea o actualiza)
- Returns: `{ success: true, profile: UserProfile }`

#### 1.4 UI - Modal "Mi Perfil"

**Ubicación**: Botón en el header (siempre visible)
- Icono: 👤 o similar
- Label: "Mi Perfil"

**Estructura del Modal**:
```
┌─────────────────────────────────────┐
│ 👤 Mi Perfil de Guitarrista    [X] │
├─────────────────────────────────────┤
│                                     │
│ Datos Técnicos                      │
│ • Nivel: [Select: Principiante/    │
│          Intermedio/Avanzado]       │
│ • Experiencia: [5] [días/meses/     │
│                     años]           │
│                                     │
│ Objetivos y Contexto                │
│ • Objetivo Principal:               │
│   [Textarea]                        │
│ • Desafío Actual:                   │
│   [Textarea]                        │
│                                     │
│ Práctica                            │
│ • Frecuencia ideal: [5] días/semana │
│ • Técnicas prioritarias:            │
│   [Textarea]                        │
│                                     │
│ Contexto Adicional (opcional)       │
│ [Textarea JSON o campos extra]      │
│                                     │
├─────────────────────────────────────┤
│         [Cancelar] [Guardar 💾]     │
└─────────────────────────────────────┘
```

**Comportamiento**:
- Si no hay perfil: campos vacíos
- Si existe perfil: pre-cargar datos
- Validación: nivel + experiencia + objetivo principal son obligatorios
- Estilo: Glass-card cyberpunk consistente con el resto de la app

---

### 2. Análisis Multi-Paso

#### 2.1 Flujo de Análisis

```
┌──────────────┐
│ Usuario      │
│ selecciona   │
│ modalidades  │
└──────┬───────┘
       │
       v
┌──────────────────────────────────────┐
│ PASO 1: Análisis de Datos            │
│                                      │
│ Input:                               │
│ • Sesiones (últimas 30)              │
│ • Perfil del usuario                 │
│                                      │
│ Output:                              │
│ • Métricas clave                     │
│ • Patrones detectados                │
│ • Tendencias                         │
│ • Correlaciones                      │
└──────┬───────────────────────────────┘
       │
       v
┌──────────────────────────────────────┐
│ PASO 2: Generación de Insights       │
│                                      │
│ Input:                               │
│ • Análisis de datos (paso 1)        │
│ • Perfil del usuario                 │
│ • Modalidades seleccionadas          │
│ • Conocimiento pedagógico            │
│                                      │
│ Output:                              │
│ • Insights personalizados por        │
│   modalidad                          │
│ • Recomendaciones accionables        │
│ • Micro-experimentos Kaizen          │
└──────┬───────────────────────────────┘
       │
       v
┌──────────────┐
│ Presentación │
│ final al     │
│ usuario      │
└──────────────┘
```

#### 2.2 Personalización según Perfil

El perfil influye en el análisis de 3 formas clave:

**A) Tono y Complejidad**
- **Principiante**: Lenguaje simple, enfoque en fundamentos, evitar jerga técnica avanzada
- **Intermedio**: Balance técnica/musicalidad, introducir conceptos más complejos
- **Avanzado**: Micro-ajustes sutiles, análisis técnico profundo

**B) Filtro de Relevancia**
- Solo analizar aspectos relacionados a `main_goal` y `current_challenge`
- Priorizar análisis de `priority_techniques` cuando sea relevante
- Evitar ruido de info no alineada con objetivos

**D) Recomendaciones Adaptativas**
- Si hay `current_challenge` definido, buscar activamente patrones relacionados
- Sugerir micro-experimentos Kaizen específicos para superar la frustración declarada
- Conectar insights con el `main_goal` del usuario

#### 2.3 Conocimiento Pedagógico

**Para Principiantes (nivel actual del usuario):**

**A) Principios Técnicos Fundamentales**
```
- Desarrollo de velocidad: incrementos de 5-10 BPM cuando se logra 3-5 repeticiones perfectas
- Economía de movimiento: menos tensión = más velocidad y resistencia
- Construcción de memoria muscular: repeticiones correctas > velocidad
- Curva de progreso típica:
  * Días 1-14: Conexión cerebro-dedos, lento pero normal
  * Semanas 3-8: Mejora exponencial si hay práctica consistente
  * Mes 3+: Plateau natural, necesita variación de estrategias
```

**C) Detección de Problemas Comunes (Principiantes)**
```
ALERTAS CRÍTICAS (detectar y advertir):
- Tensión muscular: dolor en mano, muñeca, antebrazo → STOP y revisar técnica
- Práctica mecánica sin intención: muchas sesiones sin reflexión o mindset checklist incompleto
- Velocidad prematura: BPM sube pero quality_rating baja → frenar y consolidar
- Falta de descansos: sesiones >30min sin "hice pausas" checked → riesgo de lesión

PATRONES POSITIVOS (reforzar):
- Calentar antes de practicar
- Practicar lento con metrónomo
- Grabarse para autocorrección
- Hacer pausas regularmente
- Revisar errores específicos
```

**Integración en Prompts**:
- Estos principios se incluyen en el contexto del prompt del Paso 1 y Paso 2
- La IA debe aplicarlos al analizar datos y generar recomendaciones

---

### 3. Estructura del Output

#### 3.1 Formato de Respuesta

```markdown
# 📊 Análisis de Datos

[Resultados del Paso 1]

**Métricas Clave:**
- Total de sesiones analizadas: 15
- Duración promedio: 23 minutos
- BPM promedio logrado: 54 bpm
- Calidad promedio: 3.2★

**Patrones Detectados:**
- [Lista de patrones significativos]

**Tendencias:**
- [Tendencias temporales]

**Correlaciones:**
- [Relaciones entre variables]

---

# 💡 Insights Personalizados

[Resultados del Paso 2, solo modalidades seleccionadas]

## 🔍 Patrones Detectados
[Contenido específico basado en análisis de datos + perfil]

## ⭐ Fortalezas Observadas
[...]

## 🎯 Áreas de Mejora
[...]

[Etc., según modalidades seleccionadas]
```

#### 3.2 Modalidades Existentes (se mantienen)

Las 6 modalidades actuales siguen igual, pero su contenido mejora significativamente:

1. **patterns** (🔍 Patrones Detectados)
2. **strengths** (⭐ Fortalezas Observadas)
3. **weaknesses** (🎯 Áreas de Mejora)
4. **plateau** (📊 Análisis de Progreso)
5. **experiments** (🧪 Micro-Experimentos Kaizen)
6. **progression** (📈 Evaluación de Evolución)

---

### 4. Implementación de Prompts

#### 4.1 Paso 1: Análisis de Datos

**Prompt Template:**

```typescript
const step1Prompt = `Sos un analista experto en práctica deliberada de guitarra.

**TU TAREA**: Analizar los datos de práctica y extraer métricas, patrones y tendencias objetivas.

**PERFIL DEL GUITARRISTA**:
${JSON.stringify(profile, null, 2)}

**DATOS DE PRÁCTICA**:
${JSON.stringify(sessionsData, null, 2)}

**CONTEXTO PEDAGÓGICO** (aplicar al analizar):
${PEDAGOGICAL_KNOWLEDGE_FOR_LEVEL[profile.level]}

**INSTRUCCIONES**:
1. Calcula métricas clave: totales, promedios, distribuciones
2. Identifica patrones significativos (horarios, técnicas, correlaciones)
3. Detecta tendencias temporales (mejoras, estancamientos)
4. Encuentra correlaciones relevantes (ej: BPM vs calidad, mindset vs rendimiento)
5. **IMPORTANTE**: Sé objetivo y basate en datos concretos. NO des recomendaciones todavía.

**FORMATO DE RESPUESTA**:
Devolvé un objeto JSON con esta estructura:
{
  "metrics": {
    "totalSessions": number,
    "avgDuration": number,
    "avgBPM": number,
    "avgQuality": number,
    // ... otras métricas relevantes
  },
  "patterns": [
    { "type": string, "description": string, "evidence": string }
  ],
  "trends": [
    { "metric": string, "direction": "up" | "down" | "stable", "details": string }
  ],
  "correlations": [
    { "variables": [string, string], "relationship": string, "strength": "weak" | "moderate" | "strong" }
  ],
  "alerts": [
    { "severity": "info" | "warning" | "critical", "message": string }
  ]
}
`;
```

#### 4.2 Paso 2: Generación de Insights

**Prompt Template:**

```typescript
const step2Prompt = `Sos un coach experto en práctica deliberada de guitarra. Tu filosofía es Growth Mindset + Kaizen.

**TONO**: Voseo argentino (usá "vos", "tenés", "practicás"), motivador pero realista, profesional.

**PERFIL DEL GUITARRISTA**:
${JSON.stringify(profile, null, 2)}

**ANÁLISIS DE DATOS** (del paso anterior):
${JSON.stringify(dataAnalysis, null, 2)}

**MODALIDADES SOLICITADAS**: ${selectedTypes.join(', ')}

**CONTEXTO PEDAGÓGICO**:
${PEDAGOGICAL_KNOWLEDGE_FOR_LEVEL[profile.level]}

**PERSONALIZACIÓN**:
- **Tono y complejidad**: ${TONE_GUIDELINES[profile.level]}
- **Filtro de relevancia**: Enfocate en el objetivo principal ("${profile.main_goal}") y desafío actual ("${profile.current_challenge}")
- **Recomendaciones adaptativas**: Si detectás patrones relacionados con el desafío actual, proponé micro-experimentos Kaizen concretos

**INSTRUCCIONES**:
Generá una respuesta en Markdown con:

1. Sección "📊 Análisis de Datos" (resumen visual de las métricas y patrones detectados)

2. Luego, para cada modalidad solicitada, generá insights personalizados:

${generateModalityInstructions(selectedTypes)}

**IMPORTANTE**:
- Basá cada insight en datos específicos del análisis
- Celebrá estrategias efectivas (Growth Mindset)
- Proponé mejoras pequeñas y concretas (Kaizen)
- Considerá que es ${profile.level} con ${profile.experience_value} ${profile.experience_unit}
- Si detectaste alertas críticas (tensión, práctica mecánica), mencionálas con tacto pero claridad
`;
```

---

### 5. UI/UX - Modal de Análisis Actualizado

#### 5.1 Estados de Progreso

**Paso Config → Loading → Results**

En el estado **Loading**, ahora mostrar dos sub-estados:

```typescript
type LoadingStep = 'analyzing-data' | 'generating-insights';

// UI:
{step === 'loading' && loadingStep === 'analyzing-data' && (
  <div className="text-center py-16">
    <div className="text-6xl mb-6 animate-pulse">📊</div>
    <div className="text-neon-cyan text-xl font-semibold mb-2">
      Paso 1/2: Analizando datos...
    </div>
    <div className="text-gray-400 text-sm">
      Extrayendo métricas y patrones
    </div>
  </div>
)}

{step === 'loading' && loadingStep === 'generating-insights' && (
  <div className="text-center py-16">
    <div className="text-6xl mb-6 animate-pulse">💡</div>
    <div className="text-neon-cyan text-xl font-semibold mb-2">
      Paso 2/2: Generando insights personalizados...
    </div>
    <div className="text-gray-400 text-sm">
      Creando recomendaciones para vos
    </div>
  </div>
)}
```

#### 5.2 Presentación de Resultados

El output ahora tiene dos secciones principales:

```tsx
{step === 'results' && (
  <div className="space-y-6">
    {/* Sección 1: Análisis de Datos */}
    <div className="bg-black/30 border border-neon-cyan/20 rounded-lg p-6">
      <h2 className="text-neon-cyan text-xl font-bold mb-4">
        📊 Análisis de Datos
      </h2>
      {/* Métricas, patrones, tendencias extraídas del paso 1 */}
      <div dangerouslySetInnerHTML={{ __html: formatDataAnalysis(dataAnalysis) }} />
    </div>

    {/* Separador visual */}
    <div className="border-t border-gray-700" />

    {/* Sección 2: Insights Personalizados */}
    <div className="bg-black/30 border border-neon-magenta/20 rounded-lg p-6">
      <h2 className="text-neon-magenta text-xl font-bold mb-4">
        💡 Insights Personalizados
      </h2>
      {/* Modalidades seleccionadas con contenido mejorado */}
      <div dangerouslySetInnerHTML={{ __html: formatInsights(insights) }} />
    </div>

    <div className="text-xs text-gray-500 text-right">
      {sessionCount} sesiones analizadas
    </div>
  </div>
)}
```

---

## 📝 Tipos TypeScript Nuevos

### Profile Types

```typescript
// types/profile.ts

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExperienceUnit = 'days' | 'months' | 'years';

export interface UserProfile {
  id: number;
  level: ExperienceLevel;
  experienceValue: number;
  experienceUnit: ExperienceUnit;
  mainGoal: string;
  currentChallenge: string | null;
  idealPracticeFrequency: number | null;
  priorityTechniques: string | null;
  additionalContext: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileInput {
  level: ExperienceLevel;
  experienceValue: number;
  experienceUnit: ExperienceUnit;
  mainGoal: string;
  currentChallenge?: string;
  idealPracticeFrequency?: number;
  priorityTechniques?: string;
  additionalContext?: Record<string, any>;
}

export interface ProfileFormData extends CreateProfileInput {}
```

### AI Analysis Types (actualizados)

```typescript
// types/ai-analysis.ts (actualización)

// Paso 1: Análisis de datos estructurado
export interface DataAnalysisResult {
  metrics: {
    totalSessions: number;
    avgDuration: number;
    avgBPM: number | null;
    avgQuality: number | null;
    [key: string]: number | null;
  };
  patterns: Array<{
    type: string;
    description: string;
    evidence: string;
  }>;
  trends: Array<{
    metric: string;
    direction: 'up' | 'down' | 'stable';
    details: string;
  }>;
  correlations: Array<{
    variables: [string, string];
    relationship: string;
    strength: 'weak' | 'moderate' | 'strong';
  }>;
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }>;
}

// Request actualizado (incluye perfil opcionalmente)
export interface AIAnalysisRequest {
  analysisTypes: AnalysisType[];
  sessionLimit?: number;
  includeProfile?: boolean; // Si false, hace análisis genérico
}

// Response actualizado
export interface AIAnalysisResponse {
  success: boolean;
  dataAnalysis?: DataAnalysisResult; // Paso 1
  insights?: string; // Paso 2 (Markdown)
  sessionCount?: number;
  error?: string;
}
```

---

## 🗂️ Estructura de Archivos Nueva

```
/home/matias/projects/guitar-practice/
├── app/
│   ├── api/
│   │   ├── profile/
│   │   │   └── route.ts              # GET/POST perfil
│   │   └── ai-analysis/
│   │       └── route.ts              # POST análisis (actualizado)
│   ├── components/
│   │   ├── ProfileModal.tsx          # NUEVO: Modal de perfil
│   │   └── AIAnalysisModal.tsx       # ACTUALIZADO: 2 pasos
│   └── page.tsx                      # ACTUALIZADO: botón perfil en header
├── lib/
│   ├── prompts/
│   │   ├── step1-data-analysis.ts    # NUEVO: Prompt paso 1
│   │   ├── step2-insights.ts         # NUEVO: Prompt paso 2
│   │   └── pedagogical-knowledge.ts  # NUEVO: Base de conocimiento
│   └── profile-helpers.ts            # NUEVO: Helpers de perfil
├── types/
│   └── profile.ts                    # NUEVO: Tipos de perfil
└── db/
    └── migrations/
        └── 002_add_profile_table.sql # NUEVO: Schema perfil
```

---

## 🚀 Plan de Implementación (Próximo Paso)

Una vez aprobado este diseño, el plan sería:

### Fase 1: Perfil de Usuario
1. Crear tabla `user_profile` en DB
2. Implementar API `/api/profile` (GET/POST)
3. Crear tipos TypeScript
4. Implementar `ProfileModal` component
5. Agregar botón en header

### Fase 2: Prompts Mejorados
1. Crear archivo de conocimiento pedagógico
2. Implementar prompt del Paso 1 (análisis de datos)
3. Implementar prompt del Paso 2 (insights personalizados)
4. Agregar lógica de personalización según perfil

### Fase 3: Análisis Multi-Paso
1. Actualizar `/api/ai-analysis` para llamadas secuenciales
2. Implementar parsing de respuesta estructurada del Paso 1
3. Pasar resultados del Paso 1 al Paso 2
4. Actualizar tipos de respuesta

### Fase 4: UI/UX
1. Actualizar estados de loading en `AIAnalysisModal`
2. Implementar renderizado de "Análisis de Datos" + "Insights"
3. Mejorar formateo de Markdown
4. Testing end-to-end

### Fase 5: Refinamiento
1. Testear con sesiones reales
2. Ajustar prompts según calidad de output
3. Optimizar presentación visual
4. Documentación

---

## 📊 Estimación de Costos (OpenAI API)

**Análisis actual (1 paso):**
- 1 llamada GPT-4o
- ~1500-2000 tokens input + ~800-1200 tokens output
- Costo: ~$0.015-0.025 por análisis

**Análisis V2 (2 pasos):**
- 2 llamadas GPT-4o
- Paso 1: ~2000 tokens input + ~500 tokens output (JSON estructurado)
- Paso 2: ~2500 tokens input + ~1000 tokens output (Markdown)
- Costo estimado: ~$0.030-0.040 por análisis

**Incremento**: ~100% en costo, pero con mejora de calidad >200% (subjetivo, pero esperado)

---

## ✅ Checklist de Aprobación

Antes de implementar, confirmar:

- [ ] Estructura de perfil es completa y flexible
- [ ] Flujo de 2 pasos es claro
- [ ] Conocimiento pedagógico es adecuado para principiantes
- [ ] Personalización (A, B, D) está bien definida
- [ ] Output con 2 secciones tiene sentido
- [ ] UI/UX de modales es coherente
- [ ] Plan de implementación es realista

---

## 📚 Referencias

- **Growth Mindset**: Carol Dweck - "Mindset: The New Psychology of Success"
- **Práctica Deliberada**: Anders Ericsson - "Peak: Secrets from the New Science of Expertise"
- **Kaizen**: Masaaki Imai - "Gemba Kaizen: A Commonsense Approach to a Continuous Improvement Strategy"
- **Práctica de Guitarra**: Principios de pedagogía musical aplicados a guitarra

---

**Documento creado**: 2025-10-11
**Versión**: 1.0
**Estado**: Pendiente de aprobación
