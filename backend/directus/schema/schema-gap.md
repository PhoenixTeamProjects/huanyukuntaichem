# Schema Gap & Dry-Run Diff — 现有 Directus vs v1.5 Universal Core（v5 修正）

> 来源：v1.5 §13 + §26 + §43 + §44 + §45 + §48 + Owner Audit v5  
> 编制时间：2026-10-01 UTC（v5）

---

## 1. Collection 级状态（v5）

| Collection | Status | Migration |
|---|---|---|
| `site_settings` | create | create |
| `product_categories` | create | create |
| `products` | create | create · **不含 products.applications** |
| `applications` | create | create · **含 related_products M2M 作为单一真理源** |
| `news_categories` | create | create |
| `news` | create | create |
| `pages` | create | create · **单 canonical sections + inline translations** |
| `inquiries` | existing + diff | **10 unchanged + 1 metadata update + 7 new = 18** |
| `redirects` | optional | 不启用 |

---

## 2. 字段计数（v5 · 沿用 v4 实测 600/589）

### 2.1 三层术语

| 术语 | 含义 |
|---|---|
| **A. Canonical model field count** | 模型中所有字段的总计数 |
| **B. Planned new-model fields** | 新 schema 中应该应用的字段 = A − unchanged − update |
| **C. Actual Directus fields.create API operations** | **TO_BE_VERIFIED_IN_PHASE_2B**（Directus 11 自动创建 system fields 时可能略高于 B） |

### 2.2 Per-collection 字段精确统计

| Collection | System | Single | Trans ×10 | Relation | Structured | Canonical |
|---|---|---|---|---|---|---|
| site_settings | 7 | 6 | 70 (7 src) | 4 | 0 | **87** |
| product_categories | 7 | 4 | 60 (6 src) | 2 | 0 | **73** |
| **products** | 7 | 5 | 90 (9 src) | 3 | **2** (specifications + highlights; **applications 已删除**) | **107** |
| applications | 7 | 2 | 70 (7 src) | 2 | 0 | **81** |
| news_categories | 7 | 1 | 40 (4 src) | 0 | 0 | **48** |
| news | 7 | 4 | 70 (7 src) | 2 | 0 | **83** |
| pages | 6 | 3 | 90 (9 src) | 3 | **1** (sections single canonical) | **103** |
| inquiries | (11 existing) | 10 unchanged + 1 metadata update | 0 | 1 new (assigned_to) | 0 | **18** |

### 2.3 Aggregations（v4 实测 · v5 沿用 · 内部一致）

| 指标 | 值 |
|---|---|
| **CANONICAL_FIELD_TOTAL (A)** | **600** (87+73+107+81+48+83+103+18) |
| **UNCHANGED_FIELDS** | **10** |
| **METADATA_UPDATE_FIELDS** | **1** |
| **PLANNED_NEW_MODEL_FIELDS (B)** | **589** (600 − 10 − 1) |
| **ACTUAL_DIRECTUS_FIELD_CREATE_OPERATIONS (C)** | **TO_BE_VERIFIED_IN_PHASE_2B** |

---

## 3. Relations 分层（v5 沿用 v4 · TO_BE_VERIFIED for API operations）

| 概念 | 数量 | 来源 |
|---|---|---|
| **LOGICAL_RELATIONS** | **16** | Mapping 分析 |
| **M2M_RELATIONS** | **2** | Mapping 分析 |
| **JUNCTION_COLLECTIONS_REQUIRED** | **2**（products_files, applications_products） | Mapping |
| **JUNCTION_FIELDS_REQUIRED** | **4**（products_files: products_id + directus_files_id; applications_products: applications_id + products_id） | Mapping |
| Physical FK constraints expected | 18（14 M2O × 1 + 2 M2M × 2） | Mapping 推断 |
| **DIRECTUS_RELATION_API_OPERATIONS** | **TO_BE_VERIFIED_IN_PHASE_2B** | Phase 2B dry-run |

**Phase 2B 必须验证**：Directus 11.x `relations.create` API 在 M2M 时是否一次创建 junction table + 2 junction fields + 2 FK constraints；这是 Directus 版本相关的实现细节。

---

## 4. 移除双真理源（v5 · 强制）

