# Schema Gap & Dry-Run Diff — 现有 Directus vs v1.5 Universal Core（重新实测）

> 来源：v1.5 §13（Directus 推荐 Collections）+ §26（Canonical Data Dictionary）+ §43（询盘安全契约）+ §44（生命周期）+ §48（Engineering Baseline）+ Owner Audit 修正  
> 编制时间：2026-10-01 UTC（Owner Audit 修正版）  
> 编制执行者：Claude（只读分析，dry-run 模式，**未实际 Apply**）  
> 状态：**待用户审批**。Phase 2A 已重新审计，destructive changes = 0

---

## 1. Collection 级状态总览

| Collection | 状态 | Migration | 备注 |
|---|---|---|---|
| `site_settings` | **create** | create | 当前不存在；Singleton |
| `product_categories` | **create** | create | 当前不存在；31 条 fallback 映射 |
| `products` | **create** | create | 当前不存在；**28 条 fallback 映射（修正）** |
| `applications` | **create** | create | 当前不存在；8 条 fallback 映射 |
| `news_categories` | **create** | create | 当前不存在；6 条去重映射 |
| `news` | **create** | create | | 当前不存在；10 条 fallback 映射 |
| `pages` | **create** | create | 当前不存在；5 个 page_key |
| `inquiries` | **existing + diff** | **field-name preserved + status enum/default replaced + 7 fields added** | **保留所有现有 11 字段名；status choices/default 替换（非 destructive：0 records）；新增 7 字段；零 destructive** |
| `redirects` | **optional / create** | optional create（本期不启用） | 当前无 redirects 数据 |

**destructive changes = 0**  
**create collections = 7**  
**update collections = 0**（inquiries 是 metadata-only update，不属 destructive）  
**delete collections = 0**  
**unchanged collections = 1**（inquiries 11 字段保留）

---

## 2. Per-Collection 字段精确计数

公式：Total = Base + Single-value + Translatable-source × 10 + Relation + JSON

### 2.1 `site_settings` (CREATE Singleton)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, sort, date_created, date_updated, user_created, user_updated | 7 |
| **Single-value (non-translatable)** | company_english_name, email, phone, whatsapp, social_links | 5 |
| **Translatable source fields** | site_name, tagline, company_name, address, footer_intro, default_seo_title, default_seo_description | **7 source fields** |
| **Translatable ×10 expanded** | site_name_en/es/ru/ar/fr/pt/de/id/tr/fa, tagline_*×10, company_name_*×10, address_*×10, footer_intro_*×10, default_seo_title_*×10, default_seo_description_*×10 | **70 fields** |
| **Relation (M2O file)** | logo, logo_white, favicon, default_og_image | 4 |
| **JSON structured** | social_links（已在 single-value 中） | 0 |
| **Total** | | **86 fields** |

### 2.2 `product_categories` (CREATE · 31 records)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, sort, date_created, date_updated, user_created, user_updated | 7 |
| **Single-value** | slug (unique), level, show_in_menu, featured | 4 |
| **Translatable source fields** | category_name (en required), category_description, image_alt, seo_title, seo_description, seo_keywords | **6 source fields** |
| **Translatable ×10 expanded** | ×10 each | **60 fields** |
| **Relation (M2O self)** | parent | 1 |
| **Relation (M2O file)** | image | 1 |
| **JSON** | — | 0 |
| **Total** | | **73 fields** |

### 2.3 `products` (CREATE · 28 records · 修正)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, sort, date_created, date_updated, user_created, user_updated | 7 |
| **Single-value** | slug (unique), internal_product_code, moq, featured_product, customizable | 5 |
| **Translatable source fields** | product_name (en required), short_description, detailed_description, lead_time, packaging, image_alt, seo_title, seo_description, seo_keywords | **9 source fields** |
| **Translatable ×10 expanded** | ×10 each | **90 fields** |
| **Relation (M2O)** | product_category, main_image | 2 |
| **Relation (M2M files)** | product_images (via products_files) | 1 |
| **JSON structured** | specifications, highlights, applications | 3 |
| **Total** | | **108 fields** |

