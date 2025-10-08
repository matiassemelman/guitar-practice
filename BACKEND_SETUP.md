# Backend Setup - Deliberate Guitar

## ✅ Archivos Creados

### 1. Cliente de Base de Datos
**Archivo:** `/home/matias/projects/guitar-practice/lib/db.ts`

Funciones principales:
- `getDbClient()` - Obtiene cliente conectado a Neon PostgreSQL
- `executeQuery<T>()` - Ejecuta queries con parámetros
- `executeQueryOne<T>()` - Ejecuta query que debe retornar exactamente 1 fila
- `executeQueryOneOrNull<T>()` - Ejecuta query que puede retornar 1 fila o null
- `testConnection()` - Verifica conexión a la base de datos
- `getRowCount()` - Cuenta filas en una tabla con filtros opcionales

### 2. API Routes

#### `/home/matias/projects/guitar-practice/app/api/test/route.ts`
- **GET** `/api/test` - Verifica conexión a la base de datos

#### `/home/matias/projects/guitar-practice/app/api/sessions/route.ts`
- **GET** `/api/sessions` - Lista sesiones con filtros opcionales
- **POST** `/api/sessions` - Crea nueva sesión

#### `/home/matias/projects/guitar-practice/app/api/stats/route.ts`
- **GET** `/api/stats` - Obtiene estadísticas agregadas

---

## 🔌 Endpoints Disponibles

### 1. **GET /api/test**
Verifica la conexión a la base de datos.

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "timestamp": "2025-10-08T21:35:00.000Z",
    "database": "PostgreSQL (Neon)",
    "version": "PostgreSQL 16.4",
    "message": "Conexión exitosa a la base de datos"
  }
}
```

**Response de error (sin DATABASE_URL):**
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "DATABASE_URL no está configurada. Por favor, configura la variable de entorno en .env.local"
  }
}
```

---

### 2. **GET /api/sessions**
Lista sesiones de práctica con filtros opcionales.

**Query Parameters:**
- `technicalFocus` (opcional): Filtra por foco técnico (Técnica | Ritmo | Limpieza | Coordinación | Repertorio)
- `dateFrom` (opcional): Fecha inicio ISO 8601 (ej: 2025-10-01T00:00:00Z)
- `dateTo` (opcional): Fecha fin ISO 8601
- `limit` (opcional): Número máximo de resultados (default: 50, max: 100)
- `offset` (opcional): Offset para paginación (default: 0)

**Ejemplo de request:**
```bash
curl http://localhost:3000/api/sessions?limit=10&technicalFocus=Ritmo
```

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 1,
        "createdAt": "2025-10-08T20:30:00.000Z",
        "microObjective": "Cambio limpio de C a G a 60 bpm",
        "technicalFocus": "Técnica",
        "durationMin": 30,
        "bpmTarget": 60,
        "bpmAchieved": 55,
        "perfectTakes": 2,
        "qualityRating": 4,
        "rpe": 6,
        "mindsetChecklist": {
          "warmedUp": true,
          "practicedSlow": true,
          "recorded": false,
          "tookBreaks": true,
          "reviewedMistakes": true
        },
        "reflection": "Hoy me di cuenta que necesito relajar más la muñeca"
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

