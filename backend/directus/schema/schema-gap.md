# Schema Gap & Dry-Run Diff — 现有 Directus vs v1.5 Universal Core

> 来源：v1.5 §13（Directus 推荐 Collections）+ §26（Canonical Data Dictionary）+ §48（Engineering Baseline）+ 用户指令"existing / create / update / unchanged / optional"分类 + "destructive changes = 0 unless 专项批准"
> 编制时间：2026-10-01 UTC  
> 编制执行者：Claude（只读分析，dry-run 模式，**未实际 Apply**）  
> 状态：**待用户审核**。Phase 2A 完成（Mapping + Compatibility + Schema Gap），暂停等审批。

---

## 1. Collection 级状态总览

| Collection | 状态 | Migration | 备注 |
|---|---|---|---|
| `site_settings` | **create** | create | 当前不存在 |
| `product_categories` | **create** | create | 当前不存在 |
| `products` | **create** | create | 当前不存在 |
| `applications` | **create** | create | 当前不存在 |
| `news_categories` | **create** | create | 当前不存在 |
| `news` | **create** | create | 当前不存在 |
| `pages` | **create** | create | 当前不存在 |
| `inquiries` | **existing + diff** | unchanged + create (add fields only) | **保留 11 字段 + 新增 7 字段；零 destructive** |
| `redirects` | **optional / create** | optional create | 当前无 redirects 数据 |

**destructive changes = 0**  
**create collections = 7（必做）**  
**update collections = 0**  
**delete collections = 0**  
**unchanged collections = 1 system (`inquiries` 11 字段不变)**  
**optional = 1 (`redirects`)**

---

## 2. Collection 字段 Dry-Run Diff

### 2.1 `site_settings`（CREATE - 18 字段）

```text
[CREATE] site_settings
  id          uuid PK           NOT NULL default=null
  status      string enum       NOT NULL default='draft'  (draft/published/archived)
  sort        integer           NULL  default=null
  site_name_en  string          NULL
  site_name_es  string          NULL
  site_name_ru  string          NULL
  site_name_ar  string          NULL
  site_name_fr  string          NULL
  site_name_pt  string          NULL
  site_name_de  string          NULL
  site_name_id  string          NULL
  site_name_tr  string          NULL
  site_name_fa  string          NULL
  tagline_en  string            NULL
  ...
  tagline_fa  string            NULL  (×10)
  company_name_en   string     NULL
  ...
  company_name_fa   string     NULL  (×10)
  company_english_name  string NOT NULL
  address_en  text              NULL
  ...
  address_fa  text              NULL  (×10)
  email       string            NULL
  phone       string            NULL
  whatsapp    string            NULL
  logo        uuid M2O directus_files   NULL
  logo_white  uuid M2O directus_files   NULL
  favicon     uuid M2O directus_files   NULL
  social_links  json            NULL  (array of {platform, url})
  footer_intro_en text          NULL
  ...
  footer_intro_fa text          NULL  (×10)
  default_seo_title_en string    NULL
  ...
  default_seo_description_en text NULL
  ...
  default_og_image  uuid M2O directus_files  NULL
  date_created  timestamp       NULL  (system)
  date_updated  timestamp       NULL  (system)
  user_created  uuid M2O directus_users NULL  (system)
  user_updated  uuid M2O directus_users NULL  (system)
```

**Total fields to create = 95（含 10 语言后缀展开）**

**Constraints / Indexes**：
- `company_english_name` UNIQUE（避免重复）
- `status` enum CHECK
- `email` format CHECK（应用层 + DB 层 email format）
- 系统字段索引：`date_created` / `date_updated`

### 2.2 `product_categories`（CREATE - 25 字段 + 1 relation）

```text
[CREATE] product_categories
  id            uuid PK            NOT NULL
  status        string enum        NOT NULL default='draft'
  sort          integer            NULL  default=0
  slug          string unique      NOT NULL
  parent        uuid M2O self      NULL    -- 关系名: parent_category
  level         integer            NULL    -- system-calculated 1-5
  category_name_en  string         NOT NULL
  category_name_es  string         NULL
  category_name_ru  string         NULL
  category_name_ar  string         NULL
  category_name_fr  string         NULL
  category_name_pt  string         NULL
  category_name_de  string         NULL
  category_name_id  string         NULL
  category_name_tr  string         NULL
  category_name_fa  string         NULL  (×10, en required)
  category_description_en  text    NULL
  ...×10
  image         uuid M2O directus_files  NULL
  image_alt_en  string            NULL
  ...×10
  show_in_menu  boolean           NULL  default=true
  featured      boolean           NULL  default=false
  seo_title_en  string            NULL
  ...×10
  seo_description_en  text         NULL
  ...×10
  seo_keywords_en  string          NULL
  ...×10
  date_created  timestamp         NULL  (system)
  date_updated  timestamp         NULL  (system)
```

