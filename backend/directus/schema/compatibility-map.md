# Compatibility Map — 历史字段与 v1.5 Canonical Dictionary 映射（重新实测）

> 来源：v1.5 §26（Canonical Data Dictionary）+ §14.2（Mapping 模板）  
> 编制时间：2026-10-01 UTC（Owner Audit 修正版）  
> 编制执行者：Claude（只读映射）  
> 核心原则：**禁止为了 v1.5 Canonical Dictionary 直接重命名现有稳定字段；语义等价的历史字段通过本表保留映射。**

---

## 1. 字段映射总表

### 1.1 `inquiries`（已有，禁止删字段名，status enum 替换按 v1.5）

| v1.5 §26.1 Canonical | 当前实际 | 等价关系 | 处理 |
|---|---|---|---|
| `name` | `customer_name` (string, required) | 等价（客户姓名） | **保留字段名 `customer_name`**；前端 API 内部将 `name` → `customer_name` |
| `email` | `email` (string, required) | 完全等价 | unchanged |
| `company` | `company_name` (string, nullable) | 等价 | **保留字段名 `company_name`**；前端 `company` → `company_name` |
| `phone` | `phone` (string, nullable) | 等价 | unchanged |
| `whatsapp` | — | 新增 | **create** |
| `country` | — | 新增 | **create** |
| `message` | `message` (text, required) | 等价 | unchanged |
| `source_path` | `source_page` (string, nullable) | 等价 | **保留字段名 `source_page`**；前端 `sourcePath` → `source_page` |
| `product_slug` | `product_interested` (string, nullable) | 等价 | **保留字段名 `product_interested`**；前端 `productSlug` → `product_interested` |
| `locale` | `locale` (string, nullable) | 等价 | unchanged |
| `status` (enum: new/contacted/qualified/quoted/follow_up/closed) | `status` (string, current enum = `[pending, handled]`, default `pending`) | 当前值集合已偏离 v1.5 | **保留字段名 `status`**；**choices 替换为 v1.5 canonical enum** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换为 `new`**；**不保留 `pending` 作为 legacy runtime 值**（0 条记录决定）；**不增加 API 翻译层**（v1.5 §26.1 + §44） |
| `date_created` | `date_created` (timestamp) | 等价 | unchanged |
| `date_updated` | — | 新增 | **create** |
| `internal_notes` | — | 新增 | **create** |
| `assigned_to` | — | 新增 | **create** |
| `outcome` (enum: won/lost/deferred/no_response/invalid/spam) | — | 新增；**始终与 status 独立** | **create** |
| `next_follow_up_at` | — | 新增（v1.5 §12.6） | **create** |

**总影响**：
- 字段保留（unchanged）: 10
- 字段名 + enum/default 替换: 1（`status`，无 destructive，因为 0 records）
- 字段新增（create）: 7
- 字段删除: **0** ✓
- destructive changes: **0** ✓
- **不增加 API 翻译层**（per Owner Audit 修正指令）

### 1.2 `product_categories`（CREATE · 31 条）

