# Huanyu Kuntai Chemical / 环宇坤泰工业

This repository is the official website workspace for `huanyukuntaichem.com`.

## Current Status

- Project stage: company-specific chemical additives website implemented from the verified 2026-08-03 business master document.
- Deployment mode: Plan A, GitHub + VPS.
- Frontend: Next.js App Router, multilingual routes under `frontend/src/app/[locale]`.
- CMS/backend: Directus + PostgreSQL planned on the VPS with Docker Compose.
- Product scope: Fuel Additives, Lubricant Additives, and Lubricant Additive Packages only.
- Current content: verified English development fallback is implemented and ready for structured migration into Directus.
- Content rule: products, categories, news, pages, SEO text, image alt text, and inquiries belong in Directus as the long-term source of truth.
- Interface copy: fixed navigation, buttons, forms, empty states, and labels live in `frontend/src/locales`.

## Required Reading For Agents

Before changing code, read these files in order:

1. `AGENTS.md`
2. `docs/project-memory/00-READ-ME-FIRST.md`
3. `docs/project-memory/01-CODE-STANDARDS.md`
4. `docs/project-memory/02-AGENT-MEMORY.md`
5. `docs/project-memory/03-COMPANY-PROFILE.md`

## Repository Layout

```text
frontend/                Next.js website
backend/                 Directus/PostgreSQL deployment skeleton
deployment/              Nginx, PM2, and VPS deployment references
scripts/                 Safe deployment helper scripts
docs/project-memory/     Phoenix project memory and handoff files
```

## Local Development

```bash
npm install
npm --workspace frontend run dev
```

Copy `frontend/.env.example` to `frontend/.env.local` for local Directus testing.
Do not commit real `.env`, tokens, SSH keys, database credentials, or server secrets.

## Verification

```bash
npm --workspace frontend run lint
npm --workspace frontend run build
```
