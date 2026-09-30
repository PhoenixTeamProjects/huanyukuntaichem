# Frontend → Directus Mapping Table — 前台字段到 CMS 字段的映射（v5 修正）

> 来源：v1.5 §14.2、§26、§29 + Owner Audit v5  
> 编制时间：2026-10-01 UTC（v5）

---

## 1. SiteSettings → `site_settings`（CREATE · 87 fields · v5 沿用 v4）

## 2. fallbackCategories → `product_categories`（CREATE · 31 records · 73 fields）

## 3. fallbackProducts → `products`（CREATE · 28 records · 107 fields · v5 修正）

| Source Field | Target Field | Transform | Count | Status |
|---|---|---|---|---|
| `id` (slug) | `id` (UUID) | 保留 slug | 28 | create |
| `slug` | `slug` (unique) | 保留字面 | 28 | create |
| `category` (slug) | `product_category` (M2O) | 按 slug 匹配 UUID | 28 | create |
| `name` | `product_name_*` (10 lang) | en 填值 | 28 | create |
| `summary` | `short_description_*` (10 lang) | en 填值 | 28 | create |
| `description` | `detailed_description_*` (rich_text ×10) | en 填值 | 28 | create |
| `image` (path) | `main_image` (M2O file) | 路径 → file ID | 28 | create |
| `imageAlt` | `image_alt_*` (10 lang) | en 填值 | 28 | create |
| `highlights` (string[]) | `highlights` (JSON 多语言结构) | `[{id, sort, translations: [{locale, text}]}]` | 28 | create |
| `applications` (string[]) | **—（不创建字段）** | 关系由 `applications.related_products` M2M 表达 | — | **delete field** |
| — | `product_images` (M2M files) | `products_files` 中间表 | — | create |
| — | `specifications` (JSON array) | Repeater interface；化工属性 | — | create |
| — | `internal_product_code` / `moq` | 单值 string | — | create |
| — | `lead_time_*` / `packaging_*` (10 lang) | en 填值 | — | create |
| — | `featured_product` / `customizable` (bool) | — | — | create |
| — | `seo_title_*` / `seo_description_*` / `seo_keywords_*` (10 lang) | — | — | create |
| — | `sort` / `status` | — | — | create |

### 3.1 highlights 多语言结构化（v1.5 §45 + 翻译安全）

### 3.2 product applications 字符串迁移（**v5 实测纠正**）

```
TOTAL_OCCURRENCES         = 23   (实测, 不是 69)
UNIQUE_APPLICATION_VALUES = 20   (实测, 不是 66)
MATCHED_UNIQUE_VALUES     = 7    (精确 allowlist)
MATCHED_OCCURRENCES       = 10   (7 unique × various counts)
UNRESOLVED_UNIQUE_VALUES  = 13
UNRESOLVED_OCCURRENCES    = 13
```

**Invariant**: 10 (matched) + 13 (unresolved) = 23 ✅; 13 ≥ 13 ✅

**v3/v4 错算**："66 unique / 59 unresolved / 58 occurrences" 是**实测错误**。实际只有 23 occurrences / 20 unique。

### 3.3 Source-driven check（v5 强制）

- products checked: **28**
- invalid product slug transcriptions: **0**
- unresolved product category references: **0**

每个 product.category slug 实测 = 31 fallbackCategories slug 之一。slug typo 全部纠正：`vecos-index-improvers` → `viscosity-index-improvers` ✓

---

## 5. news_categories（CREATE · 6 records · 48 fields）

## 6. business.ts `applications` → `applications`（CREATE · 8 records · 81 fields）

## 7. business.ts 12 块 → `pages`（CREATE · 103 fields · sections 单 canonical）

## 8. UI strings（UNCHANGED · 11 keys × 10 locales）

---

## 9. inquiries Collection（v5 wording 修正）

