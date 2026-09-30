# Schema Gap & Dry-Run Diff — 现有 Directus vs v1.5 Universal Core（v4 修正）

> 来源：v1.5 §13 + §26 + §43 + §44 + §45 + §48 + Owner Audit v4  
> 编制时间：2026-10-01 UTC（v4）

---

## 1. Collection 级状态总览

| Collection | Status | Migration |
|---|---|---|
| `site_settings` | create | create |
| `product_categories` | create | create |
| `products` | create | create · **不含 products.applications** |
| `applications` | create | create · **含 related_products M2M 作为单一真理源** |
| `news_categories` | create | create |
| `news` | create | create |
| `pages` | create | create · **单 canonical sections + inline translations** |
| `inquiries` | existing + diff | field-name preserved + status enum/default replaced + 7 new |
| `redirects` | optional | 不启用 |

---

## 2. 字段计数术语分离（v4 关键修正）

### 2.1 三层术语

| 术语 | 含义 |
|---|---|
| **A. Canonical model field count** | 模型中所有字段（包括 unchanged + update + new）的总计数 |
| **B. Planned new-model fields** | 新 schema 中应该应用的字段（= canonical - unchanged - update） |
| **C. Actual Directus fields.create API operations** | apply-schema 时实际调用 `fields.create` 的次数（**TO_BE_VERIFIED_IN_PHASE_2B**） |

### 2.2 Per-collection 字段精确统计（v4 实测 · 非硬编码）

公式：canonical total = base + single + translatable-source × 10 + relation + structured

| Collection | System (base) | Single-value | Trans source ×10 | Relation | Structured (JSON) | Canonical total |
|---|---|---|---|---|---|---|
| site_settings | 7 (id, status, sort, date_*, user_*) | 6 (company_name_cn, company_english_name, email, phone, whatsapp, social_links) | 7 sources ×10 = 70 (site_name, tagline, company_name, address, footer_intro, default_seo_title, default_seo_description) | 4 (logo, logo_white, favicon, default_og_image) | 0 | **87** |
| product_categories | 7 | 4 (slug, level, show_in_menu, featured) | 6 sources ×10 = 60 (category_name, category_description, image_alt, seo_title, seo_description, seo_keywords) | 2 (parent M2O self, image M2O file) | 0 | **73** |
| **products** | 7 | 5 (slug, internal_product_code, moq, featured_product, customizable) | 9 sources ×10 = 90 (product_name, short_description, detailed_description, lead_time, packaging, image_alt, seo_title, seo_description, seo_keywords) | 3 (product_category M2O, main_image M2O, product_images M2M) | **2** (specifications + highlights JSON；**products.applications 已删除**) | **107** |
| applications | 7 | 2 (slug, featured) | 7 sources ×10 = 70 (title, short_description, content, image_alt, seo_title, seo_description, seo_keywords) | 2 (image M2O, related_products M2M) | 0 | **81** |
| news_categories | 7 | 1 (slug) | 4 sources ×10 = 40 (category_name, description, seo_title, seo_description) | 0 | 0 | **48** |
| news | 7 | 4 (slug, published_at, author, featured) | 7 sources ×10 = 70 (title, excerpt, content, image_alt, seo_title, seo_description, seo_keywords) | 2 (category M2O, cover_image M2O) | 0 | **83** |
| pages | 6 (no sort) | 3 (page_key, slug, hero_button_link) | 9 sources ×10 = 90 (title, hero_title, hero_subtitle, hero_image_alt, hero_button_text, seo_title, seo_description, seo_keywords, image_alt) | 3 (hero_image, og_image, image — all M2O file) | **1** (sections single canonical JSON) | **103** |
| inquiries | (existing 11 fields) | 10 unchanged + 1 status metadata update | 0 | 1 new (assigned_to M2O users) | 0 | **18** (10 unchanged + 1 update + 7 new) |

### 2.3 Aggregations（v4 实测 · 非硬编码）