**Specifications 替代的固定列**（v1.5 §4.3 + §26.1 建议进 Structured Block 而非固定列）：
- CAS No.（CAS Number）→ 进 specifications JSON
- Appearance（外观） → 进 specifications JSON
- Purity（纯度） → 进 specifications JSON
- Shelf Life（保质期） → 进 specifications JSON
- Storage Condition（存储条件） → 进 specifications JSON
- Viscosity / Flash Point / Density / pH / Dosage → 进 specifications JSON（**不**为这些化工属性创建独立固定列）
- 行业专用的临时属性 → 进 specifications JSON

**商务信息字段保留为单值 / 翻译字段**（因与产品规格不同）：
- moq (string)、lead_time_*、packaging_*、customizable (boolean)

### 2.4 `applications` (CREATE · 8 records)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, sort, date_created, date_updated, user_created, user_updated | 7 |
| **Single-value** | slug (unique), featured | 2 |
| **Translatable source fields** | title (en required), short_description, content, image_alt, seo_title, seo_description, seo_keywords | **7 source fields** |
| **Translatable ×10 expanded** | ×10 each | **70 fields** |
| **Relation (M2O file)** | image | 1 |
| **Relation (M2M products)** | related_products (via applications_products) | 1 |
| **Total** | | **81 fields** |

### 2.5 `news_categories` (CREATE · 6 records 去重)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, sort, date_created, date_updated, user_created, user_updated | 7 |
| **Single-value** | slug (unique) | 1 |
| **Translatable source fields** | category_name (en required), description, seo_title, seo_description | **4 source fields** |
| **Translatable ×10 expanded** | ×10 each | **40 fields** |
| **Total** | | **48 fields** |

### 2.6 `news` (CREATE · 10 records)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, sort, published_at, date_created, date_updated, user_created, user_updated | 9 |
| **Single-value** | slug (unique), author, featured | 3 |
| **Translatable source fields** | title (en required), excerpt, content, image_alt, seo_title, seo_description, seo_keywords | **7 source fields** |
| **Translatable ×10 expanded** | ×10 each | **70 fields** |
| **Relation (M2O)** | category (news_categories), cover_image (directus_files) | 2 |
| **Total** | | **84 fields** |

### 2.7 `pages` (CREATE · 5 page_keys)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Base (system)** | id, status, date_created, date_updated, user_created, user_updated | 6 |
| **Single-value** | page_key (unique), slug, hero_button_link | 3 |
| **Translatable source fields** | title, hero_title, hero_subtitle, hero_image_alt, hero_button_text, sections, seo_title, seo_description, seo_keywords, image_alt | **10 source fields** |
| **Translatable ×10 expanded** | ×10 each | **100 fields** |
| **Relation (M2O file)** | hero_image, og_image, image | 3 |
| **JSON structured (sections)** | sections_* (×10) | (含在 ×10 expanded 中) |
| **Total** | | **112 fields** |

**sections_ JSON 块结构**（v1.5 §8.3 Structured Block）：
```json
[{
  "id": "block-id-stable",
  "type": "text|image_text|features|faq|cta|process",
  "title": "...",
  "body": "...",
  "image": "file-uuid-or-null",
  "image_alt": "...",
  "button_text": "...",
  "button_link": "...",
  "sort": 1
}]
```

### 2.8 `inquiries` (EXISTING + DIFF · status enum 替换 + 7 字段新增)

| 类型 | 字段 | 数量 | 状态 |
|---|---|---|---|
| **Unchanged (existing)** | id (integer PK), customer_name, email, company_name, phone, message, source_page, product_interested, locale, date_created | **10** | unchanged |
| **Metadata-only update (non-destructive)** | status (field name preserved; choices `[pending, handled]` → `[new, contacted, qualified, quoted, follow_up, closed]`; default `pending` → `new`；**0 records 决定非 destructive**) | 1 | update (metadata-only) |
| **New added** | date_updated, whatsapp, country, assigned_to (M2O users), internal_notes, outcome (enum won/lost/deferred/no_response/invalid/spam), next_follow_up_at | **7** | create |
| **Total** | | **18 fields** | |

**status 处理细则**（Owner Audit 修正）：
- ❌ 不保留 `pending` 作为 legacy runtime value
- ❌ 不增加 API 翻译层（`pending ↔ new`）
- ✅ DB enum choices 直接替换为 v1.5 canonical `[new, contacted, qualified, quoted, follow_up, closed]`
- ✅ DB default value 直接替换为 `new`
- ✅ 字段名 `status` 保留（v1.5 §26.1 字段名也叫 `status`）
- ✅ 0 records 保证此替换**非 destructive**

