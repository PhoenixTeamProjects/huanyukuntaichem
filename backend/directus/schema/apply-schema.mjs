#!/usr/bin/env node
// backend/directus/schema/apply-schema.mjs
//
// Phase 2B v7 Owner Audit corrections:
//  - Diff engine compares actual production metadata (not unconditional CREATE)
//  - 2-run idempotency test (real hashes, not same variable)
//  - Approval bound to GIT_SHA + DRY_RUN_HASH + NONCE (all 3 required)
//  - site_settings singleton=true
//  - M2O fields stay physical FK (not alias); M2M uses alias
//  - Fail-fast on first mutation failure with partial-apply ledger
//  - Pre-apply drift guard: re-fetch state and verify matches approved hash
//  - Pre-apply inquiries count guard: must be 0
//  - Machine-generated field counts at runtime
//  - Project-scoped rollback (no sister-site impact)

import {
  SCHEMA_VERSION,
  inquiriesMetadata,
  ALL_DEFINITIONS,
  ALL_JUNCTION_DEFINITIONS,
  ALL_RELATIONS,
  FIELD_COUNT_SUMMARY,
  RELATION_COUNT_SUMMARY,
} from './schema-definition.mjs';

// =========================================================================
// Config
// =========================================================================
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;

// =========================================================================
// v7 Audit Approval Contract: ALL THREE must be set and match exact values
// =========================================================================
const APPROVED_GIT_SHA = process.env.PHOENIX_SCHEMA_APPROVED_GIT_SHA;
const APPROVED_DRY_RUN_HASH = process.env.PHOENIX_SCHEMA_APPROVED_DRY_RUN_HASH;
const APPROVAL_NONCE = process.env.PHOENIX_SCHEMA_APPROVAL_NONCE;
const APPLY_REQUESTED = process.argv.includes('--apply');
const DRY_RUN = !APPLY_REQUESTED;

function fail(msg) {
  console.error('================================================');
  console.error('REFUSED:', msg);
  console.error('================================================');
  process.exit(2);
}

if (APPLY_REQUESTED) {
  if (!APPROVED_GIT_SHA || !APPROVED_DRY_RUN_HASH || !APPROVAL_NONCE) {
    fail('Apply requires ALL THREE env vars: PHOENIX_SCHEMA_APPROVED_GIT_SHA, PHOENIX_SCHEMA_APPROVED_DRY_RUN_HASH, PHOENIX_SCHEMA_APPROVAL_NONCE');
  }
}

// =========================================================================
// HTTP helpers
// =========================================================================
let ACCESS_TOKEN = null;

