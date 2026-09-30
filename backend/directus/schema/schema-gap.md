# Schema Gap & Dry-Run Diff — 现有 Directus vs v1.5 Universal Core（v3 修正）

> 来源：v1.5 §13 + §26 + §43 + §44 + §45 + §48 + Owner Audit v3  
> 编制时间：2026-10-01 UTC（Owner Audit v3 修正版）  
> 编制执行者：Claude（dry-run，**未实际 Apply**）  
> 状态：**待审批**。Phase 2A 已第三次修正（v3）。

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
| `pages` | create | create · **单 canonical sections + translations** |
| `inquiries` | existing + diff | field-name preserved + status enum/default replaced + 7 new |
| `redirects` | optional | 不启用 |

---

## 2. 字段计数术语分离（v3 关键修正）

### 2.1 三层术语

| 术语 | 含义 | 说明 |
|---|---|---|
| **Canonical total fields** | 模型中所有字段（包括 unchanged + update + new）的总计数 | 描述 schema 的"完整大小" |
| **Unchanged fields** | 现有 Directus 中已存在、保留原状、不再触碰的字段 | inquiries 11 字段中除 status 外 10 个 |
| **Metadata updates** | 字段保留但 schema metadata 变化（choices / default / interface options 等） | inquiries.status enum + default 替换 |
| **Actual field-create operations** | apply-schema 时通过 `fields.create` API 创建的字段 | = canonical total - unchanged - metadata updates（deduped count） |

### 2.2 Per-collection 字段精确统计（v3 实测）

| Collection | Base | Single-value | Trans source ×10 | Relation | JSON | Canonical total | Unchanged | Update (meta) | Actual CREATE |
|---|---|---|---|---|---|---|---|---|---|
| site_settings | 7 | 5 + **`company_name_cn` (1)** = 6 | 7×10=70 | 4 | 0 | **87** | 0 | 0 | **87** |
| product_categories | 7 | 4 | 6×10=60 | 2 | 0 | **73** | 0 | 0 | **73** |
| **products** | 7 | 5 | 9×10=90 | 3 | 3 | **108** | 0 | 0 | **108** |
| applications | 7 | 2 | 7×10=70 | 2 | 0 | **81** | 0 | 0 | **81** |
| news_categories | 7 | 1 | 4×10=40 | 0 | 0 | **48** | 0 | 0 | **48** |
| news | 9 | 3 | 7×10=70 | 2 | 0 | **84** | 0 | 0 | **84** |
| **pages** | 6 | 3 | 10×10=100 | 3 | (sections in single canonical) | **112** | 0 | 0 | **112** |
| inquiries | (system only, 5) | (incl. status update) | 0 | 1 (assigned_to) | 0 | **18** | **10** | **1 (status metadata)** | **7** |
| **TOTAL (business collections)** | — | — | — | — | — | **611** | **10** | **1** | **600** |
| redirects (optional) | — | — | — | — | — | **5** | 0 | 0 | (5) |

**Terminology reconciled**：
- **Canonical total fields = 611**（v3 修正：从旧版"610"补 1 因为 site_settings 加了 `company_name_cn` 单字段）
- **Unchanged = 10**（inquiries 11 字段中除 status 外的 10 个）
- **Metadata update = 1**（inquiries.status choices + default 替换）
- **Actual field-create operations = 600**

**Phase 2A v2 "约 610 CREATE" 错算**：将 canonical total 当成 CREATE 数量。**v3 修正后是 600 CREATE + 10 unchanged + 1 update**。

### 2.3 Specifications 进 JSON 而非固定列（v1.5 §4.3）

化工属性（每条产品值不同）→ 进 `products.specifications` JSON 数组：
- 元素结构：`{key, values: {<locale>: <text>}}`
- 示例（per-locale）：
  ```json
  "specifications": [
    {"key": "CAS No.", "values": {"en": "12345-67-8"}},
    {"key": "Appearance", "values": {"en": "Amber Liquid"}},
    {"key": "Purity", "values": {"en": "≥99%"}},
    {"key": "Packaging", "values": {"en": "200 kg Drum"}}
  ]
  ```
- **不**为这些属性创建独立固定列（CAS No. / Appearance / Purity / Storage / Shelf Life / Viscosity / Flash Point / Density / pH / Dosage 等）

### 2.4 highlights 多语言结构化（v3 关键修正）

```json
"highlights": [
  {
    "id": "highlight-uuid-stable-1",
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
  }
]
```

### 2.5 pages.sections 单 canonical + translations（v3 关键修正）

