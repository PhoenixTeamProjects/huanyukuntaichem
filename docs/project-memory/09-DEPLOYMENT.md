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

## Automatic Deploy

GitHub Actions is prepared in `.github/workflows/deploy.yml`.
Required repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`

## Backend Update Behavior

With Plan A, frontend content can read Directus dynamically through Server Components/ISR after API integration is completed. Do not describe this project as static-export based.
