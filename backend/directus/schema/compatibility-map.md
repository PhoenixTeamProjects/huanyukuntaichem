# Compatibility Map — 历史字段与 v1.5 Canonical Dictionary 映射（v5 修正）

> 来源：v1.5 §26 + §14.2 + §43 + §45 + Owner Audit v5  
> 编制时间：2026-10-01 UTC（v5）

---

## 1. 字段映射（v5 修正 · inquiries wording + 应用 string 实测）

### 1.1 `inquiries`（EXISTING · 10 unchanged + 1 metadata update + 7 new = 18）

**v5 关键 wording 修正**：v3/v4 错误使用 "11 unchanged + 1 metadata update + 7 new"。**正确表述是 10 unchanged + 1 metadata update + 7 new = 18**（11 个 existing fields 中 10 unchanged + 1 metadata update，不重复计 status）。

```
INQUIRIES_EXISTING_FIELDS        = 11
INQUIRIES_UNCHANGED_FIELDS        = 10
INQUIRIES_METADATA_UPDATE_FIELDS  = 1   (status: enum + default)
INQUIRIES_NEW_FIELDS             = 7
INQUIRIES_CANONICAL_TOTAL        = 18
```

| v1.5 §26.1 | 当前 Directus field name | 处理 |
|---|---|---|
| `name` | **`customer_name`**（保留） | 前端 `name` → `customer_name` |
| `email` | **`email`** | unchanged |
| `company` | **`company_name`**（保留） | 前端 `company` → `company_name` |
| `phone` | **`phone`** | unchanged |
| `whatsapp` | — | create |
| `country` | — | create |
| `message` | **`message`** | unchanged |
| `source_path` | **`source_page`**（保留） | 前端 `sourcePath` → `source_page` |
| `product_slug` | **`product_interested`**（保留） | 前端 `productSlug` → `product_interested` |
| `locale` | **`locale`** | unchanged |
| `status` (canonical enum) | **`status`** | **保留字段名**；**choices 替换** `[new, contacted, qualified, quoted, follow_up, closed]`；**default 替换** `new` |
| `date_created` | **`date_created`** | unchanged |
| `date_updated` | — | create |
| `internal_notes` | — | create |
| `assigned_to` | — | create |
| `outcome` | — | create；**始终独立于 status** |
| `next_follow_up_at` | — | create |

**v5 关键 RBAC**：`status` 默认 `new` 由 Directus 设定；**Inquiry Writer NOT allowed to write status**（详见 §3）。

### 1.2 - 1.8（沿用 v4）
- `product_categories`（CREATE · 31 records · 73 fields）
- `products`（CREATE · 28 records · 107 fields）
- `applications`（CREATE · 8 records · 81 fields）
- `news_categories`（CREATE · 6 records · 48 fields）
- `news`（CREATE · 10 records · 83 fields）
- `pages`（CREATE · 103 fields · sections 单 canonical + inline translations）
- `site_settings`（CREATE Singleton · 87 fields · 含 `company_name_cn` 单字段）

### 1.9 `redirects`（OPTIONAL · 本期不启用）

---

## 2. 产品 ↔ 应用 字符串迁移（**v5 实测纠正**）

### 2.1 实测总数（v5 · 程序化）

| 指标 | **v5 实测** |
|---|---|
| Total applications occurrences | **23** |
| Unique application values | **20** |
| Matched unique values | **7** |
| Matched occurrences | **10** |
| Unresolved unique values | **13** |
| Unresolved occurrences | **13** |

**Invariant**：10 + 13 = 23 ✅; 13 ≥ 13 ✅

**v3/v4 错算**："66 unique / 59 unresolved / 58 occurrences" —— **实测错误**。v5 已纠正。

### 2.2 Per-value 完整 review 表（**v5 · 20 unique values · 全部列出 · 无 placeholder**）

