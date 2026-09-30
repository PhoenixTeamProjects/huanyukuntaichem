// backend/directus/schema/schema-definition.mjs
//
// Phase 2A-approved schema definition (v6 governance).
// All collections, fields, relations, and indices planned for the
// huanyukuntaichem Directus instance.
//
// Source of truth: docs/project-memory/05-CMS-SCHEMA.md +
// deployment/frontend-cms-mapping.md + compatibility-map.md +
// schema-gap.md (all committed at v6 HEAD 32d9fb6).
//
// This file is data only — no side effects, no I/O.

export const SCHEMA_VERSION = 'v6-2026-10-01';

// =====================================================================
// 10 locale suffix fields expanded
// =====================================================================
export const LOCALES = ['en', 'es', 'ru', 'ar', 'fr', 'pt', 'de', 'id', 'tr', 'fa'];

// Helper: build a translated field slug for the 10-locale suffix fields
export function expand10(source) {
  return LOCALES.map((l) => `${source}_${l}`);
}

// =====================================================================
// inquiries (existing + metadata diff) — Phase 2A Section 1.1
// Field names MUST NOT change.
// Only `status` enum choices + default are updated.
// 7 new fields added.
// =====================================================================
export const inquiriesMetadata = {
  collection: 'inquiries',
  primary_key_field: 'id',
  primary_key_type: 'integer',
  // 10 unchanged fields (Phase 2A wording: 10 unchanged + 1 metadata + 7 new)
  unchanged_field_names: [
    'id', 'customer_name', 'email', 'company_name', 'phone',
    'message', 'source_page', 'product_interested', 'locale', 'date_created',
  ],
  // 1 metadata update: status (field name preserved; choices + default replaced)
  metadata_update_fields: {
    status: {
      type: 'string',
      interface: 'select-dropdown',
      required: true,
      choices: [
        { text: 'New', value: 'new' },
        { text: 'Contacted', value: 'contacted' },
        { text: 'Qualified', value: 'qualified' },
        { text: 'Quoted', value: 'quoted' },
        { text: 'Follow up', value: 'follow_up' },
        { text: 'Closed', value: 'closed' },
      ],
      default_value: 'new',
    },
  },
  // 7 new fields (Phase 2A)
  new_fields: [
    { field: 'date_updated',       type: 'timestamp',   nullable: true,  default: null, interface: 'datetime' },
    { field: 'whatsapp',           type: 'string',     nullable: true,  default: null, interface: 'input' },
    { field: 'country',            type: 'string',     nullable: true,  default: null, interface: 'input' },
    { field: 'internal_notes',     type: 'text',       nullable: true,  default: null, interface: 'input-multiline' },
    { field: 'assigned_to',        type: 'uuid',       nullable: true,  default: null, interface: 'select-dropdown-m2o' },
    { field: 'outcome',            type: 'string',     nullable: true,  default: null, interface: 'select-dropdown' },
    { field: 'next_follow_up_at',  type: 'timestamp',   nullable: true,  default: null, interface: 'datetime' },
  ],
};

// =====================================================================
// 7 NEW collections
// =====================================================================

