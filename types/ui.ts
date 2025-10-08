/**
 * Tipos relacionados con UI y componentes de React.
 *
 * Define interfaces para props de componentes,
 * estados de formularios, y tipos de UI.
 */

import type {
  Session,
  TechnicalFocus,
  SessionDuration,
  MindsetChecklist,
  SessionStats,
  TimeRange,
} from './session';

/**
 * Estado del formulario de creación de sesión.
 */
export interface SessionFormState {
  microObjective: string;
  technicalFocus: TechnicalFocus | '';
  durationMin: SessionDuration | null;
  bpmTarget: string;
  bpmAchieved: string;
  perfectTakes: number;
  qualityRating: number;
  rpe: number;
  mindsetChecklist: MindsetChecklist;
  reflection: string;
}

/**
 * Estado inicial por defecto del formulario.
 */
export const DEFAULT_FORM_STATE: SessionFormState = {
  microObjective: '',
  technicalFocus: '',
  durationMin: null,
  bpmTarget: '',
  bpmAchieved: '',
  perfectTakes: 0,
  qualityRating: 0,
  rpe: 5,
  mindsetChecklist: {
    warmedUp: false,
    practicedSlow: false,
    recorded: false,
    tookBreaks: false,
    reviewedMistakes: false,
  },
  reflection: '',
};

/**
 * Estado de carga de datos.
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Props para un componente de sesión individual.
 */
export interface SessionCardProps {
  session: Session;
  onEdit?: (session: Session) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

/**
 * Props para el componente de lista de sesiones.
 */
export interface SessionsListProps {
  sessions: Session[];
  loading?: boolean;
  emptyMessage?: string;
  onSessionEdit?: (session: Session) => void;
  onSessionDelete?: (id: number) => void;
}

/**
 * Props para el componente de panel de estadísticas.
 */
export interface StatsPanelProps {
  stats?: SessionStats | null;
  loading?: boolean;
}

/**
 * Props para el componente de filtros.
 */
export interface FiltersProps {
  selectedFocus: TechnicalFocus | 'all';
  selectedTimeRange: TimeRange | 'all';
  onFocusChange: (focus: TechnicalFocus | 'all') => void;
  onTimeRangeChange: (range: TimeRange | 'all') => void;
}

/**
 * Props para el selector de foco técnico.
 */
export interface TechnicalFocusSelectorProps {
  value: TechnicalFocus | '';
  onChange: (focus: TechnicalFocus) => void;
  disabled?: boolean;
}

/**
 * Props para el selector de duración.
 */
export interface DurationSelectorProps {
  value: SessionDuration | null;
  onChange: (duration: SessionDuration) => void;
  disabled?: boolean;
}

/**
 * Props para el input de BPM.
 */
export interface BPMInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Props para el selector de tomas perfectas (0-3).
 */
export interface PerfectTakesSelectorProps {
  value: number;
  onChange: (takes: number) => void;
  disabled?: boolean;
}

/**
 * Props para el selector de rating de calidad (1-5 estrellas).
 */
export interface QualityRatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

/**
 * Props para el slider de RPE (1-10).
 */
export interface RPESliderProps {
  value: number;
  onChange: (rpe: number) => void;
  disabled?: boolean;
}

/**
 * Props para el checklist de mindset.
 */
export interface MindsetChecklistProps {
  value: MindsetChecklist;
  onChange: (checklist: MindsetChecklist) => void;
  disabled?: boolean;
}

/**
 * Props para mensajes de feedback/insight.
 */
export interface InsightMessageProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onDismiss?: () => void;
}

/**
 * Props para el gráfico de evolución de BPM.
 */
export interface BPMChartProps {
  data: Array<{
    date: string;
    target?: number | null;
    achieved?: number | null;
    microObjective: string;
  }>;
  loading?: boolean;
  height?: number;
}

/**
 * Opciones de un chip/botón de selección.
 */
export interface ChipOption<T> {
  value: T;
  label: string;
  emoji?: string;
  color?: string;
}

/**
 * Props para un componente de chips seleccionables.
 */
export interface ChipSelectorProps<T> {
  options: ChipOption<T>[];
  value: T | '';
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Tipo de notificación toast.
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Datos de una notificación toast.
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Context de notificaciones toast.
 */
export interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

/**
 * Estado de un modal/dialog.
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/**
 * Props para un componente modal/dialog.
 */
export interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Estado de errores del formulario.
 */
export interface FormErrors {
  microObjective?: string;
  technicalFocus?: string;
  durationMin?: string;
  bpmTarget?: string;
  bpmAchieved?: string;
  perfectTakes?: string;
  qualityRating?: string;
  rpe?: string;
  reflection?: string;
  general?: string;
}

/**
 * Hook personalizado para manejo de formulario de sesión.
 */
export interface UseSessionFormReturn {
  formState: SessionFormState;
  errors: FormErrors;
  loading: boolean;
  handleChange: <K extends keyof SessionFormState>(
    field: K,
    value: SessionFormState[K]
  ) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  isValid: boolean;
}

/**
 * Configuración de autocompletado para el campo de objetivo.
 */
export interface AutocompleteConfig {
  suggestions: string[];
  maxSuggestions?: number;
  minChars?: number;
}

/**
 * Props para el componente de autocompletado.
 */
export interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  maxSuggestions?: number;
  minChars?: number;
}

/**
 * Tema de colores de la aplicación.
 */
export interface Theme {
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

/**
 * Labels descriptivos para los niveles de RPE.
 */
export const RPE_LABELS: Record<number, string> = {
  1: 'Muy fácil',
  2: 'Fácil',
  3: 'Moderado',
  4: 'Un poco difícil',
  5: 'Difícil',
  6: 'Bastante difícil',
  7: 'Muy difícil',
  8: 'Extremadamente difícil',
  9: 'Máximo esfuerzo',
  10: 'Imposible mantener',
};

/**
 * Labels descriptivos para los items del checklist de mindset.
 */
export const MINDSET_LABELS: Record<keyof MindsetChecklist, string> = {
  warmedUp: 'Calenté antes de practicar',
  practicedSlow: 'Practiqué lento y controlado',
  recorded: 'Me grabé para revisar',
  tookBreaks: 'Hice pausas durante la sesión',
  reviewedMistakes: 'Revisé y analicé mis errores',
};

/**
 * Opciones de chips para foco técnico.
 */
export const TECHNICAL_FOCUS_OPTIONS: ChipOption<TechnicalFocus>[] = [
  { value: 'Técnica', label: 'Técnica', emoji: '🎸' },
  { value: 'Ritmo', label: 'Ritmo', emoji: '🥁' },
  { value: 'Limpieza', label: 'Limpieza', emoji: '✨' },
  { value: 'Coordinación', label: 'Coordinación', emoji: '🤝' },
  { value: 'Repertorio', label: 'Repertorio', emoji: '📚' },
];

/**
 * Opciones de chips para duración de sesión.
 */
export const DURATION_OPTIONS: ChipOption<SessionDuration>[] = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];