**删除**：`sections_en / sections_es / ... / sections_fa` 10 个独立 JSON 字段

**改为**：单一 canonical `sections` JSON（含 10 locale translations 数组）

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
      {"locale": "es", "title": "...", ...},
      ...
      {"locale": "fa", "title": "...", ...}
    ]
  }
]
```

**v1.5 §45.2 不变量（强制）**：
- block_id：单一稳定 ID，跨 locale 一致
- block_type：单一类型，跨 locale 一致
- sort：单一顺序
- image：单一 file uuid
- product_ids：单一数组
- cta_link：单一路径
- 仅 `translations[].title / body / image_alt / button_text` 是 per-locale

### 2.6 site_settings.company_name_cn（v3 关键修正）

**Locales 严格限定**：en / es / ru / ar / fr / pt / de / id / tr / fa（**无** zh-CN）

**中文公司名**：`company_name_cn` 单字段（**不参与 10 语言 suffix**）

```yaml
company_name_*    # 10 语言 suffix（en 填英文名，其他留空）
company_name_cn   # 单值 string = "西安寰宇坤泰工业科技有限公司"
company_english_name  # 单值 string = "Xi'an Huanyu Kuntai Industrial Technology Co., Ltd."
```

---

## 3. Relations 分层（v3 关键修正）

### 3.1 四种关系概念（严格分离）

| 概念 | 含义 | 数量 |
|---|---|---|
| **Logical relations** | 业务关系概念（"products 关联 applications"） | **16** |
| **Directus relation objects** | 通过 Directus API `/relations` 创建的元数据记录（每条 logical relation = 1 relation object） | **16** |
| **Junction tables** | M2M 关系所需的中间表 | **2**（products_files + applications_products） |
| **Junction fields** | 中间表内连接两侧的物理字段（每 M2M 关系 ×2） | **4**（2 per junction × 2 junctions） |
| **Physical FK constraints** | 数据库实际 foreign key 索引（M2O 每条 1 个，M2M 每条 2 个） | **18**（14 M2O × 1 + 2 M2M × 2） |

### 3.2 Relations 完整清单（v3 修正 · 16 logical relations）

| # | Logical | Source Coll | Source Field | Target Coll | Target Field | Type | Junction Table | Junction Fields | FK Count | On Delete |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | product_categories self-ref | product_categories | parent | product_categories | id | M2O self | — | — | 1 | RESTRICT |
| 2 | products → category | products | product_category | product_categories | id | M2O | — | — | 1 | RESTRICT |
| 3 | products → file (main_image) | products | main_image | directus_files | id | M2O | — | — | 1 | SET NULL |
| 4 | products ↔ files (product_images) | products | product_images | directus_files | id | M2M | products_files | products_id, directus_files_id | 2 | SET NULL |
| 5 | applications → file (image) | applications | image | directus_files | id | M2O | — | — | 1 | SET NULL |
| **6** | **applications ↔ products (related_products)** | applications | related_products | products | id | **M2M**（**单一真理源**） | applications_products | applications_id, products_id | **2** | SET NULL |
| 7 | news → news_category | news | category | news_categories | id | M2O | — | — | 1 | RESTRICT |
| 8 | news → file (cover_image) | news | cover_image | directus_files | id | M2O | — | — | 1 | SET NULL |
| 9 | pages → file (hero_image) | pages | hero_image | directus_files | id | M2O | — | — | 1 | SET NULL |
| 10 | pages → file (og_image) | pages | og_image | directus_files | id | M2O | — | — | 1 | SET NULL |
| 11 | pages → file (image) | pages | image | directus_files | id | M2O | — | — | 1 | SET NULL |
| 12 | site_settings → file (logo) | site_settings | logo | directus_files | id | M2O | — | — | 1 | SET NULL |
| 13 | site_settings → file (logo_white) | site_settings | logo_white | directus_files | id | M2O | — | — | 1 | SET NULL |
| 14 | site_settings → file (favicon) | site_settings | favicon | directus_files | id | M2O | — | — | 1 | SET NULL |
| 15 | site_settings → file (default_og_image) | site_settings | default_og_image | directus_files | id | M2O | — | — | 1 | SET NULL |
| 16 | inquiries → user (assigned_to) | inquiries | assigned_to | directus_users | id | M2O | — | — | 1 | SET NULL |

### 3.3 Phase 2B 关系创建操作（避免重复创建）

| Operation Type | API calls |
|---|---|
| Directus `relations.create` | **16**（每个 logical relation 一次调用） |
| Junction tables created | **2**（`products_files`, `applications_products`）— Directus 在 M2M relation.create 时自动建 |
| FK constraints（database） | **18**（Directus 自动建） |
| Junction fields | **4**（Directus 在 M2M relation.create 时自动建） |

**Total Phase 2B relation work**: 16 API calls + 2 junction tables auto-created + 4 junction fields auto + 18 FK auto.

### 3.4 删除双真理源（v3 关键修正）

**`products.applications` JSON 字段不创建**（v2 错算保留 → v3 修正）

**单一真理源**：`applications.related_products` M2M（通过 applications_products junction table）
- 28 个 fallback products 中有 `applications` 字符串数组（66 unique / 69 occurrences）
- **删除** products.applications JSON 字段
- 迁移期通过 fuzzy match（精确 + substring）映射 fallback 字符串到 applications record
- 7 个精确匹配（Passenger vehicles, Commercial vehicles 等）
- 62 个非精确匹配（多为 highlights 重叠字符串）由运营人员审查后手工关联

---

## 4. RBAC 矩阵（v3 修正含 Public 媒体授权）

### 4.1 现状（保留）

3 policies + 2 Administrator roles + 1 user（admin@huanyukuntaichem.com）

### 4.2 拟新增（6 policies + 4 roles + 2 service tokens）

**Total Policies**: 3 existing + 6 new = **9 policies**

**Total Roles**: 2 existing + 4 new = **6 roles**

**Total Service Tokens**: 2（static token，非 role）

### 4.3 Public 角色（v3 修正 · folder-based authorization）

**v2 错误**：依赖 `directus_files.is_public=true`（该字段在 directus_files schema 中**不存在**）

**v3 修正**：folder-based authorization（v1.5 §34.1）

```
folder structure:
/Products/           → public
/Product-Categories/ → public
/Applications/       → public
/News/               → public
/Company/            → public
/Certificates/       → public
/Downloads/          → public
/Private/            → private (Public role denied)
```

**Public role**：
- ✅ Read directus_files **仅** folder 不在 `/Private/` 子树
- ❌ Read directus_files 在 `/Private/` 子树
- ❌ 任何业务集合 CRUD
- ❌ 任何 system collection

**Website Reader Token**（service token，Phase 2B 创建）：
- Read site_settings + product_categories + products + applications + news + news_categories + pages（**published-only**）
- 权限范围：read **published** records only
- 不可 read /Public/Private 中的私有文件

### 4.4 Inquiry Writer Token（v1.5 §43.2 · Least-Privilege Matrix）

| Collection / Action | Read | Create | Update | Delete |
|---|---|---|---|---|
| **inquiries** | ❌ | ✅ **白名单字段** | ❌ | ❌ |
| Other collections | ❌ | ❌ | ❌ | ❌ |
| directus_users | ❌ | ❌ | ❌ | ❌ |
| directus_files | ❌ | ❌ | ❌ | ❌ |

**Inquiry Writer 创建白名单字段**：
- ✅ 允许：`name` / `email` / `company` / `phone` / `whatsapp` / `country` / `message` / `source_path` / `product_slug` / `locale`
- ✅ 强制 `status = 'new'`（不允许传值）
- ✅ `id` / `date_created` 由系统产生（不允许传入）
- ❌ 禁止：传 `id` / `date_created` / `date_updated` / `status` / `internal_notes` / `assigned_to` / `outcome` / `next_follow_up_at`

### 4.5 Roles & Policies 总览

| # | Policy | Source | Admin | App |
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

**Total**: 9 policies · 6 roles · 2 service tokens

---

## 5. inquiries.status 处理（Owner Audit v3 修正）

| 项 | 处理 |
|---|---|
| Field name | **status（保留）** |
| Choices enum | **`[new, contacted, qualified, quoted, follow_up, closed]`（替换 v2 `[pending, handled]`）** |
| Default value | **`new`（替换 v2 `pending`）** |
| Legacy `pending` runtime | 不保留（0 records 决定） |
| API 翻译层 `pending ↔ new` | 不增加（v3 修正） |
| Destructive? | NO（metadata-only + 0 records） |

---

## 6. 媒体资源（v3 修正）

| 类别 | 数量 | 大小 | 状态 |
|---|---|---|---|
| Directus media | **0 records** | — | 待新上传（folder-based） |
| Repository static media | **46 files**（45 webp + 1 svg） | **16 MB** | 已存在（**修正"real media = 0"错误**） |
| Missing fallback refs | **3 MISSING** | — | export-capability-v2, quality-control, supply-chain |
| EXISTS fallback refs | **5 EXISTS** | — | OK |
| Temporary / generated | 0 | — | — |

### 6.1 Public 媒体授权修正

| v2 错 | **v3 正** |
|---|---|
| 依赖 `directus_files.is_public=true`（**不存在**） | folder-based authorization（`/Private/` 子树拒绝 Public） |

---

## 7. URL Inventory（v3 修正）

| 类型 | 数量 | × 10 locales |
|---|---|---|
| Fixed content routes | 7 patterns | 70 URLs |
| Dynamic news | 10 slugs | 100 URLs |
| Dynamic products | 28 slugs | 280 URLs |
| Dynamic categories | 31 slugs | 310 URLs |
| Root redirect | 1 | 10 URLs |
| API | 1 | 10 URLs |
| **`/applications/[slug]`** | **0（不存在）** | 0 |
| **Total public URLs (locale-expanded)** | — | **780** |

---

## 8. Dry-Run 总汇总（v3 修正版 · 术语分离）

```text
=== apply-schema dry-run (v3, idempotent, non-destructive) ===