| v1.5 §26.2 最低字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` | `id` (string slug) | create；UUID 内部 + slug 对外 |
| `status` (draft/published/archived) | — | create |
| `slug` (unique) | `slug` (string) | create；保留字面 slug 值 |
| `parent` (M2O self) | `parent` (string) | create；按 slug 匹配 UUID |
| `level` (int 1-5) | — | create；系统计算 |
| `sort` (int) | — | create |
| `name_*` | `name` (LocalizedText) | create；en 填值 |
| `description_*` | `description` (LocalizedText) | create；en 填值 |
| `image` (M2O file) | — | create（占位） |
| `image_alt_*` | — | create |
| `show_in_menu` (boolean) | — | create；default true |
| `featured` (boolean) | — | create；default false |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.3 `products`（CREATE · **28 条**）

| v1.5 §26.1 products 最低字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | `id` (string slug) | create；保留 slug 字段 |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `product_category` (M2O) | `category` (string slug) | create；按 slug 匹配 |
| `sort` (int) | — | create |
| `product_name_*` | `name` | create；en 填值 |
| `short_description_*` | `summary` | create；en 填值 |
| `detailed_description_*` (rich_text) | `description` | create；en 填值 |
| `main_image` (M2O file) | `image` (string path) | create；fallback 期间路径保留 |
| `product_images` (M2M files) | — | create |
| `image_alt_*` | `imageAlt` | create |
| `specifications` (JSON array) | — | **create；化工行业核心（CAS No. / Appearance / Purity / Storage / Shelf Life 等）通过 Specifications 承载，不做固定列** |
| `internal_product_code` | — | create（单值 string） |
| `moq` | — | create（单值 string） |
| `lead_time_*` | — | create（×10） |
| `packaging_*` | — | create（×10） |
| `featured_product` (boolean) | — | create |
| `customizable` (boolean) | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |
| `highlights` (JSON) | `highlights` (string[]) | create；保持 JSON 数组 |
| `applications` (JSON) | `applications` (string[]) | create；保持 JSON 数组 |

**Spec → Structured Block 建议**：
- 化工属性：CAS No. / Appearance / Purity / Storage Condition / Shelf Life / Viscosity / Flash Point 等
- 进 `specifications` JSON 数组（元素 `{key, values: {lang: text}}`）
- **不**为这些属性创建独立固定列（v1.5 §4.3 + §26.1）

### 1.4 `applications`（CREATE · 8 条）

| v1.5 §7 字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | — | create；按 title 规范化 |
| `title_*` | `business.ts applications[].title` | create；en 填值 |
| `short_description_*` | `applications[].description` | create；en 填值 |
| `content_*` (rich_text) | — | create；en 留空待编辑 |
| `image` (M2O file) | — | create（占位） |
| `image_alt_*` | — | create |
| `related_products` (M2M products) | — | create；通过中间表 `applications_products` |
| `sort` / `status` / `featured` | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.5 `news_categories`（CREATE · 6 条去重）

| v1.5 §6.1 字段 | 当前等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | — | create；用 category_name 规范化 |
| `category_name_*` | 6 条去重字符串 | create；en 填值 |
| `description_*` | — | create（暂留空） |
| `sort` / `status` | — | create |
| `seo_title_*` / `seo_description_*` | — | create |

### 1.6 `news`（CREATE · 10 条）

| v1.5 §6.2 字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | `id` (string slug) | create；保留 slug |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `category` (M2O news_categories) | `category` (string) | create；按 category_name 匹配 |
| `sort` / `featured` / `author` | — | create |
| `published_at` (datetime) | `publishedAt` ('2026-09-01') | create；ISO 字符串 → timestamp |
| `title_*` | `title` | create；en 填值 |
| `excerpt_*` | `excerpt` | create；en 填值 |
| `content_*` (rich_text) | `content` | create；en 填值 |
| `cover_image` (M2O file) | `image` (string path) | create；fallback 路径保留 |
| `image_alt_*` | `imageAlt` | create；en 填值 |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.7 `pages`（CREATE · 5 个 page_key）

| v1.5 §8.2 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` | — | create |
| `page_key` (unique) | — | create；`home` / `about` / `service` / `applications` / `contact` |
| `slug` | — | create；与 page_key 同步 |
| `title_*` | — | create |
| `hero_title_*` | `business.ts hero.title` | create；en 填值（home） |
| `hero_subtitle_*` | `business.ts hero.summary` + `companyName` | create；en 填值（home） |
| `hero_image` / `hero_image_alt_*` / `hero_button_text_*` / `hero_button_link` | — | create |
| `sections_*`（JSON array，×10） | `business.ts` 12 块 | create；每 page_key 一个 sections 数组；type ∈ `{text, image_text, features, faq, cta, process}` |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |
| `og_image` / `image` / `image_alt_*` | — | create |

**Sections_ 结构**（Structured Block · v1.5 §8.3）：
```json
{
  "sections_en": [
    {"id": "hero", "type": "text", "title": "...", "body": "...", "image": null, "image_alt": null, "button_text": null, "button_link": null, "sort": 1},
    {"id": "positioning", "type": "text", "title": "...", "body": "...", ...},
    ...
  ]
}
```

### 1.8 `site_settings`（CREATE Singleton）

| v1.5 §9 字段 | 当前等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` | — | create |
| `site_name_*` | `fallbackSettings.siteName` | create；en 填值 |
| `tagline_*` | `fallbackSettings.tagline` | create；en 填值 |
| `company_name_*` | `03-COMPANY-PROFILE.md` | create；zh-CN 填中文官方名 |
| `company_english_name` | `03-COMPANY-PROFILE.md` | create；单值 |
| `address_*` | `fallbackSettings.address` | create；en 填值 |
| `email` / `phone` / `whatsapp` | `fallbackSettings.phone` + 待确认 | create |
| `logo` / `logo_white` / `favicon` | — | create（M2O file） |
| `social_links` (JSON) | — | create |
| `footer_intro_*` | — | create |
| `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | — | create |

### 1.9 `redirects`（OPTIONAL · 本期不启用）

| v1.5 §2 字段 | 处理 |
|---|---|
| `id` / `from_path` / `to_path` / `status_code` / `enabled` | optional；当前无 redirects 数据；启用需 nginx 集成评估 |

---

## 2. 保留 vs 修改对照

