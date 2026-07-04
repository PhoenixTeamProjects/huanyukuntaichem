# 11 - Changelog

## 2026-07-04

- Established Phoenix B2B project structure for Huanyu Kuntai Chemical.
- Added multilingual Next.js frontend skeleton.
- Added Directus/PostgreSQL backend deployment skeleton.
- Added VPS deployment references.
- Added required project memory documentation.
- Pushed initial structure to GitHub.
- Synced code to the VPS and built the frontend.
- Started PM2 frontend on port `3007`.
- Enabled Nginx host routing.
- Recorded existing VPS Directus/PostgreSQL containers to prevent accidental overwrite.
- Issued Let's Encrypt certificate for main, www, and CMS domains.
- Enabled HTTP to HTTPS redirects and verified public HTTPS responses.
- Updated GitHub Actions deployment to upload a commit archive instead of running `git pull` on the VPS.
