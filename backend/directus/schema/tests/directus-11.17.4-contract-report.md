# Directus 11.17.4 Schema API Contract — Verification Report

> **STATUS**: Phase 2B BLOCKED_CORRECTIVE  
> Disposable Directus 11.17.4 instance NOT YET PROVISIONED.  
> This document will be populated by the actual disposable verification.  
> Phoenix Owner has not requested disposable provisioning in this pass.

## Disposable Environment Specification (Planned)

| Item | Value |
|---|---|
| Compose project name | `huanyukuntaichem-schema-test` |
| Network name | `huanyukuntaichem-test-net` |
| Directus version | 11.17.4 |
| Postgres version | 16.x |
| Directus loopback port | 8058 (non-production) |
| Postgres loopback port | 5440 (non-production) |
| Admin email | `admin@test.local` (throwaway) |
| Admin password | generated at runtime (throwaway) |
| Directus KEY/SECRET | generated at runtime (throwaway) |

## Forbidden During Verification

- ❌ production Directus URL
- ❌ production Postgres data
- ❌ production volumes
- ❌ production network
- ❌ production admin token
- ❌ production env
- ❌ production folders

## Verification Items (16)

| # | Item | Status |
|---|---|---|
| 1 | POST /collections exact accepted payload | NOT_RUN |
| 2 | nested fields behavior | NOT_RUN |
| 3 | Partial AST schema.name vs primary key reporting | NOT_RUN |
| 4 | Partial AST system fields behavior | NOT_RUN |
| 5 | physical M2O field creation | NOT_RUN |
| 6 | M2O relation API payload | NOT_RUN |
| 7 | GET /relations actual response structure | NOT_RUN |
| 8 | M2M alias behavior | NOT_RUN |
| 9 | junction collection creation | NOT_RUN |
| 10 | junction field creation | NOT_RUN |
| 11 | FK creation | NOT_RUN |
| 12 | idempotent equivalent re-run behavior | NOT_RUN |
| 13 | status PATCH default + choices | NOT_RUN |
| 14 | exact aggregate/count query | NOT_RUN |
| 15 | field meta/interface payload | NOT_RUN |
| 16 | singleton behavior | NOT_RUN |

## Method (Planned)

```bash
# 1. Spin up disposable stack
docker compose -p huanyukuntaichem-schema-test \
  -f backend/directus/schema/tests/disposable-compose.yml up -d

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

## Output Format Per Item

For each verified item:

```markdown
### Item N

**Request:**
[verbatim HTTP request shape]

**Response:**
[verbatim HTTP response shape]

**Observed Behavior:**
[actual Directus 11.17.4 behavior]

**Impact on apply-schema.mjs:**
[what code change is required, if any]

**Status:** PASS | FAIL | NOT_SUPPORTED
```

## Current Status: PENDING ALL

**Until all 16 items become PASS or FAIL with documented evidence, Phase 2B remains BLOCKED_CORRECTIVE.**