# Plan de Implementación: Coach IA con Feedback Inteligente

**Fecha**: 2025-10-10
**Feature**: Sistema de análisis IA complementario al feedback instantáneo
**Enfoque**: Endpoint Único + Modal Simple (Pragmático sin Over-engineering)

---

## 📊 Progress Tracker

- [ ] **FASE 1**: Tipos TypeScript
- [ ] **FASE 2**: Backend API Route
- [ ] **FASE 3**: Componente Modal
- [ ] **FASE 4**: Integración UI
- [ ] **FASE 5**: Testing y Validación

---

## 🎯 Objetivos

1. ✅ Complementar (no reemplazar) sistema de insights existente
2. ✅ Control total del usuario sobre qué analizar
3. ✅ Integración sin refactoring del código existente
4. ✅ Mantener estética Cyberpunk 2077
5. ✅ Filosofía Growth Mindset + Kaizen en el core

---

## 🏗️ Arquitectura Simplificada

```
Usuario click → Modal (config) → POST /api/ai-analysis → Claude API → Modal (resultados)
```

**Decisiones de diseño**:
- ❌ Sin streaming (simplifica código, diferencia de 5s no justifica complejidad)
- ❌ Sin filtros de fecha (YAGNI - análisis de últimas 30 sesiones es suficiente)
- ❌ Sin cache (uso personal, no crítico)
- ❌ Sin Context API (props drilling funciona bien)
- ✅ Resumen inteligente (evita token overflow)
- ✅ 6 tipos de análisis predefinidos
- ✅ Validación frontend y backend
- ✅ Manejo robusto de errores

---

## 📋 FASE 1: Tipos TypeScript

### 1.1. Crear `/types/ai-analysis.ts`

**Archivo**: NUEVO
**Líneas**: 0 (crear desde cero)

```typescript
// Types for AI Analysis feature
export type AnalysisType =
  | 'patterns'         // Detectar patrones en práctica
  | 'weaknesses'       // Identificar áreas débiles
  | 'experiments'      // Sugerir micro-experimentos Kaizen
  | 'plateau'          // Analizar estancamiento
  | 'strengths'        // Reconocer fortalezas (Growth Mindset)
  | 'progression';     // Evaluar progreso temporal

export interface AIAnalysisRequest {
  analysisTypes: AnalysisType[];
  sessionLimit?: number;  // Default: 30
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis?: string;      // Markdown formatted
  sessionCount?: number;
  error?: string;
}

// UI Metadata para los checkboxes
export const ANALYSIS_TYPE_INFO: Record<AnalysisType, {
  label: string;
  description: string;
  icon: string;
}> = {
  patterns: {
    label: 'Detectar Patrones',
    description: 'Identifica tendencias en tu práctica',
    icon: '🔍'
  },
  weaknesses: {
    label: 'Áreas de Mejora',
    description: 'Señala oportunidades de crecimiento',
    icon: '🎯'
  },
  experiments: {
    label: 'Micro-Experimentos',
    description: 'Sugiere estrategias Kaizen concretas',
    icon: '🧪'
  },
  plateau: {
    label: 'Análisis de Estancamiento',
    description: 'Detecta plateaus y cómo superarlos',
    icon: '📊'
  },
  strengths: {
    label: 'Reconocer Fortalezas',
    description: 'Celebra lo que hacés bien',
    icon: '⭐'
  },
  progression: {
    label: 'Evaluar Progreso',
    description: 'Analiza evolución en BPM y calidad',
    icon: '📈'
  }
};
```

**Validación**:
```bash
npx tsc --noEmit
```

---

### 1.2. Actualizar `/types/api.ts`

**Archivo**: EXISTENTE
**Acción**: AGREGAR al final

```typescript
// AI Analysis API types
export type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AnalysisType
} from './ai-analysis';
```

---

## 📋 FASE 2: Backend API Route

### 2.1. Instalar dependencia

**Comando**:
```bash
npm install @anthropic-ai/sdk
```

### 2.2. Agregar variable de entorno

**Archivo**: `.env.local`
**Acción**: AGREGAR

```
ANTHROPIC_API_KEY=replace-with-a-private-environment-value
```

### 2.3. Crear `/app/api/ai-analysis/route.ts`