const SITE_SETTINGS_FIELDS = [
  { field: 'status',          type: 'string',     required: true,  default: 'draft',   interface: 'select-dropdown' },

  // translatable (10 lang × 7 source fields = 70 fields)
  { field: 'site_name_en',       type: 'string',  nullable: true },
  { field: 'site_name_es',       type: 'string',  nullable: true },
  { field: 'site_name_ru',       type: 'string',  nullable: true },
  { field: 'site_name_ar',       type: 'string',  nullable: true },
  { field: 'site_name_fr',       type: 'string',  nullable: true },
  { field: 'site_name_pt',       type: 'string',  nullable: true },
  { field: 'site_name_de',       type: 'string',  nullable: true },
  { field: 'site_name_id',       type: 'string',  nullable: true },
  { field: 'site_name_tr',       type: 'string',  nullable: true },
  { field: 'site_name_fa',       type: 'string',  nullable: true },
  { field: 'tagline_en',       type: 'string',  nullable: true },
  { field: 'tagline_es',       type: 'string',  nullable: true },
  { field: 'tagline_ru',       type: 'string',  nullable: true },
  { field: 'tagline_ar',       type: 'string',  nullable: true },
  { field: 'tagline_fr',       type: 'string',  nullable: true },
  { field: 'tagline_pt',       type: 'string',  nullable: true },
  { field: 'tagline_de',       type: 'string',  nullable: true },
  { field: 'tagline_id',       type: 'string',  nullable: true },
  { field: 'tagline_tr',       type: 'string',  nullable: true },
  { field: 'tagline_fa',       type: 'string',  nullable: true },
  { field: 'company_name_en',    type: 'string',  nullable: true },
  { field: 'company_name_es',    type: 'string',  nullable: true },
  { field: 'company_name_ru',    type: 'string',  nullable: true },
  { field: 'company_name_ar',    type: 'string',  nullable: true },
  { field: 'company_name_fr',    type: 'string',  nullable: true },
  { field: 'company_name_pt',    type: 'string',  nullable: true },
  { field: 'company_name_de',    type: 'string',  nullable: true },
  { field: 'company_name_id',    type: 'string',  nullable: true },
  { field: 'company_name_tr',    type: 'string',  nullable: true },
  { field: 'company_name_fa',    type: 'string',  nullable: true },
  { field: 'address_en',         type: 'text',    nullable: true },
  { field: 'address_es',         type: 'text',    nullable: true },
  { field: 'address_ru',         type: 'text',    nullable: true },
  { field: 'address_ar',         type: 'text',    nullable: true },
  { field: 'address_fr',         type: 'text',    nullable: true },
  { field: 'address_pt',         type: 'text',    nullable: true },
  { field: 'address_de',         type: 'text',    nullable: true },
  { field: 'address_id',         type: 'text',    nullable: true },
  { field: 'address_tr',         type: 'text',    nullable: true },
  { field: 'address_fa',         type: 'text',    nullable: true },
  { field: 'footer_intro_en',    type: 'text',    nullable: true },
  { field: 'footer_intro_es',    type: 'text',    nullable: true },
  { field: 'footer_intro_ru',    type: 'text',    nullable: true },
  { field: 'footer_intro_ar',    type: 'text',    nullable: true },
  { field: 'footer_intro_fr',    type: 'text',    nullable: true },
  { field: 'footer_intro_pt',    type: 'text',    nullable: true },
  { field: 'footer_intro_de',    type: 'text',    nullable: true },
  { field: 'footer_intro_id',    type: 'text',    nullable: true },
  { field: 'footer_intro_tr',    type: 'text',    nullable: true },
  { field: 'footer_intro_fa',    type: 'text',    nullable: true },
  { field: 'default_seo_title_en',        type: 'string', nullable: true },
  { field: 'default_seo_title_es',        type: 'string', nullable: true },
  { field: 'default_seo_title_ru',        type: 'string', nullable: true },
  { field: 'default_seo_title_ar',        type: 'string', nullable: true },
  { field: 'default_seo_title_fr',        type: 'string', nullable: true },
  { field: 'default_seo_title_pt',        type: 'string', nullable: true },
  { field: 'default_seo_title_de',        type: 'string', nullable: true },
  { field: 'default_seo_title_id',        type: 'string', nullable: true },
  { field: 'default_seo_title_tr',        type: 'string', nullable: true },
  { field: 'default_seo_title_fa',        type: 'string', nullable: true },
  { field: 'default_seo_description_en',   type: 'text',   nullable: true },
  { field: 'default_seo_description_es',   type: 'text',   nullable: true },
  { field: 'default_seo_description_ru',   type: 'text',   nullable: true },
  { field: 'default_seo_description_ar',   type: 'text',   nullable: true },
  { field: 'default_seo_description_fr',   type: 'text',   nullable: true },
  { field: 'default_seo_description_pt',   type: 'text',   nullable: true },
  { field: 'default_seo_description_de',   type: 'text',   nullable: true },
  { field: 'default_seo_description_id',   type: 'text',   nullable: true },
  { field: 'default_seo_description_tr',   type: 'text',   nullable: true },
  { field: 'default_seo_description_fa',   type: 'text',   nullable: true },

  // single-value (6 fields)
  { field: 'company_name_cn',        type: 'string',    nullable: true },  // NOT in 10-lang suffix
  { field: 'company_english_name',   type: 'string',    nullable: true },
  { field: 'email',                  type: 'string',    nullable: true },
  { field: 'phone',                  type: 'string',    nullable: true },
  { field: 'whatsapp',               type: 'string',    nullable: true },
  { field: 'social_links',          type: 'json',      nullable: true },

  // relation (M2O file, 4 fields)
  { field: 'logo',                  type: 'uuid',  nullable: true,  relation: 'm2o', related_collection: 'directus_files' },
  { field: 'logo_white',            type: 'uuid',  nullable: true,  relation: 'm2o', related_collection: 'directus_files' },
  { field: 'favicon',               type: 'uuid',  nullable: true,  relation: 'm2o', related_collection: 'directus_files' },
  { field: 'default_og_image',      type: 'uuid',  nullable: true,  relation: 'm2o', related_collection: 'directus_files' },

  // system-managed
  { field: 'sort',                 type: 'integer',    nullable: true,  default: null },
  { field: 'date_created',         type: 'timestamp',   nullable: true,  system: true },
  { field: 'date_updated',         type: 'timestamp',   nullable: true,  system: true },
  { field: 'user_created',         type: 'uuid',       nullable: true,  system: true },
  { field: 'user_updated',         type: 'uuid',       nullable: true,  system: true },
];

export const site_settingsDefinition = {
  collection: 'site_settings',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: SITE_SETTINGS_FIELDS,
};

// =====================================================================
// product_categories (CREATE · 31 records · 73 fields)
// =====================================================================
const PRODUCT_CATEGORIES_FIELDS = [
  { field: 'status',                type: 'string',   required: true, default: 'draft', interface: 'select-dropdown' },

  // single-value (4)
  { field: 'slug',                  type: 'string',  required: true, unique: true },
  { field: 'level',                 type: 'integer', nullable: true, default: 1 },
  { field: 'show_in_menu',          type: 'boolean', nullable: true, default: true },
  { field: 'featured',              type: 'boolean', nullable: true, default: false },

  // translatable (6 source × 10 = 60)
  { field: 'category_name_en',      type: 'string',  nullable: true },  // en required
  { field: 'category_name_es',      type: 'string',  nullable: true },
  { field: 'category_name_ru',      type: 'string',  nullable: true },
  { field: 'category_name_ar',      type: 'string',  nullable: true },
  { field: 'category_name_fr',      type: 'string',  nullable: true },
  { field: 'category_name_pt',      type: 'string',  nullable: true },
  { field: 'category_name_de',      type: 'string',  nullable: true },
  { field: 'category_name_id',      type: 'string',  nullable: true },
  { field: 'category_name_tr',      type: 'string',  nullable: true },
  { field: 'category_name_fa',      type: 'string',  nullable: true },
  { field: 'category_description_en',   type: 'text',  nullable: true },
  { field: 'category_description_es',   type: 'text',  nullable: true },
  { field: 'category_description_ru',   type: 'text',  nullable: true },
  { field: 'category_description_ar',   type: 'text',  nullable: true },
  { field: 'category_description_fr',   type: 'text',  nullable: true },
  { field: 'category_description_pt',   type: 'text',  nullable: true },
  { field: 'category_description_de',   type: 'text',  nullable: true },
  { field: 'category_description_id',   type: 'text',  nullable: true },
  { field: 'category_description_tr',   type: 'text',  nullable: true },
  { field: 'category_description_fa',   type: 'text',  nullable: true },
  { field: 'image_alt_en',          type: 'string', nullable: true },
  { field: 'image_alt_es',          type: 'string', nullable: true },
  { field: 'image_alt_ru',          type: 'string', nullable: true },
  { field: 'image_alt_ar',          type: 'string', nullable: true },
  { field: 'image_alt_fr',          type: 'string', nullable: true },
  { field: 'image_alt_pt',          type: 'string', nullable: true },
  { field: 'image_alt_de',          type: 'string', nullable: true },
  { field: 'image_alt_id',          type: 'string', nullable: true },
  { field: 'image_alt_tr',          type: 'string', nullable: true },
  { field: 'image_alt_fa',          type: 'string', nullable: true },
  { field: 'seo_title_en',          type: 'string', nullable: true },
  { field: 'seo_title_es',          type: 'string', nullable: true },
  { field: 'seo_title_ru',          type: 'string', nullable: true },
  { field: 'seo_title_ar',          type: 'string', nullable: true },
  { field: 'seo_title_fr',          type: 'string', nullable: true },
  { field: 'seo_title_pt',          type: 'string', nullable: true },
  { field: 'seo_title_de',          type: 'string', nullable: true },
  { field: 'seo_title_id',          type: 'string', nullable: true },
  { field: 'seo_title_tr',          type: 'string', nullable: true },
  { field: 'seo_title_fa',          type: 'string', nullable: true },
  { field: 'seo_description_en',    type: 'text',    nullable: true },
  { field: 'seo_description_es',    type: 'text',    nullable: true },
  { field: 'seo_description_ru',    type: 'text',    nullable: true },
  { field: 'seo_description_ar',    type: 'text',    nullable: true },
  { field: 'seo_description_fr',    type: 'text',    nullable: true },
  { field: 'seo_description_pt',    type: 'text',    nullable: true },
  { field: 'seo_description_de',    type: 'text',    nullable: true },
  { field: 'seo_description_id',    type: 'text',    nullable: true },
  { field: 'seo_description_tr',    type: 'text',    nullable: true },
  { field: 'seo_description_fa',    type: 'text',    nullable: true },

  // relations (2)
  { field: 'parent',               type: 'uuid', nullable: true, relation: 'm2o', related_collection: 'product_categories', on_delete: 'RESTRICT' },
  { field: 'image',                type: 'uuid', nullable: true, relation: 'm2o', related_collection: 'directus_files' },

  // system
  { field: 'sort',                  type: 'integer',    nullable: true,  default: null },
  { field: 'date_created',          type: 'timestamp',   nullable: true,  system: true },
  { field: 'date_updated',          type: 'timestamp',   nullable: true,  system: true },
  { field: 'user_created',          type: 'uuid',       nullable: true,  system: true },
  { field: 'user_updated',          type: 'uuid',       nullable: true,  system: true },
];