- ✅ `products.applications` JSON 字段**不创建**
- ✅ **单一真理源**：`applications.related_products` M2M
- ✅ **仅 7 unique values auto-map**（实测）：Passenger vehicles / Commercial vehicles / Heavy-duty diesel engines / Construction machinery / Industrial machinery / Lubricant manufacturing / Automotive aftermarket
- ✅ **13 unique + 13 occurrences 待人工 review**（**DO NOT AUTO-CREATE**）
- ❌ 禁止 fuzzy / substring / invented

---

## 5. RBAC 矩阵（v5 关键 RBAC 修正）

### 5.1 Inquiry Writer（**v5 关键 RBAC**）

**禁止**使用前端 DTO 字段名（name / company / source_path / product_slug）。

**必须**使用 Directus collection 字段名。

#### 5.1.1 Inquiry Writer CREATE allowed fields whitelist
（仅 Directus collection 实际字段）

```
customer_name
email
company_name
phone
whatsapp
country
message
source_page
product_interested
locale
```

#### 5.1.2 Inquiry Writer NOT allowed

```
id
status
date_created
date_updated
internal_notes
assigned_to
outcome
next_follow_up_at
```

#### 5.1.3 status NOT writable（**v5 关键 RBAC**）

```
INQUIRY_WRITER_STATUS_WRITE_PERMISSION = DENIED
INQUIRY_STATUS_INITIALIZATION           = DIRECTUS_DEFAULT_NEW
```

- Inquiry Writer create permission **excludes** `status`
- `/api/inquiries` **不**接收 browser status field
- `/api/inquiries` **不**转发 user-supplied status
- Directus field default `new` 自动生效
- 防止 public-facing service 创建 `status=contacted/qualified/quoted/follow_up/closed`

### 5.2 Next.js adapter 字段映射（v5）

| Frontend DTO | Directus collection field |
|---|---|
| `name` | `customer_name` |
| `email` | `email` |
| `company` | `company_name` |
| `phone` | `phone` |
| `whatsapp` | `whatsapp` |
| `country` | `country` |
| `message` | `message` |
| `sourcePath` | `source_page` |
| `productSlug` | `product_interested` |
| `locale` | `locale` |

**DO NOT put DTO names into Directus permissions**（v5 强制）。

### 5.3 Public 媒体授权（v5 · folder ID allowlist）

**禁止**用 `directus_files.is_public=true`（不存在）。

**Phase 2B 确定性发现/创建**：
- `/Products/` `/Product-Categories/` `/Applications/` `/News/` `/Company/` `/Certificates/` `/Downloads/` —— **public allowlist**
- `/Private/` —— **private（**Public 不 allowlist**）**

Public permission filter: `directus_files.folder IN (<public folder IDs>)`

**禁止** broad `directus_files` listing

### 5.4 Roles / Policies / Service Tokens 总览

- 9 policies (3 existing + 6 new)
- 6 roles (2 existing + 4 new)
- **SERVICE_IDENTITIES_REQUIRED=2**（Website Reader + Inquiry Writer）
- **SERVICE_IDENTITY_BINDING_IMPLEMENTATION=TO_BE_VERIFIED_IN_PHASE_2B_AGAINST_INSTALLED_DIRECTUS_VERSION**

---

## 6. Service Identities（v5 · 逻辑需求）

| Identity | 服务端限制 | 权限 |
|---|---|---|
| **Website Reader** | server-side only | read published content only; no writes; no inquiry access; no system/admin |
| **Inquiry Writer** | server-side only | create inquiries only（白名单 Directus fields）；no read/list/update/delete；no status write；no other collections；no system/admin |

**Phase 2B 必须验证**：
- Directus 11.x static access token 模型
- token ↔ role ↔ policy 绑定模型
- 实际 API 操作顺序

**Phase 2A 不创建任何 service user 或 token**。

---

## 7. Structured Fields · Operator UX（v4 沿用）

- Option A: Directus Repeater interface + raw JSON hidden
- 降级路径：Phase 2B 实测 Repeater 不足 → Option B controlled child collections
- **RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR=NO**

---

## 8. inquiries.status 处理（v5）