Collections CREATE:        7
  site_settings, product_categories, products,
  applications, news_categories, news, pages
Collections UNCHANGED:     1  (inquiries, all 11 field names preserved)
Collections UPDATE:        0  (inquiries.status metadata-only)
Collections DELETE:        0
Junction tables CREATE:     2  (products_files, applications_products)
Optional CREATE:            1  (redirects, if enabled)

# 字段计数术语分离
Canonical total fields:     611
Unchanged fields:           10  (inquiries)
Metadata-update fields:     1   (inquiries.status: enum + default)
Actual field-create:        600
Fields DELETE:              0
Fields RENAMED:             0  (products.applications NOT created; removed)

# Relations 分层
Logical relations:          16
Directus relation objects:  16  (1 API call per logical relation)
Junction tables:            2   (auto-created by Directus M2M relation.create)
Junction fields:            4   (auto-created)
Physical FK constraints:    18  (auto-created)

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
Indexes DELETE:             0

DESTRUCTIVE CHANGES:       0
EXPECTED UNEXPECTED ON 2nd RUN: 0
```

---

## 9. 关键设计决策（v3 全部）

| # | 决策 |
|---|---|
| 1 | products.applications JSON **不创建**（消除双真理源） |
| 2 | pages.sections **单 canonical + translations 内嵌**（不分离 10 个 `_*` 字段） |
| 3 | highlights **多语言结构化**（id + sort + translations array） |
| 4 | company_name_cn **单字段**（中文公司名，不参与 10 语言 suffix） |
| 5 | Public 媒体 **folder-based authorization**（不依赖不存在的 `is_public` 字段） |
| 6 | inquiries.status **直接 v1.5 canonical enum + default new**（不保留 pending，不加 API 翻译） |
| 7 | Specifications **JSON 而非固定列**（化工属性 CAS No./Purity/Storage/Shelf Life） |
| 8 | URL 路由全区分 **fixed / dynamic / redirect / api** 四类（移除 `/applications/[slug]` 错误） |
| 9 | **真实媒体 ≠ 0**：`frontend/public/images/**` 有 46 文件 16 MB |
| 10 | **字段计数术语分离**：canonical total / unchanged / metadata-update / actual CREATE |

---

## 10. 待审批项（v3 修正后 · 10 项）

| # | 待审批 |
|---|---|
| 1 | 7 个新 Collection 字段定义（含单 canonical sections、structured highlights、specifications JSON、company_name_cn） |
| 2 | inquiries 保留 11 字段名 + status enum 替换策略（v1.5 canonical，0 records 非 destructive） |
| 3 | products/categories/news/applications 实测量（28/31/10/8/6） |
| 4 | 16 logical relations + 2 junction tables + 4 junction fields + 18 FK constraints |
| 5 | 6 个新 Policies + 4 个新 Roles + 2 个 Service Tokens + Public folder-based 授权 |
| 6 | 媒体策略：Directus folder-based + Repository static media 保留 |
| 7 | destructive changes = 0 + 重复运行零非预期变化（幂等） |
| 8 | Products.applications JSON 移除（双真理源 → 单一 M2M） |
| 9 | Pages.sections 单 canonical + translations（不分离 10 个 `_*`） |
| 10 | 总字段数 611（canonical）/ 600（CREATE）/ 10（unchanged）/ 1（metadata update）|

---

**Phase 2A v3 修正完成 · 暂停等审批。**