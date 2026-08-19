---
status: implementing
date: 2026-08-19
scope: public-demo-security
decision: public-fixture-plus-private-companion
---

# Deliberate Guitar — plan de demo pública segura

## Resultado buscado

Conservar `https://guitar-practice-opal.vercel.app` como proof público útil para
recruiters sin exponer datos personales, permitir escrituras globales ni dejar
un camino público hacia Neon u OpenAI. Matias conserva el tracker real en un
segundo proyecto Vercel protegido.

No se construye autenticación propia, multi-tenancy ni un SaaS. La separación
de deployments es el control de seguridad principal.

```text
Recruiter
  -> guitar-practice-opal.vercel.app
  -> datos sintéticos versionados
  -> sin APIs, Neon ni OpenAI

Matias
  -> proyecto Vercel privado
  -> protected Vercel preview deployment
  -> API real -> Neon + OpenAI
```

## Evidencia que fuerza esta decisión

- No existe auth ni middleware de aplicación.
- Las sesiones no tienen `user_id`; sus IDs son enumerables.
- El perfil es un singleton global `id = 1`.
- Los hábitos son globales y se sobrescriben por fecha.
- Seis operaciones públicas escriben, borran o generan costo.
- Siete lecturas públicas exponen datos o agregados reales.
- `/api/ai-analysis` hace dos llamadas GPT-4o de hasta 2048 tokens cada una,
  sin auth, rate limit ni validación completa del request.
- La salida de OpenAI entra en `dangerouslySetInnerHTML` sin sanitización,
  creando una cadena posible de prompt injection a XSS.
- `test-api.sh` es mutante y no limpia la sesión que crea.

## Alternativas descartadas

| Alternativa | Motivo |
| --- | --- |
| Ocultar botones | Las rutas siguen invocables con scripts o `curl`. |
| CORS u `Origin` | No autentican; un cliente no navegador puede falsificarlos o ignorarlos. |
| Token en frontend | El visitante puede copiarlo y reutilizarlo. |
| Rate limit en memoria | No es durable entre instancias serverless y no protege privacidad. |
| Misma DB con datos demo | Los GET pueden filtrar datos owner y los writes pueden envenenar el fixture. |
| Auth propia en una URL | Agrega sesiones, login, recuperación y testing sin resolver un problema de producto. |
| Preview como tracker definitivo | Mezcla secretos y demo y crea una operación frágil. |

## Paso 0 — contención

Antes de editar o desplegar:

1. Bloquear temporalmente `/api/*` en el firewall del proyecto público. El plan
   actual de Vercel no permite Authentication sobre el dominio de producción;
   Standard Protection sí cubre previews y URLs de deployment.
2. Inventariar aliases y deployments históricos.
3. Crear un backup o branch recuperable de Neon.
4. Mantener la protección hasta que el companion privado, el fixture público y
   la revocación de credenciales estén verificados.

Si la protección no está disponible, el fallback es revocar primero la key
OpenAI y la credencial Neon actuales, aceptando downtime temporal.

## Implementación

### 1. Runtime fail-closed

Crear `lib/app-mode.ts` y un `proxy.ts` compatible con Next 16.

- Admitir sólo `APP_MODE=demo` o `APP_MODE=private`.
- Valor ausente o inválido: no permitir DB, OpenAI ni APIs.
- En `demo`, rechazar `/api/*` antes de ejecutar handlers.
- Cada handler sensible replica el guard server-side; middleware no es el único
  control.
- `APP_MODE` no usa prefijo `NEXT_PUBLIC_`.

### 2. Demo pública fixture-only

Separar la página actual en:

- `PrivateTracker`: experiencia real actual.
- `PublicDemo`: lectura de fixtures sintéticos.
- `app/page.tsx`: selector server-side por modo.
- `lib/demo-data.ts`: perfil, sesiones, hábitos, métricas y ejemplo de análisis
  ficticios y auditables.

La demo:

- muestra un banner visible de modo demo;
- no hace requests a `/api`;
- no permite crear, editar, borrar ni guardar;
- permite explorar sesiones, métricas y un análisis de ejemplo;
- explica que los datos son sintéticos y el análisis está precomputado.

### 3. Hardening del tracker privado

- Eliminar `dangerouslySetInnerHTML`. Renderizar el output como texto
  `white-space: pre-wrap` o con componentes React que nunca acepten HTML crudo.
- Validar `analysisTypes` contra los seis valores permitidos, sin duplicados.
- Limitar `sessionLimit` server-side a un entero entre `1` y `30`.
- Introducir `AI_ANALYSIS_ENABLED`; cualquier valor distinto de `true` corta
  antes de DB/OpenAI.
- No devolver errores crudos de DB/OpenAI al navegador.
- No loguear reflexiones, objetivos o contenido del perfil.
- Eliminar o deshabilitar `/api/test` en producción.
- Agregar `Cache-Control: no-store` a respuestas privadas.
- Agregar headers de seguridad básicos; CSP es defensa adicional, no reemplaza
  eliminar el HTML crudo.

### 4. Companion privado

Crear un segundo proyecto Vercel desde el mismo repositorio sin relinkear el
checkout local compartido.

- `APP_MODE=private`.
- Mantenerlo como preview privado bajo Standard Protection; no promoverlo a
  producción mientras el plan no permita proteger producción.
