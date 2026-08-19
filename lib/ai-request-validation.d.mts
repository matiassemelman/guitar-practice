import type { AnalysisType } from '@/types/ai-analysis';

export const ALLOWED_ANALYSIS_TYPES: readonly AnalysisType[];

export class AIRequestValidationError extends Error {}

export function parseAIAnalysisRequest(body: unknown): {
  analysisTypes: AnalysisType[];
  sessionLimit: number;
};