```
INQUIRIES_EXISTING_FIELDS      = 11
INQUIRIES_UNCHANGED_FIELDS      = 10
INQUIRIES_METADATA_UPDATE_FIELDS = 1   (status: enum + default)
INQUIRIES_NEW_FIELDS           = 7
INQUIRIES_CANONICAL_TOTAL      = 18   (10 + 1 + 7)
```

| Source Field | Target Field (Directus collection) | Transform | Status |
|---|---|---|---|
| `id` (integer PK) | `id` | 保留 | unchanged |
| `customer_name` | `customer_name` | 保留字段名 | unchanged |
| `email` | `email` | 保留 | unchanged |
| `company_name` | `company_name` | 保留字段名 | unchanged |
| `phone` | `phone` | 保留 | unchanged |
| `message` | `message` | 保留 | unchanged |
| `source_page` | `source_page` | 保留字段名 | unchanged |
| `product_interested` | `product_interested` | 保留字段名 | unchanged |
| `locale` | `locale` | 保留 | unchanged |
| `date_created` | `date_created` | 保留 | unchanged |
| **`status` 当前 enum `[pending, handled]`, default `pending`** | `status` | **保留字段名**；choices 替换；default 替换 | **metadata update** |
| — | `date_updated` (timestamp) | 系统管理 | create |
| — | `whatsapp` (string) | — | create |
| — | `country` (string) | — | create |
| — | `assigned_to` (M2O users) | — | create |
| — | `internal_notes` (text) | — | create |
| — | `outcome` (enum) | 独立于 status | create |
| — | `next_follow_up_at` (timestamp) | — | create |

---

## 10. URL/Slug 保留矩阵（v5 沿用 v4）

| URL 类型 | 数量 | × 10 locales | total |
|---|---|---|---|
| 6 fixed content patterns (除 home) | 6 | × 10 | 60 |
| `/[locale]` (home) | 1 | × 10 | 10 |
| `/[locale]/products/category/[slug]` | 31 | × 10 | 310 |
| `/[locale]/products/[slug]` | 28 | × 10 | 280 |
| `/[locale]/news` | 1 | × 10 | 10 |
| `/[locale]/news/[slug]` | 10 | × 10 | 100 |
| **Public locale content URLs** | — | — | **760** |
| `/` (redirect-only) | 1 | × 1 | **1** |
| `/api/inquiries` | 1 | × 1 | **1** |
| **Total route instances + endpoints** | — | — | **762** |

### 10.1 Slug 统计
- Slug-bearing records: **69**
- Unique literal slug values: **41**

### 10.2 Route patterns
- 7 fixed + 3 dynamic + 1 root + 1 API = **12**

---

## 11. 媒体映射（v5 拆分修正）

| 类别 | 数量 | 路径 |
|---|---|---|
| **FRONTEND_PUBLIC_IMAGES_FILES** | **45 webp** | `frontend/public/images/**` |
| **FRONTEND_PUBLIC_ROOT_MEDIA_FILES** | **1 svg** | `frontend/public/industrial-fuel-additive.svg` |
| **TOTAL_REPOSITORY_STATIC_MEDIA_FILES** | **46** | — |
| Directus media | 0 records | directus_files via folder-based 授权 |

### 11.1 fallback media refs
- **FALLBACK_MEDIA_REFS**: 8
- **FALLBACK_MEDIA_EXISTS**: 5
- **FALLBACK_MEDIA_MISSING**: 3

### 11.2 Public 媒体授权（v5 implementable）

**Phase 2B 确定性发现/创建以下 folder IDs**（用 Directus API `/folders`）：
- `/Products/` `/Product-Categories/` `/Applications/` `/News/` `/Company/` `/Certificates/` `/Downloads/` —— public（allowlist）
- **`/Private/`** —— **private（**Public 不 allowlist**）**

---

## 12. Structured Fields · Operator UX（v4 + v5 沿用）

### 12.1 选型（Option A · 待 Phase 2B 验证）