- No crear shareable links ni publicar bypass tokens.
- Crear una credencial/role nuevo de aplicación en Neon.
- Crear una key nueva de un proyecto OpenAI dedicado.
- Configurar `AI_ANALYSIS_ENABLED=true`.
- Configurar rate limiting durable en Vercel WAF si el plan lo permite.
- Configurar límites de modelo y un hard spend limit conservador en OpenAI; si
  el hard cap no está disponible en la cuenta, usar alertas y mantener el kill
  switch como circuito operativo.

Las credenciales se cargan directamente en los dashboards. No pasan por chat,
git, logs ni el proyecto público.

### 5. Cutover del URL actual

1. Verificar CRUD + IA en el companion protegido con credenciales nuevas.
2. Desplegar `APP_MODE=demo` en el proyecto actual.
3. Quitar `DATABASE_URL`, `OPENAI_API_KEY`, `AI_ANALYSIS_ENABLED` y cualquier
   bypass secret de Production, Preview y Development del proyecto público.
4. Revocar —no sólo reemplazar— la key OpenAI y la credencial/role Neon que
   quedaron embebidos en deployments históricos.
5. Verificar que esas credenciales anteriores ya no funcionan.
6. Hacer pública únicamente la producción fixture; previews continúan
   protegidos.
7. Auditar varias URLs históricas: aunque resuelvan, no deben leer Neon ni
   invocar OpenAI.

No se promueve un deployment histórico como rollback después de la rotación.

### 6. Operación y documentación

- Actualizar `.env.example` sólo con nombres de variables.
- Actualizar README: demo sintética pública y tracker real privado.
- Reemplazar `test-api.sh` por un smoke con cleanup y guard que prohíba apuntar
  accidentalmente a producción.
- Documentar matriz de entornos, rotación y rollback.

## Matriz de entorno

| Entorno | `APP_MODE` | Neon | OpenAI | IA |
| --- | --- | --- | --- | --- |
| Público | `demo` | ausente | ausente | precomputada |
| Companion | `private` | credencial nueva | key nueva | habilitada |
| Local | `private` | credencial local | key local | opt-in |
| Preview público | `demo` | ausente | ausente | apagada |

## Pruebas obligatorias

### Demo pública

- `/` responde 200 en incógnito y muestra sólo fixtures.
- El recorrido completo no produce requests a `/api`.
- Todos los verbos contra `/api/sessions`, `/api/profile`, `/api/habits` y
  `/api/ai-analysis` devuelven 404/403 antes de DB/OpenAI.
- Repetir con `Origin`, `Referer`, cookies y `Authorization` falsos.
- Un sentinel privado nunca aparece en HTML, APIs, stats, errores ni prompts.
- El proyecto público no contiene secretos en ningún entorno.

### Companion privado

- Sin sesión Vercel, navegador y `curl` no llegan a la aplicación.
- Con acceso, crear, editar y borrar una sesión temporal deja la base limpia.
- Probar hábito y perfil con snapshot y restauración.
- Ejecutar una sola IA y registrar sólo éxito, request ID y costo/uso, no
  contenido personal.
- `AI_ANALYSIS_ENABLED=false` evita cualquier llamada.
- Tipos inválidos, duplicados, `sessionLimit=31` y JSON excesivo fallan antes de
  DB/OpenAI.
- Un output simulado `<img src=x onerror=...>` aparece como texto y no ejecuta
  JavaScript.

### Histórico y rollback

- Credencial Neon anterior rechazada.
- Key OpenAI anterior revocada.
- URLs históricas no acceden a ninguno de los proveedores.
- Rollback público usa sólo otro deployment fixture.
- Rollback privado ocurre únicamente dentro del companion protegido.

## Premortem técnico

| Falla | Señal temprana | Mitigación |
| --- | --- | --- |
| Sólo se oculta la UI | `curl` todavía obtiene 200/201 | Guard fail-closed por handler y matriz ruta por verbo. |
| La demo sigue leyendo datos owner | Sentinel privado aparece públicamente | Fixtures sin secretos ni imports operativos de DB. |
| Un deployment viejo sigue vivo | Credencial anterior aún funciona | Revocación real de Neon/OpenAI antes de levantar contención. |
| Output IA ejecuta HTML | Payload con event handler crea DOM activo | Eliminar el sink, testear como texto y sumar CSP. |
| El proof deja de ser convincente | Recruiter ve una pantalla vacía o bloqueada | Fixture con historia coherente, métricas y análisis visible. |
| El hardening consume varios días | Aparece auth propia, usuarios o migración multi-tenant | Stop rule: dos deployments, fixtures, guards y nada más. |

## Estimación y stop rule

- Contención: `10–20 min`.
- Código, fixtures y pruebas: `2–4 h`.
- Companion, rotación y cutover: `1–2 h`.
- Total realista: `4–6 h`, incluyendo verificación.

Se termina cuando el URL público conserva el proof, no tiene secretos ni
acceso a proveedores, y el companion protegido pasa CRUD + IA. No se agrega
login propio, multiusuario, sandbox por visitante ni rediseño visual amplio.

## Gate humano

Antes de ejecutar, Matias debe aprobar esta única decisión:

> Mantener el URL actual como demo pública sintética y crear un companion
> privado protegido para el tracker real, aceptando una ventana breve de
> protección durante el cutover y una segunda rotación de credenciales.
