# Frontend → Directus Mapping Table — 前台字段到 CMS 字段的映射

> 来源：v1.5 §14.2、§26（Mapping 模板）+ §29（首次接管清单）  
> 编制时间：2026-10-01 UTC  
> 编制执行者：Claude（只读映射，无数据迁移）  
> 范围：所有前台消费字段 → 对应 Directus Collection / Field / Transform

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
| TS | `frontend/src/lib/directus/fallback-data.ts` | `fallbackSettings.siteName` | "HUANYU KUNTAI CHEM" | site_settings | `site_name_*` | 单值 → 10 语言后缀字段；默认值填 en，其余留空 | 1 | create | Header / Footer / 全站 | Home 页 og:site_name 显示匹配 |
| TS | 同上 | `fallbackSettings.tagline` | "Additive Technology for Global Industry" | site_settings | `tagline_*` | 10 语言后缀；en 填值 | 1 | create | Header / Footer | 首页 hero 副标题匹配 |
| TS | 同上 | `fallbackSettings.phone` | "+86 181 8260 2513" | site_settings | `phone` | 单值 string；不本地化 | 1 | create | Footer / Contact 页 | 电话链接 `tel:+8618182602513` 渲染正确 |
| TS | 同上 | `fallbackSettings.email` | null（未确认） | site_settings | `email` | 单值 string；CMS 字段可空，UI 不渲染空值 | 1 | create | Contact 页 | 留空时不显示 |
| TS | 同上 | `fallbackSettings.address` | "No. 66 Dongqi Road, ..." | site_settings | `address_*` | 10 语言后缀 | 1 | create | Footer / Contact | Footer 地址渲染匹配 |
| （缺失） | — | — | — | site_settings | `company_name_*` | 新增字段 | 0 | create | Footer / About 页 | "西安寰宇坤泰工业科技有限公司" 等 |
| （缺失） | — | — | — | site_settings | `company_english_name` | 新增字段（单值 string） | 0 | create | Footer / About | 英文名匹配 03-COMPANY-PROFILE.md |
| （缺失） | — | — | — | site_settings | `logo` / `logo_white` / `favicon` | 新增 M2O directus_files | 0 | create（待真实图） | Header / favicon | 上传文件后渲染 |
| （缺失） | — | — | — | site_settings | `whatsapp` | 新增字符串 | 0 | create（待确认） | Contact | 链接 `https://wa.me/86...` |
| （缺失） | — | — | — | site_settings | `social_links` | 新增 JSON 数组，元素 `{platform, url}` | 0 | create | Footer | JSON 解析并渲染图标 |
| （缺失） | — | — | — | site_settings | `footer_intro_*` | 新增 10 语言后缀文本 | 0 | create | Footer | 占位 + 后续编辑 |
| （缺失） | — | — | — | site_settings | `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | 新增 SEO 回退字段 | 0 | create | 缺 SEO 字段页面回退 | 无 SEO 时回退 |

---

## 2. fallbackCategories → `product_categories`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `frontend/src/lib/directus/fallback-data.ts` | `fallbackCategories[].id` | "fuel-additives" | product_categories | `id` (UUID) | **保留 slug 作为公开 URL 标识**；内部 id 用 UUID | 31 | create | — | 列表展示 |
| TS | 同上 | `slug` | "fuel-additives" | product_categories | `slug` (unique) | 保留字面 slug；唯一约束 | 31 | create | `/products/category/[slug]` URL | URL 不变 |
| TS | 同上 | `name` (单语言字符串) | "Fuel Additives" | product_categories | `category_name_*` | 拆为 10 语言后缀；en 填值 | 31 | create | 产品分类标题 / Header | 多语言渲染匹配 |
| TS | 同上 | `description` | "Gasoline and diesel additive systems..." | product_categories | `category_description_*` | 10 语言后缀；en 填值 | 31 | create | 产品分类详情页 | 多语言描述匹配 |
| TS | 同上 | `parent` (string id) | "fuel-additives" | product_categories | `parent_category` (M2O self) | 字符串 → UUID 关系；按 slug 匹配 | 30 有 parent / 3 root | create | 分类树构建 | 父子关系正确 |
| （推断） | — | — | — | product_categories | `level` (int) | 系统计算 1–5 | — | create | 验证 ≤ 5 级 | 分类深度检查 |
| （缺失） | — | — | — | product_categories | `image` (M2O file) | 新增字段 | 0 | create（可选） | 分类卡片图 | — |
| （缺失） | — | — | — | product_categories | `image_alt_*` | 新增 10 语言后缀 | 0 | create | 卡片图 alt | — |
| （缺失） | — | — | — | product_categories | `show_in_menu` (boolean) | 新增字段；默认 true | — | create | 导航菜单 | 公开导航显示 |
| （缺失） | — | — | — | product_categories | `featured` (boolean) | 新增字段；默认 false | — | create | 首页重点推荐 | — |
| （缺失） | — | — | — | product_categories | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 SEO 字段 | — | create | 分类页 SEO | — |
| （缺失） | — | — | — | product_categories | `sort` (int) | 新增字段，默认 | — | create | 排序 | — |
| （缺失） | — | — | — | product_categories | `status` (enum) | 新增；draft/published/archived | — | create | 发布状态 | 仅 published 显示 |

---

## 3. fallbackProducts → `products`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `fallback-data.ts` | `id` | "fuel-additives-system" | products | `id` (UUID) | **保留 slug** 作为对外标识 | 10 | create | — | 详情页 URL 不变 |
| TS | 同上 | `slug` | "fuel-additives-system" | products | `slug` (unique) | 保留字面 slug | 10 | create | `/products/[slug]` URL | URL 不变 |
| TS | 同上 | `category` (parent slug) | "fuel-additives" | products | `product_category` (M2O) | 按 slug 匹配 category UUID | 10 | create | 分类归属 + 面包屑 | 详情页分类面包屑正确 |
| TS | 同上 | `name` | "Fuel Additives System" | products | `product_name_*` | 10 语言后缀；en 填值 | 10 | create | 产品卡片 / 详情标题 | 多语言匹配 |
| TS | 同上 | `summary` | "Verified fuel additive..." | products | `short_description_*` | 10 语言后缀；en 填值 | 10 | create | 卡片摘要 / 详情开头 | 摘要匹配 |
| TS | 同上 | `description` (paragraph) | "Verified lubricant additive..." | products | `detailed_description_*` (rich text) | 10 语言后缀；en 填值；text → rich text | 10 | create | 详情正文 | 详情页正文匹配 |
| TS | 同上 | `image` (string path) | "/images/home/lubricant-additives.webp" | products | `main_image` (M2O file) | **路径 → 上传文件 ID**；fallback 期间前端可降级到原路径 | 10 | create（待真实图） | 主图 | 占位 / 实图 |
| TS | 同上 | `imageAlt` | "Fuel Additives System" | products | `image_alt_*` | 10 语言后缀 | 10 | create | 主图 alt | alt 渲染 |
| TS | 同上 | `highlights` (string[]) | [...] | products | `highlights` (JSON 数组) | 字符串数组 → JSON 数组字段 | 10 | create | 卡片要点 | 列表渲染 |
| TS | 同上 | `applications` (string[]) | [...] | products | `applications` (JSON 数组) | 字符串数组 → JSON 数组字段 | 10 | create | 卡片应用 | 列表渲染 |
| （缺失） | — | — | — | products | `product_images` (M2M files) | 新增字段 | — | create | 图库 | — |
| （缺失） | — | — | — | products | `specifications` (JSON 数组) | 新增字段；元素 `{key, values:{语言:文本}}` | — | create | 规格表 | — |
| （缺失） | — | — | — | products | `internal_product_code` / `moq` / `lead_time_*` / `packaging_*` | 新增采购字段 | — | create | 商务信息区 | — |
| （缺失） | — | — | — | products | `featured_product` / `customizable` (boolean) | 新增字段 | — | create | 首页推荐 | — |
| （缺失） | — | — | — | products | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 SEO 字段 | — | create | 产品 SEO | — |
| （缺失） | — | — | — | products | `sort` / `status` | 新增 | — | create | 列表排序 + 发布 | — |

---

## 4. fallbackNews → `news`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `fallback-data.ts` | `id` | "news-choosing-the-right-additive-direction" | news | `id` (UUID) | **保留 slug 作为 URL** | 10 | create | — | 详情页 URL 不变 |
| TS | 同上 | `slug` | "choosing-the-right-additive-direction" | news | `slug` (unique) | 保留字面 slug | 10 | create | `/news/[slug]` URL | URL 不变 |
| TS | 同上 | `category` (string) | "Lubricant formulation" | news | `category` (M2O news_categories) | 字符串 → 关系 | 10 | create | 列表分类筛选 | 筛选生效 |
| TS | 同上 | `title` | "How to choose the right additive direction..." | news | `title_*` | 10 语言后缀；en 填值 | 10 | create | 列表 / 详情标题 | 多语言匹配 |
| TS | 同上 | `excerpt` | "Effective selection starts with..." | news | `excerpt_*` | 10 语言后缀 | 10 | create | 列表摘要 | 摘要匹配 |
| TS | 同上 | `content` (paragraph) | "The first step in additive selection is..." | news | `content_*` (rich text) | 10 语言后缀；en 填值 | 10 | create | 详情正文 | 详情页正文匹配 |
| TS | 同上 | `image` (string path) | "/images/home/lubricant-additives.webp" | news | `cover_image` (M2O file) | 路径 → 上传文件 ID；fallback 期间降级 | 10 | create（待真实图） | 封面图 | 占位 / 实图 |
| TS | 同上 | `imageAlt` | (title 副本) | news | `image_alt_*` | 10 语言后缀 | 10 | create | 封面图 alt | alt 渲染 |
| TS | 同上 | `publishedAt` | "2026-09-01" (统一) | news | `published_at` (timestamp) | 字符串 ISO → timestamp | 10 | create | 列表日期 | 日期匹配 |
| （缺失） | — | — | — | news | `author` | 新增字段 | — | create | 文章作者 | — |
| （缺失） | — | — | — | news | `featured` (boolean) | 新增字段 | — | create | 首页精选 | — |
| （缺失） | — | — | — | news | `seo_title_*` / `seo_description_*` / `seo_keywords_*` | 新增 SEO 字段 | — | create | 文章 SEO | — |
| （缺失） | — | — | — | news | `sort` / `status` | 新增 | — | create | 列表排序 + 发布 | — |

---

## 5. fallbackNews category 字符串 → `news_categories`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS 内联 | `fallback-data.ts` | 各 news 的 `category` 字符串 | "Lubricant formulation" | news_categories | `slug` / `category_name_*` | 5 条去重："Lubricant formulation" / "Fuel additives" / "Additive packages" / "Quality & documentation" / "Quality systems" / "Global supply" | 5（去重后可能 5-6） | create | 新闻列表分类筛选 | 分类筛选生效 |

---

## 6. business.ts `applications` → `applications`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `frontend/src/lib/directus/business.ts` | `applications[].title` | "Passenger vehicles" | applications | `title_*` | 10 语言后缀 | 8 | create | `/applications` 列表 / 详情 | 标题匹配 |
| TS | 同上 | `applications[].description` | "Gasoline and diesel fuel treatment..." | applications | `short_description_*` / `content_*` | 摘要 + 正文 | 8 | create | 详情页 | 描述匹配 |
| TS | 同上 | `applications[].direction` | "Fuel additives · PCMO additive packages" | applications | `summary_*` | 摘要备用字段 | 8 | create | 详情卡片 | — |
| （缺失） | — | — | — | applications | `image` / `image_alt_*` | 新增字段 | — | create（待图） | 应用封面 | — |
| （缺失） | — | — | — | applications | `related_products` (M2M products) | 中间表 `applications_products` | — | create | "相关产品"区 | 关联正确 |
| （缺失） | — | — | — | applications | `slug` (unique) | 新增字段 | — | create | `/applications/[slug]` URL | URL 不变 |
| （缺失） | — | — | — | applications | `seo_*` / `sort` / `status` / `featured` | 新增字段 | — | create | — |

---

## 7. business.ts Home/About/Service/Applications 静态块 → `pages`（CREATE）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| TS | `business.ts` | `hero` (eyebrow, title, summary) | Hero 文本 | pages | `hero_title_*` / `hero_subtitle_*` | 拆为字段；eyebrow 进 `hero_title_*` 之前或 `sections_*` | 1（home page） | create | `/` 顶部 | 渲染匹配 |
| TS | 同上 | `positioning` | "Global Fuel & Lubricant Additives..." | pages | `sections_*` JSON 数组 type=`text` | 文本进 sections | 1 | create | `/` 定位区 | 渲染 |
| TS | 同上 | `companyName` | "Xi'an Huanyu Kuntai..." | pages | `hero_title_*` 备用 | 单值，参见 site_settings | 1 | create | `/` 副标 | — |
| TS | 同上 | `companyIntroduction` (3 段) | 3 段文字 | pages | `sections_*` type=`text` | 段落合并为单 sections 条目 | 1 | create | `/about` | 渲染 |
| TS | 同上 | `productSystems` (3 项) | Fuel/Lubricant/Packages | pages | `sections_*` type=`features` | 每项对应 `sections[*].title` + `body` | 1 | create | `/` 三大产品体系区 | 渲染 |
| TS | 同上 | `capabilities` (8 项) | Formula dev / OEM / Quality... | pages | `sections_*` type=`features` | 8 项合并为 1 个 sections 条目 | 1 | create | `/` / `/about` | 渲染 |
| TS | 同上 | `qualityProcess` (8 步) | Raw material → Export release | pages | `sections_*` type=`process` | 8 步骤 → 1 个 sections 条目 | 1 | create | `/about` | 渲染 |
| TS | 同上 | `customerTypes` (6 类) | Importers / Manufacturers... | pages | `sections_*` type=`features` | 6 类合并为 1 个 sections | 1 | create | `/` / `/about` | 渲染 |
| TS | 同上 | `applications` (8 个) | Passenger / Heavy Duty... | pages | `sections_*` `type=image_text`（链接到 applications collection） | 每个应用保留 1 个 sections 条目，关联 applications record | 1 | create | `/applications` 入口 / Home | 渲染 |
| TS | 同上 | `serviceProcess` (6 步) | Requirement → Export & supply | pages | `sections_*` type=`process` | 6 步 → 1 个 sections 条目 | 1（service page） | create | `/service` | 渲染 |
| TS | 同上 | `markets` (6 个) | SEA / ME / Africa... | pages | `sections_*` type=`features` | 6 个市场 → 1 个 sections | 1（about 或 home） | create | `/about` | 渲染 |
| TS | 同上 | `complianceNote` | "Certifications, compliance documents..." | pages | `sections_*` type=`text` | 1 段 → 1 个 sections | 1 | create | `/about` | 渲染 |
| （页面路由） | — | — | — | pages | `page_key` (unique string) | 5 个 page_key：`home` / `about` / `service` / `applications` / `contact` | 5 | create | 全部页面 | 路由对应正确 |
| （缺失） | — | — | — | pages | `hero_image` / `hero_image_alt_*` / `hero_button_text_*` / `hero_button_link` | 新增字段 | — | create | Hero 区 | — |

---

## 8. UI strings → `frontend/src/locales/*/common.json`（UNCHANGED）

| Source Type | Source File | Source Field | Source Example | Target | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|
| JSON | `frontend/src/locales/{en,es,ru,ar,fr,pt,de,id,tr,fa}/common.json` | `nav.*` / `cta.*` / `home.*` / `products.intro` / `news.intro` / `about.intro` / `applications.intro` / `service.intro` / `contact.intro` / `form.*` / `footer.*` | "Products", "Send inquiry" | (留 locale JSON) | **不迁移**；v1.5 §0.2 明确"locales 只放固定界面词"；产品正文/新闻正文/分类描述必须从 Directus 读 | 10 文件 × ~25 key | unchanged | Header / Footer / 表单 / CTA | 多语言 UI 渲染稳定 |

---

## 9. inquiries Collection（EXISTING 路径，必须保持，禁止删除重建）

| Source Type | Source File | Source Field | Source Example | Target Collection | Target Field | Transform Rule | Record Count | Migration Status | Frontend Consumer | Verification Result |
|---|---|---|---|---|---|---|---|---|---|---|
| DB | Directus `inquiries` | `id` | (nextval) | inquiries | `id` (保留为 integer + seq) | **不动 schema**；不破坏现有 id 序列 | 0 | unchanged | `/api/inquiries` 写入 | 数据库自增 id 正常 |
| DB | 同上 | `customer_name` | (前端 InquiryPayload.name) | inquiries | `customer_name` | **保留字段名**（与 v1.5 §26.1 `name` 通过 Compatibility Map 对应） | 0 | unchanged | `/api/inquiries` POST 接收 | API 接收匹配 |
| DB | 同上 | `email` | (前端 email) | inquiries | `email` | 保留；与 v1.5 `email` 等价 | 0 | unchanged | 同上 | 邮箱验证 |
| DB | 同上 | `company_name` | (前端 company) | inquiries | `company_name` | 保留；与 v1.5 `company` 等价 | 0 | unchanged | 同上 | — |
| DB | 同上 | `phone` | (前端 phone) | inquiries | `phone` | 保留 | 0 | unchanged | 同上 | — |
| DB | 同上 | `message` | (前端 message) | inquiries | `message` | 保留 | 0 | unchanged | 同上 | — |
| DB | 同上 | `source_page` | (前端 sourcePath) | inquiries | `source_page` | 保留；与 v1.5 `source_path` 等价 | 0 | unchanged | 同上 | — |
| DB | 同上 | `product_interested` | (前端 productSlug) | inquiries | `product_interested` | 保留；与 v1.5 `product_slug` 等价 | 0 | unchanged | 同上 | — |
| DB | 同上 | `locale` | (前端 locale) | inquiries | `locale` | 保留 | 0 | unchanged | 同上 | — |
| DB | 同上 | `status` (string, default 'pending') | 'pending' | inquiries | `status` | **保留字段名 + 值**；v1.5 §26.1 要求枚举 `{new, contacted, qualified, quoted, follow_up, closed}`，通过 Compatibility Map 映射 `pending` → `new` | 0 | unchanged（值映射在 API 层） | 业务跟进 | 状态机映射正确 |
| DB | 同上 | `date_created` (timestamp) | 系统 | inquiries | `date_created` | 保留 | 0 | unchanged | 列表显示 | — |
| （缺失） | — | — | — | inquiries | `date_updated` | 新增（系统管理） | 0 | create | 列表显示 | 自动维护 |
| （缺失） | — | — | — | inquiries | `whatsapp` | 新增字段 | 0 | create | Contact 页表单 | — |
| （缺失） | — | — | — | inquiries | `country` | 新增字段 | 0 | create | Contact 页表单 | — |
| （缺失） | — | — | — | inquiries | `assigned_to` (M2O users) | 新增字段（业务员分配） | 0 | create | 后台跟进 | — |
| （缺失） | — | — | — | inquiries | `internal_notes` (text) | 新增字段（仅 Sales Staff / Admin 可读） | 0 | create | 后台 | — |
| （缺失） | — | — | — | inquiries | `outcome` (enum) | 新增字段；v1.5 §26.1：won/lost/deferred/no_response/invalid/spam | 0 | create | 后台分类 | — |
| （缺失） | — | — | — | inquiries | `next_follow_up_at` (datetime) | 新增字段（逾期待跟进） | 0 | create | 后台 | — |

---

## 10. 应用 Schema（v1.5 §13 推荐顺序）

按规范执行顺序：

1. **site_settings** ← CREATE（CREATE 集合）
2. **product_categories** ← CREATE
3. **products** ← CREATE
4. **applications** ← CREATE（v1.5 Universal Core；与 business.ts 的 8 个应用对应）
5. **news_categories** ← CREATE
6. **news** ← CREATE
7. **pages** ← CREATE（page_key：home/about/service/applications/contact）
8. **inquiries** ← EXISTING（差异审计，仅 create 缺失字段，绝不 delete/rebuild）
9. **redirects** ← RECOMMENDED（optional，当前无 redirect 数据）

---

## 11. 字段来源总览（数字汇总）

| 现有数据源 | 条数 | 目标 Collection |
|---|---|---|
| fallbackSettings | 1 条（5 字段） | site_settings |
| fallbackCategories | 31 条 | product_categories |
| fallbackProducts | 10 条 | products |
| fallbackNews | 10 条 | news |
| fallbackNews category 字符串 | 5 去重 | news_categories |
| business.ts applications | 8 条 | applications |
| business.ts 其他块（hero/capabilities/etc.） | 12 块 | pages（5 个 page_key） |
| inquiries DB | 0 条（11 字段已存在） | inquiries（差分审计） |
| redirects | 0 条 | redirects（推荐，可选） |

> 本表为 Phase 2A 的 Mapping 事实。Phase 2B 才会执行实际 Apply Schema（dry-run → 用户确认 → apply）。