**Total fields to create = 87（含 10 语言后缀展开）**

**Relations**：
- `parent` → `product_categories`（M2O self，alias `parent_category`）

**Indexes**：
- UNIQUE `slug`
- INDEX `parent` (FK)
- INDEX `status`
- INDEX `level` (用于 max-5 校验)

**Max 5 级 depth** 通过 application 层 + DB CHECK 约束（level BETWEEN 1 AND 5）保证。

### 2.3 `products`（CREATE - 53 字段 + 3 relations）

```text
[CREATE] products
  id           uuid PK           NOT NULL
  status       string enum       NOT NULL default='draft'
  sort         integer           NULL  default=0
  slug         string unique     NOT NULL
  product_category  uuid M2O product_categories  NOT NULL  -- 关系名
  main_image   uuid M2O directus_files  NULL
  product_images  M2M directus_files  NULL  -- 关系名: product_files
  product_name_en  string         NOT NULL
  ...×10
  short_description_en  text       NULL
  ...×10
  detailed_description_en  rich_text_html  NULL  -- rich text
  ...×10
  specifications  json            NULL  -- array of {key, values: {lang: text}}
  highlights   json              NULL  -- array of strings
  applications  json             NULL  -- array of strings
  image_alt_en string            NULL
  ...×10
  internal_product_code  string   NULL
  moq          string            NULL
  lead_time_en  string           NULL
  ...×10
  packaging_en  string           NULL
  ...×10
  featured_product  boolean       NULL  default=false
  customizable  boolean        NULL  default=false
  seo_title_en  string            NULL
  ...×10
  seo_description_en  text         NULL
  ...×10
  seo_keywords_en  string          NULL
  ...×10
  date_created  timestamp         NULL  (system)
  date_updated  timestamp         NULL  (system)
```

**Total fields to create = 130（含 10 语言后缀展开）**

**Relations**：
- `product_category` → `product_categories`（M2O）
- `main_image` → `directus_files`（M2O）
- `product_images` → `directus_files`（M2M，via `products_files` 中间表）

**Intermediate tables**（v1.5 §13.5）：
- `products_files(id, products_id, directus_files_id, sort, image_alt_*)` — UNIQUE `(products_id, directus_files_id)`

**Indexes**：
- UNIQUE `slug`
- INDEX `product_category` (FK)
- INDEX `status`
- INDEX `featured_product`

### 2.4 `applications`（CREATE - 28 字段 + 2 relations）

```text
[CREATE] applications
  id           uuid PK           NOT NULL
  status       string enum       NOT NULL default='draft'
  sort         integer           NULL  default=0
  slug         string unique     NOT NULL
  title_en     string            NOT NULL
  ...×10
  short_description_en  text      NULL
  ...×10
  content_en   rich_text_html    NULL
  ...×10
  image        uuid M2O directus_files  NULL
  image_alt_en string            NULL
  ...×10
  related_products  M2M products   NULL  -- 中间表 applications_products
  featured     boolean           NULL  default=false
  seo_title_en string            NULL
  ...×10
  seo_description_en text         NULL
  ...×10
  seo_keywords_en string          NULL
  ...×10
  date_created timestamp          NULL  (system)
  date_updated timestamp          NULL  (system)
```

**Total fields to create = 88（含 10 语言后缀展开）**

**Relations**：
- `image` → `directus_files`（M2O）
- `related_products` → `products`（M2M，via `applications_products(id, applications_id, products_id)`，UNIQUE `(applications_id, products_id)`）

**Indexes**：
- UNIQUE `slug`
- INDEX `status`
- INDEX `featured`

### 2.5 `news_categories`（CREATE - 26 字段）

```text
[CREATE] news_categories
  id           uuid PK           NOT NULL
  status       string enum       NOT NULL default='draft'
  sort         integer           NULL  default=0
  slug         string unique     NOT NULL
  category_name_en string        NOT NULL
  ...×10
  description_en  text           NULL
  ...×10
  seo_title_en   string          NULL
  ...×10
  seo_description_en  text        NULL
  ...×10
  date_created timestamp          NULL  (system)
  date_updated timestamp          NULL  (system)
```

