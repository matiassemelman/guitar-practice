# Tipos TypeScript - Deliberate Guitar

Documentación completa de la estructura de tipos del proyecto.

## Estructura de Archivos

```
types/
├── session.ts      # Tipos principales de sesiones
├── api.ts          # Tipos de API y respuestas
├── database.ts     # Mapeo entre DB y aplicación
├── ui.ts           # Tipos de componentes UI
└── index.ts        # Barrel export

lib/
├── validation.ts       # Validación de datos
├── session-helpers.ts  # Utilidades para sesiones
└── insights.ts         # Generador de insights motivacionales
```

## Tipos Principales

### Session (`session.ts`)

**Interface `Session`**: Representa una sesión completa de práctica.

```typescript
interface Session {
  id: number;
  createdAt: string; // ISO 8601

  // Campos obligatorios
  microObjective: string;
  technicalFocus: TechnicalFocus;
  durationMin: SessionDuration;

  // Métricas opcionales
  bpmTarget?: number | null;
  bpmAchieved?: number | null;
  perfectTakes?: number | null;
  qualityRating?: number | null;
  rpe?: number | null;

  // Mindset y reflexión
  mindsetChecklist?: MindsetChecklist | null;
  reflection?: string | null;
}
```

**Type `TechnicalFocus`**: Enum de focos técnicos.

```typescript
type TechnicalFocus =
  | 'Técnica'
  | 'Ritmo'
  | 'Limpieza'
  | 'Coordinación'
  | 'Repertorio';
```

**Type `SessionDuration`**: Duraciones válidas en minutos.

```typescript
type SessionDuration = 5 | 10 | 20 | 30 | 45 | 60;
```

**Interface `MindsetChecklist`**: Checklist de estrategias de práctica deliberada.

```typescript
interface MindsetChecklist {
  warmedUp: boolean;          // ¿Calentó antes?
  practicedSlow: boolean;     // ¿Practicó lento?
  recorded: boolean;          // ¿Se grabó?
  tookBreaks: boolean;        // ¿Hizo pausas?
  reviewedMistakes: boolean;  // ¿Revisó errores?
}
```

**Interface `CreateSessionInput`**: Datos para crear nueva sesión.

```typescript
interface CreateSessionInput {
  microObjective: string;
  technicalFocus: TechnicalFocus;
  durationMin: SessionDuration;
  // ... campos opcionales
}
```

**Interface `SessionStats`**: Estadísticas calculadas.

```typescript
interface SessionStats {
  currentStreak: number;
  weeklyMinutes: number;
  weeklyAverageQuality: number | null;
  weeklySessionCount: number;
  totalSessions: number;
  totalMinutes: number;
}
```

### API (`api.ts`)

**Estructura de respuestas**: Todas las respuestas de la API siguen este formato.

```typescript
type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

**Códigos de error**:

```typescript
enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

**Type Guards**:

```typescript
isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T>
isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse
```

### Database (`database.ts`)

**Interface `SessionRow`**: Fila de la tabla `sessions` (snake_case).

```typescript
interface SessionRow {
  id: number;
  created_at: string;
  micro_objective: string;
  technical_focus: string;
  duration_min: number;
  // ... más campos
}
```

**Funciones de transformación**:

```typescript
// DB → Aplicación
rowToSession(row: SessionRow): Session

// Aplicación → DB
inputToInsertParams(input: CreateSessionInput): SessionInsertParams

// Generador de queries
buildInsertQuery(params: SessionInsertParams): { sql: string; values: unknown[] }
buildSelectQuery(options: SelectQueryOptions): { sql: string; values: unknown[] }
```

### UI (`ui.ts`)

**Interface `SessionFormState`**: Estado del formulario.

```typescript
interface SessionFormState {
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
```

**Type `LoadingState`**: Estados de carga.

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

**Constantes útiles**:

```typescript
// Labels de RPE
RPE_LABELS: Record<number, string> = {
  1: 'Muy fácil',
  2: 'Fácil',
  // ...
  10: 'Imposible mantener',
}

// Labels de mindset
MINDSET_LABELS: Record<keyof MindsetChecklist, string> = {
  warmedUp: 'Calenté antes de practicar',
  practicedSlow: 'Practiqué lento y controlado',
  // ...
}

// Opciones de chips
TECHNICAL_FOCUS_OPTIONS: ChipOption<TechnicalFocus>[]
DURATION_OPTIONS: ChipOption<SessionDuration>[]
```