| 不允许 | 原因 |
|---|---|
| 重命名 inquiries 已有字段名 | v1.5 §26.1 + 用户指令"existing field name must be preserved" |
| 删除 inquiries Collection | 用户指令"禁止删除重建" |
| 删除现有任何 fallback 字段 | fallback 是兜底 |
| 为 v1.5 创建第二套分类/产品/新闻 | 一致性 |
| 导入批量假数据 | 用户指令禁止 |
| 保留 `pending` 作为 legacy runtime 值（inquiries.status） | Owner Audit 修正：0 records 不保留 legacy |
| **增加 API 翻译层处理 `pending` ↔ `new`** | **Owner Audit 修正：DB enum 直接 v1.5 canonical，不增加翻译层** |

| 允许 | 说明 |
|---|---|
| 新增 inquiries 字段 | whatsapp / country / date_updated / internal_notes / assigned_to / outcome / next_follow_up_at |
| 替换 inquiries.status 的 enum choices + default | v1.5 canonical enum `[new, contacted, qualified, quoted, follow_up, closed]`；default `new` |
| 新建 7 个 collections | site_settings / product_categories / products / news_categories / news / applications / pages |
| 新建 1 个可选 collection | redirects |
| 前端 API 字段映射 | InquiryPayload.name → Directus customer_name；前端与 DB 字段名解耦 |
| 保持 fallback-data.ts 28 products 数据原状 | 正式上线时按需逐条 import |

---

## 3. URL/Slug 兼容性矩阵（迁移不变）

| 现有 URL | 数量 | Directus 字段 | 迁移后 URL | 一致性 |
|---|---|---|---|---|
| `/products/category/[slug]` | 31 | product_categories.slug | 同 | ✅ |
| `/products/[slug]` | 28（修正） | products.slug | 同 | ✅ |
| `/news/[slug]` | 10 | news.slug | 同 | ✅ |
| `/applications/[slug]` | 8 | applications.slug | 同 | ✅ |
| `/[locale]/{about,service,applications,contact,products,news}` | 7 固定 | page_key | 同 | ✅ |

**总公开 URL = 31 + 28 + 10 + 8 + 8 + 路由 = 85 个**，全部保留。

---

## 4. 多语言字段兼容性

| 主题 | 当前 | v1.5 | 兼容性 |
|---|---|---|---|
| 翻译模型 | `_*` 后缀（10 lang） | `_*` 后缀（10 lang） | ✅ |
| 语言集合 | en/es/ru/ar/fr/pt/de/id/tr/fa | en/es/ru/ar/fr/pt/de/id/tr/fa | ✅ |
| RTL | ar + fa | ar + fa | ✅ |
| 默认 | en | en | ✅ |
| hreflang | 未实现 | 必须 | 待补 |
| sitemap 语言过滤 | 不分语言 | 按已发布语言 | 待补 |

---

## 5. UI strings vs CMS 内容边界（v1.5 §0.2）

| 边界 | 在哪 |
|---|---|
| 固定界面词（nav/cta/form/footer） | `frontend/src/locales/*/common.json`（永远不进入 Directus） |
| 产品/新闻/应用/页面正文 + SEO + 图片 Alt + 分类描述 | Directus（永远不写死 fallback / JSX / data / MD） |
| fallback-data.ts + business.ts | 开发期支持；正式上线时按需逐条 import |

---

## 6. inquiries 状态机迁移（Owner Audit 修正关键项）

**Phase 2A v1（错误）**：
- 保留 `pending` 作为 legacy runtime value
- 增加 API 翻译层 `pending ↔ new`

**Phase 2A v2（Owner Audit 修正）**：
- ❌ 不保留 `pending` 作为 legacy runtime value
- ❌ 不增加 API 翻译层
- ✅ DB enum choices 直接替换为 v1.5 canonical：`[new, contacted, qualified, quoted, follow_up, closed]`
- ✅ default value 直接替换为 `new`
- ✅ 当前 0 条记录决定此替换是**非 destructive**

**Field name 仍 preserved**：`status` 字段名不重命名（v1.5 也是 `status`）。
**outcome 始终独立于 status**（v1.5 §44 双维度模型）。

---

## 7. Phase 2B 收尾要求（用户确认后才能执行）

完成 Schema 应用 + Permissions + 测试后：

1. ✅ Directus 8 个 Collection + required 全部 create 完毕
2. ✅ inquiries 字段名 100% 保留；status enum 替换（非 destructive）；7 字段新增
3. ✅ slug 全部沿用 fallback（**28 products 修正**）；URL 无变化
4. ✅ frontend/src/lib/directus/* 改造为调用新字段
5. ✅ fallback-data.ts 标注 `已迁入 Directus，仅作开发期参考`
6. ✅ business.ts 同上标注
7. ✅ apply-schema.mjs 幂等；重复运行零非预期变化
8. ✅ destructive changes = 0
9. ✅ **不增加 API 翻译层**（v1.5 直接 ENUM）

---

> Mapping + Compatibility + Schema Gap 完成后，进入 dry-run 输出 + 用户审批，然后才能 Apply。