### 2.9 `redirects` (OPTIONAL · 本期不启用)

| 类型 | 字段 | 数量 |
|---|---|---|
| **Single-value** | id (UUID PK), from_path (unique), to_path, status_code (int default 301), enabled (boolean default true) | 5 |

---

## 3. 全局字段总数（修正实测）

| Collection | Total fields |
|---|---|
| site_settings | 86 |
| product_categories | 73 |
| products | **108** |
| applications | 81 |
| news_categories | 48 |
| news | 84 |
| pages | 112 |
| inquiries | **18** (10 unchanged + 1 update + 7 new) |
| **GRAND TOTAL (业务 collections)** | **610** |
| redirects (optional) | +5 |
| System fields (id/status/sort/date_*/user_*) | (含在 each) |
| **System tables (directus_*)** | 29 collections (不动) |

**Phase 2A v1 "约 700 字段"** 表述已修正为精确计数 **610**（不含 redirects / 不含 system）。

---

## 4. Relations 全清单（20 条 · 逐条列出）

| # | Source Collection | Source Field | Target Collection | Target Field | Relation Type | Junction Table | Nullable | On Delete |
|---|---|---|---|---|---|---|---|---|
| 1 | product_categories | parent | product_categories | id | M2O self | (none) | YES | RESTRICT |
| 2 | products | product_category | product_categories | id | M2O | (none) | NO（published 必填） | RESTRICT |
| 3 | products | main_image | directus_files | id | M2O | (none) | YES | SET NULL |
| 4 | products | product_images | directus_files | id | M2M | products_files | YES | SET NULL |
| 5 | applications | image | directus_files | id | M2O | (none) | YES | SET NULL |
| 6 | applications | related_products | products | id | M2M | applications_products | YES | SET NULL |
| 7 | news | category | news_categories | id | M2O | (none) | NO（published 必填） | RESTRICT |
| 8 | news | cover_image | directus_files | id | M2O | (none) | YES | SET NULL |
| 9 | pages | hero_image | directus_files | id | M2O | (none) | YES | SET NULL |
| 10 | pages | og_image | directus_files | id | M2O | (none) | YES | SET NULL |
| 11 | pages | image | directus_files | id | M2O | (none) | YES | SET NULL |
| 12 | site_settings | logo | directus_files | id | M2O | (none) | YES | SET NULL |
| 13 | site_settings | logo_white | directus_files | id | M2O | (none) | YES | SET NULL |
| 14 | site_settings | favicon | directus_files | id | M2O | (none) | YES | SET NULL |
| 15 | site_settings | default_og_image | directus_files | id | M2O | (none) | YES | SET NULL |
| 16 | inquiries | assigned_to | directus_users | id | M2O | (none) | YES | SET NULL |
| 17 | products_files (junction) | products_id | products | id | M2O | (junction table) | NO | CASCADE |
| 18 | products_files (junction) | directus_files_id | directus_files | id | M2O | (junction table) | NO | CASCADE |
| 19 | applications_products (junction) | applications_id | applications | id | M2O | (junction table) | NO | CASCADE |
| 20 | applications_products (junction) | products_id | products | id | M2O | (junction table) | NO | CASCADE |

**Total relations: 20**  
**Junction tables: 2**（products_files, applications_products）

**UNIQUE Constraints on Junction Tables**:
- `products_files`: UNIQUE `(products_id, directus_files_id)` + 包含 `sort` + `image_alt_*` (×10)
- `applications_products`: UNIQUE `(applications_id, products_id)`

---

## 5. RBAC 角色 / Policy 设计（含 Administrator & Public）

### 5.1 现状（保留）

| Role | ID | Admin | App | Users |
|---|---|---|---|---|
| Administrator | `00d19e33-1a51-4840-9344-9f1c718fab70` | (none) | (none) | 0 |
| Administrator | `6bdc716e-5e30-49cf-b302-357be132af3a` | (none) | (none) | 1（admin@huanyukuntaichem.com） |

