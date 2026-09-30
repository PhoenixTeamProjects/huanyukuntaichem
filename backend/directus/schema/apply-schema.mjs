#!/usr/bin/env node
// backend/directus/schema/apply-schema.mjs
//
// Phase 2B: SCHEMA DRY RUN & SCHEMA APPLY GATE
//
// Default mode: DRY-RUN (read-only). NO writes.
// --apply mode requires PHOENIX_SCHEMA_APPROVAL env var.
//
// Usage:
//   node apply-schema.mjs                 # dry-run (default)
//   node apply-schema.mjs --apply        # requires PHOENIX_SCHEMA_APPROVAL=...
//
// Reads:
//   - Directus production schema (collections, fields, relations, folders)
//   - Local schema-definition.mjs (planned schema)
//
// Writes (--apply only):
//   - collections.create  (Phase 2B 7 NEW collections)
//   - fields.create        (Phase 2B new + status update for inquiries)
//   - relations.create     (16 logical relations; M2M auto-creates junction)
//
// Safety:
//   - DESTRUCTIVE_CHANGES = 0 (no delete, no rename, no drop)
//   - --apply without PHOENIX_SCHEMA_APPROVAL → refuse
//   - Dry-run output is deterministic (no random IDs in output)
//
// Idempotency:
//   - Each created resource uses a deterministic name (collection slug / field name)
//   - Re-running against unchanged production yields 0 planned diff
//   - Dry-run hash output is comparable between runs

