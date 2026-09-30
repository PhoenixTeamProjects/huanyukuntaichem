# Compatibility Map — 历史字段与 v1.5 Canonical Dictionary 映射（v4 修正）

> 来源：v1.5 §26 + §14.2 + §45 + Owner Audit v4  
> 编制时间：2026-10-01 UTC（v4）

---

## 1. 字段映射（v4 全部 11 项修正）

### 1.1 `inquiries`（EXISTING · 11 unchanged + 1 metadata update + 7 new = 18）

| v1.5 §26.1 | 当前 | 处理 |
|---|---|---|
| `name` | `customer_name` | **保留字段名**；前端 `name` → `customer_name` |
| `email` | `email` | unchanged |
| `company` | `company_name` | **保留字段名**；前端 `company` → `company_name` |
| `phone` | `phone` | unchanged |
| `whatsapp` | — | create |
| `country` | — | create |
| `message` | `message` | unchanged |
| `source_path` | `source_page` | **保留字段名**；前端 `sourcePath` → `source_page` |
| `product_slug` | `product_interested` | **保留字段名**；前端 `productSlug` → `product_interested` |
| `locale` | `locale` | unchanged |
| `status` (canonical enum) | `status` (current enum=`[pending, handled]`, default=`pending`) | **保留字段名**；**choices 替换** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换** `new`（0 records 非 destructive） |
| `date_created` | `date_created` | unchanged |
| `date_updated` | — | create |
| `internal_notes` | — | create（仅 Sales Staff / Admin 可读） |
| `assigned_to` | — | create（M2O users） |
| `outcome` | — | create；**始终独立于 status** |
| `next_follow_up_at` | — | create |

### 1.2 `product_categories`（CREATE · 31）

### 1.3 `products`（CREATE · **107** · v4 修正：从 v3 的 108 减 1 因为 products.applications JSON 移除）

| v1.5 §26.1 | 当前 fallback | 处理 |
|---|---|---|
| `id` (UUID) | `id` (slug) | create |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `product_category` (M2O) | `category` (slug) | create |
| `sort` | — | create |
| `product_name_*` (10 lang) | `name` | create |
| `short_description_*` (10 lang) | `summary` | create |
| `detailed_description_*` (rich_text ×10) | `description` | create |
| `main_image` (M2O file) | `image` (path) | create |
| `product_images` (M2M files) | — | create（via products_files） |
| `image_alt_*` (10 lang) | `imageAlt` | create |
| `specifications` (JSON) | — | **create**；Repeater interface；化工属性（CAS No. / Appearance / Purity / Storage / Shelf Life / Viscosity / Flash / Dosage） |
| `highlights` (JSON 多语言结构化) | `highlights` (string[]) | **create**；Repeater interface `[{id, sort, translations: [{locale, text}]}]` |
| `~~applications` (string[])~~ | ~~`applications`~~ | **❌ 删除**（双真理源 → 单一 `applications.related_products` M2M） |
| `internal_product_code` / `moq` | — | create |
| `lead_time_*` / `packaging_*` (10 lang) | — | create |
| `featured_product` / `customizable` (bool) | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | create |

### 1.4 `applications`（CREATE · 81）

| v1.5 §7 | 当前 fallback | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | — | create |
| `title_*` (10 lang) | `business.ts applications[].title` | create |
| `short_description_*` (10 lang) | `applications[].description` | create |
| `content_*` (rich_text ×10) | — | create |
| `image` (M2O file) | — | create |
| `image_alt_*` (10 lang) | — | create |
| **`related_products` (M2M products)** | — | **create（单一真理源）** |
| `sort` / `status` / `featured` | — | create |
| `seo_*` (10 lang) | — | create |

### 1.5 `news_categories`（CREATE · 48 · 6 去重 records）

### 1.6 `news`（CREATE · **83** · v4 修正：从 v3 的 84 减 1 因为 `featured` 归类调整）

| v1.5 §6.2 | 当前 fallback | 处理 |
|---|---|---|
| `id` (UUID) | `id` (slug) | create |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `category` (M2O news_categories) | `category` (string) | create |
| `sort` | — | create |
| `published_at` (datetime) | `publishedAt` | create |
| `author` | — | create |
| `featured` (bool) | — | create |
| `title_*` / `excerpt_*` / `content_*` (10 lang) | `title` / `excerpt` / `content` | create |
| `cover_image` (M2O file) | `image` (path) | create |
| `image_alt_*` (10 lang) | `imageAlt` | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | create |

