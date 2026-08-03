# 11 - Changelog

## 2026-08-03

- Adopted the user-provided chemical-division business master document as the current company and product boundary source.
- Confirmed the official company names, HUANYU KUNTAI CHEM business brand, 2008 industry start, and global additive positioning.
- Locked the website to Fuel Additives, Lubricant Additives, and Lubricant Additive Packages.
- Preserved the existing header menu unchanged.
- Rebuilt the homepage around additive technology, manufacturing, formulation, quality control, customization, and global supply.
- Added a hierarchical product tree and verified product-family fallback content without invented technical parameters.
- Built company-specific Applications, Service, About, Contact, and product-detail content.
- Removed the unverified fallback email address from public settings.
- Replaced simulated inquiry success with real Directus write behavior and explicit error handling.
- Added SEO metadata defaults and noindex protection for untranslated locale routes.
- Audited the live Directus/PostgreSQL runtime and confirmed existing public read plus inquiry-create permissions.
- Created and validated a pre-chemical-migration PostgreSQL backup before changing CMS data.
- Archived all published industrial-parts products, categories, applications, services, and news without deleting their records.
- Published 31 chemical product categories, 28 product families, 8 application records, and 6 service records in Directus.
- Corrected the Directus homepage, page records, global SEO defaults, and canonical domain for HUANYU KUNTAI CHEM.
- Connected frontend product/category reads to Directus with a five-minute ISR cache and safe local fallback.
- Mapped the inquiry API to the existing Directus inquiry field names and `pending` workflow status.
- Added the public site and Directus URLs to the VPS build environment so statically generated product pages use live CMS data and ISR.

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
- Changed deployment to build in a release work directory first, then stop PM2 and switch `current` after the build succeeds.
