# Compatibility Map — 历史字段与 v1.5 Canonical Dictionary 映射（v3 修正）

> 来源：v1.5 §26（Canonical Data Dictionary）+ §14.2 + §45（Multilingual Schema Governance）  
> 编制时间：2026-10-01 UTC（Owner Audit v3 修正）  
> 编制执行者：Claude（只读映射）

---

## 1. 字段映射总表（v3 修正含 products.applications 移除 + sections 重设计 + company_name_cn + Public 媒体）

### 1.1 `inquiries`（已有，禁止删字段名，status enum 替换按 v1.5）

| v1.5 §26.1 Canonical | 当前实际 | 等价关系 | 处理 |
|---|---|---|---|
| `name` | `customer_name` (string, required) | 等价（客户姓名） | **保留 `customer_name`**；前端 API 内部 `name` → `customer_name` |
| `email` | `email` | 完全等价 | unchanged |
| `company` | `company_name` (string, nullable) | 等价 | **保留 `company_name`**；前端 `company` → `company_name` |
| `phone` | `phone` | 等价 | unchanged |
| `whatsapp` | — | 新增 | create |
| `country` | — | 新增 | create |
| `message` | `message` (text) | 等价 | unchanged |
| `source_path` | `source_page` (string, nullable) | 等价 | **保留 `source_page`**；前端 `sourcePath` → `source_page` |
| `product_slug` | `product_interested` (string, nullable) | 等价 | **保留 `product_interested`**；前端 `productSlug` → `product_interested` |
| `locale` | `locale` | 等价 | unchanged |
| `status` (enum: new/contacted/qualified/quoted/follow_up/closed) | `status` (string, current enum=`[pending, handled]`, default=`pending`) | 当前值集合已偏离 v1.5 | **保留字段名 `status`**；**choices 替换为 v1.5 canonical** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换为 `new`**；**不保留 `pending` legacy runtime value**（0 records 决定）；**不增加 API 翻译层** |
| `date_created` | `date_created` | 等价 | unchanged |
| `date_updated` | — | 新增 | create |
| `internal_notes` | — | 新增（仅 Sales Staff / Admin 可读） | create |
| `assigned_to` | — | 新增（M2O users） | create |
| `outcome` (enum: won/lost/deferred/no_response/invalid/spam) | — | 新增；**始终独立于 status** | create |
| `next_follow_up_at` | — | 新增 | create |

### 1.2 `product_categories`（CREATE · 31 条）