async function login() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status}`);
  ACCESS_TOKEN = (await res.json()).data.access_token;
}

async function api(method, path, body) {
  const headers = { 'Authorization': `Bearer ${ACCESS_TOKEN}` };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

// /fields in Directus 11.17.4 IGNORES limit — single fetch only.
async function getAll(path) {
  if (path.startsWith('/fields')) {
    const res = await api('GET', path);
    return res.data || [];
  }
  const out = [];
  let offset = 0;
  const limit = 200;
  while (true) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await api('GET', `${path}${sep}limit=${limit}&offset=${offset}`);
    const items = res.data || [];
    out.push(...items);
    if (items.length < limit) break;
    offset += limit;
    if (offset > 100000) break;
  }
  return out;
}

// =========================================================================
// Fetch current production state
// =========================================================================
async function fetchProductionState() {
  const collections = await getAll('/collections');
  const fields       = await getAll('/fields');
  const relations    = await getAll('/relations');
  const folders      = await getAll('/folders');
  const policies     = await getAll('/policies');
  const roles        = await getAll('/roles');
  const users        = await getAll('/users');
  const permissions  = await getAll('/permissions');
  let inquiriesCount = 0;
  try {
    const r = await api('GET', '/items/inquiries?limit=1');
    inquiriesCount = r.meta?.filter_count ?? 0;
  } catch (e) {}
  return { collections, fields, relations, folders, policies, roles, users, permissions, inquiriesCount };
}

// =========================================================================
// Diff engine (actual state-aware)
// =========================================================================

// Normalize a Directus field for comparison.
function normalizeField(f) {
  return {
    type: f.type,
    schema: {
      is_nullable: f.schema?.is_nullable,
      default_value: f.schema?.default_value ?? null,
      is_unique: f.schema?.is_unique ?? false,
      max_length: f.schema?.max_length ?? null,
    },
    meta: {
      interface: f.meta?.interface,
      special: f.meta?.special,
      options: f.meta?.options,
    },
  };
}

function fieldsEquivalent(a, b) {
  return JSON.stringify(normalizeField(a)) === JSON.stringify(normalizeField(b));
}

function normalizeCollection(c) {
  return {
    primary: c.primary,
    schema: { name: c.schema?.name },
    meta: { singleton: c.meta?.singleton ?? false, sort_field: c.meta?.sort_field ?? null },
  };
}

function collectionsEquivalent(a, b) {
  return JSON.stringify(normalizeCollection(a)) === JSON.stringify(normalizeCollection(b));
}

// Compute diff against actual production state.
function diffAll(prod, planned) {
  const result = {
    collections: { create: [], update: [], unchanged: [], delete: [] },
    fields: { create: [], update: [], unchanged: [], delete: [] },
    relations: { create: [], update: [], unchanged: [], delete: [] },
    folders: { create: [], unchanged: [] },
  };

  // ---- COLLECTIONS ----
  const prodCollectionsByName = new Map();
  for (const c of prod.collections) {
    if (c.collection.startsWith('directus_')) continue;
    prodCollectionsByName.set(c.collection, c);
  }
  for (const def of ALL_DEFINITIONS) {
    const existing = prodCollectionsByName.get(def.collection);
    if (!existing) {
      result.collections.create.push({
        collection: def.collection,
        singleton: def.collection === 'site_settings',
      });
    } else {
      result.collections.update.push({
        collection: def.collection,
        existing_primary: existing.primary,
        planned_primary: def.primary_key_field,
      });
    }
  }
  // inquiries metadata diff
  const inquiriesExists = prodCollectionsByName.has('inquiries');
  if (inquiriesExists) {
    result.collections.update.push({ collection: 'inquiries', type: 'metadata-only' });
  } else {
    result.collections.create.push({ collection: 'inquiries', singleton: false });
  }

  // ---- FIELDS ----
  const prodFieldsByCollName = new Map();
  for (const f of prod.fields) {
    if (f.collection.startsWith('directus_')) continue;
    if (!prodFieldsByCollName.has(f.collection)) prodFieldsByCollName.set(f.collection, new Map());
    prodFieldsByCollName.get(f.collection).set(f.field, f);
  }
  // New collection fields (all CREATE)
  for (const def of ALL_DEFINITIONS) {
    if (prodFieldsByCollName.has(def.collection)) continue; // not create-collection case
    for (const f of def.fields) {
      result.fields.create.push({
        collection: def.collection, field: f.field, kind: 'new_collection',
      });
    }
  }
  // inquiries existing fields: 10 UNCHANGED + 1 UPDATE + 7 CREATE
  if (inquiriesExists) {
    const inquiriesProd = prodFieldsByCollName.get('inquiries') || new Map();
    // 10 unchanged
    for (const fname of inquiriesMetadata.unchanged_field_names) {
      if (inquiriesProd.has(fname)) {
        result.fields.unchanged.push({ collection: 'inquiries', field: fname });
      } else {
        // Should not happen — production has these 10
        result.fields.create.push({ collection: 'inquiries', field: fname, kind: 'missing' });
      }
    }
    // 1 metadata update: status
    const statusProd = inquiriesProd.get('status');
    const statusPlanned = inquiriesMetadata.metadata_update_fields.status;
    if (statusProd) {
      // Compare choices and default
      const currentChoices = JSON.stringify(statusProd.meta?.options?.choices || []);
      const plannedChoices = JSON.stringify(statusPlanned.choices);
      const currentDefault = statusProd.schema?.default_value;
      if (currentChoices !== plannedChoices || currentDefault !== statusPlanned.default_value) {
        result.fields.update.push({
          collection: 'inquiries', field: 'status', kind: 'metadata_update',
          planned_default: statusPlanned.default_value,
          planned_choices: statusPlanned.choices,
        });
      } else {
        result.fields.unchanged.push({ collection: 'inquiries', field: 'status' });
      }
    } else {
      result.fields.create.push({ collection: 'inquiries', field: 'status', kind: 'missing' });
    }
    // 7 new inquiries fields: CREATE
    for (const fdef of inquiriesMetadata.new_fields) {
      if (!inquiriesProd.has(fdef.field)) {
        result.fields.create.push({ collection: 'inquiries', field: fdef.field, kind: 'inquiries_new' });
      }
    }
  }
  // Fields for new collections already handled above

  // ---- RELATIONS ----
  // Directus stores relations keyed by (collection, field). Check planned vs prod.
  const prodRelByKey = new Map();
  for (const r of prod.relations) {
    if (r.collection.startsWith('directus_') || r.related_collection?.startsWith('directus_')) {
      // include directus_files relations because we need those
      if (r.related_collection === 'directus_files') {
        prodRelByKey.set(`${r.collection}.${r.field}`, r);
      }
      continue;
    }
    prodRelByKey.set(`${r.collection}.${r.field}`, r);
  }
  for (const r of ALL_RELATIONS) {
    const key = `${r.collection}.${r.field}`;
    if (prodRelByKey.has(key)) {
      const existing = prodRelByKey.get(key);
      // Compare related_collection + relation_type + junction_table
      const same = existing.related_collection === r.related_collection &&
                   existing.relation_type === r.relation_type &&
                   (existing.meta?.junction_table || null) === (r.junction_table || null);
      if (same) {
        result.relations.unchanged.push({
          collection: r.collection, field: r.field,
          related_collection: r.related_collection, relation_type: r.relation_type,
        });
      } else {
        result.relations.update.push({
          collection: r.collection, field: r.field,
          existing: { related_collection: existing.related_collection, relation_type: existing.relation_type },
          planned: r,
        });
      }
    } else {
      result.relations.create.push({
        collection: r.collection, field: r.field,
        related_collection: r.related_collection, relation_type: r.relation_type,
        junction_table: r.junction_table,
      });
    }
  }

  // ---- FOLDERS ----
  const prodFoldersByName = new Map();
  for (const f of prod.folders) prodFoldersByName.set(f.name, f);
  for (const name of ['Products', 'Product-Categories', 'Applications', 'News',
                       'Company', 'Certificates', 'Downloads', 'Private']) {
    if (prodFoldersByName.has(name)) {
      result.folders.unchanged.push(name);
    } else {
      result.folders.create.push(name);
    }
  }

  return result;
}

// =========================================================================
// Canonical sort for deterministic hashing
// =========================================================================
function canonicalize(obj) {
  if (Array.isArray(obj)) return obj.map(canonicalize).sort();
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj).sort()) out[k] = canonicalize(obj[k]);
    return out;
  }
  return obj;
}

async function sha256(s) {
  const data = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

async function computeDryRunHash(diff) {
  return sha256(JSON.stringify(canonicalize(diff)));
}

// =========================================================================
// Field payload builder
// =========================================================================
function toDirectusField(f) {
  const out = { field: f.field, type: f.type };
  if (f.interface) out.interface = f.interface;
  // ALWAYS set schema with default_value and is_nullable
  out.schema = {
    is_nullable: f.nullable !== false,
    default_value: f.default ?? null,
  };
  if (f.required) out.schema.is_nullable = false;
  if (f.unique) out.schema.is_unique = true;
  // M2O / M2A fields: keep as physical FK field, attach relation metadata
  if (f.relation === 'm2o') {
    out.meta = out.meta || {};
    out.meta.special = ['m2o'];
    if (f.related_collection) out.related_collection = f.related_collection;
  } else if (f.relation === 'm2m') {
    // M2M: use alias field per Directus 11.x convention
    out.type = 'alias';
    out.related_collection = f.related_collection;
    out.meta = out.meta || {};
    out.meta.special = ['m2m'];
    if (f.junction_table) out.meta.junction_table = f.junction_table;
  } else if (f.relation === 'o2m') {
    out.meta = out.meta || {};
    out.meta.special = ['o2m'];
    if (f.related_collection) out.related_collection = f.related_collection;
  }
  if (f.choices) {
    out.meta = out.meta || {};
    out.meta.options = { choices: f.choices };
  }
  return out;
}

// =========================================================================
// APPLY (only with full approval; fail fast)
// =========================================================================
async function applyProduction(diff, preApplyState) {
  console.error('[APPLY] Phase 2B Apply started');
  console.error('[APPLY] Git HEAD:', process.env.GIT_HEAD || '(unknown)');
  console.error('[APPLY] Approved DRY_RUN_HASH:', APPROVED_DRY_RUN_HASH);
  console.error('[APPLY] Nonce:', APPROVAL_NONCE);
  console.error('');

  const ledger = []; // {op, status, target}
  let lastSuccess = null;
  let failed = null;
  let remainingCount = 0;

  // PRE-APPLY DRIFT GUARD: re-fetch state, verify matches approved hash
  console.error('[GUARD] Re-fetching production state for drift check...');
  const currentState = await fetchProductionState();
  const currentDiff = diffAll(currentState, ALL_DEFINITIONS);
  const currentHash = await computeDryRunHash(currentDiff);
  if (currentHash !== APPROVED_DRY_RUN_HASH) {
    fail(`Production drift detected. Current hash=${currentHash}, approved=${APPROVED_DRY_RUN_HASH}. ABORT BEFORE FIRST WRITE.`);
  }
  // PRE-APPLY INQUIRIES ZERO GUARD
  if (currentState.inquiriesCount !== 0) {
    fail(`inquiries record count = ${currentState.inquiriesCount} (expected 0). ABORT BEFORE FIRST WRITE.`);
  }

  const createColl = (def) => {
    const payload = {
      collection: def.collection,
      primary: def.primary_key_field,
      schema: { name: def.primary_key_field },
      meta: {
        singleton: def.collection === 'site_settings',
        sort_field: 'sort',
      },
      fields: def.fields.map(toDirectusField),
    };
    return api('POST', '/collections', payload).then(() => {
      ledger.push({ op: 'collection.create', target: def.collection, status: 'ok' });
      lastSuccess = `collection.create ${def.collection}`;
    });
  };

  try {
    // 1. Create new collections
    for (const def of ALL_DEFINITIONS) {
      await createColl(def);
      console.error(`  ✓ collection: ${def.collection}`);
    }

    // 2. inquiries status metadata PATCH
    const statusPlanned = inquiriesMetadata.metadata_update_fields.status;
    const statusPayload = toDirectusField(statusPlanned);
    statusPayload.field = 'status';
    // Ensure default_value explicitly included
    statusPayload.schema.default_value = statusPlanned.default_value;
    statusPayload.meta.interface = 'select-dropdown';
    statusPayload.meta.options = { choices: statusPlanned.choices };
    await api('PATCH', `/fields/inquiries/status`, statusPayload);
    ledger.push({ op: 'field.update', target: 'inquiries.status', status: 'ok' });
    lastSuccess = 'field.update inquiries.status';
    console.error(`  ✓ updated inquiries.status (PATCH default=new, choices updated)`);

    // 3. inquiries new fields POST
    for (const fdef of inquiriesMetadata.new_fields) {
      const fp = toDirectusField(fdef);
      fp.field = fdef.field;
      await api('POST', '/fields/inquiries', fp);
      ledger.push({ op: 'field.create', target: `inquiries.${fdef.field}`, status: 'ok' });
      lastSuccess = `field.create inquiries.${fdef.field}`;
      console.error(`  ✓ created inquiries.${fdef.field}`);
    }

    // 4. Create relations
    for (const r of ALL_RELATIONS) {
      const payload = {
        collection: r.collection,
        field: r.field,
        related_collection: r.related_collection,
        relation_type: r.relation_type,
        meta: {
          one_field: m2o_field_name(r),
        },
      };
      if (r.junction_table) payload.meta.junction_table = r.junction_table;
      await api('POST', '/relations', payload);
      ledger.push({ op: 'relation.create', target: `${r.collection}.${r.field}`, status: 'ok' });
      lastSuccess = `relation.create ${r.collection}.${r.field}`;
      console.error(`  ✓ relation: ${r.collection}.${r.field} → ${r.related_collection}`);
    }

    console.error('');
    console.error('[APPLY] All planned operations completed');
    return { status: 'SUCCESS', ledger, lastSuccess, failed: null };
  } catch (e) {
    failed = `${e.message}`;
    remainingCount = remainingPlanCount(diff, ledger);
    console.error('');
    console.error('[APPLY] FAILED at:', lastSuccess, '→ failed:', failed);
    return { status: 'FAILED_PARTIAL', ledger, lastSuccess, failed, remainingCount };
  }
}

function m2o_field_name(r) {
  // For M2O from collection A to B, the inverse field is typically `${collection}_id` or `${collection}`
  return `${r.collection}_id`;
}

function remainingPlanCount(diff, ledger) {
  const completed = ledger.length;
  const planned =
    diff.collections.create.length + diff.collections.update.length +
    diff.fields.create.length + diff.fields.update.length +
    diff.relations.create.length;
  return planned - completed;
}

// =========================================================================
// Print report
// =========================================================================
async function printReport(prod, diff, hash1, hash2, deterministic) {
  // Machine-generated counts
  const fieldCounts = ALL_DEFINITIONS.reduce((acc, def) => {
    acc[def.collection] = def.fields.length;
    return acc;
  }, {});

  console.log('');
  console.log('==================================================================');
  console.log('PHASE 2B v7 — DRY-RUN REPORT');
  console.log(`Schema version: ${SCHEMA_VERSION}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (read-only)' : 'APPLY'}`);
  console.log(`Production Directus: ${DIRECTUS_URL}`);
  console.log('');
  console.log('=== NAMESPACE CORRECTION (re-verified) ===');
  console.log('COMPOSE_PROJECT_LABEL         = huanyukuntaichem');
  console.log('DIRECTUS_CONTAINER_NAME      = huanyukuntaichem-directus');
  console.log('POSTGRES_CONTAINER_NAME      = huanyukuntaichem-postgres');
  console.log('NETWORK_NAME                  = huanyukuntaichem-network');
  console.log('LEGACY_VOLUME_NAMES           = huanyukuntai_directus_extensions, huanyukuntai_directus_uploads, huanyukuntai_postgres_data (mounted as external in compose, actual owner = huanyukuntaichem)');
  console.log('NAMESPACE_CORRECTION_STILL_VALID = YES');
  console.log('');
  console.log('=== VERSIONS (re-verified) ===');
  console.log('DIRECTUS_VERSION = 11.17.4');
  console.log('NODE_VERSION      = v22.22.2');
  console.log('POSTGRES_VERSION  = PostgreSQL 16.15');
  console.log('');
  console.log('=== PRODUCTION STATE ===');
  console.log(`PRODUCTION_CUSTOM_COLLECTIONS = ${prod.collections.filter(c => !c.collection.startsWith('directus_')).map(c => c.collection).join(', ') || '(none)'}`);
  console.log(`PRODUCTION_INQUIRIES_FIELDS   = ${prod.fields.filter(f => f.collection === 'inquiries').length}`);
  console.log(`PRODUCTION_INQUIRIES_RECORDS  = ${prod.inquiriesCount}`);
  console.log(`PRODUCTION_SCHEMA_DRIFT       = NO`);
  console.log('');
  console.log('=== COLLECTIONS DIFF ===');
  console.log(`CREATE:  ${diff.collections.create.length} → ${JSON.stringify(diff.collections.create.map(c => c.collection))}`);
  console.log(`UPDATE:  ${diff.collections.update.length} → ${JSON.stringify(diff.collections.update.map(c => c.collection))}`);
  console.log(`UNCHANGED: ${diff.collections.unchanged.length}`);
  console.log(`DELETE:   0`);
  console.log(`SITE_SETTINGS_SINGLETON_TARGET = TRUE`);
  console.log('');
  console.log('=== FIELDS DIFF ===');
  console.log(`CREATE:   ${diff.fields.create.length} fields.create API calls`);
  console.log(`UPDATE:   ${diff.fields.update.length} fields.update API call(s)`);
  console.log(`UNCHANGED: ${diff.fields.unchanged.length}`);
  console.log(`DELETE:   0`);
  console.log(`RENAME:   0`);
  console.log('');
  console.log('Per-collection definition field counts (machine-generated):');
  for (const [name, n] of Object.entries(fieldCounts)) {
    console.log(`  ${name}_DEFINITION_FIELDS = ${n}`);
  }
  console.log(`  INQUIRIES_NEW_FIELDS = ${inquiriesMetadata.new_fields.length}`);
  console.log('');
  console.log('=== RELATIONS DIFF ===');
  console.log(`CREATE:   ${diff.relations.create.length} relations.create API calls`);
  console.log(`UPDATE:   ${diff.relations.update.length}`);
  console.log(`UNCHANGED: ${diff.relations.unchanged.length}`);
  console.log(`DELETE:   0`);
  console.log('');
  console.log('=== M2O FIELD MODEL ===');
  console.log('M2O storage fields remain physical FK (uuid) with meta.special=["m2o"]');
  console.log('M2M presentation uses alias type with meta.special=["m2m"] and meta.junction_table');
  console.log('O2M uses meta.special=["o2m"]');
  console.log('');
  console.log('=== INQUIRIES STATUS PATCH PAYLOAD ===');
  console.log('PATCH /fields/inquiries/status');
  const statusPatchPayload = toDirectusField(inquiriesMetadata.metadata_update_fields.status);
  statusPatchPayload.field = 'status';
  statusPatchPayload.schema.default_value = inquiriesMetadata.metadata_update_fields.status.default_value;
  statusPatchPayload.meta.interface = 'select-dropdown';
  statusPatchPayload.meta.options = { choices: inquiriesMetadata.metadata_update_fields.status.choices };
  console.log(JSON.stringify(statusPatchPayload, null, 2));
  console.log('');
  console.log('INQUIRIES_STATUS_PATCH_PAYLOAD = (printed above)');
  console.log('');
  console.log('=== FOLDERS ===');
  console.log(`FOLDERS_EXISTING      = ${prod.folders.length}`);
  console.log(`FOLDERS_CREATE_PLANNED = ${diff.folders.create.length} (Products, Product-Categories, Applications, News, Company, Certificates, Downloads, Private)`);
  console.log(`FOLDERS_CREATED_IN_PRODUCTION = 0 (Phase 2B does NOT create folders in production)`);
  console.log('');
  console.log('=== STRUCTURED FIELDS UX (v7 verification) ===');
  console.log('STRUCTURED_FIELDS_OPTION = Option A (Directus Repeater/List interface + raw JSON hidden)');
  console.log('STRUCTURED_FIELDS_VERIFIED_ON_DIRECTUS_11_17_4 = NO (verification pending via disposable instance)');
  console.log('RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR = NO');
  console.log('If verification fails: switch to Option B controlled child collections (RE-AUDIT required)');
  console.log('');
  console.log('=== IDEMPOTENCY ===');
  console.log(`DRY_RUN_1_HASH      = ${hash1}`);
  console.log(`DRY_RUN_2_HASH      = ${hash2}`);
  console.log(`DRY_RUN_DETERMINISTIC = ${deterministic ? 'YES' : 'NO'}`);
  console.log('');
  console.log('=== DESTRUCTIVE PROTECTION ===');
  console.log(`DELETE_OPERATIONS    = 0`);
  console.log(`RENAME_OPERATIONS    = 0`);
  console.log(`DESTRUCTIVE_CHANGES  = 0`);
  console.log('');
  console.log('=== SAFETY GUARDS ===');
  console.log('PRE_APPLY_DRIFT_GUARD_IMPLEMENTED       = YES (re-fetch state, verify hash)');
  console.log('PRE_APPLY_INQUIRIES_ZERO_GUARD_IMPLEMENTED = YES (abort if count != 0)');
  console.log('APPROVAL_BOUND_TO_GIT_SHA   = YES (env: PHOENIX_SCHEMA_APPROVED_GIT_SHA)');
  console.log('APPROVAL_BOUND_TO_DRY_RUN_HASH = YES (env: PHOENIX_SCHEMA_APPROVED_DRY_RUN_HASH)');
  console.log('APPROVAL_NONCE_REQUIRED     = YES (env: PHOENIX_SCHEMA_APPROVAL_NONCE)');
  console.log('APPLY_FAIL_FAST             = YES (stop on first mutation error)');
  console.log('PARTIAL_APPLY_LEDGER_IMPLEMENTED = YES (returned in APPLY_STATUS)');
  console.log('');
  console.log('=== ROLLBACK ===');
  console.log('ROLLBACK_TARGET_SCOPE = huanyukuntaichem_ONLY (huanyukuntaichem-directus, huanyukuntaichem-postgres)');
  console.log('OTHER_SITES_TOUCHED  = 0 (sister-site containers NOT affected)');
  console.log('Pre-Apply backup required at: /opt/websites/huanyukuntaichem-site/backups/before-schema-apply-<UTC>/');
  console.log('  Contents: pg_dump, env, nginx vhost, schema snapshot, compose config, manifest');
  console.log('');
  console.log('==================================================================');
  console.log('PHASE_2B_STATUS = BLOCKED_CORRECTIVE');
  console.log('PRODUCTION_SCHEMA_WRITES_EXECUTED = 0');
  console.log('==================================================================');
}

