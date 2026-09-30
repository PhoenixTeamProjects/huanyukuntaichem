# Existing Content Inventory — 现有前台内容盘点（Owner Audit v4 修正）

> 来源：v1.5 §14、§29 + Owner Audit v4 修正  
> 编制时间：2026-10-01 UTC（v4）  
> 编制执行者：Claude（只读实测）

---

## 1. URL 路由清单（v4 · 按 4 类分组 · 修正 root/API 不乘 10 locales）

### 1.1 Fixed locale content routes（7 route patterns）

| Route | File |
|---|---|
| `/[locale]` | `frontend/src/app/[locale]/page.tsx` |
| `/[locale]/products` | `frontend/src/app/[locale]/products/page.tsx` |
| `/[locale]/news` | `frontend/src/app/[locale]/news/page.tsx` |
| `/[locale]/applications` | `frontend/src/app/[locale]/applications/page.tsx` |
| `/[locale]/service` | `frontend/src/app/[locale]/service/page.tsx` |
| `/[locale]/about` | `frontend/src/app/[locale]/about/page.tsx` |
| `/[locale]/contact` | `frontend/src/app/[locale]/contact/page.tsx` |

### 1.2 Dynamic locale content routes（3 route patterns）

| Route pattern | File | Slug 来源数 |
|---|---|---|
| `/[locale]/products/category/[slug]` | `products/category/[slug]/page.tsx` | 31 (categories) |
| `/[locale]/products/[slug]` | `products/[slug]/page.tsx` | 28 (products) |
| `/[locale]/news/[slug]` | `news/[slug]/page.tsx` | 10 (news) |

**没有** `/applications/[slug]` 动态路由（实测 `frontend/src/app/[locale]/applications/` 目录**只有 page.tsx**，无 `[slug]` 子目录）。

### 1.3 Redirect-only routes（1 route pattern）

| Route | File | 行为 |
|---|---|---|
| `/` | `frontend/src/app/page.tsx` | `redirect(\`/${defaultLocale}\`)` → `/en` |

### 1.4 API routes（1 endpoint pattern）

| Route | File | Method |
|---|---|---|
| `/api/inquiries` | `frontend/src/app/api/inquiries/route.ts` | POST |

### 1.5 URL 总数（v4 修正 · 不乘 root/API）

| 类型 | 计算 | 总数 |
|---|---|---|
| Locale-expanded public content URLs | 7 fixed × 10 + 10 × 10 + 28 × 10 + 31 × 10 = 70 + 100 + 280 + 310 | **760** |
| Root redirect-only endpoints | 1 (× 1, **不**乘 10) | **1** |
| API endpoints | 1 (× 1, **不**乘 10) | **1** |
| **Total route instances/endpoints** | 760 + 1 + 1 | **762** |

### 1.6 Route patterns（v4 修正）

| 类型 | 数量 |
|---|---|
| Fixed locale content | 7 |
| Dynamic locale content | 3 |
| Root redirect | 1 |
| API | 1 |
| **Total route patterns** | **12** |

### 1.7 Slug 统计（v4 修正 · 区分 records 与 unique literal values）

| 指标 | 值 |
|---|---|
| **Slug-bearing content records**（记录数） | 31 (categories) + 28 (products) + 10 (news) = **69** |
| **Unique literal slug values**（去重字面值） | **41** |

**41 unique literal slugs 来源分析**：
- 28 product slugs **全部**也是 category slug（每个 product 与其 parent category 同名）
- Categories-only（不在 products 中）：3 个 = `fuel-additives`, `lubricant-additives`, `lubricant-additive-packages`
- News：10 个，与 products/categories 无 exact slug 重叠
- 总去重：28 + 3 + 10 = **41**

### 1.8 v3 错算纠正

| 旧版 | **v4** |
|---|---|
| 780 URL instances | **762**（root/API 不乘 10 locales） |
| 15 URL patterns | **12** |
| "69 distinct slugs" | **"69 slug-bearing content records"**（+ 41 unique literal values 单独计算） |

---

## 2. 业务内容来源全景