`products.specifications` / `products.highlights` / `pages.sections` 用 Directus Repeater interface + raw JSON hidden for operators。

**降级路径**：Phase 2B 实测 Directus 11 Repeater 不足 → Option B controlled child collections。

**RAW_JSON_REQUIRED_FOR_NORMAL_OPERATOR=NO**

### 12.2 Operator UX 规范

| 字段 | 运营者所见 | raw JSON 可见？ |
|---|---|---|
| `products.specifications` | "Add parameter"（key + value ×10 locales） | ❌ NO |
| `products.highlights` | "Add highlight"（stable id + sort + text ×10 locales） | ❌ NO |
| `pages.sections` | "Add section"（type enum + sort + image + product_ids + CTA + 10 语言 text） | ❌ NO |

---

## 13. Service Identities（v5 逻辑需求）

**SERVICE_IDENTITIES_REQUIRED=2**

| Identity | 服务端限制 | 权限范围 |
|---|---|---|
| **Website Reader** | server-side only | read published business content only; no writes; no inquiry access; no system/admin |
| **Inquiry Writer** | server-side only | create inquiries only; actual Directus field whitelist only; no read/list/update/delete; no lifecycle status write; no other collections; no system/admin |

**SERVICE_IDENTITY_BINDING_IMPLEMENTATION=TO_BE_VERIFIED_IN_PHASE_2B_AGAINST_INSTALLED_DIRECTUS_VERSION**

Phase 2B 验证：
- Directus 11.x 是否支持 static access tokens
- token 与 role / policy 的绑定模型
- 是否需要 service user account + role + token 三层

**不在 Phase 2A 创建任何 service user 或 token**。

---

## 14. Inquiry Writer 权限白名单（**v5 关键 RBAC 修正**）

**禁止**用前端 DTO 字段名（name / company / source_path / product_slug）。

**必须**用 Directus collection 字段名。

### 14.1 Inquiry Writer CREATE 允许字段（v5 · Directus collection 字段名）

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

### 14.2 Inquiry Writer NOT 允许写入字段

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

### 14.3 status 关键约束（v5）

```
INQUIRY_WRITER_STATUS_WRITE_PERMISSION=DENIED
INQUIRY_STATUS_INITIALIZATION=DIRECTUS_DEFAULT_NEW
```

- Inquiry Writer create permission **excludes** `status`
- `/api/inquiries` **不**接收 browser status field
- `/api/inquiries` **不**转发 user-supplied status
- Directus field default `new` 自动生效
- 防止 public-facing service 创建 status=contacted/qualified/quoted/follow_up/closed

### 14.4 Next.js adapter 字段映射

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

---

## 15. 关键设计决策（v5 全部）

1. ✅ products.applications JSON **不创建**
2. ✅ pages.sections **单 canonical + inline translations**
3. ✅ highlights 多语言结构化
4. ✅ company_name_cn 单字段（中文公司名）
5. ✅ Public 媒体 folder-based authorization
6. ✅ inquiries.status 直接 v1.5 canonical
7. ✅ Repeater interface（Phase 2B 验证）
8. ✅ URL inventory 762 total / 12 patterns
9. ✅ slug-bearing records 69 / unique literal 41
10. ✅ Media 45 webp + 1 svg = 46
11. ✅ Product applications: **23 occurrences / 20 unique / 7 matched / 10 matched-occ / 13 unresolved / 13 unresolved-occ**
12. ✅ Inquiries wording: **10 unchanged + 1 metadata update + 7 new = 18**
13. ✅ Inquiry Writer 用 **Directus field names**（不是 DTO）
14. ✅ **status NOT writable by Inquiry Writer**（默认 new）
15. ✅ Service Identities 是**逻辑需求**（Phase 2B 验证绑定）
16. ✅ **Blockers A/B/C/D** 分层

---

> v5 是 Owner Audit v5 修正版。前 v1-v4 全部以本版为准。