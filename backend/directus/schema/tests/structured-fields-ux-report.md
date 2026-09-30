# Structured Fields UX Verification — Status Report

> **STATUS**: Phase 2B BLOCKED_CORRECTIVE  
> Disposable Directus 11.17.4 UX verification NOT YET COMPLETED.  
> Placeholder — will be filled by the disposable verification.

## Target Structured JSON Fields

1. `products.specifications`
2. `products.highlights`
3. `pages.sections`

## Required Operator UX (v1.5 §27.1)

- raw JSON hidden
- add / remove / reorder
- validation
- stable block IDs
- controlled block types
- 10-locale text editing workable
- no free-form page builder UX

## Verification Method (Planned)

Performed in disposable Directus 11.17.4:

```
1. Create collection products with specifications/highlights fields
   configured as interface=list with template=Repeater
2. Create collection pages with sections field (type=json)
3. Login as non-technical operator role
4. For products.specifications:
   - Verify "Add parameter" form
   - Verify parameter name (key) + value entry
   - Verify reordering via drag
   - Verify JSON hidden in final view
5. For products.highlights:
   - Verify per-locale text tabs
   - Verify en + translated texts editable
6. For pages.sections:
   - Verify block_type enum constraint (text|image_text|features|...)
   - Verify image + CTA fields
   - Verify per-locale translation text
   - Verify stable block_id across reorders
```

## Pass Criteria

```
PASS if:
  - Normal operator can add/remove/reorder
  - Validation enforced (block_type in allowed values)
  - Per-locale editing works without raw JSON
  - No "edit raw JSON" button exposed
  - Stable block IDs preserved across reorders
```

```
FAIL if:
  - Operator must edit raw JSON for any normal task
  - Per-locale editing requires manual JSON traversal
  - Block types not constrained (free-form page builder)
  - Reordering breaks stable IDs
```

## Status: NOT_RUN

Decision criteria:

```
STRUCTURED_FIELDS_OPTION = Option A (Repeater) | Option B (child collections)
STRUCTURED_FIELDS_VERIFIED_ON_DIRECTUS_11_17_4 = NO
RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR = NO (target, not yet confirmed)
```

## If Option A passes

```
STRUCTURED_FIELDS_OPTION = OPTION_A_REPEATER
STRUCTURED_FIELDS_VERIFIED_ON_DIRECTUS_11_17_4 = YES
RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR = NO
```

## If Option A fails

```
STRUCTURED_FIELDS_OPTION = OPTION_B_CHILD_COLLECTIONS
STOP — do not apply production schema.
Recalculate collections + fields + relations + permissions.
Return to Owner.
```

## Current Status: NOT_RUN

**Until verification completes, Phase 2B remains BLOCKED_CORRECTIVE.**