**Archivo**: NUEVO
**Líneas**: 0 (crear desde cero)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { executeQuery } from '@/lib/db';
import type { AIAnalysisRequest, AnalysisType } from '@/types/ai-analysis';
import type { SessionRow } from '@/types/database';
import { rowToSession } from '@/types/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Helper: Construir query SQL para obtener sesiones
function buildSessionsQuery(limit: number = 30) {
  return {
    sql: 'SELECT * FROM sessions ORDER BY created_at DESC LIMIT $1',
    params: [limit]
  };
}

// Helper: Preparar datos para el prompt (resumen inteligente)
function prepareDataForPrompt(sessions: any[]) {
  // Si hay <= 15 sesiones, enviar todas con detalles
  if (sessions.length <= 15) {
    return sessions.map(s => ({
      fecha: new Date(s.createdAt).toLocaleDateString('es-AR'),
      objetivo: s.microObjective,
      foco: s.technicalFocus,
      duracion: s.durationMin,
      bpm: s.bpmTarget && s.bpmAchieved ? `${s.bpmAchieved}/${s.bpmTarget}` : 'N/A',
      calidad: s.qualityRating ? `${s.qualityRating}★` : 'N/A',
      mindset: s.mindsetChecklist || {}
    }));
  }

  // Si hay > 15, enviar últimas 10 + resumen del resto
  const recent = sessions.slice(0, 10).map(s => ({
    fecha: new Date(s.createdAt).toLocaleDateString('es-AR'),
    objetivo: s.microObjective,
    foco: s.technicalFocus,
    duracion: s.durationMin,
    bpm: s.bpmTarget && s.bpmAchieved ? `${s.bpmAchieved}/${s.bpmTarget}` : 'N/A',
    calidad: s.qualityRating ? `${s.qualityRating}★` : 'N/A',
    mindset: s.mindsetChecklist || {}
  }));

  const older = sessions.slice(10);
  const summary = {
    totalSesiones: older.length,
    duracionPromedio: Math.round(
      older.reduce((sum, s) => sum + s.durationMin, 0) / older.length
    ),
    calidadPromedio: older.filter(s => s.qualityRating).length > 0
      ? (older.reduce((sum, s) => sum + (s.qualityRating || 0), 0) /
         older.filter(s => s.qualityRating).length).toFixed(1)
      : 'N/A',
    focosDistribucion: older.reduce((acc: any, s) => {
      acc[s.technicalFocus] = (acc[s.technicalFocus] || 0) + 1;
      return acc;
    }, {})
  };

  return { sesionesRecientes: recent, resumenAnteriores: summary };
}

