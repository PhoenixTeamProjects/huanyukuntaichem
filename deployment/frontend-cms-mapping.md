# Frontend → Directus Mapping Table — 前台字段到 CMS 字段的映射（v3 修正）

> 来源：v1.5 §14.2、§26、§29（首次接管清单）  
> 编制时间：2026-10-01 UTC（Owner Audit v3 修正）  
> 编制执行者：Claude（只读映射）

---

## Mapping 表字段说明（每行）

| 列 | 含义 |
|---|---|
| Source Type | 静态 TS / JSON / MD / DB / API / JSX 硬编码 |
| Source File/API | 源文件路径 |
| Source Field | 源 TS interface 或 JSON key |
| Source Example | 示例值 |
| Target Collection | Directus Collection 名 |
| Target Field | Directus 字段名（含 `_*` 多语言后缀） |
| Transform Rule | 转换 / 适配 / 合并策略 |
| Record Count | 现有记录条数 |
| Migration Status | existing / create / update / unchanged / optional |
| Frontend Consumer | 哪个页面 / 组件消费 |
| Verification Result | 验收方式 |

---

## 1. SiteSettings → `site_settings`（CREATE）

| Source Type | Source Field | Source Example | Target Collection | Target Field | Transform | Count | Status | Frontend Consumer | Verification |
|---|---|---|---|---|---|---|---|---|---|
| TS | `siteName` | "HUANYU KUNTAI CHEM" | site_settings | `site_name_*` | 单值 → 10 语言后缀；en 填值 | 1 | create | Header/Footer | og:site_name 匹配 |
| TS | `tagline` | "Additive Technology..." | site_settings | `tagline_*` | 10 语言；en 填值 | 1 | create | Header/Footer | hero 副标题匹配 |
| TS | `phone` | "+86 181 8260 2513" | site_settings | `phone` | 单值 string | 1 | create | Footer/Contact | tel:+8618182602513 |
| TS | `email` | null | site_settings | `email` | 单值；可空 | 1 | create | Contact | 留空不显示 |
| TS | `address` | "No. 66 Dongqi Road..." | site_settings | `address_*` | 10 语言 | 1 | create | Footer/Contact | Footer 地址渲染 |
| — | — | — | site_settings | `company_name_*` | 10 语言；**en 用英文名**；其他 locale 留空 | — | create | Footer/About | 英文公司名匹配 |
| — | — | — | site_settings | **`company_name_cn`** | **单值 string（不参与 10 语言 suffix）**专门存中文公司名 | 0 | create | Footer (中文环境) | "西安寰宇坤泰工业科技有限公司" |
| — | — | — | site_settings | `company_english_name` | 单值 string | 0 | create | Footer/About | 英文官方名 |
| — | — | — | site_settings | `logo` / `logo_white` / `favicon` | M2O file | 0 | create（待真实图） | Header/favicon | 上传后渲染 |
| — | — | — | site_settings | `whatsapp` | string | 0 | create（待确认） | Contact | wa.me 链接 |
| — | — | — | site_settings | `social_links` | JSON `{platform, url}` | 0 | create | Footer | 解析渲染 |
| — | — | — | site_settings | `footer_intro_*` | 10 语言 | 0 | create | Footer | 占位后续编辑 |
| — | — | — | site_settings | `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | SEO 回退 | 0 | create | 缺 SEO 时回退 | — |

---

## 2. fallbackCategories → `product_categories`（CREATE · 31 records）

（**每条记录**通过 `category(...)` 工厂函数定义；28 有 parent / 3 root）

| Source Field | Target Field | Transform | Status |
|---|---|---|---|
| `id` (string slug) | `id` (UUID) | 内部 UUID；公开用 slug | create |
| `slug` | `slug` (unique) | 保留字面 | create |
| `name` | `category_name_*` | 10 语言；en 填值 | create |
| `description` | `category_description_*` | 10 语言；en 填值 | create |
| `parent` (string) | `parent` (M2O self) | 按 slug 匹配 UUID | create |
| — | `level` (int 1-5) | 系统计算 | create |
| — | `image` (M2O file) | 新增 | create（占位） |
| — | `image_alt_*` | 10 语言 | create |
| — | `show_in_menu` (boolean, default true) | 新增 | create |
| — | `featured` (boolean, default false) | 新增 | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 | create |
| — | `sort` (int) | 新增 | create |
| — | `status` (enum) | draft/published/archived | create |

---

## 3. fallbackProducts → `products`（CREATE · 28 records）

**关键修正**：移除 `products.applications` JSON（双真理源 → 单一真理源 `applications.related_products` M2M）；改 `highlights` 为多语言结构化。

| Source Field | Target Field | Transform | Status |
|---|---|---|---|
| `id` (string slug) | `id` (UUID) | 保留 slug | create |
| `slug` | `slug` (unique) | 保留字面 | create |
| `category` (slug) | `product_category` (M2O) | 按 slug 匹配 UUID | create |
| `name` | `product_name_*` | 10 语言；en 填值 | create |
| `summary` | `short_description_*` | 10 语言 | create |
| `description` | `detailed_description_*` (rich_text) | 10 语言；en 填值 | create |
| `image` (string path) | `main_image` (M2O file) | 路径 → file ID | create（占位待真实图） |
| `imageAlt` | `image_alt_*` | 10 语言 | create |
| `highlights` (string[]) | **`highlights` (JSON structured multiling)** | **结构化**：`[{id, sort, translations: [{locale, text}]}]`；每个 source string 拆为 1 entry，10 locale translations | create |
| **`applications` (string[])** | **—（删除）** | **不再保留此字段；通过 `applications.related_products` M2M 表达关系**；fallback 应用字符串通过 fuzzy match 映射到 applications record | **delete field at apply time（v1 已存在 schema 中没有，所以是 0 destructive）** |
| — | `product_images` (M2M files) | 通过 `products_files` 中间表 | create |
| — | `specifications` (JSON array) | 化工属性（CAS No., Appearance, Purity, Storage Condition, Shelf Life 等） | create |
| — | `internal_product_code` | string | create |
| — | `moq` | string | create |
| — | `lead_time_*` | 10 语言 | create |
| — | `packaging_*` | 10 语言 | create |
| — | `featured_product` / `customizable` (boolean) | 新增 | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 | create |
| — | `sort` / `status` | 新增 | create |

### 3.1 highlights 多语言结构化（v1.5 §45 不变量 + Translation-safe）

**修正前（v2）**：
```json
"highlights": [
  "Fuel system and injector cleaners",
  "Gasoline detergent and deposit-control additives",
  ...
]
```
**问题**：自然语言内容不能跨 locale 翻译，无序。

**修正后（v3）**：
```json
"highlights": [
  {
    "id": "highlight-uuid-1",
    "sort": 1,
    "translations": [
      {"locale": "en", "text": "Fuel system and injector cleaners"},
      {"locale": "es", "text": "..."},
      {"locale": "ru", "text": "..."},
      {"locale": "ar", "text": "..."},
      {"locale": "fr", "text": "..."},
      {"locale": "pt", "text": "..."},
      {"locale": "de", "text": "..."},
      {"locale": "id", "text": "..."},
      {"locale": "tr", "text": "..."},
      {"locale": "fa", "text": "..."}
    ]
  },
  ...
]
```

**不变量**（per v1.5 §45.2）：id、sort、block position 跨 locale 一致；只 translations[].text 是 per-locale。

### 3.2 applications 字符串映射（双真理源消除）

**修正前（v2）**：
- `products.applications` JSON array 保留（与 applications.related_products M2M 同时存在）
- 66 unique strings / 69 total occurrences / 与 business.ts applications 7 精确匹配

**修正后（v3）**：
- **`products.applications` JSON field 不创建 / 不保留**
- **单一真理源**：`applications.related_products` M2M
- 迁移期：fallback product application 字符串通过 fuzzy match 映射到 application records：
  - 精确匹配：7 条直接关联
  - substring / synonym 匹配：剩余 62 条由运营人员审查后手工关联
  - highlight 重叠字符串（如 "Calcium sulfonate detergents"）**不**映射到 applications（这些是技术参数，不是应用场景）

---

## 4. fallbackNews → `news`（CREATE · 10 records）

| Source Field | Target Field | Transform | Status |
|---|---|---|---|
| `id` (slug) | `id` (UUID) | 保留 slug | create |
| `slug` | `slug` (unique) | 保留字面 | create |
| `category` (string) | `category` (M2O news_categories) | 按 category_name 匹配 | create |
| `title` | `title_*` | 10 语言 | create |
| `excerpt` | `excerpt_*` | 10 语言 | create |
| `content` | `content_*` (rich_text) | 10 语言；en 填值 | create |
| `image` (path) | `cover_image` (M2O file) | 路径 → file ID | create（占位） |
| `imageAlt` | `image_alt_*` | 10 语言 | create |
| `publishedAt` | `published_at` (timestamp) | ISO 字符串 → timestamp | create |
| — | `author` | string | create |
| — | `featured` (boolean) | 新增 | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 | create |
| — | `sort` / `status` | 新增 | create |

---

## 5. news_categories（CREATE · 6 去重 records）

| Source Field | Target Field | Status |
|---|---|---|
| 6 去重字符串 | `slug` / `category_name_*` | create |

去重：Lubricant formulation (3), Fuel additives (2), Quality & documentation (2), Additive packages (1), Quality systems (1), Global supply (1)

---

## 6. business.ts `applications` → `applications`（CREATE · 8 records）

| Source Field | Target Field | Transform | Status |
|---|---|---|---|
| `title` | `title_*` | 10 语言；en 填值 | create |
| `description` | `short_description_*` | 10 语言 | create |
| `direction` | `summary_*` (备用摘要) | 10 语言 | create |
| — | `content_*` (rich_text) | 新增；en 留空 | create |
| — | `image` / `image_alt_*` | M2O file + 10 语言 | create（占位） |
| — | **`related_products` (M2M)** | 通过 `applications_products` 中间表 | create |
| — | `slug` (unique) | 按 title 规范化 | create |
| — | `seo_*` / `sort` / `status` / `featured` | 新增 | create |

---

## 7. business.ts 12 块 → `pages`（CREATE · 5 page_keys · **Sections 重设计**）

**关键修正（v3）**：单 canonical `sections` 结构 + 内嵌 per-locale translations（不分离成 `sections_en / sections_es / ...` 10 个数组）。

### 7.1 sections_ JSON 结构（v1.5 §45.2 Structured Block · v3 修正）

```json
"pages": [{
  "page_key": "home",
  "sections": [
    {
      "id": "block-id-stable-hero",
      "type": "text",
      "sort": 1,
      "image": "file-uuid-or-null",
      "image_alt_localized_key": null,
      "product_ids": [],
      "cta_link": null,
      "translations": [
        {"locale": "en", "title": "...", "body": "...", "image_alt": "...", "button_text": "..."},
        {"locale": "es", "title": "...", "body": "...", "image_alt": "...", "button_text": "..."},
        ...
      ]
    },
    {
      "id": "block-id-stable-product-systems",
      "type": "features",
      "sort": 2,
      ...
    }
  ]
}]
```

**不变量（v1.5 §45.2 强制）**：
- block_id：单一稳定 ID，跨 locale 一致
- block_type：单一类型，跨 locale 一致
- sort：单一顺序，跨 locale 一致
- image：单一 file uuid，跨 locale 一致
- product_ids：单一数组，跨 locale 一致
- cta_link：单一路径，跨 locale 一致
- 仅 `translations[].title / body / image_alt / button_text` 是 per-locale

### 7.2 Mapping（business.ts 12 块 → sections entries）

| business.ts 字段 | sections block ID | target |
|---|---|---|
| `hero` | `block-hero` | home |
| `positioning` | `block-positioning` | home |
| `companyIntroduction` | `block-company-intro` | about |
| `companyName` | (合并到 `block-company-intro` 或 `block-hero`) | about/home |
| `productSystems` | `block-product-systems` | home |
| `capabilities` | `block-capabilities` | service |
| `qualityProcess` | `block-quality-process` | about |
| `customerTypes` | `block-customer-types` | about |
| `applications` (8 个) | **单一 block** `block-applications` | applications |
| `serviceProcess` | `block-service-process` | service / about |
| `markets` | `block-markets` | about |
| `complianceNote` | `block-compliance-note` | about |

**5 个 page_key**：home / about / service / applications / contact（contact 没有 sections，全靠 UI messages）

### 7.3 pages Collection 其他字段

| Field | Type | Status |
|---|---|---|
| `id` (UUID) | PK | create |
| `status` (enum) | draft/published/archived | create |
| `page_key` (unique) | string | create |
| `slug` | string | create |
| `title_*` | 10 语言 | create |
| `hero_title_*` | 10 语言 | create |
| `hero_subtitle_*` | 10 语言 | create |
| `hero_image` | M2O file | create |
| `hero_image_alt_*` | 10 语言 | create |
| `hero_button_text_*` | 10 语言 | create |
| `hero_button_link` | string | create |
| **`sections`** | **JSON single canonical + translations** | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 10 语言 | create |
| `og_image` | M2O file | create |
| `image` | M2O file | create |
| `image_alt_*` | 10 语言 | create |

---

## 8. UI strings → `frontend/src/locales/*/common.json`（UNCHANGED · 实测 11 keys × 10 lang）

不进入 Directus（v1.5 §0.2）。

---

## 9. inquiries Collection（EXISTING + DIFF · **status metadata update + 7 字段新增**）

| Source Field | Target Field | Transform | Status |
|---|---|---|---|
| `id` (integer PK) | `id` | 保留 | unchanged |
| `customer_name` | `customer_name` | **保留字段名**（与 v1.5 `name` 兼容） | unchanged |
| `email` | `email` | 等价 | unchanged |
| `company_name` | `company_name` | **保留字段名**（与 v1.5 `company` 兼容） | unchanged |
| `phone` | `phone` | 等价 | unchanged |
| `message` | `message` | 等价 | unchanged |
| `source_page` | `source_page` | **保留字段名**（与 v1.5 `source_path` 兼容） | unchanged |
| `product_interested` | `product_interested` | **保留字段名**（与 v1.5 `product_slug` 兼容） | unchanged |
| `locale` | `locale` | 等价 | unchanged |
| `date_created` | `date_created` | 等价 | unchanged |
| **`status` 当前 enum `[pending, handled]`, default `pending`** | `status` | **字段名保留**；**choices 替换** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换** `new` | **update**（metadata-only，0 records 非 destructive） |
| — | `date_updated` | timestamp | create |
| — | `whatsapp` | string | create |
| — | `country` | string | create |
| — | `assigned_to` | M2O directus_users | create |
| — | `internal_notes` | text | create |
| — | `outcome` | enum won/lost/deferred/no_response/invalid/spam | create |
| — | `next_follow_up_at` | timestamp | create |

---

## 10. redirects（OPTIONAL · 本期不启用）

| Field | Status |
|---|---|
| `id` / `from_path` / `to_path` / `status_code` / `enabled` | optional |

---

## 11. URL/Slug 保留矩阵（v3 修正 · locale-expanded count）

| URL 类型 | slug / pattern 数 | × 10 locales | total URLs |
|---|---|---|---|
| `/[locale]` (home) | 1 route pattern | × 10 | **10** |
| `/[locale]/products` | 1 | × 10 | **10** |
| `/[locale]/products/category/[slug]` | 31 slugs | × 10 | **310** |
| `/[locale]/products/[slug]` | 28 slugs | × 10 | **280** |
| `/[locale]/news` | 1 | × 10 | **10** |
| `/[locale]/news/[slug]` | 10 slugs | × 10 | **100** |
| `/[locale]/applications` | 1 | × 10 | **10** |
| `/[locale]/service` | 1 | × 10 | **10** |
| `/[locale]/about` | 1 | × 10 | **10** |
| `/[locale]/contact` | 1 | × 10 | **10** |
| **Total public URLs (locale-expanded)** | — | — | **780** |
| `/` (redirect-only) | 1 | × 10 | **10** |
| `/api/inquiries` | 1 | × 10 | **10** |
| `/applications/[slug]` | **不存在** | — | **0** ✓ |

**distinct slugs**：31 (categories) + 28 (products) + 10 (news) = **69**  
**distinct route patterns**：7 fixed + 3 dynamic + 1 redirect + 1 api = **12**  
**No `/applications/[slug]`** — **已纠正 v2 错误**

---

## 12. 媒体映射（v3 修正）

| Source | Target | 状态 |
|---|---|---|
| **Directus media** (空) | directus_files via folder-based authorization（v1.5 §34） | 0 records；新建时按 `/Products / /Product-Categories / /Applications / /News / /Company / /Certificates / /Downloads / /Private` 文件夹结构上传 |
| **Repository static media** | 保留在 `frontend/public/images/**` + 1 SVG | **46 files / 16 MB · 真实存在**（**修正"real media = 0"错误**） |
| **Missing fallback references** | 3 MISSING（`export-capability-v2.webp`, `quality-control.webp`, `supply-chain.webp`） | fallback 引用但实际文件不存在；待真实资源补齐 |
| **5 fallback references EXISTS** | 5 个 fallback 引用都有实际文件 | OK |
| **Temporary / generated** | 0 | — |

---

## 13. 关键设计决策（v3 全部）

1. ✅ **products.applications JSON 移除**（单一真理源：applications.related_products M2M）
2. ✅ **Pages.sections 单 canonical + translations 内嵌**（不分离 10 个 `_*` 字段）
3. ✅ **highlights 多语言结构化**（id + sort + translations array）
4. ✅ **company_name_cn 单字段**专门存中文公司名（不参与 10 语言 suffix）
5. ✅ **Public 媒体访问走 folder-based**（不依赖不存在的 `is_public` 字段）
6. ✅ **URL inventory 4 类分组**（fixed / dynamic / redirect / api）· 移除 `/applications/[slug]` 错误

---

> v3 是 Owner Audit v3 修正版。所有 v1/v2 不一致已纠正。前 v1（FAIL）/ v2（BLOCKED）以本版为准。