**注**：现状两个角色都叫 "Administrator"。Phase 2B 需保留（保留字段名同），但需要确认到底应用哪个对应 admin 用户。**不修改现有字段名**（兼容性要求）。

### 5.2 Policies 现状（保留）

| Policy | ID | Admin Access | App Access | 用途 |
|---|---|---|---|---|
| "Policy for Administrator" | 0c2980e0 | True | True | 系统策略 |
| "Administrator" | 223e98c3 | True | True | 系统策略 |
| "$t:public_label" | abf8a154 | **False** | **False** | **Public 角色（v1.5 §0.3）** |

**注**：Directus 11 内置的 `Public` 角色由 `$t:public_label` policy 表达；admin=False + app=False 表示该策略不授予 admin/app 访问权。

### 5.3 拟新增 Policies（6 个）

| New Policy | 关联 Role / Token | Admin Access | App Access |
|---|---|---|---|
| Content Editor Policy | Content Editor role | False | False |
| Product Manager Policy | Product Manager role | False | False |
| Sales Staff Policy | Sales Staff role | False | False |
| SEO Editor Policy | SEO Editor role | False | False |
| Website Reader Policy | Website Reader Token（static token） | False | True |
| Inquiry Writer Policy | Inquiry Writer Token（static token） | False | False |

### 5.4 Roles 拟新增（4 个 Role）

| Role | Type | Note |
|---|---|---|
| Content Editor | 用户角色 | 内容编辑 + 媒体 |
| Product Manager | 用户角色 | 产品 + 产品分类 |
| Sales Staff | 用户角色 | 询盘跟进 |
| SEO Editor | 用户角色 | SEO 字段 |

**Service Tokens**（2 个，非 role，独立 token）：
- Website Reader Token：Next.js 服务端只读 published 内容
- Inquiry Writer Token：Next.js 服务端只写 inquiries 白名单字段

### 5.5 Public 角色（v1.5 §0.3 + §43.1）· Least-Privilege Matrix

| Collection / Action | Read | Create | Update | Delete |
|---|---|---|---|---|
| products | ❌（必须 published 且仅 is_public file） | ❌ | ❌ | ❌ |
| product_categories | ❌ | ❌ | ❌ | ❌ |
| news / news_categories | ❌ | ❌ | ❌ | ❌ |
| applications | ❌ | ❌ | ❌ | ❌ |
| pages | ❌ | ❌ | ❌ | ❌ |
| site_settings | ❌ | ❌ | ❌ | ❌ |
| inquiries | ❌ | ❌ | ❌ | ❌ |
| directus_users | ❌ | ❌ | ❌ | ❌ |
| directus_files | ✅ 仅 `is_public=true` 的文件（via `/assets/<id>` 直链）；列表遍历 ❌ | ❌ | ❌ | ❌ |
| directus_activity / comments / presets | ❌ | ❌ | ❌ | ❌ |
| directus_collections / fields / relations | ❌ | ❌ | ❌ | ❌ |
| directus_roles / policies | ❌ | ❌ | ❌ | ❌ |

**Public API Key 不可触碰的范围**：
- ❌ 业务集合任何 CRUD
- ❌ 询盘任何操作
- ❌ 系统集合（schema / users / permissions / settings）
- ❌ 私有文件（`is_public=false`）
- ✅ 仅直链访问 `is_public=true` 的媒体文件

### 5.6 Inquiry Writer Token（v1.5 §43.2）· Least-Privilege Matrix

| Collection / Action | Read | Create | Update | Delete |
|---|---|---|---|---|
| **inquiries** | ❌ | ✅ **白名单字段** | ❌ | ❌ |
| Other collections | ❌ | ❌ | ❌ | ❌ |
| directus_users / system | ❌ | ❌ | ❌ | ❌ |
| directus_files | ❌ | ❌ | ❌ | ❌ |

**Inquiry Writer 创建白名单字段**（v1.5 §43.2 + §26.1）：
- ✅ 允许写入：`name` / `email` / `company` / `phone` / `whatsapp` / `country` / `message` / `source_path` / `product_slug` / `locale`
- ✅ 强制 status = `new`（不允许传值覆盖）
- ✅ date_created / id 由系统产生（不允许传入）
- ❌ 禁止：传 id / date_created / status / date_updated / internal_notes / assigned_to / outcome / next_follow_up_at

