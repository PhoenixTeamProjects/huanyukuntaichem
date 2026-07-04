# 09 - Deployment

## Deployment Mode

Plan A: GitHub + VPS.

## Domains

- Main: `https://huanyukuntaichem.com`
- WWW: `https://www.huanyukuntaichem.com`
- CMS: `https://cms.huanyukuntaichem.com`

## DNS

- `huanyukuntaichem.com` A record points to the VPS.
- `www.huanyukuntaichem.com` A record points to the VPS.
- `cms.huanyukuntaichem.com` A record points to the VPS.
- Cloudflare was temporarily kept on DNS-only gray cloud during origin HTTPS setup.

## VPS Paths

- App root: `/opt/websites/huanyukuntaichem-site`
- Current app: `/opt/websites/huanyukuntaichem-site/current`
- Releases: `/opt/websites/huanyukuntaichem-site/releases`
- Backups: `/opt/websites/huanyukuntaichem-site/backups`
- Frontend port: `3007`
- Directus port: `8055`

## Runtime

- Next.js runs through PM2.
- Directus and PostgreSQL run through Docker Compose.
- Nginx reverse proxies the frontend and CMS.

## HTTPS

- Let's Encrypt certificate issued for `huanyukuntaichem.com`, `www.huanyukuntaichem.com`, and `cms.huanyukuntaichem.com`.
- Certificate path: `/etc/letsencrypt/live/huanyukuntaichem.com/fullchain.pem`.
- Private key path stays on the VPS under `/etc/letsencrypt/live/huanyukuntaichem.com/privkey.pem`.
- Expiry date: 2026-10-02.
- Certbot scheduled automatic renewal.
- HTTP to HTTPS redirect is enabled by Certbot/Nginx.

## Current VPS State

- Code path: `/opt/websites/huanyukuntaichem-site/current`
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

The workflow uploads a tar archive of the checked-out GitHub commit to `/opt/websites/huanyukuntaichem-site/releases/<commit>.tar.gz`, uploads the matching `scripts/deploy-vps.sh` to `/opt/websites/huanyukuntaichem-site/releases/deploy-vps-<commit>.sh`, then runs that uploaded script on the VPS. The VPS current directory does not need to be a Git working tree and should not store a GitHub token.

## Backend Update Behavior

With Plan A, frontend content can read Directus dynamically through Server Components/ISR after API integration is completed. Do not describe this project as static-export based.
