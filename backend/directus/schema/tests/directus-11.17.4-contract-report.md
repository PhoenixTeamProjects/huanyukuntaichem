# Directus 11.17.4 Schema API Contract — Verification Report (Placeholder)

> **STATUS**: NOT VERIFIED YET  
> **Owner Audit v8 requirement #14 + #15 + #16 + #17 + #18**  
> Phase 2B remains `BLOCKED_CORRECTIVE` until this report is completed via
> a throwaway disposable Directus 11.17.4 + PostgreSQL 16.x environment.

## Required Disposable Environment

| Item | Value |
|---|---|
| Compose project name | `huanyukuntaichem-schema-test` |
| Network name | `huanyukuntaichem-test-net` (separate from production) |
| Directus version | 11.17.4 (same as production) |
| Postgres version | 16.x compatible with production |
| Directus port (loopback) | 8058 (non-production) |
| Postgres port | 5440 (non-production) |
| Admin email (throwaway) | admin@test.local |
| Volumes | separate, non-shared with production |

## Forbidden During Verification

- ❌ production Directus URL
- ❌ production Postgres data
- ❌ production volumes
- ❌ production network
- ❌ production admin token
- ❌ production env
- ❌ production folders

## Verification Items (Owner Audit v8 #14-#17)

| # | Item | Status |
|---|---|---|
| 1 | POST /collections exact accepted payload | PENDING |
| 2 | Nested `fields` behavior | PENDING |
| 3 | Automatic primary-key behavior | PENDING |
| 4 | Automatic system fields behavior | PENDING |
| 5 | Physical M2O field creation (uuid) | PENDING |
| 6 | M2O relation API payload | PENDING |
| 7 | GET /relations actual response shape (Directus 11.x) | PENDING |
| 8 | M2M alias creation + junction behavior | PENDING |
| 9 | Junction collection creation (auto-managed) | PENDING |
| 10 | Junction field creation (auto-managed) | PENDING |
| 11 | FK creation (Directus auto vs explicit) | PENDING |
| 12 | Idempotent re-run of equivalent creation | PENDING |
| 13 | status field PATCH (default + choices) | PENDING |
| 14 | exact inquiries aggregate/count query | PENDING |
| 15 | field meta/interface payload structure | PENDING |
| 16 | singleton collection behavior (site_settings) | PENDING |

## Method (Planned)

```bash
# 1. Spin up disposable stack
docker compose -p huanyukuntaichem-schema-test \
  -f tests/disposable-compose.yml up -d

# 2. Wait for healthy
until curl -sf http://127.0.0.1:8058/server/health; do sleep 1; done

# 3. Acquire token
$TOKEN=$(curl -sS -X POST http://127.0.0.1:8058/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | jq -r .data.access_token)

# 4. Probe each endpoint and capture exact request/response
#    (record verbatim — sanitize any tokens/ids)
```

## Output

This document will be populated with concrete API request/response transcripts
from the disposable instance after verification completes. Until then, all
fields above remain `PENDING`.

**Until this report is finalized, Phase 2B remains `BLOCKED_CORRECTIVE`.**