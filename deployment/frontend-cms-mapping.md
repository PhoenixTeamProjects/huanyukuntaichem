# Frontend → Directus Mapping Table — 前台字段到 CMS 字段的映射（重新实测）

> 来源：v1.5 §14.2、§26（Mapping 模板）+ §29（首次接管清单）  
> 编制时间：2026-10-01 UTC（Owner Audit 修正版）  
> 编制执行者：Claude（只读映射，无数据迁移）  
> 范围：所有前台消费字段 → 对应 Directus Collection / Field / Transform  
> **修正**：products 从 10 条修正为 28 条（实测 fallback-data.ts）

---

## Mapping 表字段说明（每行）

| 列 | 含义 |
|---|---|
| Source Type | 静态 TS / JSON / MD / DB / API / JSX 硬编码 |
| Source File/API | 源文件路径 |
| Source Field | 源 TS interface 或 JSON key |
| Source Example | 一个示例值 |
| Target Collection | Directus Collection 名 |
| Target Field | Directus 字段名（含 `_*` 多语言后缀） |
| Transform Rule | 转换 / 适配 / 合并策略 |
| Record Count | 现有记录条数（fallback 中） |
| Migration Status | existing / create / update / unchanged / optional |
| Frontend Consumer | 哪个页面 / 组件消费 |
| Verification Result | 验收方式 |

---

