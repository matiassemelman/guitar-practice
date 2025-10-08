/**
 * Barrel export de todos los tipos del proyecto.
 *
 * Este archivo centraliza todos los exports de tipos
 * para facilitar los imports en el resto de la aplicación.
 */

// Session types
export type {
  Session,
  CreateSessionInput,
  UpdateSessionInput,
  TechnicalFocus,
  SessionDuration,
  MindsetChecklist,
  SessionStats,
  BPMDataPoint,
  SessionFilters,
  TimeRange,
} from './session';

export {
  SESSION_CONSTANTS,
  isTechnicalFocus,
  isSessionDuration,
  DEFAULT_MINDSET_CHECKLIST,
} from './session';

// API types
export type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  CreateSessionResponse,
  GetSessionsResponse,
  GetSessionResponse,
  DeleteSessionResponse,
  GetStatsResponse,
  GetBPMDataResponse,
  GetSessionsQueryParams,
  GetBPMDataQueryParams,
  CreateSessionRequestBody,
  ExtractApiData,
  FetchConfig,
  RetryOptions,
} from './api';

export {
  ApiErrorCode,
  isApiSuccess,
  isApiError,
  createSuccessResponse,
  createErrorResponse,
} from './api';

// Database types
export type {
  SessionRow,
  SessionInsertParams,
  SelectQueryOptions,
  WeeklyStatsRow,
} from './database';

export {
  rowToSession,
  inputToInsertParams,
  buildInsertQuery,
  buildSelectQuery,
  buildWeeklyStatsQuery,
  buildStreakQuery,
  buildBPMEvolutionQuery,
  parseWeeklyStats,
} from './database';

// UI types
export type {
  SessionFormState,
  LoadingState,
  SessionCardProps,
  SessionsListProps,
  StatsPanelProps,
  FiltersProps,
  TechnicalFocusSelectorProps,
  DurationSelectorProps,
  BPMInputProps,
  PerfectTakesSelectorProps,
  QualityRatingSelectorProps,
  RPESliderProps,
  MindsetChecklistProps,
  InsightMessageProps,
  BPMChartProps,
  ChipOption,
  ChipSelectorProps,
  ToastType,
  Toast,
  ToastContextValue,
  ModalState,
  ModalProps,
  FormErrors,
  UseSessionFormReturn,
  AutocompleteConfig,
  AutocompleteInputProps,
  Theme,
} from './ui';

export {
  DEFAULT_FORM_STATE,
  RPE_LABELS,
  MINDSET_LABELS,
  TECHNICAL_FOCUS_OPTIONS,
  DURATION_OPTIONS,
} from './ui';
