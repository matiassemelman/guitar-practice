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

// ============================================================================
// Multi-Step Analysis Types
// ============================================================================

// Paso 1: Análisis de datos estructurado
export interface DataAnalysisResult {
  metrics: {
    totalSessions: number;
    avgDuration: number;
    avgBPM: number | null;
    avgQuality: number | null;
    totalMinutes: number;
    sessionsByFocus: Record<string, number>;
    mindsetCompletionRate: number;
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

// Response actualizado con ambos pasos
export interface AIAnalysisMultiStepResponse {
  success: boolean;
  dataAnalysis?: DataAnalysisResult;
  insights?: string;
  sessionCount?: number;
  error?: string;
}

// Helper para extraer JSON robusto
export function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) return JSON.parse(match[1]);

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end));
    }
    throw new Error('No se encontró JSON válido');
  }
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