## 1. SiteSettings → `site_settings`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `fallback-data.ts` | `siteName` | "HUANYU KUNTAI CHEM" | site_settings | `site_name_*` | 单值 → 10 语言后缀字段；en 填值 | 1 | create | Header / Footer / 全站 | Home 页 og:site_name 匹配 |
| TS | 同上 | `tagline` | "Additive Technology for Global Industry" | site_settings | `tagline_*` | 10 语言后缀；en 填值 | 1 | create | Header / Footer | 首页 hero 副标题匹配 |
| TS | 同上 | `phone` | "+86 181 8260 2513" | site_settings | `phone` | 单值 string；不本地化 | 1 | create | Footer / Contact | tel:+8618182602513 正确 |
| TS | 同上 | `email` | null | site_settings | `email` | 单值 string；可空 | 1 | create | Contact 页 | 留空时不显示 |
| TS | 同上 | `address` | "No. 66 Dongqi Road, ..." | site_settings | `address_*` | 10 语言后缀 | 1 | create | Footer / Contact | Footer 地址渲染匹配 |
| — | — | — | — | site_settings | `company_name_*` | 新增 | 0 | create | Footer / About | 03-COMPANY-PROFILE.md 中文名 |
| — | — | — | — | site_settings | `company_english_name` | 新增单值 string | 0 | create | Footer / About | 英文官方名 |
| — | — | — | — | site_settings | `logo` / `logo_white` / `favicon` | 新增 M2O directus_files | 0 | create（待真实图） | Header / favicon | 上传后渲染 |
| — | — | — | — | site_settings | `whatsapp` | 新增字符串 | 0 | create（待确认） | Contact | wa.me 链接 |
| — | — | — | — | site_settings | `social_links` | 新增 JSON 数组 `{platform, url}` | 0 | create | Footer | 解析渲染 |
| — | — | — | — | site_settings | `footer_intro_*` | 新增 10 语言后缀 | 0 | create | Footer | 占位后续编辑 |
| — | — | — | — | site_settings | `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | 新增 SEO 回退 | 0 | create | 缺 SEO 时回退 | — |

**Total records: 1 → site_settings (Singleton)**

---

## 2. fallbackCategories → `product_categories`（CREATE · 31 条）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `fallback-data.ts` | `id` | "fuel-additives" | product_categories | `id` (UUID) | 内部用 UUID；公开标识用 slug | 31 | create | — | — |
| TS | 同上 | `slug` | "fuel-additives" | product_categories | `slug` (unique) | 保留字面 slug；UNIQUE | 31 | create | `/products/category/[slug]` URL | URL 不变 |
| TS | 同上 | `name` | "Fuel Additives" | product_categories | `category_name_*` | 10 语言后缀；en 填值 | 31 | create | 分类标题 | 多语言匹配 |
| TS | 同上 | `description` | "Gasoline and diesel additive systems..." | product_categories | `category_description_*` | 10 语言后缀；en 填值 | 31 | create | 分类详情页 | 多语言描述 |
| TS | 同上 | `parent` (string) | "fuel-additives" | product_categories | `parent` (M2O self) | 字符串 → UUID 关系 | 28 有 parent / 3 root | create | 分类树构建 | 父子关系正确 |
| — | — | — | — | product_categories | `level` (int 1-5) | 系统计算 | — | create | max-5 校验 | 深度检查 |
| — | — | — | — | product_categories | `image` (M2O file) | 新增 | 0 | create（待真实图） | 分类卡片图 | — |
| — | — | — | — | product_categories | `image_alt_*` | 新增 | 0 | create | 卡片图 alt | — |
| — | — | — | — | product_categories | `show_in_menu` (boolean, default true) | 新增 | — | create | 导航菜单 | — |
| — | — | — | — | product_categories | `featured` (boolean, default false) | 新增 | — | create | 首页推荐 | — |
| — | — | — | — | product_categories | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 | — | create | 分类页 SEO | — |
| — | — | — | — | product_categories | `sort` (int, default 0) | 新增 | — | create | 列表排序 | — |
| — | — | — | — | product_categories | `status` (enum) | 新增；draft/published/archived | — | create | 发布状态 | 仅 published 显示 |

**Total records: 31 → product_categories**

---

## 3. fallbackProducts → `products`（CREATE · **28 条** · 修正）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `fallback-data.ts` | `id` | "gasoline-fuel-additives" | products | `id` (UUID) | 保留 slug 作为公开标识 | **28** | create | — | URL 不变 |
| TS | 同上 | `slug` | "gasoline-fuel-additives" | products | `slug` (unique) | 保留字面 slug | **28** | create | `/products/[slug]` | URL 不变 |
| TS | 同上 | `category` (slug) | "gasoline-fuel-additives" | products | `product_category` (M2O) | 按 slug 匹配 category UUID | **28** | create | 分类归属 + 面包屑 | 详情页分类正确 |
| TS | 同上 | `name` | "Gasoline Fuel Additives" | products | `product_name_*` | 10 语言后缀；en 填值 | **28** | create | 卡片 / 详情标题 | 多语言匹配 |
| TS | 同上 | `summary` | "A structured portfolio for gasoline..." | products | `short_description_*` | 10 语言后缀 | **28** | create | 卡片摘要 | 摘要匹配 |
| TS | 同上 | `description` | "This product family is supplied..." | products | `detailed_description_*` (rich_text) | 10 语言后缀；en 填值；text → rich text | **28** | create | 详情正文 | 详情页正文匹配 |
| TS | 同上 | `image` (string path) | "/images/home/lubricant-additives.webp" | products | `main_image` (M2O file) | 路径 → 上传文件 ID；fallback 期间路径保留 | **28** | create（占位待真实图） | 主图 | — |
| TS | 同上 | `imageAlt` | "Gasoline Fuel Additives" | products | `image_alt_*` | 10 语言后缀 | **28** | create | 主图 alt | — |
| TS | 同上 | `highlights` (string[]) | [...] | products | `highlights` (JSON) | 字符串数组 → JSON | **28** | create | 卡片要点 | 列表渲染 |
| TS | 同上 | `applications` (string[]) | [...] | products | `applications` (JSON) | 字符串数组 → JSON | **28** | create | 卡片应用 | 列表渲染 |
| — | — | — | — | products | `product_images` (M2M files) | 新增 | 0 | create | 图库 | — |
| — | — | — | — | products | `specifications` (JSON array) | **可由 Specifications 承载**：CAS No.、Appearance、Purity 等化工字段 | 0 | create | 规格表 | — |
| — | — | — | — | products | `internal_product_code` | 单值 string | 0 | create | 内部管理 | — |
| — | — | — | — | products | `moq` (string) | 单值 string | 0 | create | 商务信息 | — |
| — | — | — | — | products | `lead_time_*` (string ×10) | 10 语言后缀；en 填值 | 0 | create | 商务信息 | — |
| — | — | — | — | products | `packaging_*` (string ×10) | 10 语言后缀 | 0 | create | 商务信息 | — |
| — | — | — | — | products | `featured_product` (boolean, default false) | 新增 | — | create | 首页推荐 | — |
| — | — | — | — | products | `customizable` (boolean, default false) | 新增 | — | create | 商务定制 | — |
| — | — | — | — | products | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 | — | create | 产品 SEO | — |
| — | — | — | — | products | `sort` / `status` | 新增 | — | create | 列表排序 + 发布 | — |

**Total records: 28 → products**（**Phase 2A 旧版写 10 是错的，已实测修正**）

**注：建议进入 Specifications（structured JSON）而非固定列的字段**：
- 化工属性 (CAS No., Appearance, Purity, Storage Condition, Shelf Life 等)
- 行业专用参数（如果未来客户需要）
- 这类字段每条产品的值都不同，长期维护在 Specifications 更灵活

---

## 4. fallbackNews → `news`（CREATE · 10 条）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `fallback-data.ts` | `id` | "news-choosing-the-right-additive-direction" | news | `id` (UUID) | 保留 slug 作为 URL | 10 | create | — | URL 不变 |
| TS | 同上 | `slug` | "choosing-the-right-additive-direction" | news | `slug` (unique) | 保留字面 slug | 10 | create | `/news/[slug]` URL | URL 不变 |
| TS | 同上 | `category` (string) | "Lubricant formulation" | news | `category` (M2O news_categories) | 字符串 → 关系；按 category_name 匹配 | 10 | create | 列表分类筛选 | 筛选生效 |
| TS | 同上 | `title` | "How to choose the right additive direction..." | news | `title_*` | 10 语言后缀；en 填值 | 10 | create | 列表 / 详情标题 | 多语言匹配 |
| TS | 同上 | `excerpt` | "Effective selection starts with..." | news | `excerpt_*` | 10 语言后缀 | 10 | create | 列表摘要 | 摘要匹配 |
| TS | 同上 | `content` | "The first step in additive selection is..." | news | `content_*` (rich_text) | 10 语言后缀；en 填值 | 10 | create | 详情正文 | 详情页正文匹配 |
| TS | 同上 | `image` (string path) | "/images/home/lubricant-additives.webp" | news | `cover_image` (M2O file) | 路径 → 上传文件 ID | 10 | create（占位） | 封面图 | — |
| TS | 同上 | `imageAlt` | (title 副本) | news | `image_alt_*` | 10 语言后缀 | 10 | create | 封面图 alt | — |
| TS | 同上 | `publishedAt` | "2026-09-01" | news | `published_at` (timestamp) | ISO 字符串 → timestamp | 10 | create | 列表日期 | 日期匹配 |
| — | — | — | — | news | `author` (string) | 新增 | — | create | 文章作者 | — |
| — | — | — | — | news | `featured` (boolean, default false) | 新增 | — | create | 首页精选 | — |
| — | — | — | — | news | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 | — | create | 文章 SEO | — |
| — | — | — | — | news | `sort` / `status` | 新增 | — | create | 列表排序 + 发布 | — |

**Total records: 10 → news**

---

## 5. fallbackNews category 字符串 → `news_categories`（CREATE · 6 条去重）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS 内联 | `fallback-data.ts` | `news(..., category, ...)` 第 2 参数 | "Lubricant formulation" | news_categories | `slug` / `category_name_*` | 6 去重字符串规范化 slug + en 填值 | 6 | create | 新闻列表分类筛选 | 筛选生效 |

去重结果（实测）：
- "Lubricant formulation" — 3 篇
- "Fuel additives" — 2 篇
- "Quality & documentation" — 2 篇
- "Additive packages" — 1 篇
- "Quality systems" — 1 篇
- "Global supply" — 1 篇

**Total records: 6 → news_categories**

---

## 6. business.ts `applications` → `applications`（CREATE · 8 条）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `business.ts` | `applications[].title` | "Passenger vehicles" | applications | `title_*` | 10 语言后缀；en 填值 | 8 | create | `/applications` 列表 / 详情 | 标题匹配 |
| TS | 同上 | `applications[].description` | "Gasoline and diesel fuel treatment..." | applications | `short_description_*` | 10 语言后缀 | 8 | create | 详情页 | 描述匹配 |
| TS | 同上 | `applications[].direction` | "Fuel additives · PCMO additive packages" | applications | `summary_*` (备用摘要) | 10 语言后缀 | 8 | create | 详情卡片 | — |
| — | — | — | — | applications | `content_*` (rich_text) | 新增；en 留空待编辑 | 0 | create | 详情正文扩展 | — |
| — | — | — | — | applications | `image` (M2O file) / `image_alt_*` | 新增 | 0 | create（待真实图） | 应用封面 | — |
| — | — | — | — | applications | `related_products` (M2M products) | 中间表 `applications_products` | 0 | create | "相关产品"区 | — |
| — | — | — | — | applications | `slug` (unique) | 新增；按 title 规范化 | — | create | `/applications/[slug]` URL | URL 不变 |
| — | — | — | — | applications | `seo_*` / `sort` / `status` / `featured` | 新增 | — | create | — | — |

**Total records: 8 → applications**

---

## 7. business.ts 12 块 → `pages`（CREATE · 5 个 page_key）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `business.ts` | `hero` (eyebrow, title, summary) | Hero 文本 | pages (page_key=`home`) | `hero_title_*` / `hero_subtitle_*` | 拆字段；en 填值 | 1 | create | `/` 顶部 | 渲染匹配 |
| TS | 同上 | `positioning` | "Global Fuel & Lubricant..." | pages | `sections_*` JSON array (`type=text`) | 进入 home sections | 1 | create | `/` 定位区 | 渲染 |
| TS | 同上 | `companyName` | "Xi'an Huanyu Kuntai..." | pages | `hero_subtitle_*`（备用） | en 填值 | 1 | create | `/` 副标 | — |
| TS | 同上 | `companyIntroduction` (3 段) | 3 段文字 | pages | `sections_*` (`type=text`) | 段落合并为 1 sections 条目 | 1 | create | `/about` | 渲染 |
| TS | 同上 | `productSystems` (3 项) | Fuel / Lubricant / Packages | pages (home) | `sections_*` (`type=features`) | 3 项 → 1 sections 条目 | 1 | create | `/` 三大产品区 | 渲染 |
| TS | 同上 | `capabilities` (8 项) | Formula / Quality / OEM... | pages (service) | `sections_*` (`type=features`) | 8 项 → 1 sections | 1 | create | `/service` / `/` | 渲染 |
| TS | 同上 | `qualityProcess` (8 步) | Raw material → Export release | pages (about) | `sections_*` (`type=process`) | 8 步 → 1 sections | 1 | create | `/about` | 渲染 |
| TS | 同上 | `customerTypes` (6 类) | Importers / Manufacturers... | pages (about) | `sections_*` (`type=features`) | 6 类 → 1 sections | 1 | create | `/about` | 渲染 |
| TS | 同上 | `applications` (8 个) | Passenger / Heavy Duty... | pages (applications) | `sections_*` (`type=image_text`) | 8 个 → 1 sections（**冗余**：已迁到 applications collection） | 1 | create | `/applications` 入口 | 渲染 |
| TS | 同上 | `serviceProcess` (6 步) | Requirement → Export & supply | pages (service) | `sections_*` (`type=process`) | 6 步 → 1 sections | 1 | create | `/service` | 渲染 |
| TS | 同上 | `markets` (6 个) | SEA / ME / Africa... | pages (about) | `sections_*` (`type=features`) | 6 个市场 → 1 sections | 1 | create | `/about` | 渲染 |
| TS | 同上 | `complianceNote` | "Certifications, compliance documents..." | pages (about) | `sections_*` (`type=text`) | 1 段 → 1 sections | 1 | create | `/about` | 渲染 |
| — | — | — | — | pages | `page_key` (unique) | 5 个：`home` / `about` / `service` / `applications` / `contact` | 5 | create | 路由映射 | — |
| — | — | — | — | pages | `slug` | 与 page_key 同步 | — | create | — | — |
| — | — | — | — | pages | `title_*` | 10 语言后缀 | — | create | 页面标题 | — |
| — | — | — | — | pages | `hero_image` / `hero_image_alt_*` / `hero_button_text_*` / `hero_button_link` | 新增 | — | create | Hero 区 | — |
| — | — | — | — | pages | `seo_*` / `og_image` / `image` / `image_alt_*` | 新增 | — | create | SEO / OG | — |

**Total records: 5 → pages (5 page_keys: home/about/service/applications/contact)**

---

## 8. UI strings → `frontend/src/locales/*/common.json`（UNCHANGED · 实测 11 keys × 10 lang）

实测每个 locale 文件 = 13 行（en 为 65 行），共 11 个顶级 key：

| 顶级 key | 内容 |
|---|---|
| `nav` | primary / language / home / products / applications / service / news / about / contact |
| `cta` | inquiry / contact / sendInquiry / viewDetails / readMore |
| `home` | eyebrow / title / summary / capabilitiesTitle / capabilitiesText / capabilityFuel / capabilityFuelText / capabilityChemical / capabilityChemicalText / capabilityQuality / capabilityQualityText |
| `products` | intro |
| `news` | intro |
| `about` | intro |
| `applications` | intro |
| `service` | intro |
| `contact` | intro |
| `form` | name / email / company / phone / message / sending / sent / error |
| `footer` | quickLinks / contact |

**不迁移到 Directus**（v1.5 §0.2 + §14.3）。

---

## 9. inquiries Collection（EXISTING + DIFF · **强制保留，禁止删字段**）

| Source Type | Source Field | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|
| DB（保留） | `id` (integer PK) | inquiries | `id` | **保留 integer + seq** | 0 | unchanged | — | 序列正常 |
| DB（保留） | `customer_name` | inquiries | `customer_name` | **保留字段名**（与 v1.5 §26.1 `name` 兼容映射，**API 层不翻译**） | 0 | unchanged | API POST | — |
| DB（保留） | `email` | inquiries | `email` | 等价 | 0 | unchanged | API POST | 邮箱格式校验 |
| DB（保留） | `company_name` | inquiries | `company_name` | **保留字段名**（与 v1.5 `company` 兼容映射） | 0 | unchanged | API POST | — |
| DB（保留） | `phone` | inquiries | `phone` | 等价 | 0 | unchanged | API POST | — |
| DB（保留） | `message` (text) | inquiries | `message` | 等价 | 0 | unchanged | API POST | — |
| DB（保留） | `source_page` | inquiries | `source_page` | **保留字段名**（与 v1.5 `source_path` 兼容映射） | 0 | unchanged | API POST | — |
| DB（保留） | `product_interested` | inquiries | `product_interested` | **保留字段名**（与 v1.5 `product_slug` 兼容映射） | 0 | unchanged | API POST | — |
| DB（保留） | `locale` | inquiries | `locale` | 等价 | 0 | unchanged | API POST | — |
| DB（**CHOICES 替换**） | `status` 当前 enum = `[pending, handled]`, default = `pending` | inquiries | `status` | **保留字段名**；**enum choices 替换为 v1.5 canonical** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换为 `new`**。0 records 决定不保留 `pending` 作为 legacy runtime 值，**不增加 API 翻译层** | 0 | **update** (field name preserved, choices/default replaced) | 业务跟进 | 状态机使用 v1.5 canonical |
| DB（保留） | `date_created` (timestamp) | inquiries | `date_created` | 等价 | 0 | unchanged | 系统 | — |
| — | — | inquiries | `date_updated` (timestamp) | 新增（系统管理） | 0 | create | 系统 | — |
| — | — | inquiries | `whatsapp` (string) | 新增 | 0 | create | Contact 表单 | — |
| — | — | inquiries | `country` (string) | 新增 | 0 | create | Contact 表单 | — |
| — | — | inquiries | `assigned_to` (uuid M2O users) | 新增 | 0 | create | 业务员分配 | — |
| — | — | inquiries | `internal_notes` (text) | 新增（仅 Sales Staff / Admin 可读） | 0 | create | 后台 | — |
| — | — | inquiries | `outcome` (enum: won/lost/deferred/no_response/invalid/spam) | 新增；**outcome 始终独立于 status**（v1.5 §44） | 0 | create | 后台分类 | — |
| — | — | inquiries | `next_follow_up_at` (timestamp) | 新增 | 0 | create | 逾期待跟进 | — |

**Net effect on inquiries**：
- fields UNCHANGED: 10（11 - status 的 field metadata 替换）
- fields ADDED: 7
- fields DELETED: **0** ✓
- destructive changes: **0** ✓
- status enum choices: `[pending, handled]` → `[new, contacted, qualified, quoted, follow_up, closed]`
- status default: `pending` → `new`

---

## 10. 应用 Schema 顺序（v1.5 §13 推荐）

按规范执行顺序：

1. **site_settings** ← CREATE
2. **product_categories** ← CREATE
3. **products** ← CREATE
4. **applications** ← CREATE
5. **news_categories** ← CREATE
6. **news** ← CREATE
7. **pages** ← CREATE（page_key：home/about/service/applications/contact）
8. **inquiries** ← EXISTING + DIFF（保留 11 字段 + 新增 7 字段 + status enum 替换）
9. **redirects** ← RECOMMENDED（本期不启用）

---

## 11. 字段来源总览（数字汇总 · 修正版）

| 现有数据源 | 条数 | 目标 Collection |
|---|---|---|
| fallbackSettings | 1 条（5 字段） | site_settings |
| fallbackCategories | **31** 条 | product_categories |
| fallbackProducts | **28** 条（修正） | products |
| fallbackNews | 10 条 | news |
| fallbackNews category 字符串 | 6 条去重 | news_categories |
| business.ts applications | 8 条 | applications |
| business.ts 其他 12 块（home/about/service） | 5 page_key | pages |
| inquiries DB | 0 条（11 字段已存在） | inquiries（diff 审计） |
| redirects | 0 条 | redirects（可选，本期不启用） |

**总 fallback 记录数：31 + 28 + 10 + 8 + 5 + 1 = 83 条** → 全量映射到 Directus

---

## 12. URL/slug 保留矩阵（迁移不变）

| 现有 URL | 数量 | 目标字段 | 迁移后 URL | 一致性 |
|---|---|---|---|---|
| `/products/category/[slug]` | **31** 个 slug | product_categories.slug | 不变 | ✅ |
| `/products/[slug]` | **28** 个 slug（修正） | products.slug | 不变 | ✅ |
| `/news/[slug]` | 10 个 slug | news.slug | 不变 | ✅ |
| `/applications/[slug]` | 8 个 slug | applications.slug | 不变 | ✅ |
| `/[locale]` + 7 个固定路由 | 固定 | page_key | 不变 | ✅ |

**总公开 URL 形状 = 31 + 28 + 10 + 8 + 8 = 85 个**，全部保留。

> 修正：Phase 2A 旧版错算 79 个 = 31 + 10 + 10 + 10 + 8（products 用了 10 而不是 28），正确是 85 个。