| # | source_value | occurrence_count | exact_application_match | target_application | migration_action | review_required |
|---|---|---|---|---|---|---|
| 1 | Automotive aftermarket | 1 | YES | applications[8] | AUTO-MAP | NO |
| 2 | Commercial vehicles | 2 | YES | applications[2] | AUTO-MAP | NO |
| 3 | Construction machinery | 1 | YES | applications[4] | AUTO-MAP | NO |
| 4 | Heavy-duty diesel engines | 2 | YES | applications[3] | AUTO-MAP | NO |
| 5 | Industrial machinery | 2 | YES | applications[6] | AUTO-MAP | NO |
| 6 | Lubricant manufacturing | 1 | YES | applications[7] | AUTO-MAP | NO |
| 7 | Passenger vehicles | 1 | YES | applications[1] | AUTO-MAP | NO |
| 8 | Automatic transmission fluids | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 9 | Automotive gear oils | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 10 | Compressor oils | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 11 | Construction and agricultural power systems | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 12 | Construction equipment | 1 | NONE | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 13 | Cutting fluids | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 14 | Industrial gear oils | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 15 | Lubricating grease formulations | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 16 | Metalworking fluids | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 17 | Motorcycle engine oils | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 18 | Passenger-car engine oils | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 19 | Private-label fuel-treatment programs | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |
| 20 | Turbine oils | 1 | NO | NONE | **DO NOT AUTO-CREATE** | **YES（人工）** |

**Sum**: 7 × {1,2,1,2,2,1,1} = 10 matched + 13 × 1 = 13 unresolved = **23 total** ✅

### 2.3 迁移规则（v5 严格 · 无 fuzzy）

- ✅ **仅 7 unique values** 精确 allowlist auto-map
- ⚠️ **13 unique values + 13 occurrences** 待人工 review
- ❌ 禁止 fuzzy / substring / invented / 自动未审批关系

---

## 3. Inquiry Writer RBAC（**v5 关键修正 · Directus field names**）

### 3.1 ❌ v3/v4 错误：使用 DTO 字段名

```
# 这些是 DTO 名（前端/Next.js 适配层），不能放在 Directus permissions
name             <- DTO
company          <- DTO
source_path      <- DTO (typo, mixed with DTO)
product_slug     <- DTO
```

### 3.2 ✅ v5 正确：使用 Directus collection 字段名

**Inquiry Writer CREATE allowed fields whitelist**：

```
customer_name        ← 实际 Directus collection field
email                ← 实际 Directus collection field
company_name         ← 实际 Directus collection field
phone                ← 实际 Directus collection field
whatsapp             ← 实际 Directus collection field
country              ← 实际 Directus collection field
message              ← 实际 Directus collection field
source_page         ← 实际 Directus collection field
product_interested  ← 实际 Directus collection field
locale               ← 实际 Directus collection field
```

**Inquiry Writer NOT allowed**：

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

### 3.3 status NOT writable by Inquiry Writer（**v5 关键 RBAC**）

```
INQUIRY_WRITER_STATUS_WRITE_PERMISSION = DENIED
INQUIRY_STATUS_INITIALIZATION           = DIRECTUS_DEFAULT_NEW
```

- Inquiry Writer create permission **excludes** `status`
- `/api/inquiries` **不**接收 browser status field
- `/api/inquiries` **不**转发 user-supplied status
- Directus field default `new` 自动生效
- 防止 public-facing service 创建 `status=contacted/qualified/quoted/follow_up/closed`

### 3.4 Next.js adapter 字段映射（v5）

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

### 3.5 禁止的 Inquiry Writer 行为

- ❌ 创建 `status = contacted` / `qualified` / `quoted` / `follow_up` / `closed` 记录
- ❌ 创建 `id` / `date_created` / `date_updated`（系统字段）
- ❌ 写 `internal_notes` / `assigned_to` / `outcome` / `next_follow_up_at`（运营/业务字段）
- ❌ read / list / update / delete 任何 inquiries 记录
- ❌ read / write 其他 collection
- ❌ read system collections（users / permissions / schema）

---

## 4. Service Identities（v5 逻辑需求 · Phase 2B 验证）

```
SERVICE_IDENTITIES_REQUIRED          = 2
SERVICE_IDENTITY_BINDING_IMPLEMENTATION = TO_BE_VERIFIED_IN_PHASE_2B_AGAINST_INSTALLED_DIRECTUS_VERSION
```

### 4.1 Service Identity A: Website Reader

**逻辑需求**：
- server-side only
- read published business content only
- no writes
- no inquiry access
- no system/admin access

### 4.2 Service Identity B: Inquiry Writer