**Total fields to create = 80（含 10 语言后缀展开）**

**Indexes**：
- UNIQUE `slug`

### 2.6 `news`（CREATE - 50 字段 + 1 relation）

```text
[CREATE] news
  id           uuid PK           NOT NULL
  status       string enum       NOT NULL default='draft'
  sort         integer           NULL  default=0
  slug         string unique     NOT NULL
  category     uuid M2O news_categories  NOT NULL
  published_at timestamp         NOT NULL
  author       string            NULL
  featured     boolean           NULL  default=false
  title_en     string            NOT NULL
  ...×10
  excerpt_en   text            NULL
  ...×10
  content_en   rich_text_html    NULL
  ...×10
  cover_image  uuid M2O directus_files  NULL
  image_alt_en string            NULL
  ...×10
  seo_title_en  string            NULL
  ...×10
  seo_description_en text         NULL
  ...×10
  seo_keywords_en string          NULL
  ...×10
  date_created timestamp          NULL  (system)
  date_updated timestamp          NULL  (system)
```

**Total fields to create = 126（含 10 语言后缀展开）**

**Relations**：
- `category` → `news_categories`（M2O）
- `cover_image` → `directus_files`（M2O）

**Indexes**：
- UNIQUE `slug`
- INDEX `category` (FK)
- INDEX `published_at` (用于"未来发布日期不提前公开")
- INDEX `status`

### 2.7 `pages`（CREATE - 30 字段）

```text
[CREATE] pages
  id           uuid PK           NOT NULL
  status       string enum       NOT NULL default='draft'
  page_key     string unique     NOT NULL  (5 values: home/about/service/applications/contact)
  slug         string            NOT NULL
  title_en     string            NOT NULL
  ...×10
  hero_title_en   string         NULL
  ...×10
  hero_subtitle_en  string       NULL
  ...×10
  hero_image   uuid M2O directus_files  NULL
  hero_image_alt_en  string      NULL
  ...×10
  hero_button_text_en  string    NULL
  ...×10
  hero_button_link  string       NULL
  sections_en  json              NULL  -- array of {id,type,title,body,image,image_alt,button_text,button_link,sort}
  ...×10
  seo_title_en  string           NULL
  ...×10
  seo_description_en  text        NULL
  ...×10
  seo_keywords_en  string        NULL
  ...×10
  og_image     uuid M2O directus_files  NULL
  image        uuid M2O directus_files  NULL
  image_alt_en  string           NULL
  ...×10
  date_created  timestamp         NULL  (system)
  date_updated  timestamp         NULL  (system)
```

**Total fields to create = 92（含 10 语言后缀展开）**

**Indexes**：
- UNIQUE `page_key`
- UNIQUE `slug`

### 2.8 `inquiries`（EXISTING + DIFF）

```text
[UNCHANGED] (preserve all 11 existing fields verbatim)
  id              integer PK
  customer_name   string NOT NULL
  email           string NOT NULL
  company_name    string NULL
  phone           string NULL
  message         text NOT NULL
  source_page     string NULL
  product_interested  string NULL
  locale          string NULL
  status          string NOT NULL default='pending'
  date_created    timestamp NULL

[CREATE - ADD only, no destructive]
  whatsapp        string NULL  (new)
  country         string NULL  (new)
  date_updated    timestamp NULL  (system-managed)
  internal_notes  text NULL  (Sales Staff / Admin only via permission)
  assigned_to     uuid M2O directus_users NULL  (new)
  outcome         string enum NULL  (won/lost/deferred/no_response/invalid/spam)
  next_follow_up_at  timestamp NULL  (new)
```

**Net effect on inquiries**：
- fields unchanged = 11
- fields added = 7
- fields deleted = **0** ✓
- destructive changes = **0** ✓

**Compatibility Map for value semantics** (per compat-mapping.md §1.1):
- `status = 'pending'` ← maps to v1.5 §26.1 `new`
- API 层/前端层做 status 值转换；DB schema 不动

### 2.9 `redirects`（OPTIONAL - 5 fields）

```text
[CREATE - OPTIONAL]
  id           uuid PK           NOT NULL
  from_path    string unique     NOT NULL
  to_path      string            NOT NULL
  status_code  integer           NULL  default=301
  enabled      boolean           NULL  default=true
```

