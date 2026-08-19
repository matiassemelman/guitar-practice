# Deliberate Guitar

A full-stack practice tracker that turns deliberate guitar sessions into
structured evidence and actionable coaching.

[Open the read-only portfolio demo](https://guitar-practice-opal.vercel.app)

## Product flow

1. Capture a micro-objective, technical focus, tempo, quality and reflection.
2. Store and query practice history in Neon PostgreSQL.
3. Convert recent sessions into constrained JSON with OpenAI.
4. Use that structured analysis to produce coaching insights and a next
   experiment.

The public deployment uses a synthetic, versioned dataset and a precomputed AI
result. It makes no database or model requests and cannot create, edit or delete
data. The real owner tracker runs separately behind deployment-level access
control.

## Runtime modes

The server fails closed unless `APP_MODE` is explicitly configured:

| Mode | UI | API | Credentials |
| --- | --- | --- | --- |
| `demo` | Read-only synthetic proof | Disabled | None |
| `private` | Full tracker | Enabled | Neon + OpenAI |
| missing/invalid | Safe disabled page | Disabled | None |

API routes also enforce private mode inside every handler; middleware is an
additional boundary, not the only one. AI generation has an independent
`AI_ANALYSIS_ENABLED=true` kill switch.

## Local development

Copy `.env.example` to `.env.local`, set `APP_MODE=private`, and add private
credentials locally. Never add credentials to the public Vercel project.

```bash
npm install
npm test
npm run dev
```

For a fixture-only local build:

```bash
APP_MODE=demo npm run build
APP_MODE=demo npm start
```

## Security properties

- Public data is synthetic and imported directly by the demo UI.
- Missing or invalid runtime mode blocks all API access.
- Model request types and session count are allowlisted and bounded.
- Model output is rendered as React text nodes, never raw HTML.
- API responses are `no-store`; errors do not expose provider details.
- The database diagnostic endpoint is not shipped.

The deployment and rotation runbook lives in
[`docs/public-demo-security-plan.md`](docs/public-demo-security-plan.md).

## Stack

- Next.js 16, React 19 and TypeScript
- Neon PostgreSQL
- OpenAI API
- Tailwind CSS
- Vercel