**Inquiry Writer 不可触碰的范围**：
- ❌ 任何 list / read / update / delete
- ❌ 历史询盘数据
- ❌ 任何其他 collection
- ❌ server log 不能记录完整 email / phone / message（v1.5 §43.1）

### 5.7 Content Editor / Product Manager / Sales Staff / SEO Editor · 角色矩阵

| Collection ↓ / Role → | Content Editor | Product Manager | Sales Staff | SEO Editor |
|---|---|---|---|---|
| products | R published + U non-SEOs | **CRU all** | R | **U seo_* / image_alt_*** |
| product_categories | R published + U non-SEOs | **CRU all** | R | **U seo_* / image_alt_*** |
| applications | CRU | R | R | **U seo_* / image_alt_*** |
| news | **CRU all** | R | R | **U seo_* / image_alt_*** |
| news_categories | CRU | R | R | **U seo_* / image_alt_*** |
| pages | **CRU all** | R | R | **U seo_* / image_alt_*** |
| site_settings | RU non-secrets | R | R | **U seo_* / default_seo_*** |
| inquiries | ❌ | ❌ | **RU**（status / assigned_to / outcome / internal_notes / next_follow_up_at） | ❌ |
| directus_files | **CRUD is_public=true only** | R+W product images | ❌ | R |
| directus_users | R (limited fields) | R | R | R |
| Schema / system | ❌ | ❌ | ❌ | ❌ |

### 5.8 Administrator（保留现有）

| Property | Value |
|---|---|
| Role ID | `6bdc716e-5e30-49cf-b302-357be132af3a`（admin@huanyukuntaichem.com 所在） |
| Policy | "Administrator" / "Policy for Administrator" |
| Access | 全部（admin=True, app=True） |
| 用途 | 系统管理 + 业务后台全权 |
| 不可用于前端 API | ✓（v1.5 §43.2 + §0.3） |

### 5.9 Policies 总览

| # | Policy | 来源 | Admin | App |
|---|---|---|---|---|
| 1 | "Policy for Administrator" | existing | True | True |
| 2 | "Administrator" | existing | True | True |
| 3 | "$t:public_label" (= Public) | existing | False | False |
| 4 | Content Editor Policy | **new** | False | False |
| 5 | Product Manager Policy | **new** | False | False |
| 6 | Sales Staff Policy | **new** | False | False |
| 7 | SEO Editor Policy | **new** | False | False |
| 8 | Website Reader Policy | **new** | False | True |
| 9 | Inquiry Writer Policy | **new** | False | False |

**Total policies**: 3 existing + 6 new = **9 policies** (destructive = 0)

### 5.10 Permissions 预估

- Content Editor Policy: products/categories/news/pages/applications + media + settings 业务字段 = ~30 permissions
- Product Manager Policy: products + product_categories + media = ~15 permissions
- Sales Staff Policy: inquiries (RU 部分字段) = ~5 permissions
- SEO Editor Policy: products/categories/news/pages/applications/settings seo_* + image_alt_* = ~20 permissions
- Website Reader Policy: products/categories/news/pages/applications/settings（published-only） + is_public file = ~12 permissions
- Inquiry Writer Policy: inquiries create (白名单字段) = 1 permission
- **Total new permissions ≈ 80**

加上 existing 20 permissions，**总计 ~100 permissions**。

---

## 6. Indexes / Unique Constraints

| Type | Field |
|---|---|
| UNIQUE | product_categories.slug |
| UNIQUE | products.slug |
| UNIQUE | applications.slug |
| UNIQUE | news_categories.slug |
| UNIQUE | news.slug |
| UNIQUE | pages.page_key |
| UNIQUE | pages.slug |
| UNIQUE | site_settings.company_english_name |
| UNIQUE | redirects.from_path (optional) |
| UNIQUE | products_files(products_id, directus_files_id) |
| UNIQUE | applications_products(applications_id, products_id) |
| INDEX | product_categories.parent (FK) |
| INDEX | product_categories.status |
| INDEX | product_categories.level (max-5 校验) |
| INDEX | products.product_category |
| INDEX | products.status |
| INDEX | products.featured_product |
| INDEX | applications.status |
| INDEX | applications.featured |
| INDEX | news.category |
| INDEX | news.published_at |
| INDEX | news.status |
| INDEX | inquiries.status |
| INDEX | inquiries.date_created |
| INDEX | inquiries.assigned_to |
| INDEX | inquiries.next_follow_up_at |
| INDEX | inquiries.outcome |