| v1.5 §26.2 最低字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` | `id` (string slug) | create；UUID 内部 + slug 对外 |
| `status` | — | create |
| `slug` (unique) | `slug` (string) | create；保留字面 |
| `parent` (M2O self) | `parent` (string) | create；按 slug 匹配 UUID |
| `level` (int 1-5) | — | create；系统计算 |
| `sort` | — | create |
| `name_*` | `name` | create；en 填值 |
| `description_*` | `description` | create；en 填值 |
| `image` (M2O file) | — | create |
| `image_alt_*` | — | create |
| `show_in_menu` (boolean) | — | create |
| `featured` (boolean) | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.3 `products`（CREATE · 28 条 · **移除 products.applications**）

| v1.5 §26.1 最低字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | `id` (string slug) | create |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `product_category` (M2O) | `category` (slug) | create；按 slug 匹配 UUID |
| `sort` | — | create |
| `product_name_*` | `name` | create；en 填值 |
| `short_description_*` | `summary` | create；en 填值 |
| `detailed_description_*` (rich_text) | `description` | create；en 填值 |
| `main_image` (M2O file) | `image` (path) | create；fallback 期间路径保留 |
| `product_images` (M2M files) | — | create |
| `image_alt_*` | `imageAlt` | create |
| **`specifications` (JSON array)** | — | **create；化工属性（CAS No., Appearance, Purity, Storage Condition, Shelf Life, Viscosity, Flash Point, Density, pH, Dosage）通过 Specifications JSON 承载** |
| `internal_product_code` | — | create |
| `moq` | — | create |
| `lead_time_*` (string ×10) | — | create |
| `packaging_*` (string ×10) | — | create |
| `featured_product` (boolean) | — | create |
| `customizable` (boolean) | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |
| **`highlights` (JSON structured multiling)** | `highlights` (string[]) | **修正**：从 string[] 改为多语言结构 `{id, sort, translations: [{locale, text}]}` |
| ~~`applications` (string[])~~ | ~~fallback product 应用字符串~~ | **❌ 删除**：单一真理源 = `applications.related_products` M2M |

### 1.4 `applications`（CREATE · 8 条）

| v1.5 §7 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | — | create |
| `title_*` | `business.ts applications[].title` | create；en 填值 |
| `short_description_*` | `applications[].description` | create；en 填值 |
| `content_*` (rich_text) | — | create |
| `image` (M2O file) | — | create |
| `image_alt_*` | — | create |
| **`related_products` (M2M products)** | — | **create（单一真理源）** |
| `sort` / `status` / `featured` | — | create |
| `seo_*` | — | create |

### 1.5 `news_categories`（CREATE · 6 去重）

| v1.5 §6.1 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | — | create |
| `category_name_*` | 6 去重字符串 | create |
| `description_*` | — | create |
| `sort` / `status` | — | create |
| `seo_title_*` / `seo_description_*` | — | create |

### 1.6 `news`（CREATE · 10 条）

| v1.5 §6.2 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | `id` (slug) | create |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `category` (M2O news_categories) | `category` (string) | create |
| `sort` / `featured` / `author` | — | create |
| `published_at` (datetime) | `publishedAt` (ISO) | create |
| `title_*` | `title` | create |
| `excerpt_*` | `excerpt` | create |
| `content_*` (rich_text) | `content` | create |
| `cover_image` (M2O file) | `image` (path) | create |
| `image_alt_*` | `imageAlt` | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.7 `pages`（CREATE · 5 page_keys · **Sections 单 canonical + translations**）

**关键修正（v3）**：单一 canonical `sections` JSON + 内嵌 per-locale `translations` 数组，**不**拆为 `sections_en / sections_es / ...` 10 个字段。

| v1.5 §8.2 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` | — | create |
| `page_key` (unique) | — | create；5 个值（home/about/service/applications/contact） |
| `slug` | — | create；与 page_key 同步 |
| `title_*` | — | create |
| `hero_title_*` | `business.ts hero.title` | create；en 填值 |
| `hero_subtitle_*` | `business.ts hero.summary` + `companyName` | create；en 填值 |
| `hero_image` (M2O file) | — | create |
| `hero_image_alt_*` | — | create |
| `hero_button_text_*` | — | create |
| `hero_button_link` | — | create |
| **`sections` (JSON single canonical)** | `business.ts` 12 块 | **create**；结构 `{id, type, sort, image, product_ids, cta_link, translations: [{locale, title, body, image_alt, button_text}]}`；**不变量**：block_id / block_type / order / media relations / product relations / CTA destination / layout variant 跨 locale 一致 |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |
| `og_image` / `image` / `image_alt_*` | — | create |

**Sections 结构示例**：
```json
"sections": [
  {
    "id": "block-hero",
    "type": "text",
    "sort": 1,
    "image": null,
    "image_alt_localized": null,
    "product_ids": [],
    "cta_link": null,
    "translations": [
      {"locale": "en", "title": "...", "body": "...", "image_alt": "...", "button_text": "..."},
      {"locale": "es", "title": "...", "body": "...", "image_alt": "...", "button_text": "..."},
      ...
      {"locale": "fa", "title": "...", "body": "...", "image_alt": "...", "button_text": "..."}
    ]
  }
]
```

### 1.8 `site_settings`（CREATE Singleton · **company_name_cn 单独**）

| v1.5 §9 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` | — | create |
| `site_name_*` | `fallbackSettings.siteName` | create；en 填值 |
| `tagline_*` | `fallbackSettings.tagline` | create；en 填值 |
| `company_name_*` (10 lang) | — | create；en 用英文名；其他 locale 留空 |
| **`company_name_cn` (单值 string)** | `03-COMPANY-PROFILE.md` "西安寰宇坤泰工业科技有限公司" | **create 单独字段**（**不**参与 10 语言 suffix）；专门存中文公司名 |
| `company_english_name` (单值 string) | `03-COMPANY-PROFILE.md` | create |
| `address_*` | `fallbackSettings.address` | create |
| `email` / `phone` / `whatsapp` | fallback + 待确认 | create |
| `logo` / `logo_white` / `favicon` (M2O file) | — | create（待真实图） |
| `social_links` (JSON) | — | create |
| `footer_intro_*` | — | create |
| `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | — | create |

