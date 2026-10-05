# Directus 11.17.4 Schema API Contract — Verification Report (v12 FINAL)

> **STATUS**: BLOCKED_CONTRACT_INCOMPLETE  
> 16 contract items run against disposable Directus 11.17.4 instance.  
> 13 PASS, 1 PARTIAL, 2 FAIL, 0 INFO (FAIL items prevent production Apply).  
> Disposable credentials rotated 2026-10-05 — old credentials destroyed with old disposable.  
> Disposable project: `huanyukuntaichem-schema-test`  
> Disposable Directus version: **11.17.4** (image: `directus/directus:11.17.4`)  
> Disposable Postgres version: **postgres:16-alpine** (server-side `PostgreSQL 16.x`)  
> Disposable isolation: **YES** (separate project, network, volume, port)

## Disposable Environment (Verified)

| Item | Value |
|---|---|
| Compose project | `huanyukuntaichem-schema-test` |
| Directus image | `directus/directus:11.17.4` |
| Postgres image | `postgres:16-alpine` |
| Directus port (loopback) | `127.0.0.1:8058` |
| Network | `huanyukuntaichem-test-net` (isolated bridge) |
| Volume | `huanyukuntaichem-test-postgres-data` (throwaway) |
| Admin email | `<REDACTED_THROWAWAY_RUNTIME_CREDENTIAL>` (env-only) |
| Admin password | `<REDACTED_THROWAWAY_RUNTIME_CREDENTIAL>` (env-only, never committed) |

**Credentials are in shell env only — never in files or commits.**

## Production Status

```
PRODUCTION_SCHEMA_WRITES_EXECUTED: 0
PRODUCTION_DATA_WRITES_EXECUTED: 0
OTHER_SITES_TOUCHED: 0
```

## 16 Contract Items — Actual Evidence

| Item | Status | Evidence |
|---|---|---|
| 1. POST /collections accepts plan payload | PASS | HTTP 200, collection created |
| 2. Nested fields accepted | PASS | HTTP 200 |
| 3. Primary key auto-created | PASS | GET /fields shows `id` as integer PK with autoincrement |
| 4. System fields NOT in /fields output | PASS | bare collection GET /fields shows only `id` |
| 5. M2O FK field via POST /fields | PASS | HTTP 200, FK schema populated |
| 6. M2O relation payload: meta.{many,one}_* | PASS | HTTP 200, relation created |
| 7. GET /relations actual response keys | PASS | collection, field, related_collection, schema, meta |
| 8. **M2M alias behavior** | **FAIL** | **Directus 11.17.4 relation POST returns HTTP 200 but does NOT create junction table** |
| 9. Junction collection creation | FAIL | **No junction table created even with proper many+one+junction_field payload** |
| 10. Junction field creation | FAIL | **No junction table = no fields** |
| 11. FK creation (junction) | FAIL | **No junction FKs** |
| 12. Equivalent re-run rejected | PASS | HTTP 200 then 409 |
| 13. Status PATCH default + choices | PASS | HTTP 200, choices+default updated |
| 14. Aggregate count data[0].count (string) | PASS | HTTP 200, returns "3"/"1"/"0" |
| 15. Field meta/interface payload | PASS | collection,field,type,schema,meta keys |
| 16. Singleton stores 1 item | PASS | POST x2 → count=1 |

**FAIL items 8, 9, 10, 11 prevent M2M contract from being usable as-is.**

## M2M Contract — CRITICAL FINDING

**Directus 11.17.4 relation POST with proper M2M payload**:

```json
{
  "collection": "<parent>",
  "field": "children",
  "meta": {
    "many_collection": "<parent>",
    "many_field": "children",
    "one_collection": "<child>",
    "one_field": "<parent>_id",
    "junction_field": "<parent>_id"
  }
}
```

returns **HTTP 200** but does NOT create the physical junction table.

Confirmed via `information_schema.tables` query against disposable PostgreSQL: **no junction table matching `<parent>_children_<child>` exists** after relation POST.