## Validación (`lib/validation.ts`)

**Funciones principales**:

```typescript
// Valida un input completo
validateCreateSessionInput(input: unknown): ValidationResult

// Valida y transforma en un solo paso
validateAndTransform(input: unknown): CreateSessionInput

// Validaciones individuales
validateMicroObjective(value: unknown): ValidationResult
validateTechnicalFocus(value: unknown): ValidationResult
validateDuration(value: unknown): ValidationResult
validateBPM(value: unknown, fieldName: string): ValidationResult
validatePerfectTakes(value: unknown): ValidationResult
validateQualityRating(value: unknown): ValidationResult
validateRPE(value: unknown): ValidationResult
validateMindsetChecklist(value: unknown): ValidationResult
validateReflection(value: unknown): ValidationResult
```

**Resultado de validación**:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## Helpers (`lib/session-helpers.ts`)

**Formateo de datos**:

```typescript
// Formateo de fechas
formatDate(isoDate: string): string
formatDateTime(isoDate: string): string
formatRelativeTime(isoDate: string): string

// Formateo de duración
formatDuration(minutes: number): string

// Emojis
getQualityEmoji(rating: number): string
getRPEEmoji(rpe: number): string
getTechnicalFocusEmoji(focus: TechnicalFocus): string

// Colores CSS
getTechnicalFocusColor(focus: TechnicalFocus): string
```

**Cálculos**:

```typescript
// Mindset
countCompletedMindsetItems(checklist: MindsetChecklist): number
getMindsetCompletionPercentage(checklist: MindsetChecklist): number

// BPM
hadBPMProgress(session: Session): boolean
getBPMProgressPercentage(session: Session): number | null

// Calidad
isHighQualitySession(session: Session): boolean
calculateSessionScore(session: Session): number

// Estadísticas
calculateTotalMinutes(sessions: Session[]): number
calculateAverageQuality(sessions: Session[]): number | null
calculateCurrentStreak(sessions: Session[]): number
calculateBasicStats(sessions: Session[]): SessionStats
```

**Filtros y agrupación**:

```typescript
groupSessionsByDate(sessions: Session[]): Map<string, Session[]>
filterSessionsByDateRange(sessions: Session[], from: string, to: string): Session[]
getWeeklySessions(sessions: Session[]): Session[]
extractBPMData(sessions: Session[]): BPMDataPoint[]
```

## Insights (`lib/insights.ts`)

**Generación de mensajes motivacionales**:

```typescript
// Genera insight basado en Growth Mindset + Kaizen
generateInsight(input: CreateSessionInput): Insight

// Genera sugerencia de micro-mejora
generateKaizenSuggestion(recentSessions: Session[]): string

// Mensajes de hitos
generateMilestoneMessage(
  milestone: 'first_session' | 'streak_7' | 'streak_30' | 'total_hours_10' | 'total_hours_50'
): string

// Reflexión semanal
generateWeeklyReflection(): { question1: string; question2: string }

// Sugerencias de objetivos
filterObjectiveSuggestions(technicalFocus: string, searchTerm?: string): string[]
```

**Interface `Insight`**:

```typescript
interface Insight {
  type: InsightType;
  message: string;
  kaizen?: string; // Sugerencia de micro-mejora
}
```

## Constantes (`session.ts`)

**Valores de validación**:

```typescript
const SESSION_CONSTANTS = {
  VALID_DURATIONS: [5, 10, 20, 30, 45, 60],
  VALID_FOCUSES: ['Técnica', 'Ritmo', 'Limpieza', 'Coordinación', 'Repertorio'],
  BPM_RANGE: { min: 20, max: 400 },
  PERFECT_TAKES_RANGE: { min: 0, max: 3 },
  QUALITY_RATING_RANGE: { min: 1, max: 5 },
  RPE_RANGE: { min: 1, max: 10 },
};
```

## Uso en la Aplicación

### Ejemplo: Crear una sesión