export const product_categoriesDefinition = {
  collection: 'product_categories',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: PRODUCT_CATEGORIES_FIELDS,
};

// =====================================================================
// products (CREATE · 28 records · 107 fields)
//
// products.applications JSON is NOT CREATED (v6 governance).
// Relations: applications ↔ products via applications.related_products M2M.
// =====================================================================
const PRODUCTS_FIELDS = [
  { field: 'status',  type: 'string', required: true, default: 'draft', interface: 'select-dropdown' },

  // single-value (5)
  { field: 'slug',                   type: 'string',  required: true, unique: true },
  { field: 'internal_product_code',  type: 'string',  nullable: true },
  { field: 'moq',                   type: 'string',  nullable: true },
  { field: 'featured_product',       type: 'boolean', nullable: true, default: false },
  { field: 'customizable',          type: 'boolean', nullable: true, default: false },

  // translatable (9 source × 10 = 90)
  { field: 'product_name_en',          type: 'string', nullable: true },
  { field: 'product_name_es',          type: 'string', nullable: true },
  { field: 'product_name_ru',          type: 'string', nullable: true },
  { field: 'product_name_ar',          type: 'string', nullable: true },
  { field: 'product_name_fr',          type: 'string', nullable: true },
  { field: 'product_name_pt',          type: 'string', nullable: true },
  { field: 'product_name_de',          type: 'string', nullable: true },
  { field: 'product_name_id',          type: 'string', nullable: true },
  { field: 'product_name_tr',          type: 'string', nullable: true },
  { field: 'product_name_fa',          type: 'string', nullable: true },
  { field: 'short_description_en',     type: 'text',   nullable: true },
  { field: 'short_description_es',     type: 'text',   nullable: true },
  { field: 'short_description_ru',     type: 'text',   nullable: true },
  { field: 'short_description_ar',     type: 'text',   nullable: true },
  { field: 'short_description_fr',     type: 'text',   nullable: true },
  { field: 'short_description_pt',     type: 'text',   nullable: true },
  { field: 'short_description_de',     type: 'text',   nullable: true },
  { field: 'short_description_id',     type: 'text',   nullable: true },
  { field: 'short_description_tr',     type: 'text',   nullable: true },
  { field: 'short_description_fa',     type: 'text',   nullable: true },
  { field: 'detailed_description_en',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_es',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_ru',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_ar',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_fr',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_pt',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_de',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_id',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_tr',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'detailed_description_fa',  type: 'text',   nullable: true, interface: 'input-rich-text-html' },
  { field: 'lead_time_en',            type: 'string', nullable: true },
  { field: 'lead_time_es',            type: 'string', nullable: true },
  { field: 'lead_time_ru',            type: 'string', nullable: true },
  { field: 'lead_time_ar',            type: 'string', nullable: true },
  { field: 'lead_time_fr',            type: 'string', nullable: true },
  { field: 'lead_time_pt',            type: 'string', nullable: true },
  { field: 'lead_time_de',            type: 'string', nullable: true },
  { field: 'lead_time_id',            type: 'string', nullable: true },
  { field: 'lead_time_tr',            type: 'string', nullable: true },
  { field: 'lead_time_fa',            type: 'string', nullable: true },
  { field: 'packaging_en',           type: 'string', nullable: true },
  { field: 'packaging_es',           type: 'string', nullable: true },
  { field: 'packaging_ru',           type: 'string', nullable: true },
  { field: 'packaging_ar',           type: 'string', nullable: true },
  { field: 'packaging_fr',           type: 'string', nullable: true },
  { field: 'packaging_pt',           type: 'string', nullable: true },
  { field: 'packaging_de',           type: 'string', nullable: true },
  { field: 'packaging_id',           type: 'string', nullable: true },
  { field: 'packaging_tr',           type: 'string', nullable: true },
  { field: 'packaging_fa',           type: 'string', nullable: true },
  { field: 'image_alt_en',            type: 'string', nullable: true },
  { field: 'image_alt_es',            type: 'string', nullable: true },
  { field: 'image_alt_ru',            type: 'string', nullable: true },
  { field: 'image_alt_ar',            type: 'string', nullable: true },
  { field: 'image_alt_fr',            type: 'string', nullable: true },
  { field: 'image_alt_pt',            type: 'string', nullable: true },
  { field: 'image_alt_de',            type: 'string', nullable: true },
  { field: 'image_alt_id',            type: 'string', nullable: true },
  { field: 'image_alt_tr',            type: 'string', nullable: true },
  { field: 'image_alt_fa',            type: 'string', nullable: true },
  { field: 'seo_title_en',            type: 'string', nullable: true },
  { field: 'seo_title_es',            type: 'string', nullable: true },
  { field: 'seo_title_ru',            type: 'string', nullable: true },
  { field: 'seo_title_ar',            type: 'string', nullable: true },
  { field: 'seo_title_fr',            type: 'string', nullable: true },
  { field: 'seo_title_pt',            type: 'string', nullable: true },
  { field: 'seo_title_de',            type: 'string', nullable: true },
  { field: 'seo_title_id',            type: 'string', nullable: true },
  { field: 'seo_title_tr',            type: 'string', nullable: true },
  { field: 'seo_title_fa',            type: 'string', nullable: true },
  { field: 'seo_description_en',      type: 'text',   nullable: true },
  { field: 'seo_description_es',      type: 'text',   nullable: true },
  { field: 'seo_description_ru',      type: 'text',   nullable: true },
  { field: 'seo_description_ar',      type: 'text',   nullable: true },
  { field: 'seo_description_fr',      type: 'text',   nullable: true },
  { field: 'seo_description_pt',      type: 'text',   nullable: true },
  { field: 'seo_description_de',      type: 'text',   nullable: true },
  { field: 'seo_description_id',      type: 'text',   nullable: true },
  { field: 'seo_description_tr',      type: 'text',   nullable: true },
  { field: 'seo_description_fa',      type: 'text',   nullable: true },
  { field: 'seo_keywords_en',         type: 'string', nullable: true },
  { field: 'seo_keywords_es',         type: 'string', nullable: true },
  { field: 'seo_keywords_ru',         type: 'string', nullable: true },
  { field: 'seo_keywords_ar',         type: 'string', nullable: true },
  { field: 'seo_keywords_fr',         type: 'string', nullable: true },
  { field: 'seo_keywords_pt',         type: 'string', nullable: true },
  { field: 'seo_keywords_de',         type: 'string', nullable: true },
  { field: 'seo_keywords_id',         type: 'string', nullable: true },
  { field: 'seo_keywords_tr',         type: 'string', nullable: true },
  { field: 'seo_keywords_fa',         type: 'string', nullable: true },

  // structured JSON (2 — Repeater interface at runtime)
  { field: 'specifications',  type: 'json', nullable: true },
  { field: 'highlights',      type: 'json', nullable: true },

  // relations (3)
  { field: 'product_category',  type: 'uuid', nullable: false, relation: 'm2o', related_collection: 'product_categories', on_delete: 'RESTRICT' },
  { field: 'main_image',        type: 'uuid', nullable: true,  relation: 'm2o', related_collection: 'directus_files' },
  { field: 'product_images',    type: 'alias', nullable: true, relation: 'm2m', related_collection: 'directus_files', junction_table: 'products_files' },

  // system
  { field: 'sort',                 type: 'integer',  nullable: true, default: null },
  { field: 'date_created',         type: 'timestamp', nullable: true, system: true },
  { field: 'date_updated',         type: 'timestamp', nullable: true, system: true },
  { field: 'user_created',         type: 'uuid',     nullable: true, system: true },
  { field: 'user_updated',         type: 'uuid',     nullable: true, system: true },
];