**逻辑需求**（见 §3）：
- server-side only
- create inquiries only（白名单字段）
- no read/list/update/delete
- no lifecycle status write
- no other collections
- no system/admin access

### 4.3 Phase 2B 必须验证

- Directus 11.x 是否支持 static access tokens
- token 与 role / policy 的绑定模型（service user + role + token 三层？或 direct token？）
- 实际 API operation 顺序

**不在 Phase 2A 创建任何 service user 或 token**。

---

## 5. 媒体映射（v5 拆分）

| 类别 | 数量 | 路径 |
|---|---|---|
| FRONTEND_PUBLIC_IMAGES_FILES | **45 webp** | `frontend/public/images/**` |
| FRONTEND_PUBLIC_ROOT_MEDIA_FILES | **1 svg** | `frontend/public/industrial-fuel-additive.svg` |
| TOTAL_REPOSITORY_STATIC_MEDIA_FILES | **46** | — |
| FALLBACK_MEDIA_REFS | **8** | — |
| FALLBACK_MEDIA_EXISTS | **5** | — |
| FALLBACK_MEDIA_MISSING | **3** | — |

**v4 错误**: `frontend/public/images/** = 46`（混淆了根目录 svg）。v5 拆分正确。

### 5.1 Public 媒体授权（v5 implementable · folder ID allowlist）

- Phase 2B 确定性创建以下 folder IDs：
  - `/Products/` `/Product-Categories/` `/Applications/` `/News/` `/Company/` `/Certificates/` `/Downloads/` —— **public allowlist**
  - `/Private/` —— **private（不 allowlist）**
- Public permission filter: `directus_files.folder IN (<public folder IDs>)`
- **禁止** broad `directus_files` listing

---

## 6. Structured Fields · Operator UX（v4 沿用）

- Option A: Directus Repeater interface + raw JSON hidden
- RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR=**NO**
- 降级路径：Phase 2B 验证失败 → Option B controlled child collections

---

## 7. inquiries.status 处理（v5）

| 项 | 处理 |
|---|---|
| Field name | `status`（保留） |
| Choices enum | `[new, contacted, qualified, quoted, follow_up, closed]`（替换 `[pending, handled]`） |
| Default value | `new`（替换 `pending`） |
| Legacy `pending` runtime | 不保留 |
| API 翻译层 | 不增加 |
| **Inquiry Writer write permission** | **DENIED**（关键 RBAC） |
| **Browser POST status field** | **拒绝接收** |
| Destructive? | NO（0 records + metadata-only） |

---

## 8. URL/Slug 兼容性矩阵（v5 沿用 v4）

| URL 类型 | × 10 locales | total |
|---|---|---|
| Public locale content URLs | — | **760** |
| `/` (redirect) | × 1 | 1 |
| `/api/inquiries` | × 1 | 1 |
| **Total** | — | **762** |

**Route patterns**: **12** (7 + 3 + 1 + 1)
**Slug-bearing records**: **69**
**Unique literal slug values**: **41**

---

## 9. Phase 2B 收尾要求

1. ✅ Directus 8 个 Collections create
2. ✅ inquiries 11 字段保留（**10 unchanged + 1 metadata update**） + status enum 替换
3. ✅ products.applications JSON **不创建**
4. ✅ slug typo 全纠正（`vecos-index-improvers` → `viscosity-index-improvers`）
5. ✅ frontend/src/lib/directus/* 改造
6. ✅ fallback-data.ts / business.ts 标注"已迁入 Directus"
7. ✅ apply-schema.mjs 幂等
8. ✅ destructive changes = 0
9. ✅ 不增加 API 翻译层
10. ✅ pages.sections 单 canonical + translations
11. ✅ highlights 多语言结构化
12. ✅ company_name_cn 单字段
13. ✅ Public 媒体走 folder-based authorization
14. ✅ **Inquiry Writer 用 Directus field names（非 DTO names）**
15. ✅ **status NOT writable by Inquiry Writer**（默认 `new`）
16. ✅ 仅 7 unique values auto-map · 13 unique + 13 occurrences 待人工
17. ✅ Service Identities 是逻辑需求（Phase 2B 验证绑定）
18. ✅ Repeater interface（Phase 2B 验证）

---

> v5 是 Owner Audit v5 修正版。