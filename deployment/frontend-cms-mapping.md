# Frontend → Directus Mapping Table — 前台字段到 CMS 字段的映射（v4 修正）

> 来源：v1.5 §14.2、§26、§29 + Owner Audit v4  
> 编制时间：2026-10-01 UTC（v4）  
> 编制执行者：Claude（只读映射）

---

## Mapping 表字段说明

| 列 | 含义 |
|---|---|
| Source Type | 静态 TS / JSON / MD / DB / API / JSX 硬编码 |
| Source File | 源文件路径 |
| Source Field | 源 TS interface 或 JSON key |
| Source Example | 示例值 |
| Target Collection | Directus Collection |
| Target Field | Directus 字段 |
| Transform | 转换 / 适配策略 |
| Count | 现有 fallback 记录数 |
| Status | existing / create / update / unchanged / optional |
| Frontend Consumer | 哪个页面 / 组件 |
| Verification | 验收方式 |

---

## 1. SiteSettings → `site_settings`（CREATE · 87 fields）

| Source Field | Target Field | Transform | Count | Status |
|---|---|---|---|---|
| `siteName` | `site_name_*` (10 lang) | en 填值 | 1 | create |
| `tagline` | `tagline_*` (10 lang) | en 填值 | 1 | create |
| `phone` | `phone` | 单值 string | 1 | create |
| `email` | `email` | 单值 string (可空) | 1 | create |
| `address` | `address_*` (10 lang) | en 填值 | 1 | create |
| — | `company_name_*` (10 lang) | 10 语言 suffix（en 填英文） | 0 | create |
| — | **`company_name_cn`** | **单值 string（不参与 10 语言 suffix）** | 0 | create |
| — | `company_english_name` | 单值 string | 0 | create |
| — | `logo` / `logo_white` / `favicon` | M2O directus_files | 0 | create |
| — | `whatsapp` | 单值 string | 0 | create |
| — | `social_links` | JSON array | 0 | create |
| — | `footer_intro_*` | 10 语言 | 0 | create |
| — | `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | SEO 回退 | 0 | create |

---

## 2. fallbackCategories → `product_categories`（CREATE · 31 fields）

| Source Field | Target Field | Transform | Count | Status |
|---|---|---|---|---|
| `id` (slug) | `id` (UUID) | 内部 UUID + slug 对外 | 31 | create |
| `slug` | `slug` (unique) | 保留字面 | 31 | create |
| `name` | `category_name_*` (10 lang) | en 填值 | 31 | create |
| `description` | `category_description_*` (10 lang) | en 填值 | 31 | create |
| `parent` (slug) | `parent` (M2O self) | 按 slug 匹配 UUID | 28 | create |
| — | `level` (int 1-5) | 系统计算 | — | create |
| — | `image` (M2O file) | — | — | create |
| — | `image_alt_*` (10 lang) | — | — | create |
| — | `show_in_menu` / `featured` (bool) | — | — | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | — | create |
| — | `sort` / `status` | — | — | create |

---

## 3. fallbackProducts → `products`（CREATE · 107 fields · **v4 修正**）

| Source Field | Target Field | Transform | Count | Status |
|---|---|---|---|---|
| `id` (slug) | `id` (UUID) | 保留 slug | 28 | create |
| `slug` | `slug` (unique) | 保留字面 | 28 | create |
| `category` (slug) | `product_category` (M2O) | 按 slug 匹配 UUID | 28 | create |
| `name` | `product_name_*` (10 lang) | en 填值 | 28 | create |
| `summary` | `short_description_*` (10 lang) | en 填值 | 28 | create |
| `description` | `detailed_description_*` (10 lang, rich_text) | en 填值 | 28 | create |
| `image` (path) | `main_image` (M2O file) | 路径 → file ID | 28 | create |
| `imageAlt` | `image_alt_*` (10 lang) | en 填值 | 28 | create |
| `highlights` (string[]) | `highlights` (JSON) | 多语言结构 `{id, sort, translations: [{locale, text}]}` | 28 | create |
| `applications` (string[]) | **—（删除）** | **移除 products.applications**；关系由 `applications.related_products` M2M 表达 | — | **delete field at apply**（0 destructive） |
| — | `product_images` (M2M files) | `products_files` 中间表 | — | create |
| — | `specifications` (JSON array) | 化工属性（CAS No., Purity, etc.） | 28 | create |
| — | `internal_product_code` / `moq` | 单值 string | — | create |
| — | `lead_time_*` / `packaging_*` (10 lang) | en 填值 | — | create |
| — | `featured_product` / `customizable` (bool) | — | — | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | — | create |
| — | `sort` / `status` | — | — | create |

### 3.1 highlights 多语言结构化（v1.5 §45 + 翻译安全）

```json
"highlights": [
  {
    "id": "highlight-uuid-stable-1",
    "sort": 1,
    "translations": [
      {"locale": "en", "text": "..."},
      {"locale": "es", "text": "..."},
      ...10 locales
    ]
  }
]
```

### 3.2 applications 字符串迁移（**v4 修正：禁止 fuzzy**）

- ✅ **仅** 7 unique values 精确映射（Passenger vehicles 等）自动创建 M2M
- ⚠️ **59 unique strings** 待人工 review
- ❌ 禁止 substring / fuzzy / 自动 invented 关系

### 3.3 Source-driven check（v4 强制）

- products checked: **28**
- unresolved product category references: **0**

每个 product.category slug 都在 fallbackCategories 31 条中存在。**第 12 行 slug typo 已纠正：`vecos-index-improvers` → `viscosity-index-improvers`**。

---

## 4. fallbackNews → `news`（CREATE · 83 fields · **v4 修正**）

| Source Field | Target Field | Transform | Count | Status |
|---|---|---|---|---|
| `id` (slug) | `id` (UUID) | 保留 slug | 10 | create |
| `slug` | `slug` (unique) | 保留字面 | 10 | create |
| `category` (string) | `category` (M2O news_categories) | 按 category_name 匹配 | 10 | create |
| `title` | `title_*` (10 lang) | en 填值 | 10 | create |
| `excerpt` | `excerpt_*` (10 lang) | en 填值 | 10 | create |
| `content` | `content_*` (10 lang, rich_text) | en 填值 | 10 | create |
| `image` (path) | `cover_image` (M2O file) | 路径 → file ID | 10 | create |
| `imageAlt` | `image_alt_*` (10 lang) | en 填值 | 10 | create |
| `publishedAt` | `published_at` (datetime) | ISO 字符串 → timestamp | 10 | create |
| — | `author` | string | — | create |
| — | `featured` (bool) | — | — | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | — | create |
| — | `sort` / `status` | — | — | create |

---

## 5. news_categories（CREATE · 48 fields · 6 去重 records）

| Source Field | Target Field | Status |
|---|---|---|
| 6 去重 category 字符串 | `slug` / `category_name_*` (10 lang) / `description_*` (10 lang) / `seo_title_*` (10 lang) / `seo_description_*` (10 lang) | create |

---

## 6. business.ts `applications` → `applications`（CREATE · 81 fields）

| Source Field | Target Field | Status |
|---|---|---|
| `title` | `title_*` (10 lang) | create |
| `description` | `short_description_*` (10 lang) | create |
| `direction` | `summary_*` (10 lang) | create |
| — | `content_*` (10 lang, rich_text) | create |
| — | `image` / `image_alt_*` | create |
| — | **`related_products` (M2M products)**（**单一真理源**） | create |
| — | `slug` / `sort` / `status` / `featured` / `seo_*` | create |

---

## 7. business.ts 12 块 → `pages`（CREATE · 103 fields · **v4 修正**）

### 7.1 sections 单 canonical JSON 结构（v1.5 §45.2）

```json
"sections": [
  {
    "id": "block-id-stable",
    "type": "text|image_text|features|faq|cta|process",
    "sort": 1,
    "image": "file-uuid-or-null",
    "image_alt_localized_key": null,
    "product_ids": ["uuid1", "uuid2"],
    "cta_link": "/products/category/fuel-additives",
    "translations": [
      {"locale": "en", "title": "...", "body": "...", "image_alt": "...", "button_text": "..."},
      ...10 locales
    ]
  }
]
```

**v1.5 §45.2 不变量**：block_id / block_type / order / media relations / product relations / CTA destination / layout variant 跨 locale 一致；仅 `translations[].title/body/image_alt/button_text` per-locale。

### 7.2 Pages fields

| Field | Status |
|---|---|
| `id` (UUID) | create |
| `status` (enum) | create |
| `page_key` (unique) | create（5 个：home/about/service/applications/contact） |
| `slug` | create |
| `title_*` (10 lang) | create |
| `hero_title_*` / `hero_subtitle_*` (10 lang) | create |
| `hero_image` (M2O file) | create |
| `hero_image_alt_*` (10 lang) | create |
| `hero_button_text_*` (10 lang) | create |
| `hero_button_link` | create |
| **`sections` (JSON single canonical)** | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | create |
| `og_image` / `image` (M2O file) | create |
| `image_alt_*` (10 lang) | create |

---

## 8. UI strings → `frontend/src/locales/*/common.json`（UNCHANGED · 11 keys × 10 locales）

不进入 Directus（v1.5 §0.2）。

---

## 9. inquiries Collection（EXISTING + DIFF · 18 fields · **v4 修正**）

| Source Field | Target Field | Transform | Status |
|---|---|---|---|
| `id` (integer PK) | `id` | 保留 | unchanged |
| `customer_name` | `customer_name` | 保留字段名 | unchanged |
| `email` | `email` | 保留 | unchanged |
| `company_name` | `company_name` | 保留字段名 | unchanged |
| `phone` | `phone` | 保留 | unchanged |
| `message` | `message` | 保留 | unchanged |
| `source_page` | `source_page` | 保留字段名 | unchanged |
| `product_interested` | `product_interested` | 保留字段名 | unchanged |
| `locale` | `locale` | 保留 | unchanged |
| `date_created` | `date_created` | 保留 | unchanged |
| **`status` 当前 enum `[pending, handled]`, default `pending`** | `status` | **字段名保留**；**choices 替换** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换** `new` | **update (metadata-only)** |
| — | `date_updated` (timestamp) | 系统管理 | create |
| — | `whatsapp` (string) | — | create |
| — | `country` (string) | — | create |
| — | `assigned_to` (M2O users) | — | create |
| — | `internal_notes` (text) | Sales Staff / Admin only | create |
| — | `outcome` (enum won/lost/deferred/no_response/invalid/spam) | 独立于 status | create |
| — | `next_follow_up_at` (timestamp) | — | create |

---

## 10. URL/Slug 保留矩阵（v4 修正 · 不乘 root/API × 10 locales）

| URL 类型 | 数量 | × 10 locales | total URLs |
|---|---|---|---|
| `/[locale]` (home) | 1 pattern | × 10 | 10 |
| `/[locale]/products` | 1 | × 10 | 10 |
| `/[locale]/products/category/[slug]` | 31 slugs | × 10 | 310 |
| `/[locale]/products/[slug]` | 28 slugs | × 10 | 280 |
| `/[locale]/news` | 1 | × 10 | 10 |
| `/[locale]/news/[slug]` | 10 slugs | × 10 | 100 |
| `/[locale]/applications` | 1 | × 10 | 10 |
| `/[locale]/service` | 1 | × 10 | 10 |
| `/[locale]/about` | 1 | × 10 | 10 |
| `/[locale]/contact` | 1 | × 10 | 10 |
| **Public locale content URLs (locale-expanded)** | — | — | **760** |
| `/` (redirect-only) | 1 | × 1 | 1 |
| `/api/inquiries` | 1 | × 1 | 1 |
| **Total route instances + endpoints** | — | — | **762** |
| **`/applications/[slug]`** | **0（不存在）** | — | 0 |

### 10.1 Slug 统计（v4 区分）

| 指标 | 值 |
|---|---|
| Slug-bearing content records | 31 (categories) + 28 (products) + 10 (news) = **69** |
| Unique literal slug values | 28 (products, all overlap with categories) + 3 (categories-only: fuel-additives, lubricant-additives, lubricant-additive-packages) + 10 (news) = **41** |

### 10.2 Route patterns（v4 修正）

| 类型 | 数量 |
|---|---|
| Fixed locale content | 7 |
| Dynamic locale content | 3 |
| Root redirect | 1 |
| API | 1 |
| **Total** | **12** |

---

## 11. 媒体映射（v4 修正 · 5 EXISTS / 3 MISSING）

| Source | Target | Status |
|---|---|---|
| Directus media (空) | directus_files via folder-based 授权 | 0 records |
| Repo static media | `frontend/public/images/**` 保留 | **46 files / 16 MB · 真实存在** |
| 5 EXISTS fallback refs | OK | verified |
| **3 MISSING fallback refs** | 待补真实资源 | `export-capability-v2.webp`, `quality-control.webp`, `supply-chain.webp` |

### 11.1 Public 媒体授权（v4 修正 · implementable）

**不要**描述为 "folder not under /Private/"。Directus 用 folder ID，不直接用文件系统路径。

**Implementable strategy**：
1. Phase 2B 在 Directus 中**确定性发现/创建**以下 folder IDs（用 Directus API `/folders`）：
   - `/Products/`（public）
   - `/Product-Categories/`（public）
   - `/Applications/`（public）
   - `/News/`（public）
   - `/Company/`（public）
   - `/Certificates/`（public）
   - `/Downloads/`（public）
   - **`/Private/`**（**private**；Public role denied）
2. Phase 2B 配置 Public policy：
   - 对 public folder IDs（及其 descendants）允许 read
   - 对 `/Private/` folder ID 拒绝 read
3. **禁止** Phase 2A 编造 production folder UUIDs
4. 禁止 broad `directus_files` listing（必须 folder-scoped）

---

## 12. Structured fields（specifications / highlights / sections）· 运营 UX（v4 强制）

### 12.1 选型决策

**采用 Option A：Directus Repeater interface + raw JSON hidden**（保留 v3 模型，Phase 2B 选具体 interface）。

理由：
- v1.5 §4.3 明确 Specifications 是 structured JSON
- Directus 11 Repeater interface 支持 nested 数组编辑
- 不需要新增 child collections（减少 collections 数量）
- 对 Page Sections（与 products 关系）JSON 更简洁
- Phase 2B 将验证 Directus 11 interface 是否能安全支持 operator UX

**如果 Phase 2B 实测发现 Directus 11 interface 不足以安全支持 nested JSON UX**（v1.5 §27.1）→ 改用 Option B（controlled child collections）。

### 12.2 运营 UX 规范（v4 · v1.5 §27.1）

| 字段 | Directus interface | 运营者所见 | 是否隐藏 raw JSON | add/remove/reorder | 多语言编辑 | 验证 | 发布门 |
|---|---|---|---|---|---|---|---|
| `products.specifications` | Repeater | "Add parameter" 表单（key + value per locale） | ✅ YES | ✅ 通过 UI | ✅ 10 语言 tab | ✅ key 非空 | ⚠️ 缺关键字段阻止发布 |
| `products.highlights` | Repeater | "Add highlight"（id 隐藏 + sort + 10 语言文本） | ✅ YES | ✅ 通过 UI | ✅ 10 语言 tab | ✅ text 非空 | ⚠️ 缺翻译阻止该语言发布 |
| `pages.sections` | Repeater | "Add section"（type 枚举 + sort + media + 10 语言文本 + product_ids 多选 + CTA） | ✅ YES | ✅ 通过 UI + drag-reorder | ✅ 10 语言 tab | ✅ block_id stable + type enum | ⚠️ 缺关键字段阻止发布 |

**重要：normal operator **从不**直接编辑 raw JSON**（v1.5 §27.1 + §17.1B）。

---

## 13. 关键设计决策（v4 全部）

1. ✅ products.applications JSON 字段**不创建**（消除双真理源）
2. ✅ pages.sections **单 canonical + inline translations**（不分离 10 个 `_*` 字段）
3. ✅ highlights 多语言结构化
4. ✅ company_name_cn **单字段**（不参与 10 语言 suffix；locales 不含 zh-CN）
5. ✅ Public 媒体 **folder-based authorization**（不依赖不存在的 `is_public`）
6. ✅ inquiries.status **直接 v1.5 canonical enum + default new**（不保留 pending，不加 API 翻译）
7. ✅ Specifications **进 JSON**（Option A · Repeater interface）
8. ✅ Highlights **进 JSON**（Option A · Repeater interface）
9. ✅ Page Sections **进 JSON**（Option A · Repeater interface）
10. ✅ URL inventory 4 类分组 · 762 total · 12 patterns
11. ✅ product applications 仅 7 unique auto-map · 59 unique + 58 occurrences 待人工
12. ✅ Slug-bearing records 69 · Unique literal values 41
13. ✅ Media 5 EXISTS / 3 MISSING 一致
14. ✅ Field counts 600 canonical / 589 planned new / 10 unchanged / 1 update

---

> v4 是 Owner Audit v4 修正版。v1/v2/v3 已被 BLOCKED，以本版为准。