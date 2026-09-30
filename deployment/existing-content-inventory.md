# Existing Content Inventory — 现有前台内容盘点（Owner Audit v5 修正）

> 来源：v1.5 §14、§29 + Owner Audit v5  
> 编制时间：2026-10-01 UTC（v5）

---

## 1. URL 路由清单（v5 沿用 v4 修正）

### 1.1 Fixed locale content routes（7 patterns）
`/[locale]` / `/[locale]/products` / `/[locale]/news` / `/[locale]/applications` / `/[locale]/service` / `/[locale]/about` / `/[locale]/contact`

### 1.2 Dynamic locale content routes（3 patterns）
`/[locale]/products/category/[slug]` (31) · `/[locale]/products/[slug]` (28) · `/[locale]/news/[slug]` (10)

### 1.3 Redirect-only · 1.4 API · 1.5 总数
| 类型 | 数量 | × 10 locales | total |
|---|---|---|---|
| Public locale content | 7+10+28+31 patterns×slugs | — | **760** |
| Root redirect (`/`) | 1 | × 1 | **1** |
| API (`/api/inquiries`) | 1 | × 1 | **1** |
| **Total** | — | — | **762** |

**Route patterns total**: 7 + 3 + 1 + 1 = **12**

### 1.6 Slug 统计
- Slug-bearing records: **69**（31 categories + 28 products + 10 news）
- Unique literal slug values: **41**（28 product slugs 全与 categories child slugs 重叠 + 3 categories-only root slugs + 10 news slugs）

### 1.7 v3 错算纠正（historical reference · labeled）
- v3 "780 URL instances" → v4 **762**
- v3 "15 URL patterns" → v4 **12**
- v3 "69 distinct slugs" → v4 **"69 slug-bearing records"** + **41 unique literal values**

---

## 2. fallback 数据（v5 实测）

### 2.1 fallbackSettings · 2.2 fallbackCategories（31）
均沿用 v4。3 个 root slug（fuel-additives, lubricant-additives, lubricant-additive-packages） + 28 child slugs。

### 2.3 fallbackProducts（28 · 实测 · slug typo 已纠正 v5）

| # | slug | category slug | name | applications count |
|---|---|---|---|---|
| 1 | gasoline-fuel-additives | gasoline-fuel-additives | Gasoline Fuel Additives | 3 |
| 2 | diesel-fuel-additives | diesel-fuel-additives | Diesel Fuel Additives | 3 |
| 3 | detergents | detergents | Lubricant Detergents | 0 |
| 4 | dispersants | dispersants | Lubricant Dispersants | 0 |
| 5 | anti-wear-additives | anti-wear-additives | Anti-Wear Additives | 0 |
| 6 | extreme-pressure-additives | extreme-pressure-additives | Extreme Pressure Additives | 0 |
| 7 | antioxidants | antioxidants | Lubricant Antioxidants | 0 |
| 8 | friction-modifiers | friction-modifiers | Friction Modifiers | 0 |
| 9 | corrosion-inhibitors | corrosion-inhibitors | Corrosion Inhibitors | 0 |
| 10 | rust-inhibitors | rust-inhibitors | Rust Inhibitors | 0 |
| 11 | pour-point-depressants | pour-point-depressants | Pour Point Depressants | 0 |
| 12 | **viscosity-index-improvers** | **viscosity-index-improvers** | Viscosity Index Improvers | 0 |
| 13 | anti-foam-additives | anti-foam-additives | Anti-Foam Additives | 0 |
| 14 | demulsifiers | demulsifiers | Demulsifiers | 0 |
| 15 | emulsifiers | emulsifiers | Emulsifiers | 0 |
| 16 | tackifiers | tackifiers | Tackifiers | 0 |
| 17 | other-functional-lubricant-additives | other-functional-lubricant-additives | Other Functional Lubricant Additives | 0 |
| 18 | passenger-car-motor-oil-packages | passenger-car-motor-oil-packages | PCMO Additive Packages | 1 |
| 19 | heavy-duty-diesel-engine-oil-packages | heavy-duty-diesel-engine-oil-packages | HDD Engine Oil Additive Packages | 3 |
| 20 | motorcycle-oil-packages | motorcycle-oil-packages | Motorcycle Oil Additive Packages | 1 |
| 21 | gear-oil-packages | gear-oil-packages | Gear Oil Additive Packages | 2 |
| 22 | hydraulic-oil-packages | hydraulic-oil-packages | Hydraulic Oil Additive Packages | 2 |
| 23 | atf-packages | atf-packages | ATF Additive Packages | 1 |
| 24 | compressor-oil-packages | compressor-oil-packages | Compressor Oil Additive Packages | 1 |
| 25 | turbine-oil-packages | turbine-oil-packages | Turbine Oil Additive Packages | 1 |
| 26 | industrial-oil-packages | industrial-oil-packages | Industrial Oil Additive Packages | 2 |
| 27 | metalworking-fluid-packages | metalworking-fluid-packages | Metalworking Fluid Additive Packages | 2 |
| 28 | **grease-additive-solutions** | **grease-additive-solutions** | Grease Additive Solutions | 1 |