**Locales 严格限定**：en / es / ru / ar / fr / pt / de / id / tr / fa（**无** zh-CN）。  
中文公司名走 `company_name_cn` 单字段，不与 10 语言 suffix 混用。

### 1.9 `redirects`（OPTIONAL · 本期不启用）

| v1.5 §2 字段 | 处理 |
|---|---|
| `id` / `from_path` / `to_path` / `status_code` / `enabled` | optional |

---

## 2. 媒体映射（含 **Public 媒体授权修正**）

| 类别 | 现状 | 处理 |
|---|---|---|
| **Directus media** | 0 records（uploads 卷空） | 新建时按 v1.5 §34.1 文件夹结构上传：`/Products / /Product-Categories / /Applications / /News / /Company / /Certificates / /Downloads / /Private` |
| **Repository static media** | `frontend/public/images/**` 45 files + 1 SVG = **46 files / 16 MB**（**真实存在**，**修正"real media = 0"错误**） | 保留为前端静态资源；不迁入 Directus |
| **Missing references** | 3 MISSING（`export-capability-v2.webp`, `quality-control.webp`, `supply-chain.webp`） | fallback 引用但实际文件不存在；待真实资源补齐 |
| **5 EXISTS** | `/images/home/{additive-packages,fuel-additives,lubricant-additives}.webp` + `/images/home/refined/{application-heavy-duty,application-industrial-machinery}.webp` | OK |

### 2.1 Public 媒体授权（v3 修正 · **不依赖不存在的 `is_public` 字段**）

**错误方案（v2）**：依赖 `directus_files.is_public=true` 字段过滤 → 该字段在 Directus 11 系统表 schema 中**不存在**（directus_files 字段实测：仅系统默认字段）。

**修正方案（v3）· folder-based authorization**：

- Public 角色授予 **folder-scoped 权限**：仅 `/Public/*` 路径下的 files 可读
- 上传文件时按业务用途放置对应文件夹：
  - `/Products/` 产品图（公开）
  - `/Product-Categories/` 分类图（公开）
  - `/Applications/` 应用图（公开）
  - `/News/` 新闻图（公开）
  - `/Company/` 公司图（公开）
  - `/Certificates/` 证书（公开）
  - `/Downloads/` 公开下载文件（公开）
  - **`/Private/` 私有文件**（询盘附件、内部文件）→ **Public 不可读**
- Directus 11 Policy 配置：Public policy 对 `/Private/*` 文件**拒绝** read
- 私有附件走 `/assets/<file_id>` 直链（已鉴权）

**优势**：不修改 directus_files 系统表 schema（不可改），仅用 Directus folder + policy 控制。

---

## 3. 保留 vs 修改对照

| 不允许 | 原因 |
|---|---|
| 重命名 inquiries 已有字段名 | v1.5 §26.1 + 用户指令 |
| 删除 inquiries Collection | 用户指令"禁止删除重建" |
| 删除现有任何 fallback 字段 | fallback 是兜底 |
| **保留 `products.applications` JSON 双真理源** | **Owner Audit v3 修正：与 applications.related_products M2M 重复；移除** |
| 为 v1.5 创建第二套分类/产品/新闻 | 一致性 |
| 导入批量假数据 | 用户指令禁止 |
| 保留 `pending` 作为 legacy runtime value（inquiries.status） | Owner Audit v3 修正 |
| 增加 API 翻译层处理 `pending` ↔ `new` | Owner Audit v3 修正 |
| 拆分 `pages.sections` 为 `sections_en / sections_es / ...` 10 个字段 | **Owner Audit v3 修正**：单一 canonical + translations 内嵌 |
| **使用 `directus_files.is_public` 字段**（不存在） | **Owner Audit v3 修正**：用 folder-based authorization |
| 使用 zh-CN locale | 不在 10 语言集合内；中文内容走 `company_name_cn` 单字段 |