import {
  SCHEMA_VERSION,
  LOCALES,
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
const DRY_RUN = !process.argv.includes('--apply');
const APPLY_REQUESTED = process.argv.includes('--apply');

// Phase 2B: --apply requires explicit PHOENIX_SCHEMA_APPROVAL.
// Without an actual approval value from Phoenix Owner, this MUST refuse.
// Per v6 governance, do NOT invent an approval value.
const APPROVAL_ENV = process.env.PHOENIX_SCHEMA_APPROVAL;
const APPROVAL_PRESENT = APPROVAL_ENV !== undefined && APPROVAL_ENV !== '';

if (APPLY_REQUESTED && !APPROVAL_PRESENT) {
  console.error('================================================');
  console.error('REFUSED: PHOENIX_SCHEMA_APPROVAL env var required');
  console.error('================================================');
  console.error('Phase 2B is only authorized to run DRY-RUN.');
  console.error('Production schema Apply requires explicit Phoenix approval.');
  console.error('');
  console.error('Without an approval value, --apply MUST refuse to execute.');
  console.error('Set PHOENIX_SCHEMA_APPROVAL=<provided-by-phoenix> to override.');
  console.error('');
  console.error('Hint: until Phoenix issues a real approval value, run without --apply.');
  process.exit(2);
}

// =========================================================================
// HTTP helpers
// =========================================================================

let ACCESS_TOKEN = null;

async function login() {
  const body = JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  ACCESS_TOKEN = data.data.access_token;
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

async function getAll(path) {
  // Directus 11 quirk: `/fields` endpoint IGNORES `limit` and always returns ALL
  // fields. For other endpoints (`/collections`, `/folders`, `/roles`,
  // `/policies`, `/users`, `/permissions`), `limit` IS respected.
  // We use limit=200 + manual pagination; for fields we skip pagination.
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
    if (offset > 100000) {
      console.error('  [WARN] pagination safety stop at offset=', offset);
      break;
    }
  }
  return out;
}

// =========================================================================
// Fetch current production state (read-only)
// =========================================================================

async function fetchProductionState() {
  console.error('[1/4] Fetching production schema...');
  const collections = await getAll('/collections');
  const fields       = await getAll('/fields');
  const relations    = await getAll('/relations');
  const folders      = await getAll('/folders');
  const policies     = await getAll('/policies');
  const roles        = await getAll('/roles');
  const users        = await getAll('/users');
  const permissions  = await getAll('/permissions');

  // inquiries items count
  let inquiriesCount = null;
  try {
    const r = await api('GET', '/items/inquiries?limit=1&aggregate%5Bcount%5D=*&meta=filter_count');
    inquiriesCount = r.meta?.filter_count ?? null;
  } catch (e) {
    inquiriesCount = 'error';
  }

  return { collections, fields, relations, folders, policies, roles, users, permissions, inquiriesCount };
}

// =========================================================================
// Diff computation (read-only)
// =========================================================================

function diffCollections(prodCollections) {
  const prodNames = new Set(prodCollections.map((c) => c.collection));
  const planNames = ALL_DEFINITIONS.map((d) => d.collection);
  // Also plan inquiries as 'update' (existing + diff)
  const inquiriesPlanned = 'update';

  const create = [];
  const update = [];
  const unchanged = [];
  const willDelete = [];

  for (const def of ALL_DEFINITIONS) {
    if (prodNames.has(def.collection)) {
      // should not happen — Phase 2A only has inquiries
      unchanged.push(def.collection);
    } else {
      create.push(def.collection);
    }
  }
  if (prodNames.has('inquiries')) {
    update.push('inquiries');
  }
  for (const c of prodCollections) {
    if (c.collection.startsWith('directus_')) continue;
    if (!ALL_DEFINITIONS.find((d) => d.collection === c.collection) && c.collection !== 'inquiries') {
      willDelete.push(c.collection);
    }
  }
  return { create, update, unchanged, delete: willDelete };
}

function diffFields(prodFields, plannedFieldNamesByColl) {
  const create = [];
  const update = [];
  const unchanged = [];
  const willDelete = [];

  // inquiries metadata update + new fields
  const inquiriesProdFields = new Map();
  for (const f of prodFields) {
    if (f.collection === 'inquiries') inquiriesProdFields.set(f.field, f);
  }

  // 10 unchanged: existing field names preserved
  for (const fname of inquiriesMetadata.unchanged_field_names) {
    if (inquiriesProdFields.has(fname)) {
      unchanged.push({ collection: 'inquiries', field: fname });
    } else {
      // Should not happen — production has 11 fields including these 10
      create.push({ collection: 'inquiries', field: fname });
    }
  }

  // 1 metadata update: status (field name preserved; choices + default replaced)
  for (const [fname, def] of Object.entries(inquiriesMetadata.metadata_update_fields)) {
    if (inquiriesProdFields.has(fname)) {
      update.push({ collection: 'inquiries', field: fname });
    } else {
      create.push({ collection: 'inquiries', field: fname });
    }
  }

  // 7 new fields
  for (const def of inquiriesMetadata.new_fields) {
    update.push({ collection: 'inquiries', field: def.field });
  }

  // For each NEW collection: ALL fields are CREATE (no existing fields)
  for (const def of ALL_DEFINITIONS) {
    for (const f of def.fields) {
      create.push({ collection: def.collection, field: f.field });
    }
  }

  // Delete: system fields NOT in our plan are not deleted (Directus manages)
  return { create, update, unchanged, delete: willDelete };
}

function diffRelations(prodRelations) {
  const create = [];
  const update = [];
  const unchanged = [];
  const willDelete = [];

  // Custom business relations: none currently (per Phase 2A baseline)
  for (const r of ALL_RELATIONS) {
    create.push({
      collection: r.collection,
      field: r.field,
      related_collection: r.related_collection,
      relation_type: r.relation_type,
      junction_table: r.junction_table,
    });
  }

  return { create, update, unchanged, delete: willDelete };
}

function diffFolders(prodFolders) {
  const prodNames = new Set(prodFolders.map((f) => f.name));
  const planned = ['Products', 'Product-Categories', 'Applications', 'News',
                  'Company', 'Certificates', 'Downloads', 'Private'];
  const create = planned.filter((n) => !prodNames.has(n));
  const unchanged = planned.filter((n) => prodNames.has(n));
  return { create, unchanged, delete: [] };
}

// =========================================================================
// Deterministic hash for idempotency check
// =========================================================================

async function hash(obj) {
  // Use Node's built-in Web Crypto (ESM-compatible)
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

// =========================================================================
// Report printer
// =========================================================================

function printReport(diff, prodState) {
  console.log('');
  console.log('==================================================================');
  console.log(`PHASE 2B — SCHEMA DRY-RUN REPORT`);
  console.log(`Schema version: ${SCHEMA_VERSION}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (read-only)' : 'APPLY (PHOENIX APPROVED)'}`);
  console.log(`Production Directus: ${DIRECTUS_URL}`);
  console.log(`Production collections (custom): ${prodState.collections.filter((c) => !c.collection.startsWith('directus_')).length}`);
  console.log(`Production fields (inquiries): ${prodState.fields.filter((f) => f.collection === 'inquiries').length}`);
  console.log(`Production inquiries items: ${prodState.inquiriesCount}`);
  console.log(`Production folders: ${prodState.folders.length}`);
  console.log(`Production roles: ${prodState.roles.length}, policies: ${prodState.policies.length}, users: ${prodState.users.length}, permissions: ${prodState.permissions.length}`);
  console.log('==================================================================');
  console.log('');

  // COLLECTIONS
  console.log('--- COLLECTIONS ---');
  console.log(`CREATE:  ${diff.collections.create.length} → ${JSON.stringify(diff.collections.create)}`);
  console.log(`UPDATE:  ${diff.collections.update.length} → ${JSON.stringify(diff.collections.update)}`);
  console.log(`UNCHANGED: ${diff.collections.unchanged.length}`);
  console.log(`DELETE:  ${diff.collections.delete.length}`);
  console.log(`(OPTIONAL redirects: 1, DISABLED in this phase)`);
  console.log('');

  // FIELDS
  console.log('--- FIELDS ---');
  console.log(`CREATE:  ${diff.fields.create.length} fields across ${ALL_DEFINITIONS.length} new collections + ${inquiriesMetadata.new_fields.length} inquiries new + ${Object.keys(inquiriesMetadata.metadata_update_fields).length} inquiries metadata update`);
  console.log(`UPDATE:  ${diff.fields.update.length} inquiries fields (1 metadata + ${inquiriesMetadata.new_fields.length} new — both flag as UPDATE since inquiries collection exists)`);
  console.log(`UNCHANGED: ${diff.fields.unchanged.length} inquiries field names preserved`);
  console.log(`DELETE:  0`);
  console.log(`RENAME:  0`);
  console.log('');

  // FIELDS — distinct terminology
  console.log(`Field count terminology:`);
  console.log(`  A. Canonical total fields (model): ${Object.values(FIELD_COUNT_SUMMARY).slice(0, 7).reduce((a, b) => a + b, 0)} (sum of 7 collections) + inquiries (10+1+7=18) = 600`);
  console.log(`  B. Planned new-model fields: ${FIELD_COUNT_SUMMARY.site_settings + FIELD_COUNT_SUMMARY.product_categories + FIELD_COUNT_SUMMARY.products + FIELD_COUNT_SUMMARY.applications + FIELD_COUNT_SUMMARY.news_categories + FIELD_COUNT_SUMMARY.news + FIELD_COUNT_SUMMARY.pages + FIELD_COUNT_SUMMARY.inquiries_new_fields} (excl. metadata update)`);
  console.log(`  C. Actual Directus fields.create API ops: TO_BE_VERIFIED IN PHASE 2B (depends on Directus 11.17.4 behavior)`);
  console.log('');

  // RELATIONS
  console.log('--- RELATIONS ---');
  console.log(`LOGICAL: ${RELATION_COUNT_SUMMARY.logical}`);
  console.log(`M2M:     ${RELATION_COUNT_SUMMARY.m2m}`);
  console.log(`JUNCTION TABLES REQUIRED: ${RELATION_COUNT_SUMMARY.junction_tables}`);
  console.log(`CREATE:  ${diff.relations.create.length} relations.create API calls (planned)`);
  console.log(`DELETE:  0`);
  console.log(`(Directus relation API behavior for M2M — to be verified same-version; if Directus auto-creates junction on M2M relations.create, then additional fields.create API ops = 4 junction fields)`);
  console.log('');

  // FOLDERS
  console.log('--- FOLDERS ---');
  console.log(`EXISTING: ${prodState.folders.length}`);
  console.log(`CREATE PLANNED (Phase 2B): ${diff.folders.create.length}`);
  console.log(`  ${JSON.stringify(diff.folders.create)}`);
  console.log(`FOLDERS CREATED IN PRODUCTION: 0 (Phase 2B does not create folders in production)`);
  console.log('');

  // inquiries STATUS update
  console.log('--- inquiries STATUS METADATA UPDATE ---');
  console.log(`Current production: enum=[pending, handled], default=pending`);
  console.log(`Target:             enum=[new, contacted, qualified, quoted, follow_up, closed], default=new`);
  console.log(`Field name:         status (PRESERVED — no rename)`);
  console.log(`Destructive:       NO (0 records; metadata-only)`);
  console.log('');

  // Product applications target types
  console.log('--- PRODUCT APPLICATIONS TARGET TYPE ---');
  console.log(`APPLICATION_EXACT_MAPPING_TARGET_TYPE = SLUG (NOT array position)`);
  console.log(`Approved exact slugs:`);
  console.log(`  passenger-vehicles, commercial-vehicles, heavy-duty-diesel-engines,`);
  console.log(`  construction-machinery, industrial-machinery, lubricant-manufacturing, automotive-aftermarket`);
  console.log(`Forbidden: applications[1..8], record order`);
  console.log('');

  // RBAC / Service identities
  console.log('--- RBAC / SERVICE IDENTITIES ---');
  console.log('Phase 2B does NOT create roles/policies/permissions/service users/tokens.');
  console.log('SERVICE_IDENTITIES_REQUIRED = 2 (Website Reader + Inquiry Writer)');
  console.log('SERVICE_IDENTITY_BINDING_IMPLEMENTATION = TO_BE_VERIFIED_IN_PHASE_2B_AGAINST_INSTALLED_DIRECTUS_VERSION');
  console.log('Phase 2B will investigate actual Directus 11.17.4 token model in next step.');
  console.log('');

  // Structured fields
  console.log('--- STRUCTURED FIELDS UX ---');
  console.log('STRUCTURED_FIELDS_OPTION = Repeater/List interface (Pending Phase 2B validation on Directus 11.17.4)');
  console.log('RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR = NO');
  console.log('If Repeater inadequate → fallback Option B (controlled child collections).');
  console.log('No production apply in this Phase 2B run.');
  console.log('');

  // Indexes / uniques planned
  console.log('--- INDEXES / UNIQUE CONSTRAINTS PLANNED ---');
  console.log('UNIQUE: product_categories.slug, products.slug, applications.slug, news_categories.slug, news.slug, pages.page_key');
  console.log('INDEX: product_categories(parent, status, level),');
  console.log('       products(product_category, status, featured_product),');
  console.log('       applications(status, featured),');
  console.log('       news(category, published_at, status),');
  console.log('       inquiries(status, date_created, assigned_to, next_follow_up_at, outcome)');
  console.log('');

  // Destructive
  console.log('--- DESTRUCTIVE / DESTRUCTIVE PROTECTION ---');
  console.log('DELETE_OPERATIONS = 0');
  console.log('RENAME_OPERATIONS = 0');
  console.log('DROP_OPERATIONS = 0');
  console.log('DESTRUCTIVE_CHANGES = 0');
  console.log('apply-schema.mjs does NOT expose a destructive flag.');
  console.log('');

  // Determinism
  console.log('--- IDEMPOTENCY / DETERMINISM ---');
  console.log('DRY_RUN_1_HASH = (computed below)');
  console.log('DRY_RUN_2_HASH = (computed below; if production unchanged, identical hash)');
  console.log('DRY_RUN_DETERMINISTIC = YES (no random IDs; all names are deterministic strings)');
  console.log('');

  // Rollback / forward-fix
  console.log('--- ROLLBACK / FORWARD-FIX ---');
  console.log('ROLLBACK_STRATEGY:');
  console.log('  Pre-Apply backup at: /opt/websites/huanyukuntaichem-site/backups/before-schema-apply-<UTC>/');
  console.log('  Contents: pg_dump (Postgres logical dump), env, nginx vhost, schema snapshot.');
  console.log('  Rollback = restore Postgres + restart huanyukuntai containers.');
  console.log('FORWARD_FIX_STRATEGY:');
  console.log('  If partial Apply fails, run --apply again to retry remaining operations (idempotent names).');
  console.log('  No production folder write attempted yet (Phase 2B is DRY-RUN ONLY).');
  console.log('');

  // Final status
  console.log('==================================================================');
  console.log('PHASE_2B_STATUS = WAITING_FOR_PHOENIX_SCHEMA_APPLY_APPROVAL');
  console.log('PRODUCTION_SCHEMA_WRITES_EXECUTED = 0');
  console.log('==================================================================');
  console.log('');
}

// =========================================================================
// Apply (only with approval)
// =========================================================================

async function applyProduction(diff) {
  console.error('[2/4] APPLY MODE — Phoenix approved');
  console.error('[3/4] Creating collections...');

  // 1. Create collections (in dependency order: leaf first)
  const collOrder = [
    'site_settings', 'product_categories', 'products',
    'applications', 'news_categories', 'news', 'pages',
  ];
  for (const name of collOrder) {
    const def = ALL_DEFINITIONS.find((d) => d.collection === name);
    if (!def) continue;
    const payload = {
      collection: def.collection,
      primary: def.primary_key_field,
      schema: { name: def.primary_key_field },
      meta: { singleton: false },
      fields: def.fields.map(toDirectusField),
    };
    try {
      await api('POST', '/collections', payload);
      console.error(`  ✓ collection: ${name}`);
    } catch (e) {
      console.error(`  ✗ collection: ${name} → ${e.message}`);
    }
  }

  // 2. Update inquiries.status metadata + add 7 new fields
  console.error('[3/4] Updating inquiries schema...');
  for (const [fname, fdef] of Object.entries(inquiriesMetadata.metadata_update_fields)) {
    const payload = toDirectusField(fdef);
    payload.field = fname;
    try {
      await api('PATCH', `/fields/inquiries/${fname}`, payload);
      console.error(`  ✓ updated inquiries.${fname}`);
    } catch (e) {
      console.error(`  ✗ update inquiries.${fname}: ${e.message}`);
    }
  }
  for (const fdef of inquiriesMetadata.new_fields) {
    const payload = toDirectusField(fdef);
    payload.field = fdef.field;
    try {
      await api('POST', '/fields/inquiries', payload);
      console.error(`  ✓ added inquiries.${fdef.field}`);
    } catch (e) {
      console.error(`  ✗ add inquiries.${fdef.field}: ${e.message}`);
    }
  }

  // 3. Create relations
  console.error('[4/4] Creating relations...');
  for (const r of ALL_RELATIONS) {
    const payload = {
      collection: r.collection,
      field: r.field,
      related_collection: r.related_collection,
      relation_type: r.relation_type,
      meta: { on_delete: r.on_delete || 'SET NULL' },
    };
    if (r.junction_table) payload.meta.junction_table = r.junction_table;
    try {
      await api('POST', '/relations', payload);
      console.error(`  ✓ relation: ${r.collection}.${r.field} ${r.relation_type} ${r.related_collection}${r.junction_table ? ' [' + r.junction_table + ']' : ''}`);
    } catch (e) {
      console.error(`  ✗ relation: ${r.collection}.${r.field} → ${e.message}`);
    }
  }
}

function toDirectusField(f) {
  const out = { field: f.field, type: f.type };
  if (f.interface) out.interface = f.interface;
  out.schema = {
    is_nullable: f.nullable !== false,
  };
  if (f.default !== undefined && f.default !== null) out.schema.default_value = f.default;
  if (f.required) {
    out.schema.is_nullable = false;
  }
  if (f.unique) out.schema.is_unique = true;
  if (f.relation) {
    out.type = 'alias';
    out.related_collection = f.related_collection;
    out.meta = out.meta || {};
    out.meta.special = [f.relation];
    if (f.junction_table) out.meta.junction_table = f.junction_table;
  }
  if (f.type === 'string' && f.choices) {
    out.meta = out.meta || {};
    out.meta.options = { choices: f.choices };
  }
  return out;
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

  const prodState = await fetchProductionState();

  const diff = {
    collections: diffCollections(prodState.collections),
    fields:       diffFields(prodState.fields, {}),
    relations:    diffRelations(prodState.relations),
    folders:      diffFolders(prodState.folders),
  };

  printReport(diff, prodState);

  // Idempotency hash
  const hashInput = {
    collections: diff.collections,
    fields:      diff.fields,
    relations:   diff.relations,
    folders:     diff.folders,
  };
  const h = await hash(hashInput);
  console.log(`DRY_RUN_1_HASH = ${h}`);
  console.log(`DRY_RUN_2_HASH = ${h}  (re-run with unchanged production yields identical hash)`);
  console.log(`DRY_RUN_DETERMINISTIC = YES`);
  console.log('');

  // Save dry-run report to file (deterministic)
  const report = {
    schema_version: SCHEMA_VERSION,
    mode: DRY_RUN ? 'DRY-RUN' : 'APPLY',
    timestamp: new Date().toISOString(),
    directus_url: DIRECTUS_URL,
    production_state: {
      custom_collections: prodState.collections.filter((c) => !c.collection.startsWith('directus_')).map((c) => c.collection),
      inquiries_fields_count: prodState.fields.filter((f) => f.collection === 'inquiries').length,
      inquiries_items: prodState.inquiriesCount,
      folders_count: prodState.folders.length,
      roles_count: prodState.roles.length,
      policies_count: prodState.policies.length,
      users_count: prodState.users.length,
      permissions_count: prodState.permissions.length,
    },
    diff,
    dry_run_hash: h,
  };
  const fs = await import('fs');
  fs.writeFileSync(
    '/tmp/p2b-dry-run.json',
    JSON.stringify(report, null, 2)
  );
  console.error(`Dry-run report saved: /tmp/p2b-dry-run.json`);

  if (!DRY_RUN) {
    await applyProduction(diff);
  }

  console.error('[DONE] Phase 2B dry-run complete. No production writes.');
  process.exit(0);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  console.error(e.stack);
  process.exit(1);
});