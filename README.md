# Deliberate Guitar

Aplicación web personal para tracking de práctica deliberada de guitarra.

## Stack Tecnológico

- **Frontend**: Next.js 15.5.4 (App Router) + React 19 + TypeScript 5.9
- **Estilos**: Tailwind CSS 4.1
- **Base de datos**: Neon PostgreSQL (serverless)
- **Driver DB**: @neondatabase/serverless
- **Deploy**: Vercel

## Configuración Inicial

### Requisitos

- Node.js 18+
- npm

### Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env.local`
   - Agregar tu string de conexión de Neon PostgreSQL en `DATABASE_URL`

### Comandos de Desarrollo

```bash
# Servidor de desarrollo (http://localhost:3000)
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## Estructura del Proyecto

```
/app              # Next.js App Router (páginas y layouts)
/lib              # Funciones helper y utilidades
/types            # Definiciones de tipos TypeScript
/db               # Scripts y migraciones de base de datos
/docs             # Documentación del proyecto
```

## Filosofía

**Deliberate Guitar** se basa en tres pilares:

1. **Práctica Deliberada**: Intención → Atención → Corrección → Evolución
2. **Growth Mindset**: Celebrar estrategias efectivas, no solo resultados
3. **Kaizen**: Pequeñas mejoras diarias, progreso compuesto

## Más Información

- Ver `CLAUDE.md` para guía de desarrollo con Claude Code
- Ver `docs/PLAN.md` para el plan de desarrollo del MVP
- Ver `docs/PRODUCT_SPEC.md` para la especificación del producto
