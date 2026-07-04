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
- Added a GitHub Actions precheck that reports missing VPS deployment secrets before SSH setup.
- Added line-ending rules for shell scripts and YAML, and made the deploy workflow clean CRLF from the existing VPS deploy script before running it.
- Changed GitHub Actions to execute the freshly uploaded deploy script from the release directory so the first archive deploy does not depend on an outdated script in `current`.
- Corrected the deployment root to match the VPS website convention: `/opt/websites/huanyukuntaichem-site` instead of `/var/www/huanyukuntaichem`.
- Updated deployment backups to exclude `node_modules` and Next.js cache so GitHub Actions does not stall while archiving generated dependency folders.
- Updated deployment backups to exclude the entire Next.js build directory and treat runtime file-change warnings as non-fatal.
