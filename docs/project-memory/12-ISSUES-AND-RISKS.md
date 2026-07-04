# 12 - Issues And Risks

## Open Risks

- Production company facts are incomplete.
- Directus is live on the VPS, but its collections and content have not yet been audited against this repository's schema.
- Current frontend uses fallback content until CMS collections and content are ready.
- GitHub Actions cannot deploy until repository secrets are added.
- Cloudflare should be set to Full (strict) before switching records from gray cloud to orange cloud.
- An older `huanyukuntai-frontend` Docker container is still running on `127.0.0.1:3200`. Do not remove it without confirming whether it serves an existing public route or backup.