### 1.7 `pages`（CREATE · **103** · v4 修正：从 v3 的 112 减 9 因为 sections_*×10 拆为单 canonical + inline translations）

| v1.5 §8.2 | 当前 fallback | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` (enum) | — | create |
| `page_key` (unique) | — | create（home/about/service/applications/contact） |
| `slug` | — | create |
| `title_*` (10 lang) | — | create |
| `hero_title_*` / `hero_subtitle_*` (10 lang) | `business.ts hero.*` | create |
| `hero_image` (M2O file) | — | create |
| `hero_image_alt_*` (10 lang) | — | create |
| `hero_button_text_*` (10 lang) | — | create |
| `hero_button_link` | — | create |
| **`sections` (JSON single canonical)** | `business.ts` 12 块 | **create**；`[{id, type, sort, image, image_alt_localized_key, product_ids, cta_link, translations: [{locale, title, body, image_alt, button_text}]}]` |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | create |
| `og_image` / `image` (M2O file) | — | create |
| `image_alt_*` (10 lang) | — | create |

### 1.8 `site_settings`（CREATE Singleton · **87 fields · 含 company_name_cn 单字段**）

| v1.5 §9 | 当前 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` | — | create |
| `site_name_*` (10 lang) | `siteName` | create |
| `tagline_*` (10 lang) | `tagline` | create |
| `company_name_*` (10 lang) | — | create；en 用英文 |
| **`company_name_cn`** (单值 string) | `03-COMPANY-PROFILE.md` "西安寰宇坤泰工业科技有限公司" | **create 单独字段**（**不**参与 10 语言 suffix） |
| `company_english_name` (单值 string) | `03-COMPANY-PROFILE.md` 英文名 | create |
| `address_*` (10 lang) | `address` | create |
| `email` / `phone` / `whatsapp` | fallback + 待确认 | create |
| `logo` / `logo_white` / `favicon` (M2O file) | — | create |
| `social_links` (JSON) | — | create |
| `footer_intro_*` (10 lang) | — | create |
| `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | — | create |

**Locales 严格限定**：en / es / ru / ar / fr / pt / de / id / tr / fa（**无** zh-CN）

### 1.9 `redirects`（OPTIONAL · 本期不启用）

---

## 2. 产品 ↔ 应用 字符串迁移（**v4 Owner Audit 修正：禁止 fuzzy**）

### 2.1 实测计数（v4 明确）

- **66 unique application strings**（去重）
- **69 total occurrences**
- **7 个 unique values 精确语义匹配** business.ts applications（**values** matched，非 occurrences）

```
7 unique values matched:
  Passenger vehicles
  Commercial vehicles
  Heavy-duty diesel engines
  Construction machinery
  Industrial machinery
  Lubricant manufacturing
  Automotive aftermarket

