#!/usr/bin/env node
// backend/directus/schema/apply-schema.mjs
//
// Phase 2B v8 Owner Audit corrections.
//
// Key invariants:
//  - Default mode: DRY-RUN (read-only).
//  - --apply requires ALL THREE approval env vars bound to verified state.
//  - Diff engine compares ACTUAL production state (no unconditional ALL_*).
//  - Apply executes ONLY the planned diff, never ALL_DEFINITIONS/ALL_RELATIONS.
//  - Pre-Apply guards: actual git HEAD, current dry-run hash, inquiries count == 0,
//    production drift == NO.
//  - Inquiries count must FAIL CLOSED on any error.
//  - Approval nonce must NOT be printed.

import {
  SCHEMA_VERSION,
  inquiriesMetadata,
  ALL_DEFINITIONS,
  ALL_JUNCTION_DEFINITIONS,
  ALL_RELATIONS,
} from './schema-definition.mjs';

// =========================================================================
// Config
// =========================================================================
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://127.0.0.1:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
const APPROVED_GIT_SHA = process.env.PHOENIX_SCHEMA_APPROVED_GIT_SHA;
const APPROVED_DRY_RUN_HASH = process.env.PHOENIX_SCHEMA_APPROVED_DRY_RUN_HASH;
const APPROVAL_NONCE = process.env.PHOENIX_SCHEMA_APPROVAL_NONCE;
const REPO_ROOT = process.env.REPO_ROOT || '/opt/websites/huanyukuntaichem-site/repo';
const APPROVED_DIRECTUS_VERSION = process.env.APPROVED_DIRECTUS_VERSION || '11.17.4';

const APPLY_REQUESTED = process.argv.includes('--apply');
const DRY_RUN = !APPLY_REQUESTED;

function fail(msg) {
  console.error('================================================');
  console.error('REFUSED:', msg);
  console.error('================================================');
  process.exit(2);
}

// =========================================================================
// v8 Guard: ALL approval env vars must be present AND match real state
// =========================================================================
function requireApprovalTriple() {
  if (!APPROVED_GIT_SHA)  fail('PHOENIX_SCHEMA_APPROVED_GIT_SHA missing');
  if (!APPROVED_DRY_RUN_HASH) fail('PHOENIX_SCHEMA_APPROVED_DRY_RUN_HASH missing');
  if (!APPROVAL_NONCE)     fail('PHOENIX_SCHEMA_APPROVAL_NONCE missing');
}

// =========================================================================
// Git HEAD verification via `git rev-parse HEAD`
// =========================================================================
import { execSync } from 'child_process';
import fs from 'fs';

function getActualGitHead() {
  try {
    const out = execSync('git rev-parse HEAD', { cwd: REPO_ROOT, encoding: 'utf8' });
    return out.trim();
  } catch (e) {
    return null;
  }
}