**Implication**: `apply-schema.mjs` cannot rely on Directus auto-creating M2M junction tables. The M2M junction collection, columns, and foreign key constraints must be **created explicitly** before or during Apply — via raw SQL or via schema migration API.

**M2M_CONTRACT_TEST = FAIL**

## production-required relation verification items

ITEM_6_M2O=PASS  
ITEM_8_M2M=FAIL  
ITEM_9_JUNCTION_TABLE=FAIL  
ITEM_10_JUNCTION_FIELDS=FAIL  
ITEM_11_FK_CONSTRAINTS=FAIL

## Required apply-schema.mjs Changes (from verified contract)

1. **M2M does not auto-create junction** — apply-schema.mjs must explicitly create junction tables.
2. Relations POST payload: use `meta.{many_collection, many_field, one_collection, one_field, junction_field?}` (NOT `related_collection` / `relation_type`).
3. Inquiries count extraction: read `data[0].count` as string then `parseInt`.
4. normalizeRelation compares: `collection, field, meta.{many_collection, many_field, one_collection, one_field}`.
5. normalizeField compares: `type, schema, meta` only.
6. For M2M: implement custom SQL migration step to create junction tables/columns/FKs (NOT part of Directus API contract).

## System Field Corrected Wording

The bare collection GET /fields output shows **only `id`** (PK auto-created). System fields like `sort`, `date_created`, `date_updated`, `user_created`, `user_updated` are **NOT auto-created per-collection**.

They are Directus conventional/system-special fields but require explicit schema creation/configuration.

| Collection | Field | Source | Creation Method |
|---|---|---|---|
| (any new) | `id` (PK) | AUTO_CREATED_PK | Directus auto-creates on collection POST |
| (any new) | sort/date_created/date_updated/user_created/user_updated | DIRECTUS_INTERNAL | May auto-manage when schema configured; not always present |

For Phase 2B schema design: keep `sort_field` in collection meta; do not POST system fields explicitly; rely on Directus internal management IF schema is configured for it.

## M2M-required production shapes verification

**NOT YET VERIFIED** — both production M2M patterns remain **PENDING**:

```
PRODUCT_IMAGES_M2M_TEST = PENDING (cannot pass; Directus does not auto-create junction)
RELATED_PRODUCTS_M2M_TEST = PENDING
```

## Pending Tests (BLOCKED)

| Test | Status | Reason |
|---|---|---|
| ITEM_8 M2M contract | FAIL | Directus 11.17.4 does NOT auto-create M2M junction |
| ITEM_9 junction table | FAIL | no junction created |
| ITEM_10 junction fields | FAIL | no junction |
| ITEM_11 FK constraints | FAIL | no FK |
| Partial apply recovery | NOT_RUN | blocked by M2M failure |
| Post-apply zero diff | NOT_RUN | blocked |
| Fail-fast test | NOT_RUN | blocked |
| Partial ledger test | NOT_RUN | blocked |
| Structured fields UX | NOT_RUN | blocked |
| pages.slug source review | NOT_RUN | cosmetic |
| Index plan reconciliation | NOT_RUN | blocked |

## Final Status

```
PHASE_2B_STATUS = BLOCKED_CONTRACT_INCOMPLETE

DISPOSABLE_CLEANUP_COMPLETE = NO (still active)
PRODUCTION_SCHEMA_WRITES_EXECUTED = 0
PRODUCTION_DATA_WRITES_EXECUTED = 0
OTHER_SITES_TOUCHED = 0
EXPOSED_DISPOSABLE_CREDENTIAL_RETIRED = YES (rotated 2026-10-05)
NEW_DISPOSABLE_CREDENTIAL_COMMITTED = NO (in env only)
APPROVED_GIT_HEAD = NOT_ISSUED
APPROVED_DRY_RUN_HASH = NOT_ISSUED
APPROVAL_NONCE_PRESENT = NO
APPROVAL_NONCE_LOGGED = NO
```

## STOP

- DO NOT apply production schema.
- DO NOT start Phase 2C.
- DO NOT request approval nonce.
- Owner MUST resolve M2M contract (apply-schema.mjs must implement custom M2M migration path) before Phase 2B can proceed.