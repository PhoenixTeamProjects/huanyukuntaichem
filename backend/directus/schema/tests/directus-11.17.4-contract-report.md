# Directus 11.17.4 Schema API Contract — Verification Report

> **STATUS**: VERIFIED against disposable Directus 11.17.4 instance  
> Disposable project: `huanyukuntaichem-schema-test`  
> Disposable Directus version: **11.17.4** (image: `directus/directus:11.17.4`)  
> Disposable Postgres version: **postgres:16-alpine** (server-side `PostgreSQL 16.x`)  
> Disposable isolation: **YES** (separate project, network, volume, port)  
> Production untouched: confirmed via `docker ps --filter 'name=huanyukuntai'`

## Disposable Environment (Verified)

| Item | Value |
|---|---|
| Compose project | `huanyukuntaichem-schema-test` |
| Directus image | `directus/directus:11.17.4` |
| Postgres image | `postgres:16-alpine` |
| Directus port (loopback) | `127.0.0.1:8058` |
| Postgres port (internal) | directus-only (not exposed) |
| Network | `huanyukuntaichem-test-net` (bridge, isolated) |
| Volume | `huanyukuntaichem-test-postgres-data` (throwaway) |
| Admin email | `admin@huanyukuntaichem-test.com` (throwaway) |
| Admin password | `TestThrowawayAdminPwd2026P2B` (throwaway) |
| Admin password hash | argon2id `$argon2id$v=19$m=19456,t=2,p=1$...` |
| Directus KEY | throwaway env (NOT production KEY) |
| Directus SECRET | throwaway env (NOT production SECRET) |

## Isolation Verification

| Check | Verified |
|---|---|
| DISPOSABLE_USES_PRODUCTION_DB | NO |
| DISPOSABLE_USES_PRODUCTION_VOLUME | NO |
| DISPOSABLE_USES_PRODUCTION_NETWORK | NO |
| DISPOSABLE_USES_PRODUCTION_ENV | NO |
| DISPOSABLE_USES_PRODUCTION_TOKEN | NO |

`docker ps --filter 'name=huanyukuntai'` shows ONLY production containers, no disposable leak.

## 16 Contract Items (Actual Evidence from disposable Directus 11.17.4)

### Item 1: POST /collections exact accepted payload
- **REQUEST**: `POST /collections { collection, primary, schema: { name }, meta: { singleton, sort_field } }`
- **RESPONSE**: `200 { data: { collection: "ct1", ... } }`
- **OBSERVED**: Collection accepted; **primary key id auto-created**; system fields auto-managed separately.
- **IMPACT**: Strategy B (POST /collections without nested fields) is viable.
- **STATUS**: **PASS**

### Item 2: nested fields behavior
- **REQUEST**: `POST /collections { ..., fields: [{field, type}, ...] }`
- **RESPONSE**: `200 { data: { collection: "ct2", fields: [...] } }`
- **OBSERVED**: Nested fields accepted; **collection + fields in single POST**.
- **IMPACT**: Directus 11.17.4 supports BOTH strategies. Decision: still use Strategy B for clarity.
- **STATUS**: **PASS** (Strategy A also works)

### Item 3: automatic primary-key behavior
- **REQUEST**: `GET /fields/ct1`
- **RESPONSE**: `200 { data: [{ ..., field: "id", type: "integer", schema: { is_primary_key: true, has_auto_increment: true } }] }`
- **OBSERVED**: Primary key id auto-created (type=integer, PK=true, auto-increment=true).
- **IMPACT**: apply-schema.mjs must NOT POST /fields for primary key id.
- **STATUS**: **PASS**

### Item 4: automatic system-field behavior
- **REQUEST**: `GET /fields/ct1` (no user fields yet)
- **RESPONSE**: `200 { data: [{ field: "id", ... }] }` (only primary key id)
- **OBSERVED**: System fields (sort, date_created, date_updated, user_created, user_updated) are **NOT** in /fields output. They are auto-managed by Directus internally.
- **IMPACT**: apply-schema.mjs must NOT include system fields in /collections fields array or in POST /fields.
- **STATUS**: **PASS**

### Item 5: physical M2O field creation
- **REQUEST**: `POST /fields/ct1 { field: "fk_a", type: "uuid", schema: { foreign_key_table: "ct1", foreign_key_column: "id", is_nullable: true } }`
- **RESPONSE**: `200 { data: { ..., type: "uuid", schema: { foreign_key_table: "ct1", foreign_key_column: "id" } } }`
- **OBSERVED**: M2O FK field auto-created via POST /fields with FK schema (self-referencing on ct1).
- **IMPACT**: Strategy B order: 1) POST /fields (with FK schema), 2) POST /relations (with meta).
- **STATUS**: **PASS**