**Status**: optional. 当前无 redirects 数据；启用需要额外 nginx 集成（`return 301` rules）。**Phase 2A 阶段不推荐启用，待评估**。

---

## 3. Relations 总览

| # | From collection | Field | Type | To collection | Field | On Delete |
|---|---|---|---|---|---|---|
| 1 | product_categories | parent | M2O self | product_categories | id | RESTRICT（避免级联误删）|
| 2 | products | product_category | M2O | product_categories | id | RESTRICT |
| 3 | products | main_image | M2O | directus_files | id | SET NULL |
| 4 | products | product_images | M2M | directus_files | id | SET NULL |
| 5 | applications | image | M2O | directus_files | id | SET NULL |
| 6 | applications | related_products | M2M | products | id | SET NULL |
| 7 | news | category | M2O | news_categories | id | RESTRICT |
| 8 | news | cover_image | M2O | directus_files | id | SET NULL |
| 9 | pages | hero_image | M2O | directus_files | id | SET NULL |
| 10 | pages | og_image | M2O | directus_files | id | SET NULL |
| 11 | pages | image | M2O | directus_files | id | SET NULL |
| 12 | site_settings | logo | M2O | directus_files | id | SET NULL |
| 13 | site_settings | logo_white | M2O | directus_files | id | SET NULL |
| 14 | site_settings | favicon | M2O | directus_files | id | SET NULL |
| 15 | site_settings | default_og_image | M2O | directus_files | id | SET NULL |
| 16 | inquiries | assigned_to | M2O | directus_users | id | SET NULL |

**Total relations to create = 16**

### 3.1 Intermediate junction tables

```text
[CREATE] products_files
  id                   uuid PK           NOT NULL
  products_id          uuid M2O products  NOT NULL
  directus_files_id    uuid M2O directus_files  NOT NULL
  sort                 integer           NULL  default=0
  image_alt_en         string            NULL
  ...×10
  UNIQUE (products_id, directus_files_id)

[CREATE] applications_products
  id                   uuid PK           NOT NULL
  applications_id      uuid M2O applications  NOT NULL
  products_id          uuid M2O products  NOT NULL
  UNIQUE (applications_id, products_id)
```

---

## 4. Indexes / Unique Constraints 汇总

| Type | Collection.Field | Notes |
|---|---|---|
| UNIQUE | product_categories.slug | URL 唯一 |
| UNIQUE | products.slug | URL 唯一 |
| UNIQUE | applications.slug | URL 唯一 |
| UNIQUE | news_categories.slug | URL 唯一 |
| UNIQUE | news.slug | URL 唯一 |
| UNIQUE | pages.page_key | 内部稳定键 |
| UNIQUE | pages.slug | URL 唯一 |
| UNIQUE | redirects.from_path | URL 唯一（optional）|
| UNIQUE | site_settings.company_english_name | 单值占位 |
| INDEX | product_categories.parent | FK |
| INDEX | product_categories.status | 列表过滤 |
| INDEX | product_categories.level | max-5 校验 |
| INDEX | products.product_category | FK + 分类筛选 |
| INDEX | products.status | 发布状态过滤 |
| INDEX | products.featured_product | 首页推荐 |
| INDEX | applications.status | 状态过滤 |
| INDEX | applications.featured | 推荐 |
| INDEX | news.category | FK + 分类筛选 |
| INDEX | news.published_at | 时间排序 + "未来日期不公开" |
| INDEX | news.status | 状态过滤 |
| INDEX | inquiries.status | 跟进过滤 |
| INDEX | inquiries.date_created | 时间排序 |
| INDEX | inquiries.assigned_to | 业务员筛选 |
| INDEX | inquiries.next_follow_up_at | 逾期待跟进 |
| INDEX | inquiries.outcome | 结果筛选 |

---

## 5. Roles / Policies / Permissions Dry-Run Diff

### 5.1 现有 Directus 状态（保留）
- roles: 系统默认（Administrator 已存在）
- policies: 3 个（Administrator、Policy for Administrator、$t:public_label）
- permissions: 20 条
- users: 1 个（admin@huanyukuntaichem.com，role: Administrator）

### 5.2 v1.5 §13 矩阵（拟新增）