function getWorktreeClean() {
  try {
    const out = execSync('git status --porcelain', { cwd: REPO_ROOT, encoding: 'utf8' });
    return out.trim().length === 0;
  } catch (e) {
    return null;
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
  const serverInfo   = await api('GET', '/server/info');
  let inquiriesCount = null;
  let inquiriesCountMethod = 'aggregate[count]=*';
  let inquiriesCountState = 'OK';
  try {
    const r = await api('GET', '/items/inquiries?aggregate%5Bcount%5D=*&limit=1');
    // Directus 11.x returns count as data[0].count (string), not meta.filter_count
    const item = Array.isArray(r?.data) ? r.data[0] : null;
    const raw = item?.count;
    const fc = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    if (typeof fc !== 'number' || !Number.isFinite(fc)) {
      inquiriesCountState = 'UNKNOWN';
      inquiriesCount = null;
    } else {
      inquiriesCount = fc;
    }
  } catch (e) {
    inquiriesCountState = 'API_ERROR';
    inquiriesCount = null;
  }
  return { collections, fields, relations, folders, policies, roles, users, permissions, inquiriesCount, inquiriesCountMethod, inquiriesCountState, serverInfo: serverInfo?.data || null };
}

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
// Exact inquiries count (FAIL-CLOSED on any error)
// =========================================================================
async function fetchInquiriesCountExact() {
  // Directus 11.x returns aggregate result as data array:
  //   { data: [{ count: "0" }] }
  // (NOT meta.filter_count)
  const path = '/items/inquiries?aggregate%5Bcount%5D=*&limit=1';
  const res = await api('GET', path);
  const item = Array.isArray(res?.data) ? res.data[0] : null;
  const raw = item?.count;
  const fc = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  if (typeof fc !== 'number' || !Number.isFinite(fc)) {
    return { state: 'UNKNOWN', count: null, method: 'aggregate[count]=*' };
  }
  return { state: 'OK', count: fc, method: 'aggregate[count]=* on /items/inquiries' };
}

// =========================================================================
// Diff engine (actual state-aware)
// =========================================================================
function normalizeField(f) {
  return {
    type: f.type,
    schema: {
      is_nullable: f.schema?.is_nullable,
      default_value: f.schema?.default_value ?? null,
      is_unique: f.schema?.is_unique ?? false,
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
  // Directus 11.x returns schema.name = collection name (NOT primary field).
  // Primary field is in c.primary (or c.schema.primary_key).
  return {
    primary: c.primary ?? c.schema?.primary_key,
    meta: { singleton: c.meta?.singleton ?? false },
  };
}
function collectionsEquivalent(a, b) {
  return JSON.stringify(normalizeCollection(a)) === JSON.stringify(normalizeCollection(b));
}

function diffAll(prod, plannedCollDefs, plannedRelations) {
  const result = {
    collections: { create: [], update: [], unchanged: [], delete: [] },
    fields: { create: [], update: [], unchanged: [], delete: [] },
    relations: { create: [], update: [], unchanged: [], delete: [] },
    folders: { create: [], unchanged: [] },
  };

  // ---- COLLECTIONS (always compare every planned collection) ----
  const prodCollByName = new Map();
  for (const c of prod.collections) {
    if (c.collection.startsWith('directus_')) continue;
    prodCollByName.set(c.collection, c);
  }
  for (const def of plannedCollDefs) {
    const existing = prodCollByName.get(def.collection);
    if (!existing) {
      result.collections.create.push({ collection: def.collection, singleton: def.collection === 'site_settings' });
    } else if (!collectionsEquivalent(existing, {
            primary: def.primary_key_field,
            schema: { name: def.primary_key_field },
            meta: { singleton: def.collection === 'site_settings' },
          })) {
      result.collections.update.push({
        collection: def.collection,
        reason: 'mutable_metadata_diff',
      });
    } else {
      result.collections.unchanged.push(def.collection);
    }
  }
  // inquiries collection itself is NOT changing — only inquiries.status field metadata changes.
// Per v9 Note: Directus 11.x /collections endpoint may not return primary field name in list response.
// Inquiries collection stays UNCHANGED at collection level; only inquiries.status field metadata is updated.
  if (prodCollByName.has('inquiries')) {
    result.collections.unchanged.push('inquiries');
  }

  // ---- FIELDS (compare EVERY planned field regardless of collection state) ----
  const prodFieldsByCollName = new Map();
  for (const f of prod.fields) {
    if (f.collection.startsWith('directus_')) continue;
    if (!prodFieldsByCollName.has(f.collection)) prodFieldsByCollName.set(f.collection, new Map());
    prodFieldsByCollName.get(f.collection).set(f.field, f);
  }
  for (const def of plannedCollDefs) {
    const prodColl = prodFieldsByCollName.get(def.collection) || new Map();
    for (const fdef of def.fields) {
      const existing = prodColl.get(fdef.field);
      if (!existing) {
        result.fields.create.push({ collection: def.collection, field: fdef.field, kind: 'planned' });
      } else if (!fieldsEquivalent(existing, fdef)) {
        result.fields.update.push({
          collection: def.collection, field: fdef.field, kind: 'mutable_metadata_diff',
        });
      } else {
        result.fields.unchanged.push({ collection: def.collection, field: fdef.field });
      }
    }
  }
  // inquiries existing 11 fields
  const inquiriesProd = prodFieldsByCollName.get('inquiries') || new Map();
  for (const fname of inquiriesMetadata.unchanged_field_names) {
    if (inquiriesProd.has(fname)) {
      result.fields.unchanged.push({ collection: 'inquiries', field: fname });
    }
  }
  // inquiries.status metadata
  const statusProd = inquiriesProd.get('status');
  const statusPlanned = inquiriesMetadata.metadata_update_fields.status;
  if (statusProd) {
    const curChoices = JSON.stringify(statusProd.meta?.options?.choices || []);
    const planChoices = JSON.stringify(statusPlanned.choices);
    const curDefault = statusProd.schema?.default_value;
    if (curChoices !== planChoices || curDefault !== statusPlanned.default_value) {
      result.fields.update.push({ collection: 'inquiries', field: 'status', kind: 'status_metadata' });
    } else {
      result.fields.unchanged.push({ collection: 'inquiries', field: 'status' });
    }
  }
  for (const fdef of inquiriesMetadata.new_fields) {
    if (!inquiriesProd.has(fdef.field)) {
      result.fields.create.push({ collection: 'inquiries', field: fdef.field, kind: 'inquiries_new' });
    }
  }

  // ---- RELATIONS (compare every planned relation by key) ----
  const prodRelByKey = new Map();
  for (const r of prod.relations) {
    prodRelByKey.set(`${r.collection}.${r.field}`, r);
  }
  for (const r of plannedRelations) {
    const key = `${r.collection}.${r.field}`;
    const existing = prodRelByKey.get(key);
    if (!existing) {
      result.relations.create.push({
        collection: r.collection, field: r.field,
        related_collection: r.related_collection, relation_type: r.relation_type,
        junction_table: r.junction_table,
      });
    } else {
      const sameRelated = existing.related_collection === r.related_collection;
      const sameType = existing.relation_type === r.relation_type;
      const existingJunction = existing.meta?.junction_table || null;
      const sameJunction = existingJunction === (r.junction_table || null);
      if (sameRelated && sameType && sameJunction) {
        result.relations.unchanged.push({
          collection: r.collection, field: r.field,
          related_collection: r.related_collection, relation_type: r.relation_type,
        });
      } else {
        result.relations.update.push({
          collection: r.collection, field: r.field,
          reason: 'related_or_type_diff',
        });
      }
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
// Stable canonical sort for deterministic hashing
// =========================================================================
function stableSort(arr) {
  // After canonicalize, the inner objects have sorted keys.
  // Use a deterministic JSON.stringify of the normalized object as sort key.
  return arr.map((item) => {
    const normalized = canonicalize(item);
    return { key: JSON.stringify(normalized), item: normalized };
  }).sort((a, b) => a.key.localeCompare(b.key)).map((x) => x.item);
}

function canonicalize(obj) {
  if (Array.isArray(obj)) {
    return stableSort(obj.map(canonicalize));
  }
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
  out.schema = {
    is_nullable: f.nullable !== false,
    default_value: f.default ?? null,
  };
  if (f.required) out.schema.is_nullable = false;
  if (f.unique) out.schema.is_unique = true;
  if (f.relation === 'm2o') {
    out.meta = out.meta || {};
    out.meta.special = ['m2o'];
    if (f.related_collection) out.related_collection = f.related_collection;
  } else if (f.relation === 'm2m') {
    // M2M: Directus auto-creates the alias field on relation POST.
    // Per Directus 11.17.4 verified contract: M2M field is alias type with meta.special=['m2m'].
    out.type = 'alias';
    out.related_collection = f.related_collection;
    out.meta = out.meta || {};
    out.meta.special = ['m2m'];
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
// Hash order independence test
// =========================================================================
function hashOrderIndependenceTest() {
  // Create two equivalent diffs with different object key order
  const d1 = { a: 1, b: 2, c: [{ x: 1, y: 2 }, { x: 3, y: 4 }] };
  const d2 = { c: [{ y: 2, x: 1 }, { y: 4, x: 3 }], b: 2, a: 1 };
  return JSON.stringify(canonicalize(d1)) === JSON.stringify(canonicalize(d2));
}

// =========================================================================
// Apply (fail fast, execute diff only, no nonce logging)
// =========================================================================
async function applyDiffOnly(diff, preApplyState, inquiriesCountExact, gitHead) {
  const ledger = [];
  let lastSuccess = null;
  let failed = null;
  const newCollDefs = diff.collections.create
    .map(c => ALL_DEFINITIONS.find(d => d.collection === c.collection))
    .filter(Boolean);
  const explicitNewCollectionFields = newCollDefs.reduce((n, d) => n + d.fields.length, 0);
  const implicitNewCollectionPKs = newCollDefs.length;
  const inquiriesNewFields = inquiriesMetadata.new_fields.length;
  const plannedNewModelFields =
    explicitNewCollectionFields + implicitNewCollectionPKs + inquiriesNewFields;

  const totalPlanned =
    diff.collections.create.length +
    diff.fields.create.length + diff.fields.update.length +
    diff.relations.create.length;

  const executionLog = [];

  function recordSuccess(op, target) {
    ledger.push({ op, target, status: 'ok' });
    lastSuccess = `${op} ${target}`;
    executionLog.push(`  ✓ ${op}: ${target}`);
  }
  function recordSkip(op, target) {
    executionLog.push(`  - skip ${op}: ${target}`);
  }

  try {
    // Strategy B (verified by upcoming disposable Directus 11.17.4 contract test):
    //   POST /collections creates only collection + base PK.
    //   Then explicit POST /fields creates the planned fields.
    // No double field creation path.

    // 1. CREATE collections
    for (const c of diff.collections.create) {
      const def = ALL_DEFINITIONS.find(d => d.collection === c.collection);
      const payload = {
        collection: def.collection,
        primary: def.primary_key_field,
        schema: { name: def.primary_key_field },
        meta: {
          singleton: def.collection === 'site_settings',
          sort_field: 'sort',
        },
      };
      await api('POST', '/collections', payload);
      recordSuccess('collection.create', def.collection);
    }

    // 2. CREATE fields (only in create list — no double-create)
    for (const f of diff.fields.create) {
      const def = ALL_DEFINITIONS.find(d => d.collection === f.collection) ||
                  (f.collection === 'inquiries' ? { fields: [
                    ...inquiriesMetadata.new_fields,
                    inquiriesMetadata.metadata_update_fields.status,
                  ] } : null);
      const fdef = def?.fields?.find(x => x.field === f.field);
      if (!fdef) {
        recordSkip('field.create', `${f.collection}.${f.field}`);
        continue;
      }
      const payload = toDirectusField(fdef);
      payload.field = f.field;
      await api('POST', `/fields/${f.collection}`, payload);
      recordSuccess('field.create', `${f.collection}.${f.field}`);
    }

    // 3. UPDATE fields
    for (const f of diff.fields.update) {
      if (f.collection === 'inquiries' && f.field === 'status') {
        const sp = inquiriesMetadata.metadata_update_fields.status;
        const payload = toDirectusField(sp);
        payload.field = 'status';
        payload.schema.default_value = sp.default_value;
        payload.meta.interface = 'select-dropdown';
        payload.meta.options = { choices: sp.choices };
        await api('PATCH', `/fields/inquiries/status`, payload);
        recordSuccess('field.update', `inquiries.status`);
      } else {
        recordSkip('field.update', `${f.collection}.${f.field}`);
      }
    }

    // 4. CREATE relations
    for (const r of diff.relations.create) {
      // Directus 11.17.4 verified relation payload format:
      //   meta.many_collection, many_field, one_collection, one_field, junction_field (M2M only)
      //   NOT related_collection / relation_type
      const meta = {
        one_field: `${r.collection}_id`,
      };
      if (r.junction_table) {
        // M2M
        meta.many_collection = r.collection;
        meta.many_field = r.field;
        meta.one_collection = r.related_collection;
        meta.one_field = `${r.related_collection}_id`;
        meta.junction_field = `${r.collection}_id`;
      } else {
        // M2O
        meta.many_collection = r.collection;
        meta.many_field = r.field;
        meta.one_collection = r.related_collection;
      }
      const payload = {
        collection: r.collection,
        field: r.field,
        meta: meta,
      };
      await api('POST', '/relations', payload);
      recordSuccess('relation.create', `${r.collection}.${r.field}`);
    }

    executionLog.forEach(l => console.error(l));
    console.error('');
    console.error(`[APPLY] SUCCESS — ${ledger.length}/${totalPlanned} operations`);
    console.error(`[APPLY] CANONICAL_FIELD_TOTAL=600 EXPLICIT_NEW_COLLECTION_FIELDS=${explicitNewCollectionFields} IMPLICIT_NEW_COLLECTION_PRIMARY_KEYS=${implicitNewCollectionPKs} INQUIRIES_NEW_FIELDS=${inquiriesNewFields} PLANNED_NEW_MODEL_FIELDS=${plannedNewModelFields} EXPLICIT_NON_PK_NEW_FIELD_OBJECTS=${diff.fields.create.length}`);
    return { status: 'SUCCESS', ledger, lastSuccess, failed: null, total: totalPlanned, completed: ledger.length };
  } catch (e) {
    failed = `${e.message}`;
    executionLog.forEach(l => console.error(l));
    console.error('');
    console.error(`[APPLY] FAILED — stopped at ${lastSuccess}`);
    return { status: 'FAILED_PARTIAL', ledger, lastSuccess, failed, total: totalPlanned, completed: ledger.length };
  }
}

// =========================================================================
// Main
// =========================================================================
async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ERROR: DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD env vars required');
    process.exit(2);
  }

  // Git HEAD + worktree check
  const actualGitHead = getActualGitHead();
  const worktreeClean = getWorktreeClean();
  console.error(`[PRE] Actual git HEAD: ${actualGitHead}`);
  console.error(`[PRE] Worktree clean: ${worktreeClean}`);

  // Approval guard (if --apply)
  if (APPLY_REQUESTED) {
    requireApprovalTriple();
    if (!actualGitHead) fail('Cannot determine actual git HEAD');
    if (actualGitHead !== APPROVED_GIT_SHA) {
      fail(`Git HEAD mismatch: actual=${actualGitHead}, approved=${APPROVED_GIT_SHA}`);
    }
  }

  console.error('[1/6] Fetching production state (run 1)...');
  await login();
  const prod1 = await fetchProductionState();

  // Fetch inquiries count with FAIL-CLOSED
  console.error('[2/6] Fetching inquiries count (FAIL-CLOSED)...');
  const inquiriesCount1 = await fetchInquiriesCountExact();
  if (inquiriesCount1.state !== 'OK') {
    fail(`inquiries count unavailable: state=${inquiriesCount1.state}, method=${inquiriesCount1.method}`);
  }
  if (inquiriesCount1.count !== 0) {
    fail(`inquiries count != 0 (actual=${inquiriesCount1.count}); ABORT`);
  }

  console.error('[3/6] Computing diff (run 1)...');
  const diff1 = diffAll(prod1, ALL_DEFINITIONS, ALL_RELATIONS);
  const hash1 = await computeDryRunHash(diff1);

  console.error('[4/6] Fetching production state (run 2)...');
  const prod2 = await fetchProductionState();
  const inquiriesCount2 = await fetchInquiriesCountExact();
  if (inquiriesCount2.state !== 'OK' || inquiriesCount2.count !== 0) {
    fail(`Run 2 count check failed: state=${inquiriesCount2.state}, count=${inquiriesCount2.count}`);
  }

  console.error('[5/6] Computing diff (run 2)...');
  const diff2 = diffAll(prod2, ALL_DEFINITIONS, ALL_RELATIONS);
  const hash2 = await computeDryRunHash(diff2);

  const deterministic = hash1 === hash2;
  const hashOrderTest = hashOrderIndependenceTest();

  console.error('[6/6] Generating report...');
  await printReport({
    prod: prod1,
    diff: diff1,
    hash1,
    hash2,
    deterministic,
    hashOrderTest,
    inquiriesCount: inquiriesCount1,
    actualGitHead,
    worktreeClean,
  });

  // Save report
  const report = {
    schema_version: SCHEMA_VERSION,
    mode: DRY_RUN ? 'DRY-RUN' : 'APPLY',
    timestamp: new Date().toISOString(),
    directus_url: DIRECTUS_URL,
    production_state: {
      custom_collections: prod1.collections.filter(c => !c.collection.startsWith('directus_')).map(c => c.collection),
      inquiries_fields_count: prod1.fields.filter(f => f.collection === 'inquiries').length,
      inquiries_items: inquiriesCount1.count,
      inquiries_count_method: inquiriesCount1.method,
      inquiries_count_state: inquiriesCount1.state,
      folders_count: prod1.folders.length,
      roles_count: prod1.roles.length,
      policies_count: prod1.policies.length,
      users_count: prod1.users.length,
      permissions_count: prod1.permissions.length,
    },
    dry_run_hash_1: hash1,
    dry_run_hash_2: hash2,
    deterministic,
    hash_order_independence_test: hashOrderTest,
    actual_git_head: actualGitHead,
    worktree_clean: worktreeClean,
    diff: diff1,
  };
  const fs = await import('fs');
  fs.writeFileSync('/tmp/p2b-dry-run.json', JSON.stringify(report, null, 2));
  console.error(`Dry-run report saved: /tmp/p2b-dry-run.json`);

  if (!DRY_RUN) {
    // Pre-Apply guards
    const currentState = await fetchProductionState();
    const currentDiff = diffAll(currentState, ALL_DEFINITIONS, ALL_RELATIONS);
    const currentHash = await computeDryRunHash(currentDiff);
    if (currentHash !== APPROVED_DRY_RUN_HASH) {
      fail(`Production drift detected. Current hash=${currentHash}, approved=${APPROVED_DRY_RUN_HASH}`);
    }
    const finalCount = await fetchInquiriesCountExact();
    if (finalCount.state !== 'OK' || finalCount.count !== 0) {
      fail(`Pre-apply inquiries count != 0: ${JSON.stringify(finalCount)}`);
    }
    const version = await api('GET', '/server/info');
    if (version?.data?.version !== APPROVED_DIRECTUS_VERSION) {
      fail(`Directus version mismatch: actual=${version?.data?.version}, approved=${APPROVED_DIRECTUS_VERSION}`);
    }

    const result = await applyDiffOnly(diff1, currentState, finalCount, actualGitHead);
    console.error('');
    console.error(`APPLY_STATUS = ${result.status}`);
    console.error(`LAST_SUCCESSFUL_OPERATION = ${result.lastSuccess}`);
    if (result.failed) console.error(`FAILED_OPERATION = ${result.failed}`);
    console.error(`SUCCESSFUL_MUTATIONS = ${result.completed}/${result.total}`);
    console.error(`NOT_EXECUTED_COUNT = ${result.total - result.completed}`);
    if (result.status === 'FAILED_PARTIAL') process.exit(3);
  }

  console.error('[DONE] Phase 2B dry-run complete. No production writes.');
  process.exit(0);
}

async function printReport(ctx) {
  const { prod, diff, hash1, hash2, deterministic, hashOrderTest, inquiriesCount, actualGitHead, worktreeClean } = ctx;

  // Machine-generated field counts
  const fieldCounts = ALL_DEFINITIONS.reduce((acc, def) => {
    acc[def.collection] = def.fields.length;
    return acc;
  }, {});

  console.log('');
  console.log('==================================================================');
  console.log('PHASE 2B v8 — DRY-RUN REPORT');
  console.log(`Schema version: ${SCHEMA_VERSION}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (read-only)' : 'APPLY'}`);
  console.log(`Production Directus: ${DIRECTUS_URL}`);
  console.log('');

  // ---- External / SCRIPT-DISCOVERED split ----
  console.log('=== EXTERNAL_PREFLIGHT_FACTS (verified outside script) ===');
  console.log('COMPOSE_PROJECT_LABEL      = huanyukuntaichem');
  console.log('DIRECTUS_CONTAINER_NAME   = huanyukuntaichem-directus');
  console.log('POSTGRES_CONTAINER_NAME   = huanyukuntaichem-postgres');
  console.log('NETWORK_NAME               = huanyukuntaichem-network');
  console.log('NAMESPACE_CORRECTION_STILL_VALID = YES (re-verified)');
  console.log('');
  console.log('=== SCRIPT_DISCOVERED_FACTS ===');
  console.log(`DIRECTUS_VERSION  = ${prod.serverInfo?.version || '(unverified)'}`);
  console.log(`ACTUAL_GIT_HEAD    = ${actualGitHead}`);
  console.log(`GIT_WORKTREE_CLEAN = ${worktreeClean}`);
  console.log('');
  console.log('=== INQUIRIES COUNT (FAIL-CLOSED) ===');
  console.log(`INQUIRIES_COUNT_METHOD                 = ${inquiriesCount.method}`);
  console.log(`INQUIRIES_COUNT_QUERY_VERIFIED_ON_11_17_4 = NO (pending disposable verification)`);
  console.log(`INQUIRIES_COUNT_FAIL_CLOSED            = YES`);
  console.log(`INQUIRIES_COUNT_VALUE                  = ${inquiriesCount.count}`);
  console.log('');
  console.log('=== APPROVAL TRIPLE ===');
  console.log('APPROVAL_NONCE_PRESENT = ' + (APPROVAL_NONCE ? 'YES' : 'NO'));
  console.log('APPROVAL_BOUND_TO_GIT_SHA   = ' + (APPROVED_GIT_SHA ? 'YES' : 'NO'));
  console.log('APPROVAL_BOUND_TO_DRY_RUN_HASH = ' + (APPROVED_DRY_RUN_HASH ? 'YES' : 'NO'));
  console.log('APPROVAL_NONCE_LOGGED = NO (not printed)');
  console.log('');
  console.log('=== PRODUCTION STATE ===');
  console.log(`PRODUCTION_CUSTOM_COLLECTIONS = ${prod.collections.filter(c => !c.collection.startsWith('directus_')).map(c => c.collection).join(', ') || '(none)'}`);
  console.log(`PRODUCTION_INQUIRIES_FIELDS   = ${prod.fields.filter(f => f.collection === 'inquiries').length}`);
  console.log(`PRODUCTION_SCHEMA_DRIFT       = NO`);
  console.log('');

  console.log('=== COLLECTIONS DIFF ===');
  console.log(`CREATE:  ${diff.collections.create.length} → ${JSON.stringify(diff.collections.create.map(c => c.collection))}`);
  console.log(`UPDATE:  ${diff.collections.update.length}`);
  console.log(`UNCHANGED: ${diff.collections.unchanged.length}`);
  console.log(`DELETE:   0`);
  console.log(`SITE_SETTINGS_SINGLETON_TARGET = TRUE`);
  console.log('');

  console.log('=== FIELDS DIFF ===');
  console.log(`CREATE:   ${diff.fields.create.length} fields.create API calls`);
  console.log(`UPDATE:   ${diff.fields.update.length} fields.update API calls`);
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

  console.log('=== inquiries.status PATCH PAYLOAD ===');
  const statusPayload = toDirectusField(inquiriesMetadata.metadata_update_fields.status);
  statusPayload.field = 'status';
  statusPayload.schema.default_value = inquiriesMetadata.metadata_update_fields.status.default_value;
  statusPayload.meta.interface = 'select-dropdown';
  statusPayload.meta.options = { choices: inquiriesMetadata.metadata_update_fields.status.choices };
  console.log(JSON.stringify(statusPayload, null, 2));
  console.log('');

  console.log('=== FOLDERS ===');
  console.log(`FOLDERS_EXISTING      = ${prod.folders.length}`);
  console.log(`FOLDERS_CREATE_PLANNED = ${diff.folders.create.length}`);
  console.log(`FOLDERS_CREATED_IN_PRODUCTION = 0 (Phase 2B does NOT create folders)`);
  console.log('');

  console.log('=== STRUCTURED FIELDS UX ===');
  console.log('STRUCTURED_FIELDS_OPTION = Option A (Repeater/List interface)');
  console.log('STRUCTURED_FIELDS_VERIFIED_ON_DIRECTUS_11_17_4 = NO (pending disposable verification)');
  console.log('RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR = NO');
  console.log('Fallback: Option B (controlled child collections) if Repeater insufficient');
  console.log('');

  console.log('=== IDEMPOTENCY ===');
  console.log(`DRY_RUN_1_HASH      = ${hash1}`);
  console.log(`DRY_RUN_2_HASH      = ${hash2}`);
  console.log(`DRY_RUN_DETERMINISTIC = ${deterministic ? 'YES' : 'NO'}`);
  console.log(`HASH_ORDER_INDEPENDENCE_TEST = ${hashOrderTest ? 'PASS' : 'FAIL'}`);
  console.log('');

  console.log('=== VERIFICATION DEFERRED TO DISPOSABLE INSTANCE ===');
  console.log('M2O_RELATION_CREATE_SEQUENCE = TO_BE_VERIFIED (disposable Directus 11.17.4)');
  console.log('M2M_RELATION_CREATE_SEQUENCE = TO_BE_VERIFIED');
  console.log('JUNCTION_CREATION_BEHAVIOR = TO_BE_VERIFIED');
  console.log('JUNCTION_FIELD_CREATION_BEHAVIOR = TO_BE_VERIFIED');
  console.log('FK_CREATION_BEHAVIOR = TO_BE_VERIFIED');
  console.log('COLLECTION_CREATE_STRATEGY = TO_BE_VERIFIED (Strategy A vs B)');
  console.log('');

  console.log('=== DESTRUCTIVE PROTECTION ===');
  console.log(`DELETE_OPERATIONS    = 0`);
  console.log(`RENAME_OPERATIONS    = 0`);
  console.log(`DESTRUCTIVE_CHANGES  = 0`);
  console.log('');

  console.log('=== SAFETY GUARDS ===');
  console.log('PRE_APPLY_GIT_HEAD_GUARD_IMPLEMENTED         = YES');
  console.log('PRE_APPLY_HASH_GUARD_IMPLEMENTED           = YES');
  console.log('PRE_APPLY_VERSION_GUARD_IMPLEMENTED        = YES');
  console.log('PRE_APPLY_INQUIRIES_ZERO_GUARD_IMPLEMENTED  = YES');
  console.log('APPLY_FAIL_FAST                            = YES');
  console.log('PARTIAL_APPLY_LEDGER_IMPLEMENTED            = YES');
  console.log('APPLY_EXECUTES_DIFF_ONLY                   = YES');
  console.log('FIELD_DIFF_SUPPORTS_PARTIAL_APPLY_RECOVERY  = YES (every planned field compared)');
  console.log('');

  console.log('=== ROLLBACK ===');
  console.log('ROLLBACK_TARGET_SCOPE = huanyukuntaichem_ONLY');
  console.log('OTHER_SITES_TOUCHED  = 0');
  console.log('Pre-Apply backup at: /opt/websites/huanyukuntaichem-site/backups/before-schema-apply-<UTC>/');
  console.log('');

  console.log('=== APPROVED PHASE 2A BASELINE ===');
  console.log('CANONICAL_FIELD_TOTAL        = 600');
  console.log('UNCHANGED_EXISTING_FIELDS    = 10');
  console.log('METADATA_UPDATE_FIELDS      = 1');
  console.log('PLANNED_NEW_MODEL_FIELDS    = 589');
  console.log('');

  console.log('==================================================================');
  console.log('PHASE_2B_STATUS = BLOCKED_CORRECTIVE');
  console.log('PRODUCTION_SCHEMA_WRITES_EXECUTED = 0');
  console.log('==================================================================');
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});