// Helper: Construir prompt según tipos de análisis
function buildPrompt(types: AnalysisType[], data: any) {
  const intro = `Sos un coach experto en práctica deliberada de guitarra. Tu filosofía es Growth Mindset + Kaizen.

**TONO**: Voseo argentino (usá "vos", "tenés", "practicás"), motivador pero realista, profesional.

**DATOS DE PRÁCTICA**:
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

**ANÁLISIS SOLICITADOS**: ${types.join(', ')}

Generá una respuesta en Markdown con las siguientes secciones:
`;

  const sections: string[] = [];

  if (types.includes('patterns')) {
    sections.push(`## 🔍 Patrones Detectados
Identificá tendencias en horarios, técnicas, correlaciones (ej: BPM vs calidad). Usá datos concretos.`);
  }

  if (types.includes('strengths')) {
    sections.push(`## ⭐ Fortalezas Observadas
Reconocé estrategias efectivas y hábitos positivos. Celebrá el esfuerzo (Growth Mindset).`);
  }

  if (types.includes('weaknesses')) {
    sections.push(`## 🎯 Áreas de Mejora
Señalá oportunidades de crecimiento con tacto. Enfocate en aprendizaje, no deficiencias.`);
  }

  if (types.includes('plateau')) {
    sections.push(`## 📊 Análisis de Progreso
Evaluá si hay estancamiento en BPM o calidad. Si lo hay, explicá posibles causas.`);
  }

  if (types.includes('experiments')) {
    sections.push(`## 🧪 Micro-Experimentos Kaizen
Proponé 2-3 estrategias concretas y específicas para próximas sesiones.`);
  }

  if (types.includes('progression')) {
    sections.push(`## 📈 Evaluación de Evolución
Analizá progreso en BPM, calidad y adherencia a mindset. Destacá mejoras.`);
  }

  return intro + '\n' + sections.join('\n\n') + '\n\n**Importante**: Basá cada insight en datos específicos del historial.';
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validar request
    const body: AIAnalysisRequest = await request.json();
    const { analysisTypes, sessionLimit = 30 } = body;

    if (!analysisTypes || analysisTypes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Seleccioná al menos un tipo de análisis' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API key de IA no configurada' },
        { status: 500 }
      );
    }

    // 2. Obtener sesiones de la DB
    const { sql, params } = buildSessionsQuery(sessionLimit);
    const rows = await executeQuery<SessionRow>(sql, params);
    const sessions = rows.map(rowToSession);

    if (sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay sesiones para analizar' },
        { status: 400 }
      );
    }

    // 3. Preparar datos para el prompt
    const data = prepareDataForPrompt(sessions);

    // 4. Construir prompt
    const prompt = buildPrompt(analysisTypes, data);

    // 5. Llamar a Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }],
    });

    // 6. Extraer texto de respuesta
    const analysisText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    // 7. Retornar respuesta
    return NextResponse.json({
      success: true,
      analysis: analysisText,
      sessionCount: sessions.length
    });

  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al procesar análisis'
      },
      { status: 500 }
    );
  }
}
```

**Validación**:
```bash
# 1. Verificar que compila
npx tsc --noEmit

# 2. Iniciar servidor
npm run dev

# 3. Testear con curl
curl -X POST http://localhost:3000/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisTypes":["patterns","strengths"]}'
```

---

## 📋 FASE 3: Componente Modal

### 3.1. Crear `/app/components/AIAnalysisModal.tsx`

**Archivo**: NUEVO
**Líneas**: 0 (crear desde cero)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ANALYSIS_TYPE_INFO } from '@/types/ai-analysis';
import type { AnalysisType } from '@/types/ai-analysis';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAnalysisModal({ isOpen, onClose }: AIAnalysisModalProps) {
  // Estado
  const [step, setStep] = useState<'config' | 'loading' | 'results'>('config');
  const [selectedTypes, setSelectedTypes] = useState<AnalysisType[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [sessionCount, setSessionCount] = useState(0);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setStep('config');
      setSelectedTypes([]);
      setAnalysis('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers
  const toggleType = (type: AnalysisType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAnalyze = async () => {
    if (selectedTypes.length === 0) {
      setError('Seleccioná al menos un tipo de análisis');
      return;
    }

    setStep('loading');
    setError('');

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisTypes: selectedTypes })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error en el análisis');
      }

      setAnalysis(data.analysis);
      setSessionCount(data.sessionCount);
      setStep('results');

    } catch (err: any) {
      setError(err.message);
      setStep('config');
    }
  };

  const handleBack = () => {
    setStep('config');
    setAnalysis('');
  };

  // Render según paso
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm p-6 border-b border-neon-magenta/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neon-magenta">
              🤖 Coach IA - Feedback Inteligente
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-neon-magenta transition-colors"
              disabled={step === 'loading'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* PASO 1: Configuración */}
          {step === 'config' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neon-cyan mb-4">
                  Seleccioná qué querés analizar:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(ANALYSIS_TYPE_INFO) as AnalysisType[]).map(type => {
                    const info = ANALYSIS_TYPE_INFO[type];
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all duration-300
                          ${isSelected
                            ? 'border-neon-magenta bg-neon-magenta/10 glow-magenta'
                            : 'border-gray-700 bg-black/50 hover:border-neon-cyan'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{info.icon}</div>
                        <div className="font-semibold text-gray-100 mb-1">{info.label}</div>
                        <div className="text-xs text-gray-400">{info.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-black/50 border border-neon-cyan/30 rounded-lg p-4 text-sm text-gray-300">
                ℹ️ Se analizarán hasta las últimas 30 sesiones de práctica.
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-400">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Loading */}
          {step === 'loading' && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 animate-pulse">🤖</div>
              <div className="text-neon-cyan text-xl font-semibold mb-2">
                Analizando tus sesiones...
              </div>
              <div className="text-gray-400 text-sm">
                Esto puede tomar 5-15 segundos
              </div>
            </div>
          )}

          {/* PASO 3: Resultados */}
          {step === 'results' && (
            <div className="space-y-4">
              <div
                className="prose prose-invert max-w-none bg-black/30 border border-neon-cyan/20 rounded-lg p-6"
                dangerouslySetInnerHTML={{
                  __html: analysis
                    .replace(/^## (.*)/gm, '<h2 class="text-neon-magenta text-xl font-bold mt-6 mb-3">$1</h2>')
                    .replace(/^### (.*)/gm, '<h3 class="text-neon-cyan text-lg font-semibold mt-4 mb-2">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-neon-yellow font-bold">$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />
              <div className="text-xs text-gray-500 text-right">
                {sessionCount} sesiones analizadas
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm p-6 border-t border-neon-magenta/30">
          <div className="flex gap-3">
            {step === 'config' && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={selectedTypes.length === 0}
                  className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-neon-magenta to-neon-pink text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-magenta"
                >
                  Analizar 🚀
                </button>
              </>
            )}

            {step === 'results' && (
              <>
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-6 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
                >
                  ← Nuevo Análisis
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-green text-black font-bold hover:scale-[1.02] transition-all glow-cyan"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
```

