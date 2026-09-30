# Structured Fields UX Verification — Status Report

> **STATUS**: NOT VERIFIED YET  
> **Owner Audit v8 requirement #15**  
> Phase 2B remains `BLOCKED_CORRECTIVE` until this report is completed
> via disposable Directus 11.17.4 + Repeater/List interface observation.

## Required Verification

Three structured-JSON fields in the planned schema:

| Field | Storage model | Operator UX requirement |
|---|---|---|
| `products.specifications` | JSON field (Repeater) | add parameter / parameter name / parameter value / sort; raw JSON hidden |
| `products.highlights` | JSON field (Repeater) | add highlight / English text / translated texts / sort; per-locale tabs |
| `pages.sections` | JSON field (Repeater) | add/reorder approved section / controlled block type / per-locale text / media / CTA |

## Verification Method

Performed in disposable Directus 11.17.4 + Repeater/List interface:

```
1. Create collection products with specifications/highlights fields
   configured as interface=list with template=Repeater
2. Login as a non-technical operator role
3. Add a new record via admin UI
4. For specifications:
   - Verify "Add parameter" form button works
   - Verify input for "parameter name" (key) and "parameter value"
   - Verify reordering via drag
   - Verify JSON is hidden in final view
5. For highlights:
   - Verify per-locale text tabs
   - Verify English text and translated texts both editable
6. For pages.sections:
   - Verify block type enum constraint (text|image_text|features|...)
   - Verify image and CTA fields
   - Verify per-locale translation text
7. Confirm no free-form page builder UX is exposed
```

## Pass / Fail Criteria

```
PASS if:
  - Normal operator can add/remove/reorder
  - Validation enforced (e.g., block_type in allowed values)
  - Per-locale editing works without raw JSON
  - No "edit raw JSON" button exposed to operator
  - Stable block IDs preserved across reorders
```

```
FAIL if:
  - Operator must edit raw JSON for any normal task
  - Per-locale editing requires manual JSON traversal
  - Block types not constrained (free-form page builder)
  - Reordering breaks stable IDs
```

## Current Status: NOT VERIFIED

Decision criteria will be:

```
STRUCTURED_FIELDS_OPTION = Option A (Repeater) | Option B (child collections)
STRUCTURED_FIELDS_VERIFIED_ON_DIRECTUS_11_17_4 = YES | NO
RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR = NO
```

## Fallback Path

If Option A fails:

```
STRUCTURED_FIELDS_OPTION = OPTION_B_CHILD_COLLECTIONS
```

Then STOP. Do not apply production schema.
Recalculate collections + fields + relations + permissions.
Return to Owner.

**Until verification completes, Phase 2B remains `BLOCKED_CORRECTIVE`.**