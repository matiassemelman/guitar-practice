export const ALLOWED_ANALYSIS_TYPES = Object.freeze([
  'patterns',
  'weaknesses',
  'experiments',
  'plateau',
  'strengths',
  'progression',
]);

const allowedTypes = new Set(ALLOWED_ANALYSIS_TYPES);

export class AIRequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AIRequestValidationError';
  }
}

export function parseAIAnalysisRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AIRequestValidationError('Invalid request body');
  }

  const analysisTypes = body.analysisTypes;
  if (!Array.isArray(analysisTypes) || analysisTypes.length < 1) {
    throw new AIRequestValidationError('Select at least one analysis type');
  }

  if (analysisTypes.length > ALLOWED_ANALYSIS_TYPES.length) {
    throw new AIRequestValidationError('Too many analysis types');
  }

  if (!analysisTypes.every((value) => typeof value === 'string' && allowedTypes.has(value))) {
    throw new AIRequestValidationError('Unknown analysis type');
  }

  if (new Set(analysisTypes).size !== analysisTypes.length) {
    throw new AIRequestValidationError('Duplicate analysis types are not allowed');
  }

  const sessionLimit = body.sessionLimit ?? 30;
  if (!Number.isInteger(sessionLimit) || sessionLimit < 1 || sessionLimit > 30) {
    throw new AIRequestValidationError('sessionLimit must be an integer between 1 and 30');
  }

  return {
    analysisTypes: [...analysisTypes],
    sessionLimit,
  };
}