---

## 7. 幂等性（Idempotency）

apply-schema.mjs 设计保证：

1. **第 1 次运行**：报告 create N collections / N fields / N relations / N policies / N permissions
2. **第 2 次运行**：报告 **0 unexpected changes**（不创建重复字段、不重复收集）
3. **检测逻辑**：
   - 通过 collection name 检查存在
   - 通过 field name + collection 检查字段存在
   - 通过 policy / role name 检查存在
   - 通过 permission (policy, collection, action, fields) 元组检查存在
4. **删除 / 修改保护**：除非 `--force-destructive` flag + 用户确认，否则不执行 destructive 操作

---

## 8. Dry-Run 总汇总（修正版）

```text
=== apply-schema dry-run (idempotent, non-destructive) ===

Collections CREATE:        7
  site_settings, product_categories, products,
  applications, news_categories, news, pages
Collections UNCHANGED:     1  (inquiries, all 11 field names preserved)
Collections UPDATE:        0
Collections DELETE:        0
Intermediate tables CREATE: 2  (products_files, applications_products)
Optional CREATE:            1  (redirects, if enabled)

Fields CREATE:             ~610  (精确按 per-collection 计数)
Fields UNCHANGED:          10  (inquiries 现有 10 个字段名)
Fields UPDATE (metadata):  1    (inquiries.status enum + default，非 destructive)
Fields DELETE:             0
Fields RENAMED:            0

Relations CREATE:          20  (16 M2O + 2 M2M + 2 junction M2O)
Relations DELETE:          0

Policies CREATE:           6   (Content Editor, Product Manager, Sales Staff, SEO Editor, Website Reader, Inquiry Writer)
Policies UNCHANGED:        3   (existing 3)
Policies DELETE:           0

Roles CREATE:               4   (Content Editor, Product Manager, Sales Staff, SEO Editor)
Roles UNCHANGED:           2   (existing 2 Administrator)
Roles DELETE:               0

Permissions CREATE:        ~80
Permissions UNCHANGED:     20
Permissions DELETE:        0

Indexes / Unique CREATE:   ~22
Indexes DELETE:             0

DESTRUCTIVE CHANGES:       0
EXPECTED UNEXPECTED ON 2nd RUN: 0
```

---

## 9. inquiries.status 处理（Owner Audit 修正）

| 项 | v1 处理 | **v2 处理（Owner Audit 修正）** |
|---|---|---|
| Field name | status | status（**保留**） |
| Choices (enum) | `[pending, handled]` | `[new, contacted, qualified, quoted, follow_up, closed]`（**v1.5 canonical**） |
| Default value | `pending` | `new`（**v1.5 canonical**） |
| Legacy `pending` | 保留为 runtime | **不保留**（0 records 决定） |
| API 翻译层 | 计划 | **不增加** |
| 记录迁移 | N/A（0 records） | **不需要**（字段 enum 替换 + default 替换都对 0 records 无影响） |
| Destructive? | NO | **NO** |

---

## 10. 待审批项（Phase 2A 修正后 · 9 项）

| # | 待审批 |
|---|---|
| 1 | 7 个新 Collection 的字段定义 |
| 2 | inquiries 保留所有字段名 + status enum/default 替换策略 |
| 3 | products / categories / news / applications 的 fallback 全部 28 / 31 / 10 / 8 / 6 条实测量 |
| 4 | 20 个 Relations + 2 个 Junction Tables 逐条 |
| 5 | 6 个新 Policies + 4 个新 Roles + 2 个 Service Tokens |
| 6 | **Public 角色** Least-Privilege Matrix（仅读 `is_public=true` 文件） |
| 7 | **Inquiry Writer Token** Least-Privilege Matrix（仅 create 白名单字段） |
| 8 | Specifications 进 JSON 而非固定列（化工属性） |
| 9 | destructive changes = 0 + 重复运行零非预期变化 |

---

**Phase 2A 修正完成 · 暂停等审批。**