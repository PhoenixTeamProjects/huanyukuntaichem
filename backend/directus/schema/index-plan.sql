-- backend/directus/schema/index-plan.sql
--
-- Phase 2B planned indexes and unique constraints.
--
-- This file is IDEMPOTENT SQL for future execution IF Directus API
-- cannot create the required non-unique indexes.
--
-- STATUS: NOT EXECUTED IN PRODUCTION (Phase 2B marked BLOCKED_CORRECTIVE)
--
-- Before any execution:
--   1. Re-validate against actual Directus 11.17.4 disposable instance
--   2. Owner issues explicit PHOENIX_SCHEMA_APPROVED_NEXT_NONCE
--   3. Apply in production
--
-- Concurrency:
--   Use CREATE INDEX IF NOT EXISTS (PostgreSQL 9.5+)
--
-- DO NOT run this against production without separate explicit approval.

BEGIN;

-- =====================================================
-- UNIQUE CONSTRAINTS
-- =====================================================

-- Directus API emits UNIQUE automatically for fields with schema.is_unique = true.
-- These declarations document the planned values.
-- The Apply path in apply-schema.mjs sets schema.is_unique = true on POST /fields.

-- ALTER TABLE product_categories ADD CONSTRAINT uq_product_categories_slug UNIQUE (slug);
-- ALTER TABLE products             ADD CONSTRAINT uq_products_slug UNIQUE (slug);
-- ALTER TABLE applications        ADD CONSTRAINT uq_applications_slug UNIQUE (slug);
-- ALTER TABLE news_categories     ADD CONSTRAINT uq_news_categories_slug UNIQUE (slug);
-- ALTER TABLE news                ADD CONSTRAINT uq_news_slug UNIQUE (slug);
-- ALTER TABLE pages               ADD CONSTRAINT uq_pages_page_key UNIQUE (page_key);

-- =====================================================
-- NON-UNIQUE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_product_categories_parent  ON product_categories (parent);
CREATE INDEX IF NOT EXISTS idx_product_categories_status  ON product_categories (status);
CREATE INDEX IF NOT EXISTS idx_product_categories_level   ON product_categories (level);

CREATE INDEX IF NOT EXISTS idx_products_category          ON products (product_category);
CREATE INDEX IF NOT EXISTS idx_products_status            ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_featured          ON products (featured_product);

CREATE INDEX IF NOT EXISTS idx_applications_status        ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_featured      ON applications (featured);

CREATE INDEX IF NOT EXISTS idx_news_category              ON news (category);
CREATE INDEX IF NOT EXISTS idx_news_published_at          ON news (published_at);
CREATE INDEX IF NOT EXISTS idx_news_status                ON news (status);

CREATE INDEX IF NOT EXISTS idx_inquiries_status           ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_date_created     ON inquiries (date_created);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to      ON inquiries (assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_next_follow_up_at ON inquiries (next_follow_up_at);

-- =====================================================
-- JUNCTION TABLE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_files_product     ON products_files (products_id);
CREATE INDEX IF NOT EXISTS idx_products_files_file        ON products_files (directus_files_id);

CREATE INDEX IF NOT EXISTS idx_applications_products_app   ON applications_products (applications_id);
CREATE INDEX IF NOT EXISTS idx_applications_products_prod ON applications_products (products_id);

COMMIT;

-- =====================================================
-- ROLLBACK (NOT FOR PRODUCTION USE)
-- =====================================================
--
-- DROP INDEX IF EXISTS idx_inquiries_next_follow_up_at;
-- DROP INDEX IF EXISTS idx_inquiries_assigned_to;
-- DROP INDEX IF EXISTS idx_inquiries_date_created;
-- DROP INDEX IF EXISTS idx_inquiries_status;
-- DROP INDEX IF EXISTS idx_applications_products_prod;
-- DROP INDEX IF EXISTS idx_applications_products_app;
-- DROP INDEX IF EXISTS idx_products_files_file;
-- DROP INDEX IF EXISTS idx_products_files_product;
-- DROP INDEX IF EXISTS idx_news_status;
-- DROP INDEX IF EXISTS idx_news_published_at;
-- DROP INDEX IF EXISTS idx_news_category;
-- DROP INDEX IF EXISTS idx_applications_featured;
-- DROP INDEX IF EXISTS idx_applications_status;
-- DROP INDEX IF EXISTS idx_products_featured;
-- DROP INDEX IF EXISTS idx_products_status;
-- DROP INDEX IF EXISTS idx_products_category;
-- DROP INDEX IF EXISTS idx_product_categories_level;
-- DROP INDEX IF EXISTS idx_product_categories_status;
-- DROP INDEX IF EXISTS idx_product_categories_parent;
-- ALTER TABLE pages DROP CONSTRAINT uq_pages_page_key;
-- ALTER TABLE news DROP CONSTRAINT uq_news_slug;
-- ALTER TABLE news_categories DROP CONSTRAINT uq_news_categories_slug;
-- ALTER TABLE applications DROP CONSTRAINT uq_applications_slug;
-- ALTER TABLE products DROP CONSTRAINT uq_products_slug;
-- ALTER TABLE product_categories DROP CONSTRAINT uq_product_categories_slug;