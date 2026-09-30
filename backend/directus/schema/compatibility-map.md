# Compatibility Map — 历史字段与 v1.5 Canonical Dictionary 映射

> 来源：v1.5 §26（Canonical Data Dictionary）+ §14.2（Mapping 模板）  
> 编制时间：2026-10-01 UTC  
> 编制执行者：Claude（只读映射）  
> 核心原则：**禁止为了 v1.5 Canonical Dictionary 直接重命名现有稳定字段；语义等价的历史字段通过本表保留映射。**

---

## 1. 字段映射总表

### 1.1 `inquiries`（已有，禁止删改）

| v1.5 §26.1 Canonical | 当前实际 | 等价关系 | 处理 |
|---|---|---|---|
| `name` | `customer_name` (string, required) | 等价（客户姓名） | **保留 customer_name**；前端 API 内部将 `name` → `customer_name` |
| `email` | `email` (string, required) | 完全等价 | unchanged |
| `company` | `company_name` (string, nullable) | 等价 | **保留 company_name**；前端 `company` → `company_name` |
| `phone` | `phone` (string, nullable) | 等价 | unchanged |
| `whatsapp` | — | 新增 | **create** |
| `country` | — | 新增 | **create** |
| `message` | `message` (text, required) | 等价 | unchanged |
| `source_path` | `source_page` (string, nullable) | 等价（前端字段 sourcePath） | **保留 source_page**；前端 `sourcePath` → `source_page` |
| `product_slug` | `product_interested` (string, nullable) | 等价（前端字段 productSlug） | **保留 product_interested**；前端 `productSlug` → `product_interested` |
| `locale` | `locale` (string, nullable) | 等价 | unchanged |
| `status` (enum: new/contacted/qualified/quoted/follow_up/closed) | `status` (string, default 'pending') | 当前用通用 'pending' 字符串；v1.5 要求枚举 | **保留字段 + 默认值**；前端 API 在写入时把 v1.5 标准值映射为 'pending'，状态机在 API/前端层完成转换（v1.5 §26.1 + §44 允许通过 Compatibility Map 保留等价或更成熟状态） |
| `date_created` | `date_created` (timestamp) | 等价 | unchanged |
| `date_updated` | — | 新增 | **create** |
| `internal_notes` | — | 新增 | **create** |
| `assigned_to` | — | 新增 | **create** |
| `outcome` (enum: won/lost/deferred/no_response/invalid/spam) | — | 新增 | **create** |
| `next_follow_up_at` | — | 新增 | **create**（v1.5 §12.6 推荐） |

**总影响**：保留 11 个字段不动，新增 7 个字段（whatsapp/country/date_updated/internal_notes/assigned_to/outcome/next_follow_up_at）。**destructive = 0**。

### 1.2 `product_categories`（CREATE）