**Validación**:
```bash
npx tsc --noEmit
```

---

## 📋 FASE 4: Integración UI

### 4.1. Modificar `/app/components/StatsPanel.tsx`

**Archivo**: EXISTENTE
**Líneas a modificar**:

#### Paso 1: Actualizar interface de props

**Buscar** (línea ~10):
```typescript
interface StatsPanelProps {
  stats?: SessionStats;
  loading?: boolean;
}
```

**Reemplazar con**:
```typescript
interface StatsPanelProps {
  stats?: SessionStats;
  loading?: boolean;
  onRequestAIAnalysis?: () => void;  // NUEVA PROP
}
```

#### Paso 2: Destructurar nueva prop

**Buscar** (línea ~15):
```typescript
export default function StatsPanel({ stats: initialStats, loading: initialLoading }: StatsPanelProps) {
```

**Reemplazar con**:
```typescript
export default function StatsPanel({
  stats: initialStats,
  loading: initialLoading,
  onRequestAIAnalysis  // AGREGAR
}: StatsPanelProps) {
```

#### Paso 3: Agregar botón antes del cierre del componente

**Buscar el último `</div>` del return (línea ~120-130)**
**Agregar ANTES del cierre**:

```typescript
      {/* AI Analysis Button */}
      {onRequestAIAnalysis && (
        <div className="mt-6 pt-6 border-t border-neon-magenta/30">
          <button
            onClick={onRequestAIAnalysis}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-neon-purple via-neon-magenta to-neon-pink text-white font-bold hover:glow-magenta hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🤖</span>
            <span>Análisis Inteligente con IA</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Pedí insights profundos sobre tu progreso
          </p>
        </div>
      )}
```

---

### 4.2. Modificar `/app/page.tsx`

**Archivo**: EXISTENTE
**Líneas a modificar**:

#### Paso 1: Importar componente

**Buscar los imports** (línea ~3-10)
**Agregar**:
```typescript
import AIAnalysisModal from './components/AIAnalysisModal';
```

#### Paso 2: Agregar estado

**Buscar donde están los useState** (línea ~20-30)
**Agregar**:
```typescript
const [aiModalOpen, setAiModalOpen] = useState(false);
```

#### Paso 3: Actualizar llamada a StatsPanel

**Buscar** (línea ~80-90):
```typescript
<StatsPanel key={statsKey} />
```

**Reemplazar con**:
```typescript
<StatsPanel
  key={statsKey}
  onRequestAIAnalysis={() => setAiModalOpen(true)}
/>
```

#### Paso 4: Agregar modal al render

**Buscar el último `</main>` del return** (línea ~150-160)
**Agregar ANTES del cierre de `</main>`**:

```typescript
      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
```

---

## 📋 FASE 5: Testing y Validación

### 5.1. Checklist de Testing Manual

