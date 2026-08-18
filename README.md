# Deliberate Guitar

A full-stack web app for tracking deliberate guitar practice and turning session history into structured feedback.

[Live demo](https://guitar-practice-opal.vercel.app)

## What it does

- Records practice sessions in Neon PostgreSQL.
- Reads recent session history through a Next.js server route.
- Uses one OpenAI call to produce structured JSON analysis.
- Uses that analysis in a second call to generate coaching insights.
- Returns explicit errors for missing configuration, empty sessions, empty responses and invalid JSON.

## Stack

- Next.js 15 and React 19
- TypeScript
- Neon PostgreSQL
- OpenAI API
- Tailwind CSS
- Vercel