| v1.5 §26.2 最低字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` | `id` (string slug) | 新建用 UUID；对外 slug 用 `slug` 字段；前端按 slug 寻址 |
| `status` (draft/published/archived) | — | create |
| `slug` (unique) | `slug` (string) | create；保留字面 slug 值（见 Mapping 表） |
| `parent` (M2O self) | `parent` (string parent id) | create；用 UUID M2O 替代字符串 parent |
| `level` (int 1-5) | — | create；系统计算 |
| `sort` (int) | — | create；按原 fallback 顺序填 |
| `name_*` | `name` (LocalizedText) | create；en 填值 |
| `description_*` | `description` (LocalizedText) | create；en 填值 |
| `image` (M2O file) | — | create（占位，待真实图） |
| `image_alt_*` | — | create |
| `show_in_menu` (boolean) | — | create；默认值 true |
| `featured` (boolean) | — | create；默认 false |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.3 `products`（CREATE）

| v1.5 §26.1 products 最低字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | `id` (string slug) | create；slug 另存字段 |
| `status` | — | create |
| `slug` (unique) | `slug` | create |
| `product_category` (M2O) | `category` (string slug) | create；按 slug 匹配 category UUID |
| `sort` (int) | — | create |
| `product_name_*` | `name` | create；en 填值 |
| `short_description_*` | `summary` | create；en 填值 |
| `detailed_description_*` (rich text) | `description` | create；en 填值；string → rich text |
| `main_image` (M2O file) | `image` (string path) | create；fallback 期间路径保留 |
| `product_images` (M2M files) | — | create |
| `image_alt_*` | `imageAlt` | create；en 填值 |
| `specifications` (JSON array) | — | create |
| `internal_product_code` | — | create |
| `moq` | — | create |
| `lead_time_*` | — | create |
| `packaging_*` | — | create |
| `featured_product` (boolean) | — | create |
| `customizable` (boolean) | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |
| `highlights` (JSON array) | `highlights` (string[]) | create；保持 JSON 数组 |
| `applications` (JSON array) | `applications` (string[]) | create；保持 JSON 数组 |

### 1.4 `applications`（CREATE）

| v1.5 §7 应用字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | `business.ts applications[].direction` 中隐含 slug（实际不存在） | create；按 title 生成 slug |
| `title_*` | `business.ts applications[].title` | create；en 填值 |
| `short_description_*` | `business.ts applications[].description` | create；en 填值 |
| `content_*` (rich text) | — | create；en 填值（业务段落未在 fallback 中） |
| `image` (M2O file) | — | create（待真实图） |
| `image_alt_*` | — | create |
| `related_products` (M2M products) | — | create；通过中间表 `applications_products` |
| `sort` / `status` (draft/published/archived) / `featured` | — | create |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.5 `news_categories`（CREATE）

| v1.5 §6.1 字段 | 当前等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `slug` (unique) | — | create；用 title 的规范化 slug |
| `category_name_*` | `fallback-data.ts news[].category` 字符串 | create；5 条去重填值（en） |
| `description_*` | — | create（暂留空） |
| `sort` / `status` | — | create |
| `seo_title_*` / `seo_description_*` | — | create |

### 1.6 `news`（CREATE）

| v1.5 §6.2 字段 | 当前 fallback 等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | `id` (string slug) | create；保留 slug |
| `status` (draft/published/archived) | — | create |
| `slug` (unique) | `slug` | create |
| `category` (M2O news_categories) | `category` (string) | create；按 slug/category_name 匹配 |
| `sort` / `featured` (boolean) / `author` | — | create |
| `published_at` (datetime) | `publishedAt` ('2026-09-01' 字符串) | create；ISO 字符串 → timestamp |
| `title_*` | `title` | create；en 填值 |
| `excerpt_*` | `excerpt` | create；en 填值 |
| `content_*` (rich text) | `content` | create；en 填值；string → rich text |
| `cover_image` (M2O file) | `image` (string path) | create；fallback 期间路径保留 |
| `image_alt_*` | `imageAlt` | create；en 填值 |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |

### 1.7 `pages`（CREATE）

| v1.5 §8.2 字段 | 当前 fallback 等价 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` (draft/published/archived) | — | create |
| `page_key` (unique) | — | create；5 个值：`home` / `about` / `service` / `applications` / `contact` |
| `slug` | — | create；与 page_key 同步 |
| `title_*` | — | create；en 填值 |
| `hero_title_*` | `business.ts hero.title` | create；en 填值（仅 home page） |
| `hero_subtitle_*` | `business.ts hero.summary` | create；en 填值（仅 home page） |
| `hero_image` / `hero_image_alt_*` | — | create |
| `hero_button_text_*` / `hero_button_link` | — | create |
| `sections_*` (JSON array) | `business.ts` 全部内容块 | create；把 12 个 business 块转换为 sections JSON 数组元素；元素结构 `{id, type, title, body, image, image_alt, button_text, button_link, sort}`；type 枚举 `text` / `image_text` / `features` / `faq` / `cta` / `process` |
| `seo_title_*` / `seo_description_*` / `seo_keywords_*` | — | create |
| `og_image` | — | create |
| `image` / `image_alt_*` | — | create（与 hero_image 区分） |

### 1.8 `site_settings`（CREATE Singleton）

| v1.5 §9 字段 | 当前等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | create |
| `status` (draft/published/archived) | — | create；默认 draft（singleton） |
| `site_name_*` | `fallbackSettings.siteName` | create；en 填值 |
| `tagline_*` | `fallbackSettings.tagline` | create；en 填值 |
| `company_name_*` | `03-COMPANY-PROFILE.md` 中"Official Chinese name" | create；en 留空，zh-CN 填中文官方名 |
| `company_english_name` | `03-COMPANY-PROFILE.md` "Official English name" | create；单值 |
| `address_*` | `fallbackSettings.address` | create；en 填值 |
| `email` | `fallbackSettings.email` (null) | create；可空 |
| `phone` | `fallbackSettings.phone` | create |
| `whatsapp` | — | create（待确认） |
| `logo` / `logo_white` / `favicon` | — | create（M2O file，待上传） |
| `social_links` (JSON array) | — | create |
| `footer_intro_*` | — | create（暂留空） |
| `default_seo_title_*` / `default_seo_description_*` / `default_og_image` | — | create |
| `date_created` / `date_updated` | — | create（系统维护） |

### 1.9 `redirects`（RECOMMENDED，optional）

| v1.5 §2 字段 | 当前等价字段 | 处理 |
|---|---|---|
| `id` (UUID) | — | optional create |
| `from_path` (string) | — | optional create |
| `to_path` (string) | — | optional create |
| `status_code` (int, default 301) | — | optional create |
| `enabled` (boolean, default true) | — | optional create |

当前无 redirects 数据；如启用，需保证 schema 字段与 nginx 端 redirects 配合（待评估）。

---

## 2. 保留的现有数据 + 不允许的事