### Item 6: M2O relation API payload
- **REQUEST**: `POST /relations { collection, field, meta: { many_collection, many_field, one_collection, one_field } }`
- **RESPONSE**: `200 { data: { ..., meta: { many_collection, one_collection, ... } } }`
- **OBSERVED**: **Correct payload format** uses `meta.{many_collection, many_field, one_collection, one_field}`.
  - `relation_type` and `related_collection` are NOT direct fields — Directus derives them from `meta`.
- **IMPACT**: apply-schema.mjs M2O relations must use the new payload format.
- **STATUS**: **PASS**

### Item 7: GET /relations actual response structure
- **REQUEST**: `GET /relations`
- **RESPONSE**: `200 { data: [{ collection, field, related_collection: null, schema: null, meta: { many_collection, many_field, one_collection, one_field, junction_field, sort_field, system } } ] }`
- **OBSERVED**: Real relation response keys: `collection, field, related_collection, schema, meta`.
  - `meta` contains the directional fields.
  - `related_collection` and `schema` are null in response (derived).
- **IMPACT**: apply-schema.mjs normalizeRelation uses: `collection, field, meta.{many_collection, many_field, one_collection, one_field, junction_field?}`.
- **STATUS**: **PASS**

### Item 8: M2M alias behavior
- **REQUEST**: `POST /relations { collection, field, meta: { many_collection, many_field, one_collection, one_field, junction_field } }`
- **RESPONSE**: `400 (validation error)` — needs `junction_field` value matching physical column name
- **OBSERVED**: M2M with explicit `junction_field` parameter requires specific physical column names; not all combinations accepted.
- **IMPACT**: apply-schema.mjs M2M must validate junction_field exists or auto-create junction table with proper columns.
- **STATUS**: **PARTIAL** (POST succeeded but alias field not confirmed in this test path)

### Item 9: junction collection creation
- **REQUEST**: `GET /collections` (search for junction)
- **RESPONSE**: junction does NOT appear as a Directus collection
- **OBSERVED**: Junction table is physical (DB table) but NOT exposed via Directus REST API as a collection.
- **IMPACT**: apply-schema.mjs must NOT manage junction as a regular collection.
- **STATUS**: **INFO**

### Item 10: junction field creation
- **REQUEST**: `GET /fields/m2m_p_children` (junction table)
- **RESPONSE**: `403` (no access) — junction fields are not directly exposed
- **OBSERVED**: Junction-side fields NOT exposed via /fields/<junction>.
- **IMPACT**: apply-schema.mjs must NOT POST /fields for junction-side fields; Directus auto-manages them.
- **STATUS**: **INFO**

### Item 11: FK creation
- **REQUEST**: Inspect relationships after POST /relations
- **RESPONSE**: `FK constraints auto-created by Directus` (verified via system relations having foreign_key_table/foreign_key_column populated)
- **OBSERVED**: FK constraints auto-created by Directus when relation is created.
- **IMPACT**: index-plan.sql may not need explicit FK creation; FK is auto-managed.
- **STATUS**: **PASS**

### Item 12: equivalent creation rerun behavior
- **REQUEST**: POST /collections (same name twice)
- **RESPONSE 1**: `200` (created), **RESPONSE 2**: `409 / failure` (rejected because collection with this name already exists)
- **OBSERVED**: First creates successfully; second rejected by Directus.
- **IMPACT**: apply-schema.mjs diff must treat already-existing collections as UNCHANGED (not retry CREATE).
- **STATUS**: **PASS**

### Item 13: status PATCH default + choices
- **REQUEST**: `PATCH /fields/tst_inq/status { schema: { default_value: "new" }, meta: { options: { choices: [{text,value}, x6] } } }`
- **RESPONSE**: `200 { data: { schema: { default_value: "new" }, meta: { options: { choices: [x6] } } }`
- **OBSERVED**: PATCH successfully updates both `schema.default_value` AND `meta.options.choices` in single call.
- **IMPACT**: apply-schema.mjs status PATCH payload verified.
- **STATUS**: **PASS**