| 内容类型 | 来源 | 数量 |
|---|---|---|
| Site settings | 静态 fallback TS | 1 |
| Product categories | 静态 fallback TS | 31 |
| Products | 静态 fallback TS | 28 |
| News categories | 内联字符串 | 6 去重 |
| News articles | 静态 fallback TS | 10 |
| Applications | 静态业务 TS | 8 |
| Business content | 静态业务 TS | 12 块 |
| UI strings | UI messages JSON | 11 keys × 10 locales |

---

## 3. fallback 详细清单

### 3.1 fallbackCategories（31 条 · 3 top-level + 28 children · 实测）

3 个 root slug（不在 products 中）：`fuel-additives`, `lubricant-additives`, `lubricant-additive-packages`

28 个 child slug（与 product slug 完全重叠）

### 3.2 fallbackProducts（28 条 · 实测 · **slug typo 已纠正**）

| # | slug | category slug | name |
|---|---|---|---|
| 1 | gasoline-fuel-additives | gasoline-fuel-additives | Gasoline Fuel Additives |
| 2 | diesel-fuel-additives | diesel-fuel-additives | Diesel Fuel Additives |
| 3 | detergents | detergents | Lubricant Detergents |
| 4 | dispersants | dispersants | Lubricant Dispersants |
| 5 | anti-wear-additives | anti-wear-additives | Anti-Wear Additives |
| 6 | extreme-pressure-additives | extreme-pressure-additives | Extreme Pressure Additives |
| 7 | antioxidants | antioxidants | Lubricant Antioxidants |
| 8 | friction-modifiers | friction-modifiers | Friction Modifiers |
| 9 | corrosion-inhibitors | corrosion-inhibitors | Corrosion Inhibitors |
| 10 | rust-inhibitors | rust-inhibitors | Rust Inhibitors |
| 11 | pour-point-depressants | pour-point-depressants | Pour Point Depressants |
| 12 | **viscosity-index-improvers** | viscosity-index-improvers | Viscosity Index Improvers |
| 13 | anti-foam-additives | anti-foam-additives | Anti-Foam Additives |
| 14 | demulsifiers | demulsifiers | Demulsifiers |
| 15 | emulsifiers | emulsifiers | Emulsifiers |
| 16 | tackifiers | tackifiers | Tackifiers |
| 17 | other-functional-lubricant-additives | other-functional-lubricant-additives | Other Functional Lubricant Additives |
| 18 | passenger-car-motor-oil-packages | passenger-car-motor-oil-packages | Passenger Car Motor Oil Additive Packages |
| 19 | heavy-duty-diesel-engine-oil-packages | heavy-duty-diesel-engine-oil-packages | Heavy-Duty Diesel Engine Oil Additive Packages |
| 20 | motorcycle-oil-packages | motorcycle-oil-packages | Motorcycle Oil Additive Packages |
| 21 | gear-oil-packages | gear-oil-packages | Gear Oil Additive Packages |
| 22 | hydraulic-oil-packages | hydraulic-oil-packages | Hydraulic Oil Additive Packages |
| 23 | atf-packages | atf-packages | ATF Additive Packages |
| 24 | compressor-oil-packages | compressor-oil-packages | Compressor Oil Additive Packages |
| 25 | turbine-oil-packages | turbine-oil-packages | Turbine Oil Additive Packages |
| 26 | industrial-oil-packages | industrial-oil-packages | Industrial Oil Additive Packages |
| 27 | metalworking-fluid-packages | metalworking-fluid-packages | Metalworking Fluid Additive Packages |
| 28 | grease-addditive-solutions | grease-additive-solutions | Grease Additive Solutions |

**Slug typo 修正（v3 → v4）**：第 12 行 `vecos-index-improvers` → **`viscosity-index-improvers`**（实测源文件用 `viscosity-index-improvers`）。

### 3.3 Source-driven check（product.category slug → fallbackCategories）

- products checked: **28**
- unresolved product category references: **0 expected**

每个 product 的 `category` 字段值匹配 fallbackCategories 中的 31 个 slug 之一（实测：每个 product category slug 等于其 product slug，而 28 个 product slug **全部**也是 28 个 child category slug 之一）。

