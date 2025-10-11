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