```typescript
import {
  validateAndTransform,
  generateInsight,
  inputToInsertParams,
  buildInsertQuery
} from '@/types';

// 1. Validar input del formulario
const validatedInput = validateAndTransform(rawFormData);

// 2. Generar insight motivacional
const insight = generateInsight(validatedInput);

// 3. Preparar para DB
const dbParams = inputToInsertParams(validatedInput);
const { sql, values } = buildInsertQuery(dbParams);

// 4. Ejecutar query
const result = await db.query(sql, values);
```

### Ejemplo: Mostrar estadísticas

```typescript
import { calculateBasicStats, formatDuration } from '@/types';

const stats = calculateBasicStats(allSessions);

console.log(`Racha actual: ${stats.currentStreak} días`);
console.log(`Esta semana: ${formatDuration(stats.weeklyMinutes)}`);
console.log(`Calidad promedio: ${stats.weeklyAverageQuality?.toFixed(1)} ★`);
```

### Ejemplo: Validar respuesta de API

```typescript
import { isApiSuccess, type GetSessionsResponse } from '@/types';

const response = await fetch('/api/sessions');
const data = await response.json();

if (isApiSuccess<GetSessionsResponse>(data)) {
  const sessions = data.data.sessions;
  // Procesar sesiones...
} else {
  console.error(data.error.message);
}
```

## Principios de Diseño

1. **Separación de concerns**: Tipos de dominio (`session.ts`) separados de tipos de infraestructura (`api.ts`, `database.ts`) y UI (`ui.ts`).

2. **Type safety**: Uso extensivo de type guards y validación en runtime para garantizar type safety.

3. **Sin dependencias externas**: No se usa Zod ni otras librerías de validación para mantener el bundle pequeño.

4. **JSDoc en español**: Todos los tipos están documentados en español para facilitar comprensión.

5. **Naming conventions**:
   - DB: `snake_case` (ej: `micro_objective`)
   - Aplicación: `camelCase` (ej: `microObjective`)
   - Tipos: `PascalCase` (ej: `SessionFormState`)
   - Constantes: `UPPER_SNAKE_CASE` (ej: `SESSION_CONSTANTS`)

6. **Mapeo explícito**: Funciones dedicadas para transformar entre formatos de DB y aplicación.

7. **Valores por defecto**: Constantes exportadas para estados iniciales (ej: `DEFAULT_FORM_STATE`, `DEFAULT_MINDSET_CHECKLIST`).

## Decisiones de Diseño

### ¿Por qué `string` para fechas en lugar de `Date`?

Las fechas se representan como strings ISO 8601 para facilitar serialización JSON y consistencia entre cliente/servidor. Se proveen funciones helper (`formatDate`, `formatDateTime`, `formatRelativeTime`) para formateo.

### ¿Por qué campos opcionales con `| null` en `Session`?

Los campos opcionales pueden ser `undefined` (no provisto) o `null` (provisto explícitamente como null desde la DB). El tipo `| null` refleja la realidad de PostgreSQL.

### ¿Por qué `ValidationResult` en lugar de lanzar errores?

Retornar objetos de resultado permite manejar múltiples errores de validación a la vez y facilita mostrar feedback detallado al usuario.

### ¿Por qué separar `CreateSessionInput` de `Session`?

`CreateSessionInput` no incluye `id` ni `createdAt` (generados por la DB), mientras que `Session` representa el registro completo. Esto previene errores donde se intenta crear una sesión con ID.

## Testing

Para testing, se recomienda usar estos valores de ejemplo:

```typescript
const mockSession: Session = {
  id: 1,
  createdAt: '2025-10-08T15:30:00Z',
  microObjective: 'Cambio limpio de C a G a 60 bpm',
  technicalFocus: 'Técnica',
  durationMin: 30,
  bpmTarget: 60,
  bpmAchieved: 58,
  perfectTakes: 2,
  qualityRating: 4,
  rpe: 6,
  mindsetChecklist: {
    warmedUp: true,
    practicedSlow: true,
    recorded: false,
    tookBreaks: true,
    reviewedMistakes: true,
  },
  reflection: 'Necesito mejorar la transición del acorde G',
};
```

## Referencias

- Schema de DB: Ver `/CLAUDE.md` sección "Notas sobre Schema de Base de Datos"
- Plan de desarrollo: Ver `/docs/PLAN.md` FASE 1, Paso 6
- Documentación de Neon: https://neon.tech/docs