**Config del modal**:
- [ ] Modal abre al click en botón
- [ ] 6 checkboxes visibles con iconos
- [ ] Selección múltiple funciona
- [ ] No permite enviar sin seleccionar tipos
- [ ] Botón "Cancelar" cierra modal

**Análisis**:
- [ ] Loading state muestra spinner con mensaje
- [ ] Análisis se genera correctamente
- [ ] Markdown se renderiza con colores neon
- [ ] Muestra cantidad de sesiones analizadas

**Errores**:
- [ ] Sin API key → muestra error claro
- [ ] Sin sesiones → muestra error claro
- [ ] Error de red → muestra error y permite cerrar

**Estética**:
- [ ] Glassmorphism aplicado (backdrop-blur)
- [ ] Colores neon visibles (magenta, cyan, pink, yellow)
- [ ] Glow effects en botones
- [ ] Transitions suaves (300ms)

### 5.2. Test de API

**Crear archivo**: `/test-ai-api.sh`

```bash
#!/bin/bash

echo "🧪 Testing AI Analysis API"

echo "\n1. Test sin tipos (debe fallar):"
curl -X POST http://localhost:3000/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisTypes":[]}'

echo "\n\n2. Test válido:"
curl -X POST http://localhost:3000/api/ai-analysis \
  -H "Content-Type: application/json" \
  -d '{"analysisTypes":["patterns","strengths"]}'

echo "\n\n✅ Tests completados"
```

**Ejecutar**:
```bash
chmod +x test-ai-api.sh
./test-ai-api.sh
```

### 5.3. Validación TypeScript

```bash
npx tsc --noEmit
```

### 5.4. Build de Producción

```bash
npm run build
```

---

## ✅ Checklist de Problemas → Soluciones

| Problema Identificado | Solución Implementada |
|----------------------|----------------------|
| ❓ Cómo triggerea el análisis | ✅ Botón en StatsPanel con prop callback |
| ❓ Evitar token overflow | ✅ Límite de 30 sesiones + resumen inteligente si >15 |
| ❓ Qué puede analizar | ✅ 6 tipos predefinidos con checkboxes |
| ❓ Latencia de IA (5-15s) | ✅ Loading state claro con mensaje |
| ❓ Dónde guardar API key | ✅ Variable de entorno `ANTHROPIC_API_KEY` |
| ❓ Mostrar resultado largo | ✅ Modal con scroll + Markdown parseado |
| ❓ Manejo de errores | ✅ Try-catch + mensajes user-friendly |
| ❓ Tono Growth Mindset | ✅ Prompt engineered con instrucciones claras |
| ❓ Integración sin romper código | ✅ Solo agregar, no refactorizar nada |
| ❓ Evitar over-engineering | ✅ Enfoque minimalista (500 LOC total) |
| ❓ Mantener estética cyberpunk | ✅ Reutiliza `.glass-card`, `.glow-*`, paleta neon |
| ❓ Validación de inputs | ✅ Frontend y backend validan antes de procesar |

---

## 📊 Estimación

- **Tiempo estimado**: 2-3 horas
- **Líneas de código nuevas**: ~500
- **Archivos modificados**: 4
- **Archivos creados**: 3
- **Dependencias nuevas**: 1 (`@anthropic-ai/sdk`)
- **Complejidad**: Media-Baja

---

## 🎯 Principios de Diseño Aplicados

✅ **KISS** (Keep It Simple, Stupid): Un endpoint, un modal, flujo lineal
✅ **YAGNI** (You Aren't Gonna Need It): Sin cache, Context, filtros complejos
✅ **DRY** (Don't Repeat Yourself): Reutiliza helpers, query builders, modal pattern
✅ **Separation of Concerns**: Backend maneja datos, frontend maneja UI
✅ **Progressive Enhancement**: Funciona sin IA (botón no rompe nada si falla)

---

## 🚀 Próximos Pasos (Post-MVP)

- [ ] Cache en localStorage (24h)
- [ ] Exportar análisis a Markdown
- [ ] Presets rápidos ("Análisis Semanal")
- [ ] Análisis comparativo (mes actual vs anterior)
- [ ] Historial de análisis previos

---

**Fin del Plan de Implementación**