**Response de error (validación):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Technical focus must be one of: Técnica, Ritmo, Limpieza, Coordinación, Repertorio"
  }
}
```

---

### 3. **POST /api/sessions**
Crea una nueva sesión de práctica.

**Request Body (JSON):**
```json
{
  "microObjective": "Cambio limpio de C a G a 60 bpm",
  "technicalFocus": "Técnica",
  "durationMin": 30,
  "bpmTarget": 60,
  "bpmAchieved": 55,
  "perfectTakes": 2,
  "qualityRating": 4,
  "rpe": 6,
  "mindsetChecklist": {
    "warmedUp": true,
    "practicedSlow": true,
    "recorded": false,
    "tookBreaks": true,
    "reviewedMistakes": true
  },
  "reflection": "Hoy me di cuenta que necesito relajar más la muñeca"
}
```

**Campos obligatorios:**
- `microObjective` (string, 5-500 caracteres)
- `technicalFocus` (enum: Técnica | Ritmo | Limpieza | Coordinación | Repertorio)
- `durationMin` (enum: 5 | 10 | 20 | 30 | 45 | 60)

**Campos opcionales:**
- `bpmTarget` (number, 20-400)
- `bpmAchieved` (number, 20-400)
- `perfectTakes` (number, 0-3)
- `qualityRating` (number, 1-5)
- `rpe` (number, 1-10)
- `mindsetChecklist` (object con 5 campos booleanos)
- `reflection` (string, max 1000 caracteres)

**Response exitosa (201 Created):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": 1,
      "createdAt": "2025-10-08T20:30:00.000Z",
      "microObjective": "Cambio limpio de C a G a 60 bpm",
      "technicalFocus": "Técnica",
      "durationMin": 30,
      "bpmTarget": 60,
      "bpmAchieved": 55,
      "perfectTakes": 2,
      "qualityRating": 4,
      "rpe": 6,
      "mindsetChecklist": {
        "warmedUp": true,
        "practicedSlow": true,
        "recorded": false,
        "tookBreaks": true,
        "reviewedMistakes": true
      },
      "reflection": "Hoy me di cuenta que necesito relajar más la muñeca"
    },
    "insight": "¡Excelente decisión practicar lento! La velocidad llegará con la precisión. En la próxima sesión, intenta grabarte para detectar detalles que no notas en vivo."
  }
}
```

**Response de error (validación):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed: Micro objective must be at least 5 characters long"
  }
}
```

---

### 4. **GET /api/stats**
Obtiene estadísticas agregadas de todas las sesiones.

**Response exitosa:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "currentStreak": 5,
      "weeklyMinutes": 180,
      "weeklyAverageQuality": 4.2,
      "weeklySessionCount": 6,
      "totalSessions": 42,
      "totalMinutes": 1260
    }
  }
}
```

**Descripción de métricas:**
- `currentStreak`: Días consecutivos con al menos 1 sesión (últimos 7 días)
- `weeklyMinutes`: Total de minutos practicados en los últimos 7 días
- `weeklyAverageQuality`: Promedio de calificación de calidad (1-5★) últimos 7 días
- `weeklySessionCount`: Número de sesiones en los últimos 7 días
- `totalSessions`: Total de sesiones de todos los tiempos
- `totalMinutes`: Total de minutos de todos los tiempos

---

## 📝 Instrucciones para Testing

### Prerrequisitos

1. **Configurar DATABASE_URL:**
   ```bash
   # En /home/matias/projects/guitar-practice/.env.local
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

2. **Aplicar schema a la base de datos:**
   ```bash
   # Usando psql (desde tu cliente Neon)
   psql $DATABASE_URL < /home/matias/projects/guitar-practice/db/schema.sql
   ```

### Paso 1: Iniciar servidor de desarrollo
```bash
cd /home/matias/projects/guitar-practice
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Paso 2: Test de conexión
```bash
# Verificar que la conexión a la DB funciona
curl http://localhost:3000/api/test
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "timestamp": "2025-10-08T...",
    "database": "PostgreSQL (Neon)",
    "version": "PostgreSQL 16.x",
    "message": "Conexión exitosa a la base de datos"
  }
}
```

### Paso 3: Crear una sesión de prueba
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "microObjective": "Cambio limpio de C a G a 60 bpm",
    "technicalFocus": "Técnica",
    "durationMin": 30,
    "bpmTarget": 60,
    "bpmAchieved": 55,
    "perfectTakes": 2,
    "qualityRating": 4,
    "rpe": 6,
    "mindsetChecklist": {
      "warmedUp": true,
      "practicedSlow": true,
      "recorded": false,
      "tookBreaks": true,
      "reviewedMistakes": true
    },
    "reflection": "Hoy me di cuenta que necesito relajar más la muñeca"
  }'
```

**Resultado esperado:** Status 201, sesión creada con ID + mensaje de insight.

### Paso 4: Listar sesiones
```bash
# Listar todas las sesiones
curl http://localhost:3000/api/sessions

# Listar con filtro por foco técnico
curl "http://localhost:3000/api/sessions?technicalFocus=Técnica"