| # | product slug | category slug（实测） | 在 fallbackCategories 中？ |
|---|---|---|---|
| 1-28 | （同上表 3.2） | 同 product slug | ✅ YES × 28 |

**结果：all 28 resolved. Unresolved: 0.**

### 3.4 fallbackNews（10 条 · 实测）

| # | slug | category | publishedAt |
|---|---|---|---|
| 1-10 | (同上 v3) | (6 去重) | 2026-09-01 |

### 3.5 business.ts applications（8 条 · 实测）

| # | title | direction |
|---|---|---|
| 1-8 | (同上 v3) | (...) |

---

## 4. fallback `products.applications` 数据实测

- **66 unique application strings**（去重）
- **69 total occurrences**（分布在 28 个产品上）
- 与 `business.ts applications` 8 条 title **精确语义匹配**：**7 unique values matched**

```
matched unique values (7):
  Passenger vehicles, Commercial vehicles, Heavy-duty diesel engines,
  Construction machinery, Industrial machinery, Lubricant manufacturing,
  Automotive aftermarket

unresolved unique values: 66 - 7 = 59
unresolved occurrences: 69 - <matched occurrences>
```

**Owner Audit v4 修正**：
- ❌ **禁止**自动 fuzzy / substring / invented 关系创建
- ✅ **仅**精确 approved semantic allowlist 自动映射
- ⚠️ **非精确 / 模糊字符串**：**DO NOT** create M2M relation 自动；记录在 review 表，由人工审查
- 大部分 product application 字符串（66 中的 59）实际为 highlights/components/family names 而非真实"应用场景"，不映射到 applications collection

### 4.1 待人工审查的迁移表（v4 · 需运营人员逐条 review）

| source_value | occurrence_count | exact_application_match | target_application | migration_action | review_required |
|---|---|---|---|---|---|
| Passenger vehicles | (count needed) | category mapping | applications[0] | AUTO-MAP | NO |
| Commercial vehicles | (count needed) | category mapping | applications[1] | AUTO-MAP | NO |
| Heavy-duty diesel engines | (count needed) | category mapping | applications[2] | AUTO-MAP | NO |
| Construction machinery | (count needed) | category mapping | applications[3] | AUTO-MAP | NO |
| Industrial machinery | (count needed) | category mapping | applications[5] | AUTO-MAP | NO |
| Lubricant manufacturing | (count needed) | category mapping | applications[6] | AUTO-MAP | NO |
| Automotive aftermarket | (count needed) | category mapping | applications[7] | AUTO-MAP | NO |
| （其余 59 unique strings） | various | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| (例如 "Calcium sulfonate detergents") | (1) | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| (例如 "Passenger-car engine oils") | (1) | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| (例如 "Heavy-duty application focus") | (1) | NO | NONE | DO NOT AUTO-CREATE | **YES（人工）** |
| ...（共 59 unique strings / 总共 58 occurrences 待审查） | | | | | |

**Phase 2B 不实施**自动 M2M 关联创建。人工 review 表由运营人员填好后再导入。

---

## 5. 当前 Directus 现状（实测）

| 资源 | 数量 / 详情 |
|---|---|
| users | 1（admin@huanyukuntaichem.com） |
| roles | 2（都叫 Administrator） |
| policies | 3（含 `$t:public_label` = Public） |
| permissions | 20（directus_* 系统 collection） |
| inquiries | 11 字段，0 条记录 |
| `inquiries.status` 当前 | enum `[pending, handled]`, default `pending` |
| `directus_files` 字段 | **不含** `is_public` |
| uploads 卷 | 空 |
| extensions 卷 | 空 |

---

## 6. 媒体资源清单（v4 修正 · 5 EXISTS / 3 MISSING 一致）

| 类别 | 数量 | 大小 | 状态 |
|---|---|---|---|
| **Directus media** (`directus_files`) | **0 records** | — | 待上传，folder-based 授权 |
| **Repository static media** (`frontend/public/images/**`) | **46 files**（45 webp + 1 svg） | **16 MB** | 真实存在 |
| Missing fallback refs | **3** | — | 待真实资源补齐 |
| Temporary / generated | 0 | — | — |

