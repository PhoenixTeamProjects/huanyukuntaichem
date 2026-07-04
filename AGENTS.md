# Agent Instructions

This repository follows the Phoenix foreign trade B2B website specification.

## Mandatory Start Sequence

Every agent must read these files before editing:

1. `README.md`
2. `AGENTS.md`
3. `docs/project-memory/00-READ-ME-FIRST.md`
4. `docs/project-memory/01-CODE-STANDARDS.md`
5. `docs/project-memory/02-AGENT-MEMORY.md`
6. `docs/project-memory/03-COMPANY-PROFILE.md`

Then inspect:

- `package.json`
- current directory structure
- `git status`
- `git log --oneline -5`
- `docs/project-memory/09-DEPLOYMENT.md`

## Commit Safety

Never commit real secrets:

- `.env`
- API tokens
- database URLs
- SSH private keys
- Directus admin passwords
- VPS passwords

## Project Boundary

This project is for Huanyu Kuntai Chemical / Huanyu Kuntai Industry only.
Do not copy company facts, product categories, images, SEO text, or deployment settings from another website.

## Deployment Mode

Current mode: Plan A, GitHub + VPS.

The frontend runs as a Next.js Node application on the VPS. Directus and PostgreSQL are planned for the same VPS with isolated Docker services. Do not add `output: "export"` unless the deployment mode is formally changed and documented.
