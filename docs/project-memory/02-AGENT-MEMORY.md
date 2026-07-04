# 02 - Agent Memory

## 2026-07-04 - Codex Work Record

### Executing Agent

Codex

### Task

Create the initial GitHub repository and VPS-ready website structure according to the Phoenix B2B website specification.

### Completed

- Confirmed repository was nearly empty.
- Set deployment mode to Plan A: GitHub + VPS.
- Created root workspace structure.
- Created Next.js multilingual frontend skeleton.
- Created Directus/PostgreSQL backend Docker Compose skeleton.
- Created PM2, Nginx, deploy script, and GitHub Actions deployment references.
- Created all required `docs/project-memory` files.
- Pushed the initialized structure to GitHub.
- Synced the code to `/var/www/huanyukuntaichem/current` on the VPS.
- Built the frontend on the VPS and started `huanyukuntaichem-frontend` with PM2 on port `3007`.
- Enabled Nginx host routing for the main domain and CMS host.
- Confirmed an existing `huanyukuntai-directus` container is already running on `127.0.0.1:8055`.

### Not Completed

- Directus collections are documented but not yet audited against the existing live Directus instance.
- Production company profile, verified product categories, certificates, and final contact facts still need user confirmation.
- HTTPS certificates and public DNS validation still need live domain checks.

### Risks

- Current frontend uses fallback content until Directus is configured.
- GitHub Actions requires repository secrets before automatic deploy can run.
- The VPS already has older `huanyukuntai` containers, including a frontend on `127.0.0.1:3200` and Directus on `127.0.0.1:8055`. Do not remove or recreate them without backup and confirmation.

### Next Suggested Work

1. Confirm final company profile and product categories.
2. Create Directus admin credentials on the VPS using private `.env`.
3. Build Directus collections from `05-CMS-SCHEMA.md`.
4. Replace fallback content with Directus reads.