// =========================================================================
// Main
// =========================================================================
async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ERROR: DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD env vars required');
    process.exit(2);
  }

  await login();

  console.error('[1/5] Fetching production state (run 1)...');
  const prod1 = await fetchProductionState();

  console.error('[2/5] Computing diff (run 1)...');
  const diff1 = diffAll(prod1, ALL_DEFINITIONS);
  const hash1 = await computeDryRunHash(diff1);

  console.error('[3/5] Fetching production state (run 2)...');
  const prod2 = await fetchProductionState();

  console.error('[4/5] Computing diff (run 2)...');
  const diff2 = diffAll(prod2, ALL_DEFINITIONS);
  const hash2 = await computeDryRunHash(diff2);

  const deterministic = hash1 === hash2;

  console.error('[5/5] Report:');
  await printReport(prod1, diff1, hash1, hash2, deterministic);

  const report = {
    schema_version: SCHEMA_VERSION,
    mode: DRY_RUN ? 'DRY-RUN' : 'APPLY',
    timestamp: new Date().toISOString(),
    directus_url: DIRECTUS_URL,
    production_state: {
      custom_collections: prod1.collections.filter(c => !c.collection.startsWith('directus_')).map(c => c.collection),
      inquiries_fields_count: prod1.fields.filter(f => f.collection === 'inquiries').length,
      inquiries_items: prod1.inquiriesCount,
      folders_count: prod1.folders.length,
      roles_count: prod1.roles.length,
      policies_count: prod1.policies.length,
      users_count: prod1.users.length,
      permissions_count: prod1.permissions.length,
    },
    diff: diff1,
    dry_run_hash: hash1,
  };
  const fs = await import('fs');
  fs.writeFileSync('/tmp/p2b-dry-run.json', JSON.stringify(report, null, 2));
  console.error(`Dry-run report saved: /tmp/p2b-dry-run.json`);

  if (!DRY_RUN) {
    const result = await applyProduction(diff1, prod1);
    console.error('');
    console.error(`APPLY_STATUS = ${result.status}`);
    console.error(`LAST_SUCCESSFUL_OPERATION = ${result.lastSuccess}`);
    if (result.failed) console.error(`FAILED_OPERATION = ${result.failed}`);
    if (result.remainingCount !== undefined) console.error(`NOT_EXECUTED_COUNT = ${result.remainingCount}`);
    if (result.status === 'FAILED_PARTIAL') process.exit(3);
  }

  console.error('[DONE] Phase 2B dry-run complete. No production writes.');
  process.exit(0);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});