| 项 | 处理 |
|---|---|
| Field name | `status`（保留） |
| Choices enum | `[new, contacted, qualified, quoted, follow_up, closed]`（替换 `[pending, handled]`） |
| Default value | `new`（替换 `pending`） |
| Legacy `pending` runtime | 不保留 |
| API 翻译层 | 不增加 |
| Inquiry Writer write permission | **DENIED** |
| Browser POST status | 拒绝接收 |
| Destructive? | NO（0 records + metadata-only） |

---

## 9. Product Applications 实测（v5 程序化）

```
PRODUCT_APPLICATION_UNIQUE_SOURCE_VALUES  = 20
PRODUCT_APPLICATION_OCCURRENCES            = 23
AUTO_APPROVED_EXACT_UNIQUE_VALUES          = 7
AUTO_APPROVED_EXACT_OCCURRENCES            = 10
UNRESOLVED_UNIQUE_VALUES                   = 13
UNRESOLVED_OCCURRENCES                     = 13

Invariant: 10 + 13 = 23 ✓
Invariant: 13 >= 13 ✓
```

**完整 20-row review 表见 `compatibility-map.md §2.2`**

**v3/v4 错算**：66 unique / 59 unresolved / 58 occurrences —— **实测错误**。v5 已纠正。

---

## 10. URL Inventory（v5 沿用 v4）

| 类型 | 数量 | × 10 locales | total |
|---|---|---|---|
| Public locale content URLs | — | — | **760** |
| Root redirect | 1 | × 1 | **1** |
| API | 1 | × 1 | **1** |
| **Total** | — | — | **762** |

**ROUTE_PATTERNS** = **12**

---

## 11. 媒体资源（v5 拆分）

| 类别 | 数量 |
|---|---|
| FRONTEND_PUBLIC_IMAGES_FILES | **45 webp** |
| FRONTEND_PUBLIC_ROOT_MEDIA_FILES | **1 svg** |
| TOTAL_REPOSITORY_STATIC_MEDIA_FILES | **46** |
| FALLBACK_MEDIA_REFS | **8** |
| FALLBACK_MEDIA_EXISTS | **5** |
| FALLBACK_MEDIA_MISSING | **3** |

**v4 错误**：`frontend/public/images/** = 46`（混淆了根目录 svg）。**v5 正确拆分**。

---

## 12. inquiries Collection 字段 wording（v5 修正）

```
INQUIRIES_EXISTING_FIELDS        = 11
INQUIRIES_UNCHANGED_FIELDS        = 10   (id, customer_name, email, company_name, phone, message, source_page, product_interested, locale, date_created)
INQUIRIES_METADATA_UPDATE_FIELDS  = 1    (status: enum + default)
INQUIRIES_NEW_FIELDS             = 7     (date_updated, whatsapp, country, assigned_to, internal_notes, outcome, next_follow_up_at)
INQUIRIES_CANONICAL_TOTAL        = 18   (10 + 1 + 7)
```

**v3/v4 错误**："11 unchanged + 1 metadata update + 7 new"（status 在 unchanged 11 中又计了一次）。**v5 修正**。

---

## 13. Blockers 重新分类（v5 沿用 v4）

### A. Phase 2B Schema Gate Blockers（必须先解决才能开始 schema dry-run）

| # | BLOCKER |
|---|---|
| A1 | **v3 / v4 / v5 修正文档的 Owner 审批** |
| A2 | **Directus 11.x 版本 + API 行为实测**（schema 操作顺序与实际 API 调用） |
| A3 | **Phase 2B apply-schema.mjs 设计 + dry-run 实测**（不实际写入生产） |
| A4 | **Directus service token 模型验证**（static token ↔ role ↔ policy 绑定模型） |

### B. Pre-Data-Migration Blockers（导入 fallback 数据前需解决）

| # | BLOCKER |
|---|---|
| B1 | 真实 staff 邮箱（用于 user accounts 分配新角色） |
| B2 | 3 MISSING fallback 图片资源 |
| B3 | 真实产品图 / 业务图 / Logo / Favicon |
| B4 | Directus folder 配置（Phase 2B 确定性创建 + 记录 IDs） |
| B5 | 13 unresolved unique + 13 occurrences 应用关系人工 review |

### C. Pre-Cutover Blockers（生产切换前需解决）