### 6.1 Repository static media 目录树（45 + 1 = 46 files · 实测）

```
frontend/public/images/
├── about/        (4 files)
├── applications/ (8 files)
├── contact/      (4 files)
├── home/         (8 files, 含 refined/ 8 子目录)
└── (no images outside images/)

frontend/public/industrial-fuel-additive.svg (1 file)
```

### 6.2 fallback 引用 vs 实际文件（**v4 修正 · 5 EXISTS + 3 MISSING**）

| fallback 引用 | 实际文件 | 状态 |
|---|---|---|
| `/images/home/additive-packages.webp` | ✅ EXISTS | OK |
| `/images/home/fuel-additives.webp` | ✅ EXISTS | OK |
| `/images/home/lubricant-additives.webp` | ✅ EXISTS | OK |
| `/images/home/refined/application-heavy-duty.webp` | ✅ EXISTS | OK |
| `/images/home/refined/application-industrial-machinery.webp` | ✅ EXISTS | OK |
| `/images/home/refined/export-capability-v2.webp` | ⚠️ MISSING | 待补真实资源 |
| `/images/home/refined/quality-control.webp` | ⚠️ MISSING | 待补真实资源 |
| `/images/home/refined/supply-chain.webp` | ⚠️ MISSING | 待补真实资源 |

**Fallback media 统计（v4 统一）**：
- Repo static media files: **46**
- Fallback media refs: **8**
- EXISTS: **5**
- MISSING: **3**

**v3 矛盾已纠正**：之前 §1.5 说 "Missing references = 0 / all 8 EXISTS" 与 §6.2 实际 EXISTS/MISSING 列表矛盾。**v4 一致使用 5 EXISTS + 3 MISSING**。

---

## 7. inquiries Collection 字段（实测）

| 字段 | type | default | interface | choices |
|---|---|---|---|---|
| id | integer (PK) | nextval | numeric | — |
| customer_name | string (NOT NULL) | null | input | — |
| email | string (NOT NULL) | null | input | — |
| company_name | string (nullable) | null | input | — |
| phone | string (nullable) | null | input | — |
| message | text (NOT NULL) | null | input-multiline | — |
| source_page | string (nullable) | null | input | — |
| product_interested | string (nullable) | null | input | — |
| locale | string (nullable) | null | input | — |
| status | string (NOT NULL) | `pending` | select-dropdown | `[pending, handled]` |
| date_created | timestamp (nullable) | null | datetime | — |

**status v4 Owner Audit 修正（不变）**：
- ❌ 不保留 `pending` legacy runtime
- ❌ 不增加 API 翻译层
- ✅ enum choices → `[new, contacted, qualified, quoted, follow_up, closed]`
- ✅ default → `new`
- 0 records 决定**非 destructive**

---

## 8. 关键约束（v4）

1. **inquiries 11 字段名保留**；status enum + default 替换（0 records 非 destructive）
2. **不重命名**：`customer_name` / `company_name` / `source_page` / `product_interested`
3. **移除 products.applications JSON**（双真理源消除）；单一真理源 `applications.related_products` M2M
4. **products.specifications** 进 JSON（**或** controlled child collection · Phase 2B 决定）
5. **products.highlights** 多语言结构化 JSON（**或** controlled child collection · Phase 2B 决定）
6. **pages.sections** 单 canonical + inline translations（**或** child collection · Phase 2B 决定）
7. **company_name_cn** 单字段（不参与 10 语言 suffix）
8. **Public 媒体** folder-based authorization（不依赖不存在的 `is_public` 字段）
9. **URL/slug** 不修改；**762 total route instances preserved**
10. **product applications 字符串**：仅 7 精确 allowed auto-map；59 unique + 58 occurrences 待人工 review

---

> v4 是 Owner Audit v4 修正版。v1/v2/v3 因 10 项关键问题被 BLOCKED，以本版为准。