# Listar con límite
curl "http://localhost:3000/api/sessions?limit=5"
```

### Paso 5: Obtener estadísticas
```bash
curl http://localhost:3000/api/stats
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "currentStreak": 1,
      "weeklyMinutes": 30,
      "weeklyAverageQuality": 4,
      "weeklySessionCount": 1,
      "totalSessions": 1,
      "totalMinutes": 30
    }
  }
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Variables de Entorno
- **CRÍTICO:** `DATABASE_URL` debe estar configurada en `.env.local`
- El backend retornará error descriptivo si la variable no existe

### 2. Manejo de Errores
- Todos los endpoints retornan estructura estándar `ApiResponse<T>`
- Errores de validación: HTTP 400 con código `VALIDATION_ERROR` o `INVALID_INPUT`
- Errores de DB: HTTP 500 con código `DATABASE_ERROR`
- Recursos no encontrados: HTTP 404 con código `SESSION_NOT_FOUND`

### 3. Validación de Datos
- Toda validación se hace en `/lib/validation.ts`
- Los datos se sanitizan antes de insertar (trim, normalización)
- Los valores opcionales se validan solo si están presentes

### 4. Queries SQL
- **No se usa ORM** - solo queries SQL directas
- Queries parametrizadas ($1, $2, etc.) para prevenir SQL injection
- Funciones helper en `/types/database.ts` para construir queries dinámicas

### 5. Tipos TypeScript
- Todos los tipos están en `/types/`
- Separación clara entre:
  - Tipos de DB (snake_case): `SessionRow`, `SessionInsertParams`
  - Tipos de API (camelCase): `Session`, `CreateSessionInput`
  - Funciones de transformación: `rowToSession()`, `inputToInsertParams()`

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL no está configurada"
**Solución:** Crear archivo `.env.local` con la variable `DATABASE_URL`

### Error: "Database query failed"
**Posibles causas:**
1. Credenciales incorrectas en `DATABASE_URL`
2. Tabla `sessions` no existe (aplicar schema.sql)
3. Firewall/red bloqueando conexión a Neon

**Solución:** Verificar conexión con `psql $DATABASE_URL`

### Error de validación en POST
**Solución:** Verificar que el body JSON cumple con los tipos en `/types/session.ts`
- `microObjective`: min 5 caracteres, max 500
- `technicalFocus`: uno de los valores válidos
- `durationMin`: uno de: 5, 10, 20, 30, 45, 60
- BPM: 20-400
- perfectTakes: 0-3
- qualityRating: 1-5
- rpe: 1-10

### Compilación fallida
**Nota:** El proyecto compila correctamente. Si aparece error de ESLint en componentes frontend (como `SessionCard.tsx`), es independiente del backend.

---

## 📚 Estructura del Código

```
/home/matias/projects/guitar-practice/
├── lib/
│   ├── db.ts                    # Cliente de base de datos
│   ├── validation.ts            # Funciones de validación
│   ├── insights.ts              # Generador de insights motivacionales
│   └── session-helpers.ts       # Helpers para sesiones
├── types/
│   ├── session.ts               # Tipos de sesiones
│   ├── api.ts                   # Tipos de API responses
│   ├── database.ts              # Tipos y helpers de DB
│   └── index.ts                 # Barrel exports
├── app/api/
│   ├── test/route.ts            # GET /api/test
│   ├── sessions/route.ts        # GET/POST /api/sessions
│   └── stats/route.ts           # GET /api/stats
└── db/
    └── schema.sql               # Schema de PostgreSQL
```

---

## ✅ Checklist de Validación

- [x] Cliente de DB creado en `/lib/db.ts`
- [x] Endpoint de test en `/app/api/test/route.ts`
- [x] Endpoint de sesiones en `/app/api/sessions/route.ts`
- [x] Endpoint de stats en `/app/api/stats/route.ts`
- [x] Validación completa de inputs
- [x] Error handling robusto
- [x] Tipos TypeScript estrictos
- [x] Queries SQL parametrizadas (sin ORM)
- [x] Mensajes de error descriptivos en español
- [x] Código compilando sin errores de backend

---

## 🚀 Próximos Pasos

1. Aplicar schema a la base de datos Neon
2. Configurar `DATABASE_URL` en `.env.local`
3. Ejecutar tests de los 4 endpoints
4. Integrar endpoints con el frontend
5. Implementar manejo de errores en UI
6. Testing end-to-end con datos reales