unresolved unique values: 66 - 7 = 59 unique strings
unresolved occurrences: 69 - <matched occurrences> = 58 occurrences
```

### 2.2 迁移规则（**v4 严格**）

| 规则 | 处理 |
|---|---|
| **1. Exact approved semantic allowlist** | **may map automatically** |
| **2. Non-exact / ambiguous strings** | **DO NOT create M2M relation automatically** |
| **3. Ambiguous/unresolved values** | **记录在 explicit review table**；Directus relation 留空，**直到人工 approval** |

**禁止**：
- ❌ fuzzy automatic relation creation
- ❌ substring automatic relation creation
- ❌ invented relationship

### 2.3 待人工 review 表（59 unique values）

| source_value | occurrence_count | exact_application_match | target_application | migration_action | review_required |
|---|---|---|---|---|---|
| Passenger vehicles | (待 1) | YES | applications[0] | AUTO-MAP | NO |
| Commercial vehicles | (待 2) | YES | applications[1] | AUTO-MAP | NO |
| Heavy-duty diesel engines | (待 2) | YES | applications[2] | AUTO-MAP | NO |
| Construction machinery | (待 2) | YES | applications[3] | AUTO-MAP | NO |
| Industrial machinery | (待 2) | YES | applications[5] | AUTO-MAP | NO |
| Lubricant manufacturing | (待 1) | YES | applications[6] | AUTO-MAP | NO |
| Automotive aftermarket | (待 1) | YES | applications[7] | AUTO-MAP | NO |
| **其余 59 unique strings**（如 "Calcium sulfonate detergents", "Passenger-car engine oils", "Heavy-duty application focus", "ZDDP anti-wear additives" 等） | various | **NO** | NONE | **DO NOT AUTO-CREATE** | **YES（人工 review）** |

---

## 3. 媒体映射（v4 修正）

| 类别 | 状态 |
|---|---|
| Directus media | 0 records |
| Repository static media | **46 files / 16 MB（45 webp + 1 svg）** |
| Missing fallback refs | **3**（export-capability-v2, quality-control, supply-chain） |
| EXISTS fallback refs | **5** |

### 3.1 Public 媒体授权（**v4 implementable · 非概念**）

**v3 错误**：仅描述 "folder not under /Private/"（filesystem path 概念）

**v4 修正**：Directus 用 folder **ID**（不是文件系统路径）。**Implementable 策略**：

**Phase 2B 确定性发现/创建以下 folder IDs**（用 Directus API `/folders`）：

| Folder Name | Folder ID | Type | Public Access |
|---|---|---|---|
| `/Products/` | TBD by Phase 2B | public | ✅ read allowed |
| `/Product-Categories/` | TBD | public | ✅ read allowed |
| `/Applications/` | TBD | public | ✅ read allowed |
| `/News/` | TBD | public | ✅ read allowed |
| `/Company/` | TBD | public | ✅ read allowed |
| `/Certificates/` | TBD | public | ✅ read allowed |
| `/Downloads/` | TBD | public | ✅ read allowed |
| **`/Private/`** | TBD | **private** | ❌ **read denied for Public role** |

**Phase 2B 实施要求**：
- 不要 broad `directus_files` listing（必须 folder-scoped）
- Public policy 对 public folder IDs（及其 descendants）允许 read
- Public policy 对 `/Private/` folder ID 拒绝 read
- **不要** Phase 2A 编造 production folder UUIDs

---

## 4. Structured fields · 运营 UX（v4 强制 · v1.5 §27.1）

### 4.1 选型决策

**采用 Option A**：Directus Repeater interface + structured JSON + raw JSON hidden for operators。

**如果 Phase 2B 实测发现 Directus 11 Repeater interface 不足以安全支持 nested JSON UX** → 改用 Option B（controlled child collections）。

### 4.2 Operator UX 规范

| 字段 | Directus interface | 运营者所见 | raw JSON 可见？ | add/remove/reorder | 多语言编辑 | 验证 | 发布门 |
|---|---|---|---|---|---|---|---|
| `products.specifications` | Repeater | "Add parameter"（key + value ×10 locales） | ❌ **NO**（hidden via custom interface） | ✅ UI | ✅ 10 语言 tab | ✅ key 非空 | ⚠️ 缺关键字段阻止 |
| `products.highlights` | Repeater | "Add highlight"（stable id + sort + text ×10 locales） | ❌ **NO** | ✅ UI | ✅ 10 语言 tab | ✅ text 非空 | ⚠️ 缺翻译阻止该语言发布 |
| `pages.sections` | Repeater | "Add section"（type enum + sort + image + product_ids + CTA + 10 语言 text） | ❌ **NO** | ✅ UI + drag-reorder | ✅ 10 语言 tab | ✅ block_id stable + type enum | ⚠️ 缺关键字段阻止 |

**强制**：
- ✅ normal operator **从不**直接编辑 raw JSON
- ✅ Directus **从不**成为 free-form page builder
- ✅ Repeater interface 提供 controlled add/remove/reorder UX
- ✅ per-locale text 通过 tab 切换编辑

**RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR=NO**

---

## 5. URL/Slug 兼容性矩阵（v4 修正 · 762 total · 不乘 root/API × 10 locales）

| URL 类型 | 数量 | × 10 locales | total URLs |
|---|---|---|---|
| `/[locale]` | 1 | × 10 | 10 |
| `/[locale]/products` | 1 | × 10 | 10 |
| `/[locale]/products/category/[slug]` | 31 | × 10 | 310 |
| `/[locale]/products/[slug]` | 28 | × 10 | 280 |
| `/[locale]/news` | 1 | × 10 | 10 |
| `/[locale]/news/[slug]` | 10 | × 10 | 100 |
| `/[locale]/applications` | 1 | × 10 | 10 |
| `/[locale]/service` | 1 | × 10 | 10 |
| `/[locale]/about` | 1 | × 10 | 10 |
| `/[locale]/contact` | 1 | × 10 | 10 |
| **Public locale content URLs (locale-expanded)** | — | — | **760** |
| `/` (redirect-only) | 1 | × 1 | 1 |
| `/api/inquiries` | 1 | × 1 | 1 |
| **Total route instances + endpoints** | — | — | **762** |

---

## 6. inquiries.status 处理（v4）

| 项 | 处理 |
|---|---|
| Field name | `status`（保留） |
| Choices enum | `[new, contacted, qualified, quoted, follow_up, closed]`（替换 `[pending, handled]`） |
| Default value | `new`（替换 `pending`） |
| Legacy `pending` runtime | 不保留 |
| API 翻译层 | 不增加 |
| Destructive? | NO（0 records + metadata-only） |

---

## 7. 保留 vs 修改对照（v4 完整）

| 不允许 | 原因 |
|---|---|
| 重命名 inquiries 字段名 | 用户指令"existing field name must be preserved" |
| 删除 inquiries Collection | 用户指令 |
| 保留 `products.applications` JSON | v4 Owner Audit：双真理源消除 |
| fuzzy / substring / invented product→application relations | v4 Owner Audit：禁止；59 待人工 |
| 拆分 `pages.sections_*×10` 字段 | v4 Owner Audit：单 canonical sections + inline translations |
| 用 `directus_files.is_public` 字段 | v4 Owner Audit：不存在；用 folder-based |
| 把 normal operator 直接暴露给 raw JSON | v4 Owner Audit + v1.5 §27.1 |
| 把中文公司名塞进 10 语言 suffix (zh-CN) | v4 Owner Audit：locales 不含 zh-CN；用 company_name_cn 单字段 |
| 用 root/API × 10 locales 计算 URL | v4 Owner Audit：root/API = 1 × 1，不展开 |
| 把 "69 distinct slugs" 当 unique literal values | v4 Owner Audit：rename 为 "69 slug-bearing records"；unique literal = 41 |
| 把 product count = 10（错误） | v4 实测 = 28 |
| slug typo `vecos-index-improvers` | v4 修正为 `viscosity-index-improvers` |

| 允许 | 说明 |
|---|---|
| 新增 inquiries 字段 | 7 个 |
| 替换 inquiries.status enum + default | v1.5 canonical |
| 新建 7 个 collections | site_settings / product_categories / products / news_categories / news / applications / pages |
| 新建 1 个 optional | redirects（本期不启用） |
| products.highlights 多语言结构化 | JSON |
| pages.sections 单 canonical + inline translations | JSON |
| company_name_cn 单字段 | 中文公司名 |
| folder-based 授权 | Public media |
| Option A: Repeater interface | specs/highlights/sections UX |

---

## 8. Phase 2B 收尾要求

1. ✅ 8 个 Collections create
2. ✅ inquiries 11 字段保留 + status enum 替换
3. ✅ products.applications JSON **不创建**（移除双真理源）
4. ✅ slug 全部沿用 fallback；URL 不变（762 total）
5. ✅ frontend/src/lib/directus/* 改造
6. ✅ fallback-data.ts / business.ts 标注"已迁入 Directus"
7. ✅ apply-schema.mjs 幂等
8. ✅ destructive changes = 0
9. ✅ 不增加 API 翻译层
10. ✅ pages.sections 单 canonical + translations
11. ✅ highlights 多语言结构化
12. ✅ company_name_cn 单字段
13. ✅ Public 媒体走 folder-based
14. ✅ Specifications / highlights / sections：Repeater interface（Phase 2B 验证）
15. ✅ 产品→应用关系：**仅 7 精确值 auto-map**；**59 unique values + 58 occurrences 待人工 review**

---

> v4 是 Owner Audit v4 修正版。前 v1/v2/v3 全部以本版为准。