export const productsDefinition = {
  collection: 'products',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: PRODUCTS_FIELDS,
};

// =====================================================================
// applications (CREATE · 8 records · 81 fields)
// =====================================================================
const APPLICATIONS_FIELDS = [
  { field: 'status',  type: 'string', required: true, default: 'draft', interface: 'select-dropdown' },

  // single-value (2)
  { field: 'slug',                   type: 'string',  required: true, unique: true },
  { field: 'featured',              type: 'boolean', nullable: true, default: false },

  // translatable (7 source × 10 = 70)
  { field: 'title_en',          type: 'string', nullable: true },
  { field: 'title_es',          type: 'string', nullable: true },
  { field: 'title_ru',          type: 'string', nullable: true },
  { field: 'title_ar',          type: 'string', nullable: true },
  { field: 'title_fr',          type: 'string', nullable: true },
  { field: 'title_pt',          type: 'string', nullable: true },
  { field: 'title_de',          type: 'string', nullable: true },
  { field: 'title_id',          type: 'string', nullable: true },
  { field: 'title_tr',          type: 'string', nullable: true },
  { field: 'title_fa',          type: 'string', nullable: true },
  { field: 'short_description_en',     type: 'text',  nullable: true },
  { field: 'short_description_es',     type: 'text',  nullable: true },
  { field: 'short_description_ru',     type: 'text',  nullable: true },
  { field: 'short_description_ar',     type: 'text',  nullable: true },
  { field: 'short_description_fr',     type: 'text',  nullable: true },
  { field: 'short_description_pt',     type: 'text',  nullable: true },
  { field: 'short_description_de',     type: 'text',  nullable: true },
  { field: 'short_description_id',     type: 'text',  nullable: true },
  { field: 'short_description_tr',     type: 'text',  nullable: true },
  { field: 'short_description_fa',     type: 'text',  nullable: true },
  { field: 'summary_en',              type: 'text',  nullable: true },
  { field: 'summary_es',              type: 'text',  nullable: true },
  { field: 'summary_ru',              type: 'text',  nullable: true },
  { field: 'summary_ar',              type: 'text',  nullable: true },
  { field: 'summary_fr',              type: 'text',  nullable: true },
  { field: 'summary_pt',              type: 'text',  nullable: true },
  { field: 'summary_de',              type: 'text',  nullable: true },
  { field: 'summary_id',              type: 'text',  nullable: true },
  { field: 'summary_tr',              type: 'text',  nullable: true },
  { field: 'summary_fa',              type: 'text',  nullable: true },
  { field: 'content_en',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_es',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_ru',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_ar',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_fr',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_pt',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_de',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_id',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_tr',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_fa',              type: 'text',  nullable: true, interface: 'input-rich-text-html' },
  { field: 'image_alt_en',          type: 'string', nullable: true },
  { field: 'image_alt_es',          type: 'string', nullable: true },
  { field: 'image_alt_ru',          type: 'string', nullable: true },
  { field: 'image_alt_ar',          type: 'string', nullable: true },
  { field: 'image_alt_fr',          type: 'string', nullable: true },
  { field: 'image_alt_pt',          type: 'string', nullable: true },
  { field: 'image_alt_de',          type: 'string', nullable: true },
  { field: 'image_alt_id',          type: 'string', nullable: true },
  { field: 'image_alt_tr',          type: 'string', nullable: true },
  { field: 'image_alt_fa',          type: 'string', nullable: true },
  { field: 'seo_title_en',          type: 'string', nullable: true },
  { field: 'seo_title_es',          type: 'string', nullable: true },
  { field: 'seo_title_ru',          type: 'string', nullable: true },
  { field: 'seo_title_ar',          type: 'string', nullable: true },
  { field: 'seo_title_fr',          type: 'string', nullable: true },
  { field: 'seo_title_pt',          type: 'string', nullable: true },
  { field: 'seo_title_de',          type: 'string', nullable: true },
  { field: 'seo_title_id',          type: 'string', nullable: true },
  { field: 'seo_title_tr',          type: 'string', nullable: true },
  { field: 'seo_title_fa',          type: 'string', nullable: true },
  { field: 'seo_description_en',    type: 'text',   nullable: true },
  { field: 'seo_description_es',    type: 'text',   nullable: true },
  { field: 'seo_description_ru',    type: 'text',   nullable: true },
  { field: 'seo_description_ar',    type: 'text',   nullable: true },
  { field: 'seo_description_fr',    type: 'text',   nullable: true },
  { field: 'seo_description_pt',    type: 'text',   nullable: true },
  { field: 'seo_description_de',    type: 'text',   nullable: true },
  { field: 'seo_description_id',    type: 'text',   nullable: true },
  { field: 'seo_description_tr',    type: 'text',   nullable: true },
  { field: 'seo_description_fa',    type: 'text',   nullable: true },
  { field: 'seo_keywords_en',       type: 'string', nullable: true },
  { field: 'seo_keywords_es',       type: 'string', nullable: true },
  { field: 'seo_keywords_ru',       type: 'string', nullable: true },
  { field: 'seo_keywords_ar',       type: 'string', nullable: true },
  { field: 'seo_keywords_fr',       type: 'string', nullable: true },
  { field: 'seo_keywords_pt',       type: 'string', nullable: true },
  { field: 'seo_keywords_de',       type: 'string', nullable: true },
  { field: 'seo_keywords_id',       type: 'string', nullable: true },
  { field: 'seo_keywords_tr',       type: 'string', nullable: true },
  { field: 'seo_keywords_fa',       type: 'string', nullable: true },

  // relations (2)
  { field: 'image',             type: 'uuid', nullable: true, relation: 'm2o', related_collection: 'directus_files' },
  { field: 'related_products',  type: 'alias', nullable: true, relation: 'm2m', related_collection: 'products', junction_table: 'applications_products' },

  // system
  { field: 'sort',                type: 'integer',  nullable: true, default: null },
  { field: 'date_created',        type: 'timestamp', nullable: true, system: true },
  { field: 'date_updated',        type: 'timestamp', nullable: true, system: true },
  { field: 'user_created',        type: 'uuid',     nullable: true, system: true },
  { field: 'user_updated',        type: 'uuid',     nullable: true, system: true },
];

export const applicationsDefinition = {
  collection: 'applications',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: APPLICATIONS_FIELDS,
};

// =====================================================================
// news_categories (CREATE · 6 records · 48 fields)
// =====================================================================
const NEWS_CATEGORIES_FIELDS = [
  { field: 'status',  type: 'string', required: true, default: 'draft', interface: 'select-dropdown' },
  { field: 'slug',   type: 'string', required: true, unique: true },

  { field: 'category_name_en',   type: 'string', nullable: true },
  { field: 'category_name_es',   type: 'string', nullable: true },
  { field: 'category_name_ru',   type: 'string', nullable: true },
  { field: 'category_name_ar',   type: 'string', nullable: true },
  { field: 'category_name_fr',   type: 'string', nullable: true },
  { field: 'category_name_pt',   type: 'string', nullable: true },
  { field: 'category_name_de',   type: 'string', nullable: true },
  { field: 'category_name_id',   type: 'string', nullable: true },
  { field: 'category_name_tr',   type: 'string', nullable: true },
  { field: 'category_name_fa',   type: 'string', nullable: true },

  { field: 'description_en',   type: 'text', nullable: true },
  { field: 'description_es',   type: 'text', nullable: true },
  { field: 'description_ru',   type: 'text', nullable: true },
  { field: 'description_ar',   type: 'text', nullable: true },
  { field: 'description_fr',   type: 'text', nullable: true },
  { field: 'description_pt',   type: 'text', nullable: true },
  { field: 'description_de',   type: 'text', nullable: true },
  { field: 'description_id',   type: 'text', nullable: true },
  { field: 'description_tr',   type: 'text', nullable: true },
  { field: 'description_fa',   type: 'text', nullable: true },

  { field: 'seo_title_en',   type: 'string', nullable: true },
  { field: 'seo_title_es',   type: 'string', nullable: true },
  { field: 'seo_title_ru',   type: 'string', nullable: true },
  { field: 'seo_title_ar',   type: 'string', nullable: true },
  { field: 'seo_title_fr',   type: 'string', nullable: true },
  { field: 'seo_title_pt',   type: 'string', nullable: true },
  { field: 'seo_title_de',   type: 'string', nullable: true },
  { field: 'seo_title_id',   type: 'string', nullable: true },
  { field: 'seo_title_tr',   type: 'string', nullable: true },
  { field: 'seo_title_fa',   type: 'string', nullable: true },

  { field: 'seo_description_en',   type: 'text', nullable: true },
  { field: 'seo_description_es',   type: 'text', nullable: true },
  { field: 'seo_description_ru',   type: 'text', nullable: true },
  { field: 'seo_description_ar',   type: 'text', nullable: true },
  { field: 'seo_description_fr',   type: 'text', nullable: true },
  { field: 'seo_description_pt',   type: 'text', nullable: true },
  { field: 'seo_description_de',   type: 'text', nullable: true },
  { field: 'seo_description_id',   type: 'text', nullable: true },
  { field: 'seo_description_tr',   type: 'text', nullable: true },
  { field: 'seo_description_fa',   type: 'text', nullable: true },

  { field: 'sort',                 type: 'integer',  nullable: true, default: null },
  { field: 'date_created',         type: 'timestamp', nullable: true, system: true },
  { field: 'date_updated',         type: 'timestamp', nullable: true, system: true },
  { field: 'user_created',         type: 'uuid',     nullable: true, system: true },
  { field: 'user_updated',         type: 'uuid',     nullable: true, system: true },
];

export const news_categoriesDefinition = {
  collection: 'news_categories',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: NEWS_CATEGORIES_FIELDS,
};

// =====================================================================
// news (CREATE · 10 records · 83 fields)
// =====================================================================
const NEWS_FIELDS = [
  { field: 'status',  type: 'string', required: true, default: 'draft', interface: 'select-dropdown' },

  // single-value (4)
  { field: 'slug',         type: 'string',  required: true, unique: true },
  { field: 'published_at', type: 'timestamp', nullable: false, default: null, interface: 'datetime' },
  { field: 'author',      type: 'string',  nullable: true },
  { field: 'featured',    type: 'boolean', nullable: true, default: false },

  // translatable (7 source × 10 = 70)
  { field: 'title_en',   type: 'string', nullable: true },
  { field: 'title_es',   type: 'string', nullable: true },
  { field: 'title_ru',   type: 'string', nullable: true },
  { field: 'title_ar',   type: 'string', nullable: true },
  { field: 'title_fr',   type: 'string', nullable: true },
  { field: 'title_pt',   type: 'string', nullable: true },
  { field: 'title_de',   type: 'string', nullable: true },
  { field: 'title_id',   type: 'string', nullable: true },
  { field: 'title_tr',   type: 'string', nullable: true },
  { field: 'title_fa',   type: 'string', nullable: true },

  { field: 'excerpt_en',  type: 'text', nullable: true },
  { field: 'excerpt_es',  type: 'text', nullable: true },
  { field: 'excerpt_ru',  type: 'text', nullable: true },
  { field: 'excerpt_ar',  type: 'text', nullable: true },
  { field: 'excerpt_fr',  type: 'text', nullable: true },
  { field: 'excerpt_pt',  type: 'text', nullable: true },
  { field: 'excerpt_de',  type: 'text', nullable: true },
  { field: 'excerpt_id',  type: 'text', nullable: true },
  { field: 'excerpt_tr',  type: 'text', nullable: true },
  { field: 'excerpt_fa',  type: 'text', nullable: true },

  { field: 'content_en',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_es',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_ru',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_ar',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_fr',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_pt',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_de',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_id',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_tr',  type: 'text', nullable: true, interface: 'input-rich-text-html' },
  { field: 'content_fa',  type: 'text', nullable: true, interface: 'input-rich-text-html' },

  { field: 'image_alt_en',  type: 'string', nullable: true },
  { field: 'image_alt_es',  type: 'string', nullable: true },
  { field: 'image_alt_ru',  type: 'string', nullable: true },
  { field: 'image_alt_ar',  type: 'string', nullable: true },
  { field: 'image_alt_fr',  type: 'string', nullable: true },
  { field: 'image_alt_pt',  type: 'string', nullable: true },
  { field: 'image_alt_de',  type: 'string', nullable: true },
  { field: 'image_alt_id',  type: 'string', nullable: true },
  { field: 'image_alt_tr',  type: 'string', nullable: true },
  { field: 'image_alt_fa',  type: 'string', nullable: true },

  { field: 'seo_title_en',   type: 'string', nullable: true },
  { field: 'seo_title_es',   type: 'string', nullable: true },
  { field: 'seo_title_ru',   type: 'string', nullable: true },
  { field: 'seo_title_ar',   type: 'string', nullable: true },
  { field: 'seo_title_fr',   type: 'string', nullable: true },
  { field: 'seo_title_pt',   type: 'string', nullable: true },
  { field: 'seo_title_de',   type: 'string', nullable: true },
  { field: 'seo_title_id',   type: 'string', nullable: true },
  { field: 'seo_title_tr',   type: 'string', nullable: true },
  { field: 'seo_title_fa',   type: 'string', nullable: true },

  { field: 'seo_description_en',   type: 'text', nullable: true },
  { field: 'seo_description_es',   type: 'text', nullable: true },
  { field: 'seo_description_ru',   type: 'text', nullable: true },
  { field: 'seo_description_ar',   type: 'text', nullable: true },
  { field: 'seo_description_fr',   type: 'text', nullable: true },
  { field: 'seo_description_pt',   type: 'text', nullable: true },
  { field: 'seo_description_de',   type: 'text', nullable: true },
  { field: 'seo_description_id',   type: 'text', nullable: true },
  { field: 'seo_description_tr',   type: 'text', nullable: true },
  { field: 'seo_description_fa',   type: 'text', nullable: true },

  { field: 'seo_keywords_en',   type: 'string', nullable: true },
  { field: 'seo_keywords_es',   type: 'string', nullable: true },
  { field: 'seo_keywords_ru',   type: 'string', nullable: true },
  { field: 'seo_keywords_ar',   type: 'string', nullable: true },
  { field: 'seo_keywords_fr',   type: 'string', nullable: true },
  { field: 'seo_keywords_pt',   type: 'string', nullable: true },
  { field: 'seo_keywords_de',   type: 'string', nullable: true },
  { field: 'seo_keywords_id',   type: 'string', nullable: true },
  { field: 'seo_keywords_tr',   type: 'string', nullable: true },
  { field: 'seo_keywords_fa',   type: 'string', nullable: true },

  // relations (2)
  { field: 'category',      type: 'uuid', nullable: false, relation: 'm2o', related_collection: 'news_categories', on_delete: 'RESTRICT' },
  { field: 'cover_image',   type: 'uuid', nullable: true,  relation: 'm2o', related_collection: 'directus_files' },

  { field: 'sort',            type: 'integer',  nullable: true, default: null },
  { field: 'date_created',    type: 'timestamp', nullable: true, system: true },
  { field: 'date_updated',    type: 'timestamp', nullable: true, system: true },
  { field: 'user_created',    type: 'uuid',     nullable: true, system: true },
  { field: 'user_updated',    type: 'uuid',     nullable: true, system: true },
];

export const newsDefinition = {
  collection: 'news',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: NEWS_FIELDS,
};

// =====================================================================
// pages (CREATE · 103 fields · sections single canonical + inline translations)
// =====================================================================
const PAGES_FIELDS = [
  { field: 'status',  type: 'string', required: true, default: 'draft', interface: 'select-dropdown' },

  // single-value (3)
  { field: 'page_key',   type: 'string', required: true, unique: true },
  { field: 'slug',       type: 'string', required: true },
  { field: 'hero_button_link', type: 'string', nullable: true },

  // translatable (9 source × 10 = 90)
  { field: 'title_en',   type: 'string', nullable: true },
  { field: 'title_es',   type: 'string', nullable: true },
  { field: 'title_ru',   type: 'string', nullable: true },
  { field: 'title_ar',   type: 'string', nullable: true },
  { field: 'title_fr',   type: 'string', nullable: true },
  { field: 'title_pt',   type: 'string', nullable: true },
  { field: 'title_de',   type: 'string', nullable: true },
  { field: 'title_id',   type: 'string', nullable: true },
  { field: 'title_tr',   type: 'string', nullable: true },
  { field: 'title_fa',   type: 'string', nullable: true },

  { field: 'hero_title_en',   type: 'string', nullable: true },
  { field: 'hero_title_es',   type: 'string', nullable: true },
  { field: 'hero_title_ru',   type: 'string', nullable: true },
  { field: 'hero_title_ar',   type: 'string', nullable: true },
  { field: 'hero_title_fr',   type: 'string', nullable: true },
  { field: 'hero_title_pt',   type: 'string', nullable: true },
  { field: 'hero_title_de',   type: 'string', nullable: true },
  { field: 'hero_title_id',   type: 'string', nullable: true },
  { field: 'hero_title_tr',   type: 'string', nullable: true },
  { field: 'hero_title_fa',   type: 'string', nullable: true },

  { field: 'hero_subtitle_en',   type: 'string', nullable: true },
  { field: 'hero_subtitle_es',   type: 'string', nullable: true },
  { field: 'hero_subtitle_ru',   type: 'string', nullable: true },
  { field: 'hero_subtitle_ar',   type: 'string', nullable: true },
  { field: 'hero_subtitle_fr',   type: 'string', nullable: true },
  { field: 'hero_subtitle_pt',   type: 'string', nullable: true },
  { field: 'hero_subtitle_de',   type: 'string', nullable: true },
  { field: 'hero_subtitle_id',   type: 'string', nullable: true },
  { field: 'hero_subtitle_tr',   type: 'string', nullable: true },
  { field: 'hero_subtitle_fa',   type: 'string', nullable: true },

  { field: 'hero_image_alt_en',   type: 'string', nullable: true },
  { field: 'hero_image_alt_es',   type: 'string', nullable: true },
  { field: 'hero_image_alt_ru',   type: 'string', nullable: true },
  { field: 'hero_image_alt_ar',   type: 'string', nullable: true },
  { field: 'hero_image_alt_fr',   type: 'string', nullable: true },
  { field: 'hero_image_alt_pt',   type: 'string', nullable: true },
  { field: 'hero_image_alt_de',   type: 'string', nullable: true },
  { field: 'hero_image_alt_id',   type: 'string', nullable: true },
  { field: 'hero_image_alt_tr',   type: 'string', nullable: true },
  { field: 'hero_image_alt_fa',   type: 'string', nullable: true },

  { field: 'hero_button_text_en',   type: 'string', nullable: true },
  { field: 'hero_button_text_es',   type: 'string', nullable: true },
  { field: 'hero_button_text_ru',   type: 'string', nullable: true },
  { field: 'hero_button_text_ar',   type: 'string', nullable: true },
  { field: 'hero_button_text_fr',   type: 'string', nullable: true },
  { field: 'hero_button_text_pt',   type: 'string', nullable: true },
  { field: 'hero_button_text_de',   type: 'string', nullable: true },
  { field: 'hero_button_text_id',   type: 'string', nullable: true },
  { field: 'hero_button_text_tr',   type: 'string', nullable: true },
  { field: 'hero_button_text_fa',   type: 'string', nullable: true },

  { field: 'seo_title_en',   type: 'string', nullable: true },
  { field: 'seo_title_es',   type: 'string', nullable: true },
  { field: 'seo_title_ru',   type: 'string', nullable: true },
  { field: 'seo_title_ar',   type: 'string', nullable: true },
  { field: 'seo_title_fr',   type: 'string', nullable: true },
  { field: 'seo_title_pt',   type: 'string', nullable: true },
  { field: 'seo_title_de',   type: 'string', nullable: true },
  { field: 'seo_title_id',   type: 'string', nullable: true },
  { field: 'seo_title_tr',   type: 'string', nullable: true },
  { field: 'seo_title_fa',   type: 'string', nullable: true },

  { field: 'seo_description_en',   type: 'text', nullable: true },
  { field: 'seo_description_es',   type: 'text', nullable: true },
  { field: 'seo_description_ru',   type: 'text', nullable: true },
  { field: 'seo_description_ar',   type: 'text', nullable: true },
  { field: 'seo_description_fr',   type: 'text', nullable: true },
  { field: 'seo_description_pt',   type: 'text', nullable: true },
  { field: 'seo_description_de',   type: 'text', nullable: true },
  { field: 'seo_description_id',   type: 'text', nullable: true },
  { field: 'seo_description_tr',   type: 'text', nullable: true },
  { field: 'seo_description_fa',   type: 'text', nullable: true },

  { field: 'seo_keywords_en',   type: 'string', nullable: true },
  { field: 'seo_keywords_es',   type: 'string', nullable: true },
  { field: 'seo_keywords_ru',   type: 'string', nullable: true },
  { field: 'seo_keywords_ar',   type: 'string', nullable: true },
  { field: 'seo_keywords_fr',   type: 'string', nullable: true },
  { field: 'seo_keywords_pt',   type: 'string', nullable: true },
  { field: 'seo_keywords_de',   type: 'string', nullable: true },
  { field: 'seo_keywords_id',   type: 'string', nullable: true },
  { field: 'seo_keywords_tr',   type: 'string', nullable: true },
  { field: 'seo_keywords_fa',   type: 'string', nullable: true },

  { field: 'image_alt_en',   type: 'string', nullable: true },
  { field: 'image_alt_es',   type: 'string', nullable: true },
  { field: 'image_alt_ru',   type: 'string', nullable: true },
  { field: 'image_alt_ar',   type: 'string', nullable: true },
  { field: 'image_alt_fr',   type: 'string', nullable: true },
  { field: 'image_alt_pt',   type: 'string', nullable: true },
  { field: 'image_alt_de',   type: 'string', nullable: true },
  { field: 'image_alt_id',   type: 'string', nullable: true },
  { field: 'image_alt_tr',   type: 'string', nullable: true },
  { field: 'image_alt_fa',   type: 'string', nullable: true },

  // structured JSON (single canonical sections + inline translations)
  { field: 'sections',  type: 'json', nullable: true },

  // relations (3)
  { field: 'hero_image',  type: 'uuid', nullable: true, relation: 'm2o', related_collection: 'directus_files' },
  { field: 'og_image',     type: 'uuid', nullable: true, relation: 'm2o', related_collection: 'directus_files' },
  { field: 'image',        type: 'uuid', nullable: true, relation: 'm2o', related_collection: 'directus_files' },

  { field: 'date_created',  type: 'timestamp', nullable: true, system: true },
  { field: 'date_updated',  type: 'timestamp', nullable: true, system: true },
  { field: 'user_created',  type: 'uuid',     nullable: true, system: true },
  { field: 'user_updated',  type: 'uuid',     nullable: true, system: true },
];

export const pagesDefinition = {
  collection: 'pages',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: PAGES_FIELDS,
};

// =====================================================================
// 2 junction collections (auto-managed by Directus M2M relations)
// =====================================================================

export const products_filesDefinition = {
  collection: 'products_files',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  // Directus auto-creates junction table fields on M2M relations.create
  // Including: products_id (M2O products), directus_files_id (M2O directus_files)
  fields: [], // populated by Directus at M2M relation create time
};

export const applications_productsDefinition = {
  collection: 'applications_products',
  primary_key_field: 'id',
  primary_key_type: 'uuid',
  fields: [], // auto-managed
};

// =====================================================================
// Aggregated definitions
// =====================================================================

export const ALL_DEFINITIONS = [
  site_settingsDefinition,
  product_categoriesDefinition,
  productsDefinition,
  applicationsDefinition,
  news_categoriesDefinition,
  newsDefinition,
  pagesDefinition,
];

export const ALL_JUNCTION_DEFINITIONS = [
  products_filesDefinition,
  applications_productsDefinition,
];

// =====================================================================
// 16 logical relations
// =====================================================================
export const ALL_RELATIONS = [
  // 1. product_categories self-ref (parent)
  {
    collection: 'product_categories',
    field: 'parent',
    related_collection: 'product_categories',
    relation_type: 'o2m',   // alias type for self-ref
    on_delete: 'RESTRICT',
  },
  // 2. products → product_categories
  {
    collection: 'products',
    field: 'product_category',
    related_collection: 'product_categories',
    relation_type: 'm2o',
    on_delete: 'RESTRICT',
  },
  // 3. products → directus_files (main_image)
  {
    collection: 'products',
    field: 'main_image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 4. products ↔ directus_files (product_images M2M)
  {
    collection: 'products',
    field: 'product_images',
    related_collection: 'directus_files',
    relation_type: 'm2m',
    junction_table: 'products_files',
    on_delete: 'SET NULL',
  },
  // 5. applications → directus_files (image)
  {
    collection: 'applications',
    field: 'image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 6. applications ↔ products (related_products M2M) — SINGLE TRUTH SOURCE
  {
    collection: 'applications',
    field: 'related_products',
    related_collection: 'products',
    relation_type: 'm2m',
    junction_table: 'applications_products',
    on_delete: 'SET NULL',
  },
  // 7. news → news_categories
  {
    collection: 'news',
    field: 'category',
    related_collection: 'news_categories',
    relation_type: 'm2o',
    on_delete: 'RESTRICT',
  },
  // 8. news → directus_files (cover_image)
  {
    collection: 'news',
    field: 'cover_image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 9. pages → directus_files (hero_image)
  {
    collection: 'pages',
    field: 'hero_image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 10. pages → directus_files (og_image)
  {
    collection: 'pages',
    field: 'og_image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 11. pages → directus_files (image)
  {
    collection: 'pages',
    field: 'image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 12. site_settings → directus_files (logo)
  {
    collection: 'site_settings',
    field: 'logo',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 12. site_settings → directus_files (logo_white)
  {
    collection: 'site_settings',
    field: 'logo_white',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 13. site_settings → directus_files (favicon)
  {
    collection: 'site_settings',
    field: 'favicon',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 14. site_settings → directus_files (default_og_image)
  {
    collection: 'site_settings',
    field: 'default_og_image',
    related_collection: 'directus_files',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
  // 15. inquiries → directus_users (assigned_to)
  {
    collection: 'inquiries',
    field: 'assigned_to',
    related_collection: 'directus_users',
    relation_type: 'm2o',
    on_delete: 'SET NULL',
  },
];

// =====================================================================
// Summary counts (for reference / sanity)
// =====================================================================
export const FIELD_COUNT_SUMMARY = {
  site_settings: SITE_SETTINGS_FIELDS.length,                    // 87
  product_categories: PRODUCT_CATEGORIES_FIELDS.length,          // 73
  products: PRODUCTS_FIELDS.length,                              // 107
  applications: APPLICATIONS_FIELDS.length,                        // 81
  news_categories: NEWS_CATEGORIES_FIELDS.length,                  // 48
  news: NEWS_FIELDS.length,                                        // 83
  pages: PAGES_FIELDS.length,                                      // 103
  inquiries_metadata_unchanged: inquiriesMetadata.unchanged_field_names.length,  // 10
  inquiries_metadata_update: Object.keys(inquiriesMetadata.metadata_update_fields).length,  // 1
  inquiries_new_fields: inquiriesMetadata.new_fields.length,      // 7
};

export const RELATION_COUNT_SUMMARY = {
  logical: ALL_RELATIONS.length,                                    // 16
  m2m: ALL_RELATIONS.filter((r) => r.relation_type === 'm2m').length,  // 2
  junction_tables: ALL_JUNCTION_DEFINITIONS.length,                // 2
};