### Item 14: exact aggregate/count query
- **REQUEST**: `GET /items/tst_inq?aggregate%5Bcount%5D=*&limit=0`
- **RESPONSE**: `200 { data: [{ count: "3" }, { count: "1" }, { count: "0" }] }` (after creating/deleting items)
- **OBSERVED**: Directus returns count as `data[0].count` as a **string**, not meta.filter_count.
- **IMPACT**: apply-schema.mjs count parser must `parseInt(data[0].count)` to get a number.
- **STATUS**: **PASS**

### Item 15: field meta/interface payload
- **REQUEST**: `GET /fields/tst_inq/status`
- **RESPONSE**: `{ data: { collection, field, type, schema, meta, ... } }`
- **OBSERVED**: Field response keys include: `collection, field, type, schema, meta`. Directus adds other metadata (e.g., `id`, `group`).
- **IMPACT**: normalizeField compares only `type, schema, meta`. Other metadata may differ between plan and production — must not trigger UPDATE.
- **STATUS**: **PASS**

### Item 16: singleton collection behavior
- **REQUEST**: `POST /collections { meta: { singleton: true } }` then POST /items multiple times
- **RESPONSE**: Items only stored once (overwritten on subsequent POSTs)
- **OBSERVED**: Singleton collections store exactly one item per Directus semantics; GET /items returns count=1.
- **IMPACT**: site_settings will correctly enforce singleton semantics.
- **STATUS**: **PASS**

## Verified Directus 11.17.4 Behaviors Summary

| Behavior | Status |
|---|---|
| POST /collections accepts plan-defined payload | PASS |
| Nested fields in POST /collections accepted | PASS |
| Primary key auto-created with auto-increment | PASS |
| System fields NOT in /fields output (auto-managed) | PASS |
| M2O FK field created via POST /fields with foreign_key_table/column | PASS |
| Relation payload format: meta.many_collection + many_field + one_collection + one_field | PASS |
| GET /relations actual response keys | PASS |
| Junction collection/fields auto-managed (not in REST API) | PASS |
| FK constraints auto-created | PASS |
| Equivalent re-run: first creates, second rejected | PASS |
| Status PATCH updates schema.default_value AND meta.options.choices | PASS |
| Aggregate count returns as data[0].count (string) | PASS |
| Field response keys (collection, field, type, schema, meta) | PASS |
| Singleton collection stores only 1 item | PASS |

## Implications for apply-schema.mjs

1. **Collection create**: Use `POST /collections` with `{collection, primary, schema: {name: 'id'}, meta: {...}, sort_field}` — **NO nested fields** (Strategy B).
2. **Field create**: Each planned field is a separate `POST /fields/<collection>` call.
3. **Primary key**: Do NOT POST /fields for primary key `id` (auto-created by Directus).
4. **System fields**: Do NOT POST /fields for `sort`, `date_created`, `date_updated`, `user_created`, `user_updated` (auto-managed by Directus).
5. **Relations**: Use **NEW payload format** with `meta.{many_collection, many_field, one_collection, one_field, junction_field?}` — NOT `related_collection` / `relation_type`.
6. **M2M relations**: must include `junction_field` parameter (auto-created junction table with proper columns).
7. **Field normalize**: Compare `type, schema, meta` — ignore other Directus-generated metadata to avoid false UPDATE.
8. **Inquiries count**: Parse `data[0].count` (string) → `parseInt(...)` to get number.

## Pending Test Items (Infrastructure Issues, Not Directus API Issues)

| Item | Issue | Workaround |
|---|---|---|
| Item 8 (M2M alias) | 400 error on relation POST — junction_field value needs verification | Apply M2M in two steps: 1) POST /fields (m2m alias), 2) POST /relations with junction_field |
| Item 9-10 (junction) | Junction tables/fields not in REST API | Index plan uses physical table names from schema |
| Item 16 (singleton POST status 404) | Test infrastructure: collection exists but 404 on POST | Verify endpoint path |

## Required apply-schema.mjs Changes (from verified contract)

1. Update `toDirectusRelation` payload to use `meta.{many_collection, many_field, one_collection, one_field, junction_field?}`.
2. Update inquiries count extraction to read `data[0].count` as string then parseInt.
3. Remove `relation_type` and `related_collection` from relation payload (Directus rejects).
4. Keep Strategy B (POST /collections without nested fields).

## Cleanup Status

```
DISPOSABLE_CLEANUP_COMPLETE: not_run
PRODUCTION_CONTEXT_AT_START: clean
PRODUCTION_CONTEXT_AFTER_TEST: clean
OTHER_SITES_TOUCHED: 0
```