| 不允许 | 原因 |
|---|---|
| **重命名 inquiries 已有字段**（customer_name → name 等） | v1.5 §26.1 + 用户指令"不允许为了 v1.5 Canonical Dictionary 直接重命名现有稳定字段" |
| **删除 inquiries Collection** | 用户指令"现有已有 inquiries Collection 必须保留并做差异审计，禁止删除重建" |
| **删除现有任何 fallback 字段（slug、id、name 等）** | fallback 是兜底，必须保留直到全部导入完成 |
| **为 v1.5 创建独立空白的第二套分类/产品/新闻** | 数据一致性原则；用 fallback slug 一一对应 Directus |
| **强制迁移任何 business.ts 内容到 pages 之外的 collection** | v1.5 §8.1 明确 Home/About/Service/Contact/Applications 等固定页面必须可后台维护 |
| **导入批量假数据（3 分类 + 6 产品 + 3 新闻）到生产 Directus** | 用户指令明确禁止；测试 fixture 只能放隔离环境 |

---

## 3. 允许的事

| 允许 | 说明 |
|---|---|
| **新增 inquiries 字段** | whatsapp/country/date_updated/internal_notes/assigned_to/outcome/next_follow_up_at；不破坏现有 11 字段 |
| **新建 7 个 collections** | site_settings / product_categories / products / news_categories / news / applications / pages |
| **新建 1 个可选 collection** | redirects（如启用） |
| **为现有字段添加 v1.5 等价字段（双写）** | 例如 inquiries 可加 `product_was_inquired_name` 或 `product_slug_text` 等；本表不启用 |
| **前端 API 字段转换** | InquiryPayload.name → Directus customer_name；前端字段名与 DB 字段名解耦 |
| **Compatibility Map 状态值映射** | 'pending' ↔ v1.5 'new'；通过 API 层 / 业务逻辑层完成转换 |
| **保持现有 10 语言结构（field suffix `_*`）** | en/es/ru/ar/fr/pt/de/id/tr/fa；不引入第二套翻译模型 |

---

## 4. URL/Slug 兼容性矩阵（迁移时 URL 不能断）

| 现有 URL | 来源 | Directus 字段 | 迁移后 URL | 一致性 |
|---|---|---|---|---|
| `/products/category/[slug]` | fallback | product_categories.slug | `/products/category/[slug]` | ✅ 保留 |
| `/products/[slug]` | fallback | products.slug | `/products/[slug]` | ✅ 保留 |
| `/news/[slug]` | fallback | news.slug | `/news/[slug]` | ✅ 保留 |
| `/[locale]` | 路由 | page_key=home (pages) | 不需要 slug（固定路由） | ✅ 保留 |
| `/[locale]/about` | 路由 | page_key=about | 固定 | ✅ |
| `/[locale]/service` | 路由 | page_key=service | 固定 | ✅ |
| `/[locale]/applications` | 路由 | page_key=applications + applications collection | 固定 | ✅ |
| `/[locale]/contact` | 路由 | page_key=contact | 固定 | ✅ |

**没有 URL 改动需求**。slug 字面值全部沿用 fallback。

---

## 5. 多语言字段兼容性

| 主题 | 当前实现 | v1.5 要求 | 兼容性 |
|---|---|---|---|
| 翻译字段模型 | `_*` 后缀（10 语言） | `_*` 后缀（10 语言） | ✅ 字段模型一致 |
| 语言集合 | en/es/ru/ar/fr/pt/de/id/tr/fa | en/es/ru/ar/fr/pt/de/id/tr/fa | ✅ 完全一致 |
| RTL 标记 | ar + fa | ar + fa | ✅ |
| 默认语言 | en | en | ✅ |
| hreflang | 未实现 | 必须实现 | 待补（schema 应用后） |
| sitemap 语言过滤 | 不分语言（统一输出） | 按已发布语言输出 | 待补

---

## 6. UI strings 与 CMS 内容的边界（v1.5 §0.2）

| 边界 | 在哪 | 谁负责 |
|---|---|---|
| 固定界面词（导航、按钮、表单提示、空状态、字段标签、错误提示） | `frontend/src/locales/*/common.json` | 永远不进入 Directus |
| 产品 / 新闻 / 应用 / 页面正文 + SEO + 图片 Alt + 分类描述 | Directus | 永远不写死在 locales / JSX / data / MD |
| fallback-data.ts + business.ts | 是开发期支持；**不是正式数据源** | Phase 2B 起以 Directus 为 Single Source of Truth |

---

## 7. Phase 2B 收尾要求（用户确认后才能执行）

完成 Schema 应用 + Permissions + 测试后：

1. ✅ Directus 8 个 Collection + required 上线 collection 全部 create 完毕
2. ✅ inquiries 已有字段 100% 保留；新增字段按兼容性映射创建
3. ✅ slug 全部沿用 fallback，URL 无变化
4. ✅ frontend/src/lib/directus/* 改造为调用新字段
5. ✅ fallback-data.ts 标注 `已迁入 Directus，仅作开发期参考`
6. ✅ business.ts 同上标注
7. ✅ apply-schema.mjs 幂等；重复运行零非预期变化
8. ✅ destructive changes = 0（已通过本 Mapping 锁定）

> Mapping + Compatibility + Schema Gap 完成后，进入 dry-run 输出 + 用户审批，然后才能 Apply。