### 2.4 Product → category slug source-driven validation（v5 强制）

- products checked: **28**
- invalid product slug transcriptions: **0**（含 v5 修正：`viscosity-index-improvers` · `grease-additive-solutions` 已纠正）
- unresolved product category references: **0**

每个 product.category slug 实测 = 31 fallbackCategories slug 之一。**所有 28 个 product 引用全部 resolved。**

### 2.5 fallbackNews（10）

### 2.6 business.ts applications（8）

---

## 3. Product Applications 字符串实测（v5 程序化重算）

### 3.1 总数（实测 · 不再硬编码）

| 指标 | **v5 实测** |
|---|---|
| Total applications occurrences | **23** |
| Unique application values | **20** |
| Matched unique values（精确 allowlist） | **7** |
| Matched occurrences | **10** |
| Unresolved unique values | **13** |
| Unresolved occurrences | **13** |

**Invariant check**：
- 10 + 13 = 23 ✅
- 13 ≥ 13 ✅

**v3/v4 错算**：66 unique / 59 unresolved · **实测只有 20 unique / 13 unresolved**。**v5 已纠正**。

### 3.2 Per-value 完整 review 表（20 unique values · 全部列出）

| # | source_value | occurrence_count | exact_application_match | target_application | migration_action | review_required |
|---|---|---|---|---|---|---|
| 1 | Automotive aftermarket | 1 | YES | applications[8] | AUTO-MAP | NO |
| 2 | Commercial vehicles | 2 | YES | applications[2] | AUTO-MAP | NO |
| 3 | Construction machinery | 1 | YES | applications[4] | AUTO-MAP | NO |
| 4 | Heavy-duty diesel engines | 2 | YES | applications[3] | AUTO-MAP | NO |
| 5 | Industrial machinery | 2 | YES | applications[6] | AUTO-MAP | NO |
| 6 | Lubricant manufacturing | 1 | YES | applications[7] | AUTO-MAP | NO |
| 7 | Passenger vehicles | 1 | YES | applications[1] | AUTO-MAP | NO |
| 8 | Automatic transmission fluids | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 9 | Automotive gear oils | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 10 | Compressor oils | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 11 | Construction and agricultural power systems | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 12 | Construction equipment | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 13 | Cutting fluids | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 14 | Industrial gear oils | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 15 | Lubricating grease formulations | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 16 | Metalworking fluids | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 17 | Motorcycle engine oils | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 18 | Passenger-car engine oils | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 19 | Private-label fuel-treatment programs | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| 20 | Turbine oils | 1 | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |

**Sum check**：7 (matched) × various + 13 (unresolved) × 1 each = 10 + 13 = 23 ✅

### 3.3 迁移规则（v5 严格）

- ✅ **仅 7 unique values** 精确 allowlist auto-map（见上表 #1-7）
- ⚠️ **13 unique values 待人工 review**（见上表 #8-20）
- ❌ 禁止 fuzzy / substring / invented
- ❌ 禁止自动创建未审批关系
- DO NOT AUTO-CREATE = leave Directus relation empty + human approval required

---

## 4. 当前 Directus 现状

| 资源 | 数量 |
|---|---|
| users | 1（admin@huanyukuntaichem.com） |
| roles | 2（都叫 Administrator） |
| policies | 3 |
| permissions | 20（directus_* 系统） |
| inquiries | 11 fields, 0 records |
| `inquiries.status` | enum `[pending, handled]`, default `pending` |
| `directus_files` | **不含** `is_public` |
| uploads 卷 | 空 |

---

## 5. 媒体资源（v5 修正 · 按目录拆分）

| 类别 | 数量 | 大小 | 状态 |
|---|---|---|---|
| **FRONTEND_PUBLIC_IMAGES_FILES** | **45 webp** | — | `frontend/public/images/**` |
| **FRONTEND_PUBLIC_ROOT_MEDIA_FILES** | **1 svg** | — | `frontend/public/industrial-fuel-additive.svg` |
| **TOTAL_REPOSITORY_STATIC_MEDIA_FILES** | **46** | 16 MB | 真实存在 |
| Directus media | 0 records | — | 待上传 |
| **FALLBACK_MEDIA_REFS** | **8** | — | — |
| **FALLBACK_MEDIA_EXISTS** | **5** | — | OK |
| **FALLBACK_MEDIA_MISSING** | **3** | — | `export-capability-v2.webp`, `quality-control.webp`, `supply-chain.webp` |

**v4 错误**: `frontend/public/images/** = 46`（混淆了根目录 svg）。v5 拆分：**45 + 1 = 46 total**。

---

## 6. inquiries Collection 字段（实测）

| 字段 | type | nullable | default | interface | choices |
|---|---|---|---|---|---|
| id | integer (PK) | NO | nextval | numeric | — |
| customer_name | string | NO | null | input | — |
| email | string | NO | null | input | — |
| company_name | string | YES | null | input | — |
| phone | string | YES | null | input | — |
| message | text | NO | null | input-multiline | — |
| source_page | string | YES | null | input | — |
| product_interested | string | YES | null | input | — |
| locale | string | YES | null | input | — |
| status | string | NO | `pending` | select-dropdown | `[pending, handled]` |
| date_created | timestamp | YES | null | datetime | — |

**status v5 处理**：
- ❌ 不保留 `pending` legacy runtime
- ❌ 不增加 API 翻译层
- ✅ enum choices → `[new, contacted, qualified, quoted, follow_up, closed]`
- ✅ default → `new`
- 0 records 决定**非 destructive**

---

## 7. inquiries Field count wording（v5 关键修正）

```
INQUIRIES_EXISTING_FIELDS = 11
INQUIRIES_UNCHANGED_FIELDS = 10      (id + customer_name + email + company_name + phone + message + source_page + product_interested + locale + date_created)
INQUIRIES_METADATA_UPDATE_FIELDS = 1  (status: enum + default)
INQUIRIES_NEW_FIELDS = 7             (date_updated + whatsapp + country + assigned_to + internal_notes + outcome + next_follow_up_at)
INQUIRIES_CANONICAL_TOTAL = 18       (10 + 1 + 7)

# v3 错用：11 unchanged + 1 metadata update + 7 new = 18 (重复计 status)
# v5 修正：10 unchanged + 1 metadata update + 7 new = 18
```

---

> v5 是 Owner Audit v5 修正版。前 v1-v4 因 12 项关键问题被 BLOCKED，以本版为准。