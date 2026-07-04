# 09 - Deployment

## Deployment Mode

Plan A: GitHub + VPS.

## Domains

- Main: `https://huanyukuntaichem.com`
- WWW: `https://www.huanyukuntaichem.com`
- CMS: `https://cms.huanyukuntaichem.com`

## VPS Paths

- App: `/var/www/huanyukuntaichem/current`
- Frontend port: `3007`
- Directus port: `8055`

## Runtime

- Next.js runs through PM2.
- Directus and PostgreSQL run through Docker Compose.
- Nginx reverse proxies the frontend and CMS.

## Current VPS State

- Code path: `/var/www/huanyukuntaichem/current`
- PM2 app: `huanyukuntaichem-frontend`
- PM2 frontend port: `3007`
- Existing Directus container: `huanyukuntai-directus`
- Existing Directus local port: `127.0.0.1:8055`
- Existing PostgreSQL container: `huanyukuntai-directus-postgres`
- Existing older frontend container: `huanyukuntai-frontend` on `127.0.0.1:3200`

The existing Directus/PostgreSQL containers predate this repository initialization. Do not run `backend/docker-compose.yml` on the VPS until the existing containers, data volumes, admin access, and backup status have been audited.

## Automatic Deploy

GitHub Actions is prepared in `.github/workflows/deploy.yml`.
Required repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`

## Backend Update Behavior

With Plan A, frontend content can read Directus dynamically through Server Components/ISR after API integration is completed. Do not describe this project as static-export based.