| 允许 | 说明 |
|---|---|
| 新增 inquiries 字段 | whatsapp / country / date_updated / internal_notes / assigned_to / outcome / next_follow_up_at |
| 替换 inquiries.status 的 enum choices + default | v1.5 canonical `[new, contacted, qualified, quoted, follow_up, closed]`；default `new` |
| 新建 7 个 collections | site_settings / product_categories / products / news_categories / news / applications / pages |
| 新建 1 个可选 collection | redirects（本期不启用） |
| 高亮字段从 string[] 改为多语言结构 JSON | `{id, sort, translations: [{locale, text}]}` |
| 页面 sections 字段改为单 canonical + 内嵌 translations | `{id, type, sort, image, product_ids, cta_link, translations: [...]}` |
| 移除 products.applications JSON（双真理源 → 单一 M2M） | 通过 applications.related_products 表达关系 |
| 引入 `company_name_cn` 单字段存中文公司名 | 不参与 10 语言 suffix |
| Public 媒体改用 folder-based 授权 | 通过 Directus folder + policy 配置 |

---

## 4. URL/Slug 兼容性矩阵（v3 修正 · locale-expanded count）

| URL 类型 | slug / pattern 数 | × 10 locales | total URLs |
|---|---|---|---|
| `/[locale]` | 1 | × 10 | 10 |
| `/[locale]/products/category/[slug]` | 31 | × 10 | 310 |
| `/[locale]/products/[slug]` | 28 | × 10 | 280 |
| `/[locale]/news/[slug]` | 10 | × 10 | 100 |
| `/[locale]/{products,news,applications,service,about,contact}` (固定) | 6 | × 10 | 60 |
| `/` (redirect-only) | 1 | × 10 | 10 |
| `/api/inquiries` (API) | 1 | × 10 | 10 |
| `/applications/[slug]` | **0（不存在）** | 0 | 0 |
| **Total public URLs (locale-expanded)** | — | — | **780** |
| **distinct slugs** (categories+products+news) | — | — | **69** |

---

## 5. 多语言字段兼容性（v3 修正）

| 主题 | 当前 | v1.5 | 兼容性 |
|---|---|---|---|
| 翻译模型 | `_*` 后缀（10 lang） | `_*` 后缀 | ✅ |
| 语言集合 | en/es/ru/ar/fr/pt/de/id/tr/fa | 同（**不含** zh-CN） | ✅ |
| RTL | ar + fa | ar + fa | ✅ |
| 默认 | en | en | ✅ |
| 中文公司名 | `company_name_cn`（**单字段**） | n/a | ✅（不参与 10 语言） |
| hreflang | — | 必须 | 待补 |
| pages.sections 模型 | **单 canonical + 内嵌 translations** | v1.5 §45.2 | ✅ 修正 |

---

## 6. inquiries 状态机迁移（Owner Audit v3 修正）

| 项 | v1（错误） | v2（仍 BLOCKED） | **v3（最终）** |
|---|---|---|---|
| Field name | status | status | **status** |
| Choices enum | `[pending, handled]` | `[new, contacted, qualified, quoted, follow_up, closed]` | **同 v2** |
| Default value | `pending` | `new` | **同 v2** |
| Legacy `pending` runtime | 保留 | 不保留 | **不保留** |
| API 翻译层 `pending ↔ new` | 计划 | 不增加 | **不增加** |
| Destructive? | NO | NO | **NO**（0 records + metadata-only） |

---

## 7. Phase 2B 收尾要求（用户确认后才能执行）

1. ✅ Directus 8 个 Collection + required 全部 create 完毕
2. ✅ inquiries 字段名 100% 保留；status enum 替换（非 destructive）；7 字段新增
3. ✅ products.applications JSON 字段**不创建**（移除双真理源）；applications.related_products M2M 单一真理
4. ✅ slug 全部沿用 fallback；URL 无变化（780 URL instances preserved）
5. ✅ frontend/src/lib/directus/* 改造为调用新字段
6. ✅ fallback-data.ts 标注 `已迁入 Directus，仅作开发期参考`
7. ✅ business.ts 同上标注
8. ✅ apply-schema.mjs 幂等；重复运行零非预期变化
9. ✅ destructive changes = 0
10. ✅ 不增加 API 翻译层
11. ✅ pages.sections 单 canonical + translations（不分离 10 个 `_*` 字段）
12. ✅ highlights 多语言结构化
13. ✅ company_name_cn 单字段存中文
14. ✅ Public 媒体走 folder-based 授权

---

> v3 是 Owner Audit v3 修正版。v1/v2 因 10 项关键问题被 BLOCKED，以本版为准。