| Role / Policy | 权限 | 主要目标 collection |
|---|---|---|
| **Administrator** | 全部 | 全部（已有） |
| **Content Editor** | CRUD products / categories / news / pages / applications / public media | 不含 inquiries、users、schema |
| **Product Manager** | CRUD products / product_categories / product media | 不含 news / inquiries / schema |
| **Sales Staff** | R inquiries + U inquiries.status / assigned_to / outcome / next_follow_up_at / internal_notes | 不含 schema / users / products |
| **SEO Editor** | U products / categories / news / pages 的 `seo_*` / `image_alt_*` 字段 | 不能改正文 / schema |
| **Website Reader Token**（service token） | R published-only on products / categories / news / pages / applications / site_settings | 不能 R inquiries / users / private files |
| **Inquiry Writer Token**（service token） | C inquiries（仅白名单字段：name / email / company / phone / message / source_path / product_slug / locale；status 强制 'new'） | 不能 R / U / D inquiries / 不能写其他 collection |
| **Public** | 仅 R `is_public=true` 的 directus_files；其他 collection 无访问 | 默认无权限 |

### 5.3 Permissions dry-run
- Total new policies: **5**（Content Editor, Product Manager, Sales Staff, SEO Editor, Website Reader, Inquiry Writer）
  - Wait, counting: Administrator (existing), Content Editor, Product Manager, Sales Staff, SEO Editor, Website Reader Token, Inquiry Writer Token = 7 total policies; 6 new
- Total new permissions: 估算 ~50+（每个 role × 每个 collection × CRUD subset）
- destructive = **0**（不删现有 20 个 permissions；不删现有 3 个 policies）

**注意**：这些 role / policy 名称与现有 Administrator 已存在 policy 是不同的（ID 不同），所以不存在重名冲突。

---

## 6. 幂等性（Idempotency）保证

apply-schema.mjs 的设计要求：
1. **第一次运行**：报告 create N collections / N fields / N relations / N policies
2. **第二次运行**：报告 0 unexpected changes（重复运行不创建重复字段）
3. **检测逻辑**：
   - 通过 collection name 检查是否已存在
   - 通过 field name + collection 检查字段是否已存在
   - 通过 policy name 检查 policy 是否已存在
4. **删除 / 修改保护**：除非显式 `--force-destructive` flag 且用户确认，否则不做 destructive 操作

---

## 7. Dry-run 总汇总

```text
=== apply-schema dry-run (idempotent, non-destructive) ===

Collections to CREATE:  7  (site_settings, product_categories, products, applications, news_categories, news, pages)
Collections UNCHANGED:   1  (inquiries, with 7 fields added)
Collections DELETE:      0
Collections UPDATE:      0

Intermediate tables CREATE:  2  (products_files, applications_products)
Optional CREATE:            1  (redirects, if enabled)

Fields to CREATE:          ~700  (sum across all new collections)
Fields UNCHANGED:           11    (inquiries existing 11 fields)
Fields DELETE:             0
Fields UPDATE:             0     (no rename, no type change)

Relations CREATE:          16  (all M2O / M2M as listed)
Relations DELETE:          0

Indexes / Unique CREATE:   ~25
Indexes DELETE:             0

Policies CREATE:            6  (Content Editor, Product Manager, Sales Staff, SEO Editor, Website Reader, Inquiry Writer)
Policies UNCHANGED:        3  (existing)
Policies DELETE:           0

Permissions CREATE:        ~50  (estimated; exact count depends on policy matrix)
Permissions UNCHANGED:     20
Permissions DELETE:        0

DESTRUCTIVE CHANGES:       0
EXPECTED UNEXPECTED CHANGES ON 2nd RUN: 0
```

---

## 8. 待审批项（Phase 2A 暂停点）

| # | 待审批内容 |
|---|---|
| 1 | 上述 7 个新 Collection 的字段定义是否符合 v1.5 §13 规范？ |
| 2 | inquiries 保留 11 字段 + 新增 7 字段的策略是否接受？ |
| 3 | `status = 'pending'` 与 v1.5 枚举的映射方案（API 层转换）是否接受？ |
| 4 | 16 个 Relations + 2 个 Junction Tables 是否接受？ |
| 5 | 6 个新 Policies + 角色矩阵（Content Editor / Product Manager / Sales Staff / SEO Editor / Website Reader Token / Inquiry Writer Token）是否接受？ |
| 6 | redirects collection 是否启用？ |
| 7 | 字段命名前缀（`category_name_*` / `product_name_*` / `category_description_*` / `short_description_*` 等）是否接受？这些是 v1.5 §26 + 现有 products.ts query 的字段名，必须保持一致 |
| 8 | destructive changes = 0 的承诺是否能接受？ |

---

**Phase 2A 暂停，等你审批。**