Stack recomendado (mínimo y suficiente)
Frontend (Web Desktop)

Framework: Next.js (App Router) + TypeScript — rinde bien en Vercel, routing simple, server actions opcionales para llamadas directas.

UI/estilos: Tailwind CSS — rápido para maquetar panel izquierdo (Registro) y derecho (Evolución) sin libs pesadas.

Componentes base: nativos + utilidades ligeras

Gestión de datos en cliente: fetch + estado local.

Backend (muy liviano)

Runtime: Vercel Serverless Functions

SQL directo con consultas cortas (pierde migraciones limpias, ganas 0 dependencias).

Base de datos

DB: Neon (PostgreSQL serverless)

Driver: neon serverless driver o @neondatabase/serverless para conexiones rápidas desde serverless.

Esquema: una tabla sessions + columnas que ya definimos a nivel producto (puede incluir jsonb para mindset, errors, fixes).

Seguridad (uso personal, sin login)

Rate limiting: innecesario para uso personal.

No auth de usuarios: acceso por URL

Deploy & DX (Developer Experience)

Hosting: Vercel

Variables de entorno: DATABASE_URL