| 指标 | 计算 | **v4 实测值** |
|---|---|---|
| **Canonical total fields (A)** | 87 + 73 + 107 + 81 + 48 + 83 + 103 + 18 | **600** |
| **Unchanged fields** | inquiries 11 中除 status 外 | **10** |
| **Metadata-update fields** | inquiries.status (enum + default 替换) | **1** |
| **Planned new-model fields (B)** | 600 − 10 − 1 | **589** |
| **Actual Directus fields.create API operations (C)** | **TO_BE_VERIFIED_IN_PHASE_2B**（Directus 11 可能在创建 collection 时自动建 system 字段，Phase 2B dry-run 必须实测确认） | **(TO_BE_VERIFIED_IN_PHASE_2B)** |

**注**：v3 旧版"610/611"表述不准确。**v4 实测精确值 600/589**。如果 Phase 2B 实测发现 Directus 11 会自动创建某些 system fields，最终 actual API count 可能略高于 589。

### 2.4 字段计数证据链（Source-Driven）

每个字段都对应"Referenced field"列，从 Phase 2A 的 fallback-data.ts / business.ts / frontend/src/lib/directus/* 等真实源文件实测得出。**不是从 v3 数字推断**。

---

## 3. Relations 分层（v4 修正）

### 3.1 四种关系概念（严格分离 · **TO_BE_VERIFIED for API operations**）

| 概念 | 含义 | 数量 | 来源 |
|---|---|---|---|---|
| **Logical relations** | 业务关系概念（"products 关联 applications"） | **16** | Mapping 分析 |
| **Directus relation objects** | 通过 Directus API `/relations` 创建的元数据记录 | **16 expected** | **TO_BE_VERIFIED_IN_PHASE_2B** |
| **M2M relations** | 多对多关系 | **2** | Mapping 分析 |
| **Junction collections required** | M2M 关系所需的中间表 | **2**（products_files, applications_products） | Mapping |
| **Junction fields required** | 中间表内连接两侧的字段 | **4**（products_files: products_id + directus_files_id; applications_products: applications_id + products_id） | Mapping |
| **Physical FK constraints expected** | 数据库 foreign key 索引 | **18**（14 M2O × 1 + 2 M2M × 2） | Mapping 推断 |
| **Directus API operations for relations** | 实际调用 `relations.create` 次数 | **TO_BE_VERIFIED_IN_PHASE_2B** | Phase 2B dry-run |

**v3 错误**：将"16 relations.create 自动创建 2 junction tables + 4 junction fields + 18 FK"作为**已验证事实**陈述。

**v4 修正**：
- Logical / junction / FK count 是 **Mapping 分析结果**（基于 v1.5 spec）
- **API operation count TO_BE_VERIFIED_IN_PHASE_2B** against installed Directus version
- Phase 2B 必须实际 dry-run schema operation order against installed Directus 11.x

### 3.2 Relations 完整清单（v4 · 16 logical relations）

| # | Logical | Source | Source Field | Target | Type | Junction Table | FK Count | On Delete |
|---|---|---|---|---|---|---|---|---|
| 1 | category self-ref | product_categories | parent | product_categories (id) | M2O self | — | 1 | RESTRICT |
| 2 | products → category | products | product_category | product_categories | M2O | — | 1 | RESTRICT |
| 3 | products → file (main) | products | main_image | directus_files | M2O | — | 1 | SET NULL |
| 4 | products ↔ files (gallery) | products | product_images | directus_files | M2M | products_files | 2 | SET NULL |
| 5 | applications → file | applications | image | directus_files | M2O | — | 1 | SET NULL |
| **6** | **applications ↔ products**（**单一真理源**） | applications | related_products | products | **M2M** | applications_products | **2** | SET NULL |
| 7 | news → category | news | category | news_categories | M2O | — | 1 | RESTRICT |
| 8 | news → file (cover) | news | cover_image | directus_files | M2O | — | 1 | SET NULL |
| 9 | pages → file (hero) | pages | hero_image | directus_files | M2O | — | 1 | SET NULL |
| 10 | pages → file (og) | pages | og_image | directus_files | id | M2O | — | 1 | SET NULL |
| 11 | pages → file (image) | pages | image | directus_files | M2O | — | 1 | SET NULL |
| 12 | site_settings → file (logo) | site_settings | logo | directus_files | M2O | — | 1 | SET NULL |
| 13 | site_settings → file (logo_white) | site_settings | logo_white | directus_files | M2O | — | 1 | SET NULL |
| 14 | site_settings → file (favicon) | site_settings | favicon | directus_files | M2O | — | 1 | SET NULL |
| 15 | site_settings → file (default_og_image) | site_settings | default_og_image | directus_files | M2O | — | 1 | SET NULL |
| 16 | inquiries → user (assigned_to) | inquiries | assigned_to | directus_users | M2O | — | 1 | SET NULL |

---

## 4. 移除双真理源（v4 强制）

**`products.applications` JSON 字段不创建**。

**单一真理源**：`applications.related_products` M2M（通过 `applications_products` 中间表）。

**Migration 规则（v4 严格）**：
- ✅ **仅 7 unique values** 精确 allowlist 自动映射
- ⚠️ **59 unique values + 58 occurrences** 待人工 review（DO NOT AUTO-CREATE）
- ❌ 禁止 fuzzy / substring / invented
- 详见 `compatibility-map.md §2`

---

## 5. RBAC 矩阵（v4 修正含 Public 媒体授权）

### 5.1 Public 媒体授权（**v4 implementable**）

**不要**用 `directus_files.is_public=true`（**该字段不存在**）。

**Phase 2B 实施步骤**：

1. **确定性发现/创建 folder IDs**（用 Directus API `/folders`）：
   - `/Products/` `/Product-Categories/` `/Applications/` `/News/` `/Company/` `/Certificates/` `/Downloads/` —— public
   - **`/Private/`** —— **private（Public role denied）**
2. Public policy 配置：
   - 对 public folder IDs（及其 descendants）允许 read
   - 对 `/Private/` folder ID **拒绝** read
3. **禁止** broad `directus_files` listing（必须 folder-scoped）

### 5.2 Roles / Policies 总览

| # | Policy | Source | Admin | App |
|---|---|---|---|---|
| 1 | "Policy for Administrator" | existing | True | True |
| 2 | "Administrator" | existing | True | True |
| 3 | "$t:public_label" (= Public) | existing | False | False |
| 4 | Content Editor Policy | new | False | False |
| 5 | Product Manager Policy | new | False | False |
| 6 | Sales Staff Policy | new | False | False |
| 7 | SEO Editor Policy | new | False | False |
| 8 | Website Reader Policy | new | False | True |
| 9 | Inquiry Writer Policy | new | False | False |

**Total**: 9 policies · 6 roles · 2 service tokens

### 5.3 Inquiry Writer Least-Privilege Matrix（v1.5 §43.2）

| Collection / Action | Read | Create | Update | Delete |
|---|---|---|---|---|
| **inquiries** | ❌ | ✅ **白名单字段** | ❌ | ❌ |
| Other collections | ❌ | ❌ | ❌ | ❌ |

**Inquiry Writer 创建白名单字段**：
- ✅ 允许：`name` / `email` / `company` / `phone` / `whatsapp` / `country` / `message` / `source_path` / `product_slug` / `locale`
- ✅ 强制 `status = 'new'`
- ❌ 禁止：传 `id` / `date_created` / `date_updated` / `status` / `internal_notes` / `assigned_to` / `outcome` / `next_follow_up_at`

### 5.4 Public Least-Privilege Matrix

| Collection / Action | Read | Create | Update | Delete |
|---|---|---|---|---|
| products / categories / news / applications / pages / site_settings | ❌ | ❌ | ❌ | ❌ |
| inquiries | ❌ | ❌ | ❌ | ❌ |
| directus_files in public folders | ✅ read | ❌ | ❌ | ❌ |
| directus_files in `/Private/` | ❌ | ❌ | ❌ | ❌ |
| directus_files (broad listing) | ❌ | ❌ | ❌ | ❌ |
| directus_users / system | ❌ | ❌ | ❌ | ❌ |

---

## 6. Structured Fields · 运营 UX（v4 强制 · v1.5 §27.1）

### 6.1 选型决策

**采用 Option A**：Directus Repeater interface + structured JSON + raw JSON hidden for operators。

**降级路径**：Phase 2B 实测 Directus 11 Repeater interface 不安全 → 改用 Option B（controlled child collections）。

### 6.2 Operator UX 规范

| 字段 | Directus interface | 运营者所见 | raw JSON 可见？ | add/remove/reorder | 多语言编辑 | 验证 | 发布门 |
|---|---|---|---|---|---|---|---|
| `products.specifications` | Repeater | "Add parameter" 表单（key + value ×10 locales） | ❌ NO | ✅ UI | ✅ 10 语言 tab | ✅ key 非空 | ⚠️ 缺关键字段阻止 |
| `products.highlights` | Repeater | "Add highlight"（stable id + sort + text ×10 locales） | ❌ NO | ✅ UI | ✅ 10 语言 tab | ✅ text 非空 | ⚠️ 缺翻译阻止该语言发布 |
| `pages.sections` | Repeater | "Add section"（type enum + sort + image + product_ids + CTA + 10 语言 text） | ❌ NO | ✅ UI + drag-reorder | ✅ 10 语言 tab | ✅ block_id stable + type enum | ⚠️ 缺关键字段阻止 |

**强制**：
- ✅ normal operator **从不**直接编辑 raw JSON（**RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR=NO**）
- ✅ Directus **从不**成为 free-form page builder
- ✅ Repeater interface 提供 controlled add/remove/reorder UX
- ✅ per-locale text 通过 tab 切换编辑

---

## 7. inquiries.status 处理（v4）

| 项 | 处理 |
|---|---|
| Field name | `status`（保留） |
| Choices enum | `[new, contacted, qualified, quoted, follow_up, closed]` |
| Default value | `new` |
| Legacy `pending` runtime | 不保留 |
| API 翻译层 | 不增加 |
| Destructive? | NO（0 records + metadata-only） |

---

## 8. URL Inventory（v4 修正 · 762 total）

| 类型 | 数量 | × 10 locales | total URLs |
|---|---|---|---|
| Fixed content | 7 patterns | × 10 | 70 |
| Dynamic news | 10 slugs | × 10 | 100 |
| Dynamic products | 28 slugs | × 10 | 280 |
| Dynamic categories | 31 slugs | × 10 | 310 |
| **Subtotal public** | — | — | **760** |
| Root redirect | 1 | × 1 | 1 |
| API | 1 | × 1 | 1 |
| **Total route instances + endpoints** | — | — | **762** |

**Route patterns**: 7 + 3 + 1 + 1 = **12**
**Slug-bearing records**: 69 (categories 31 + products 28 + news 10)
**Unique literal slug values**: 41

---

## 9. 媒体资源（v4 修正 · 5 EXISTS / 3 MISSING）

| 类别 | 数量 | 大小 |
|---|---|---|
| Directus media | 0 records | — |
| Repository static media | 46 files (45 webp + 1 svg) | 16 MB |
| **Missing fallback refs** | **3** | — |
| EXISTS fallback refs | 5 | — |

**v4 修正一致性**：所有文档统一使用 **5 EXISTS / 3 MISSING**，**不再**说 "Missing references = 0"。

---

## 10. Blockers 重新分类（v4 强制）

### A. Phase 2B Schema Gate Blockers（必须先解决才能开始 schema dry-run）

| # | BLOCKER |
|---|---|
| A1 | **v3 / v4 修正文档的 Owner 审批** |
| A2 | **Directus 11.x 安装版本号 + API 行为实测**（schema 操作顺序与实际 API 调用必须 dry-run） |
| A3 | **Phase 2B apply-schema.mjs 设计 + dry-run 实测**（不实际写入生产） |

### B. Pre-Data-Migration Blockers（导入 fallback 数据前需解决）

| # | BLOCKER |
|---|---|
| B1 | **真实 Directus staff 邮箱地址**（用于创建 user accounts 分配新角色；**不是 schema 创建本身的 blocker**） |
| B2 | **3 MISSING fallback 图片资源**（export-capability-v2, quality-control, supply-chain） |
| B3 | **真实产品图 / 业务图 / Logo / Favicon** |
| B4 | **Directus folder 配置**（/Products, /News, /Private 等；Phase 2B 确定性创建 + 记录 folder IDs） |
| B5 | **应用关系 59 unique values + 58 occurrences 人工 review**（运营人员填表后导入） |

### C. Pre-Cutover Blockers（生产切换前需解决）

| # | BLOCKER |
|---|---|
| C1 | **fallback products 28 条 → Directus import**（含 applications fuzzy match 审查结果） |
| C2 | **fallback business content → pages sections import**（中文公司名 等） |
| C3 | **10 语言翻译工作**（fallback 仅 en，其他 9 语言需翻译或留空 + noindex） |
| C4 | **生产 Directus 配置确认**（verify credentials, verify tokens, verify policies） |
| C5 | **Inquiries API 集成测试**（/api/inquiries + Directus_token + 字段白名单 + 限流 + honeypot） |
| C6 | **SMTP 邮件通知**（用户指令不启用 → 仅入库不入邮件） |

### D. Post-Launch / Optional Housekeeping

| # | ITEM |
|---|---|
| D1 | **redirects collection 启用**（slug 变更后 301 维护） |
| D2 | **GitHub Actions secrets 配置**（VPS_HOST / VPS_USER / VPS_PORT / VPS_SSH_KEY） |
| D3 | **fallback-data.ts / business.ts 移除**（schema 应用 + 数据迁移完成后；逐步移除以保留兜底） |
| D4 | **Pre-Data-Migration 阶段不需要时跳过**：

### E. 不在 Phase 2B 启动 Blockers 中的项目（v4 重分类）

**以下事项不阻碍 Phase 2B schema dry-run 启动**：

- ❌ **真实用户邮箱**（schema 创建不需要 user accounts；user 创建属于 Pre-Data-Migration）
- ❌ **真实图片资源**（schema 创建不需要真实图；图片属于 Pre-Data-Migration）
- ❌ **SMTP 配置**（用户指令不启用；不影响 schema 或询盘入库）
- ❌ **业务内容导入**（schema 创建完成后才能导入；属于 Pre-Data-Migration）
- ❌ **GitHub Actions secrets**（部署脚本配置；属于 Pre-Cutover 或 Post-Launch）
- ❌ **redirects 启用**（optional；schema 可以创建但不写入数据；属于 Post-Launch）

---

## 11. Dry-Run 总汇总（v4 术语分离版）

```text
=== apply-schema dry-run (v4, idempotent, non-destructive) ===

Collections CREATE:        7
  site_settings, product_categories, products,
  applications, news_categories, news, pages
Collections UNCHANGED:     1  (inquiries, all 11 field names preserved)
Collections UPDATE:        0
Collections DELETE:        0
Junction tables required:   2  (products_files, applications_products)
Optional CREATE:            1  (redirects, IF enabled — currently disabled)

# 字段计数术语分离
A. Canonical total fields:          600
B. Unchanged fields:                10  (inquiries)
C. Metadata-update fields:          1   (inquiries.status: enum + default)
D. Planned new-model fields (A-B-C): 589
E. Actual Directus fields.create API operations: TO_BE_VERIFIED_IN_PHASE_2B
Fields DELETE:                      0
Fields RENAMED:                     0  (products.applications NOT created)

# Relations 分层
F. Logical relations:               16
G. M2M relations:                   2
H. Junction collections required:   2
I. Junction fields required:        4
J. Physical FK constraints expected: 18  (14 M2O × 1 + 2 M2M × 2)
K. Directus relation API operations: TO_BE_VERIFIED_IN_PHASE_2B

Policies CREATE:           6  (Content Editor, Product Manager, Sales Staff,
                                  SEO Editor, Website Reader, Inquiry Writer)
Policies UNCHANGED:        3
Roles CREATE:               4  (Content Editor, Product Manager, Sales Staff,
                                  SEO Editor)
Service Tokens CREATE:      2  (Website Reader, Inquiry Writer)
Roles UNCHANGED:            2  (Administrator x2)

Permissions CREATE:        ~80  (estimated)
Permissions UNCHANGED:     20

Indexes / Unique CREATE:   ~22
Indexes DELETE:                      0

DESTRUCTIVE CHANGES:               0
EXPECTED UNEXPECTED ON 2nd RUN:    0
```

---

## 12. 关键设计决策（v4 全部）

| # | 决策 |
|---|---|
| 1 | products.applications JSON **不创建**（消除双真理源） |
| 2 | pages.sections **单 canonical + inline translations**（不分离 10 个 `_*` 字段） |
| 3 | highlights 多语言结构化（id + sort + translations） |
| 4 | company_name_cn **单字段**（中文公司名，不参与 10 语言 suffix；locales 不含 zh-CN） |
| 5 | Public 媒体 **folder-based authorization（implementable · folder ID based）**（不依赖不存在的 `is_public`） |
| 6 | inquiries.status **直接 v1.5 canonical enum + default new**（不保留 pending，不加 API 翻译） |
| 7 | Specifications / Highlights / Page Sections：**Option A Repeater interface（Phase 2B 验证）**（如不安全则降级 Option B child collections） |
| 8 | **URL inventory 4 类分组** · 762 total · 12 patterns · root/API 不乘 10 locales |
| 9 | **Slug-bearing records 69** · **Unique literal slug values 41**（区分记录与字面值） |
| 10 | **Media 5 EXISTS / 3 MISSING**（v3 矛盾已纠正） |
| 11 | **产品→应用关系：仅 7 精确 auto-map · 59 unique + 58 occurrences 待人工 review** |
| 12 | **Slug typo 修正**：`vecos-index-improvers` → `viscosity-index-improvers` |
| 13 | **字段计数术语分离**：canonical 600 / planned 589 / actual API **TO_BE_VERIFIED** |
| 14 | **Relations 4 层分类**：logical 16 / M2M 2 / junction 2+4 / FK 18 / API **TO_BE_VERIFIED** |
| 15 | **Blockers 重新分类**：A. Schema Gate / B. Pre-Data-Migration / C. Pre-Cutover / D. Post-Launch |

---

## 13. 待审批项（v4 修正后 · 13 项）

| # | 待审批 |
|---|---|
| 1 | 7 个新 Collection 字段定义（含公司名拆为 `company_name_*` ×10 + `company_name_cn` 单字段） |
| 2 | inquiries 保留 11 字段名 + status enum 替换（v1.5 canonical） |
| 3 | products / categories / news 实测量（28 / 31 / 10）· slug typo 修正 |
| 4 | 16 logical relations + 2 junction + 4 junction fields + 18 FK |
| 5 | 6 个新 Policies + 4 个新 Roles + 2 个 Service Tokens |
| 6 | 媒体策略：Directus folder-based + Repository static 保留 |
| 7 | destructive changes = 0 + 重复运行零非预期变化 |
| 8 | Products.applications JSON 移除（双真理源 → 单一 M2M） |
| 9 | Pages.sections 单 canonical + translations |
| 10 | 总字段数 600 / planned 589 / actual API **TO_BE_VERIFIED_IN_PHASE_2B** |
| 11 | Blockers A/B/C/D 四类分层（schema dry-run 只需解决 A 类） |
| 12 | **仅 7 unique values auto-map** · **59 unique + 58 occurrences 待人工** · **禁止 fuzzy/substring/invented** |
| 13 | Public 媒体 folder-based authorization（**implementable · folder ID based · Phase 2B 确定性创建**） |

---

**Phase 2A v4 修正完成 · 暂停等审批。**