| # | BLOCKER |
|---|---|
| C1 | fallback products 28 条 → Directus import（含 applications review 结果） |
| C2 | fallback business content → pages sections import（中文公司名 等） |
| C3 | 10 语言翻译工作 |
| C4 | 生产 Directus 配置确认 |
| C5 | Inquiries API 集成测试（含 Inquiry Writer + status 不写） |
| C6 | SMTP（用户指令不启用） |

### D. Post-Launch / Optional Housekeeping

| # | ITEM |
|---|---|
| D1 | redirects collection 启用 |
| D2 | GitHub Actions secrets 配置 |
| D3 | fallback-data.ts / business.ts 移除（schema 应用 + 数据迁移完成后） |

---

## 14. Dry-Run 总汇总（v5 术语分离版）

```
=== apply-schema dry-run (v5, idempotent, non-destructive) ===

Collections CREATE:        7
Collections UNCHANGED:     1  (inquiries, all 11 field names preserved)
Collections UPDATE:        0
Junction tables required:   2  (products_files, applications_products)
Optional CREATE:            1  (redirects, IF enabled — currently disabled)

# 字段计数术语分离
A. Canonical total fields:                 600
B. Unchanged fields:                       10   (inquiries)
C. Metadata-update fields:                 1    (inquiries.status: enum + default)
D. Planned new-model fields (A-B-C):       589
E. Actual Directus fields.create API operations: TO_BE_VERIFIED_IN_PHASE_2B

# Relations 分层
F. Logical relations:                      16
G. M2M relations:                          2
H. Junction collections required:          2
I. Junction fields required:               4
J. Directus relation API operations:       TO_BE_VERIFIED_IN_PHASE_2B

# Service identities
K. SERVICE_IDENTITIES_REQUIRED:            2
L. SERVICE_IDENTITY_BINDING_IMPLEMENTATION: TO_BE_VERIFIED_IN_PHASE_2B

# RBAC critical
M. INQUIRY_WRITER_STATUS_WRITE_PERMISSION: DENIED
N. INQUIRY_STATUS_INITIALIZATION:           DIRECTUS_DEFAULT_NEW

Policies CREATE:           6
Policies UNCHANGED:        3
Roles CREATE:               4
Roles UNCHANGED:            2
Permissions CREATE:        ~80  (estimated)
Permissions UNCHANGED:     20

Indexes / Unique CREATE:   ~22
Indexes DELETE:                      0

DESTRUCTIVE CHANGES:               0
EXPECTED UNEXPECTED ON 2nd RUN:    0
```

---

## 15. 关键设计决策（v5 全部 16 项）

| # | 决策 |
|---|---|
| 1 | products.applications JSON **不创建** |
| 2 | pages.sections 单 canonical + inline translations |
| 3 | highlights 多语言结构化 |
| 4 | company_name_cn 单字段（中文公司名） |
| 5 | Public 媒体 folder-based authorization（folder ID allowlist） |
| 6 | inquiries.status 直接 v1.5 canonical enum + default `new` |
| 7 | Specifications / Highlights / Page Sections：Option A Repeater interface |
| 8 | URL inventory 762 total / 12 patterns |
| 9 | slug-bearing records 69 / unique literal 41 |
| 10 | Media 45 webp + 1 svg = 46 |
| 11 | **Product applications 23/20/7/10/13/13**（v5 实测纠正） |
| 12 | Slug typo 全纠正 |
| 13 | 字段计数术语分离（canonical 600 / planned 589 / actual API TO_BE_VERIFIED） |
| 14 | Relations 4 层（logical 16 / M2M 2 / junction 2+4 / API TO_BE_VERIFIED） |
| 15 | **Inquiries wording**：10 unchanged + 1 metadata update + 7 new = 18 |
| 16 | **Inquiry Writer 用 Directus field names（非 DTO names）** |
| 17 | **status NOT writable by Inquiry Writer** |
| 18 | **Service Identities 是逻辑需求**（Phase 2B 验证） |
| 19 | **Blockers A/B/C/D** 分层 |

---

**Phase 2A v5 修正完成 · 暂停等 Owner Audit (v6) 审批。**

**PHASE_2A_STATUS=WAITING_FOR_PHOENIX_OWNER_AUDIT**