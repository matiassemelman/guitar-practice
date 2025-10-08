# Componentes de Deliberate Guitar

## SessionForm

Formulario de registro rápido de sesiones de práctica de guitarra, diseñado para completarse en ≤30 segundos.

### Uso Básico

```tsx
import SessionForm from '@/app/components/SessionForm';

export default function Page() {
  const handleSessionCreated = (sessionId: number) => {
    console.log('Nueva sesión creada con ID:', sessionId);
    // Aquí puedes refrescar la lista de sesiones, etc.
  };

  return (
    <SessionForm onSuccess={handleSessionCreated} />
  );
}
```

### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `onSuccess` | `(sessionId: number) => void` | No | Callback ejecutado después de crear exitosamente una sesión |

### Features Implementadas

#### ✅ Campos Obligatorios
- **Objetivo Micro**: Input de texto grande con autofocus
- **Foco Técnico**: Chips de selección única (Técnica, Ritmo, Limpieza, Coordinación, Repertorio)
- **Duración**: Botones rápidos (5, 10, 20, 30, 45, 60 minutos) - Default: 20 min

#### ✅ Campos Opcionales de Rendimiento
- **BPM Objetivo/Logrado**: Inputs numéricos validados (20-400 BPM)
- **Tomas Perfectas**: 4 botones circulares (0-3)
- **Rating de Calidad**: 5 estrellas clicables (1-5)
- **RPE (Esfuerzo Percibido)**: Slider de 1-10 con labels descriptivos

#### ✅ Checklist de Mindset (Práctica Deliberada)
- Calenté antes de practicar
- Practiqué lento / a velocidad controlada
- Me grabé para auto-evaluarme
- Tomé pausas durante la sesión
- Revisé y analicé mis errores

#### ✅ Reflexión
- Input de texto de una línea
- Placeholder: "Hoy aprendí que..."
- Máximo 1000 caracteres

#### ✅ Feedback Motivacional
- Genera insights basados en Growth Mindset + Kaizen
- Muestra mensaje de éxito con sugerencia de micro-mejora
- Auto-oculta después de 8 segundos

### Validación

El formulario valida:
- Objetivo micro: mínimo 5 caracteres, máximo 500
- Foco técnico: debe ser uno de los valores válidos
- BPM: rango 20-400
- Tomas perfectas: 0-3
- Calidad: 1-5 estrellas
- RPE: 1-10

### Integración con API

El componente hace POST a `/api/sessions` con el siguiente formato:

```typescript
interface CreateSessionInput {
  // Obligatorios
  microObjective: string;
  technicalFocus: TechnicalFocus;
  durationMin: SessionDuration;

  // Opcionales
  bpmTarget?: number;
  bpmAchieved?: number;
  perfectTakes?: number;
  qualityRating?: number;
  rpe?: number;
  mindsetChecklist?: MindsetChecklist;
  reflection?: string;
}
```

### Ejemplo de Respuesta

```json
{
  "success": true,
  "data": {
    "session": { /* ... */ },
    "insight": "¡Excelente decisión practicar lento! La velocidad llegará con la precisión. En la próxima sesión, intenta grabarte para detectar detalles que no notas en vivo."
  }
}
```

### Estados UI

- **Loading**: Botón muestra "Guardando..." y está deshabilitado
- **Error**: Banner rojo con mensaje de error
- **Success**: Banner verde con insight motivacional
- **Validación**: Botón deshabilitado si faltan campos requeridos

### Estilos y UX

- **Tailwind CSS**: Todos los estilos inline con clases de Tailwind
- **Desktop-first**: Diseño optimizado para pantalla grande
- **Mobile-friendly**: Grid responsive con breakpoints
- **Feedback visual**: Estados hover, focus, active bien definidos
- **Accesibilidad**: Labels correctos, autofocus en primer campo

### Consideraciones de Rendimiento

- Sin debouncing (formulario simple)
- Limpieza automática de formulario post-submit
- Callback `onSuccess` para integración con parent
- Timeout de 8s para auto-ocultar mensaje de éxito

---

## SessionCard

Tarjeta compacta para mostrar una sesión de práctica en la línea de tiempo.

### Uso Básico

```tsx
import SessionCard from '@/app/components/SessionCard';

<SessionCard
  session={session}
  onEdit={(session) => console.log('Editar', session)}
  onDelete={(id) => console.log('Eliminar', id)}
  compact={true}
/>
```

### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `session` | `Session` | Sí | Objeto de sesión a mostrar |
| `onEdit` | `(session: Session) => void` | No | Handler para editar sesión |
| `onDelete` | `(id: number) => void` | No | Handler para eliminar sesión |
| `compact` | `boolean` | No | Modo compacto (default: true) |

---

## SessionsList

Lista de sesiones en orden cronológico inverso (más reciente arriba) con estado de loading y mensaje vacío.

### Uso Básico

```tsx
import SessionsList from '@/app/components/SessionsList';

export default function Timeline() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSessions(data.data.sessions);
        }
        setLoading(false);
      });
  }, []);

  return (
    <SessionsList
      sessions={sessions}
      loading={loading}
      emptyMessage="¡Comienza tu práctica deliberada!"
      onSessionEdit={(session) => console.log('Editar', session)}
      onSessionDelete={(id) => console.log('Eliminar', id)}
    />
  );
}
```

### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `sessions` | `Session[]` | Sí | Array de sesiones a mostrar |
| `loading` | `boolean` | No | Muestra skeleton loader si true |
| `emptyMessage` | `string` | No | Mensaje personalizado cuando no hay sesiones |
| `onSessionEdit` | `(session: Session) => void` | No | Handler para editar sesión |
| `onSessionDelete` | `(id: number) => void` | No | Handler para eliminar sesión |

### Features

- ✅ Timeline cronológico inverso (más reciente arriba)
- ✅ Skeleton loader mientras carga
- ✅ Estado vacío con mensaje motivador y tips
- ✅ Contador de sesiones en header
- ✅ Mensaje motivador en footer (cuando hay 5+ sesiones)
- ✅ Usa SessionCard internamente para cada sesión

---

## StatsPanel

Panel horizontal de estadísticas motivadoras que muestra 3 métricas clave de progreso.

### Uso Básico

```tsx
import StatsPanel from '@/app/components/StatsPanel';

// Opción 1: Fetch automático
export default function Stats() {
  return <StatsPanel />;
}

// Opción 2: Pasar stats como prop
export default function Stats() {
  const [stats, setStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data.stats);
        }
      });
  }, []);

  return <StatsPanel stats={stats} />;
}
```

### Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `stats` | `SessionStats \| null` | No | Stats a mostrar (si no se pasa, hace fetch automático) |
| `loading` | `boolean` | No | Muestra skeleton loader si true |

### Métricas Mostradas

#### 1. Racha de días 🔥
- Días consecutivos con práctica (últimos 7 días)
- Color dinámico: verde (≥7 días), naranja (≥3 días), gris (< 3 días)
- Texto: "N días consecutivos"

#### 2. Minutos practicados ⏱️
- Total de minutos esta semana
- Muestra horas + minutos si ≥ 2 horas
- Color: azul

#### 3. Calidad promedio ⭐
- Promedio de quality_rating esta semana
- Estrellas visuales (★ ⯨ ☆)
- Muestra rating numérico: "4.2/5.0"
- Mensaje si no hay datos

#### Stats Adicionales (Compactas)
- Total de sesiones de todos los tiempos
- Tiempo total practicado (horas + minutos)

### Features

- ✅ Fetch automático de /api/stats si no se pasan stats
- ✅ Skeleton loader mientras carga
- ✅ Error handling con botón de retry
- ✅ Mensajes motivadores dinámicos basados en stats:
  - Racha ≥ 3 días: mensaje verde de felicitación
  - Minutos ≥ 120 esta semana: mensaje azul de reconocimiento
- ✅ Grid responsive (1 columna en mobile, 3 en desktop)
- ✅ Auto-refresh opcional (via prop)

### Integración con API

Espera respuesta de `/api/stats` con formato:

```typescript
{
  success: true,
  data: {
    stats: {
      currentStreak: number;
      weeklyMinutes: number;
      weeklyAverageQuality: number | null;
      weeklySessionCount: number;
      totalSessions: number;
      totalMinutes: number;
    }
  }
}
```

---

## Utilidades de Fecha

El proyecto incluye funciones helper para formateo de fechas en `/lib/date-utils.ts`.

### Funciones Disponibles

#### `formatRelativeDate(isoDate: string): string`
Formatea fecha a formato relativo amigable.
- "Ahora" (< 1 min)
- "Hace 5 min" (< 1 hora)
- "Hace 3h" (< 24 horas)
- "Hoy 14:30" (hoy)
- "Ayer 09:15" (ayer)
- "Lun 10:00" (última semana)
- "15 Mar" (más antiguo)

#### `formatFullDate(isoDate: string): string`
Formato completo: "Lunes, 15 de marzo de 2024 a las 14:30"

#### `formatShortDate(isoDate: string): string`
Formato corto: "15/03/2024"

#### `formatTime(isoDate: string): string`
Solo hora: "14:30"

#### `daysSince(isoDate: string): number`
Diferencia en días desde fecha hasta hoy.

#### `isToday(isoDate: string): boolean`
Verifica si fecha es de hoy.

#### `isYesterday(isoDate: string): boolean`
Verifica si fecha es de ayer.

#### `isWithinDays(isoDate: string, days: number): boolean`
Verifica si fecha está dentro de últimos N días.

#### `getStartOfToday(): Date`
Obtiene inicio del día actual (00:00:00).

#### `getStartOfWeek(): Date`
Obtiene inicio de semana actual (Lunes 00:00:00).

#### `getStartOfMonth(): Date`
Obtiene inicio del mes actual (día 1 00:00:00).

### Uso

```typescript
import { formatRelativeDate, isToday } from '@/lib/date-utils';

const dateStr = "2024-03-15T14:30:00Z";
console.log(formatRelativeDate(dateStr)); // "Hace 2h"
console.log(isToday(dateStr)); // false
```

---

## Próximos Componentes (WIP)

- [ ] `Filters`: Componente de filtros para sesiones (fecha, foco técnico)
- [ ] `BPMChart`: Gráfico de evolución de BPM
- [ ] `WeeklyReflection`: Panel de reflexión semanal (2 preguntas)
