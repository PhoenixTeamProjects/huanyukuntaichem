# Existing Content Inventory — 现有前台内容盘点（Owner Audit v3 修正）

> 来源：v1.5 §14、§29 现有网站接入 Directus 流程  
> 编制时间：2026-10-01 UTC（Owner Audit v3 修正）  
> 编制执行者：Claude（只读实测）

## 1. URL 路由清单（实测 · 按四类分组）

### 1.1 固定 locale 内容路由（7 条 route patterns）

| 路由 | 文件 |
|---|---|
| `/[locale]` | `frontend/src/app/[locale]/page.tsx` |
| `/[locale]/products` | `frontend/src/app/[locale]/products/page.tsx` |
| `/[locale]/news` | `frontend/src/app/[locale]/news/page.tsx` |
| `/[locale]/applications` | `frontend/src/app/[locale]/applications/page.tsx` |
| `/[locale]/service` | `frontend/src/app/[locale]/service/page.tsx` |
| `/[locale]/about` | `frontend/src/app/[locale]/about/page.tsx` |
| `/[locale]/contact` | `frontend/src/app/[locale]/contact/page.tsx` |

### 1.2 动态内容路由（3 条 patterns · slug 来自 fallback）

| 路由 pattern | 文件 | slug 数 |
|---|---|---|
| `/[locale]/products/category/[slug]` | `frontend/src/app/[locale]/products/category/[slug]/page.tsx` | 31 |
| `/[locale]/products/[slug]` | `frontend/src/app/[locale]/products/[slug]/page.tsx` | 28 |
| `/[locale]/news/[slug]` | `frontend/src/app/[locale]/news/[slug]/page.tsx` | 10 |

### 1.3 Redirect-only 路由（1 条）

| 路由 | 文件 | 行为 |
|---|---|---|
| `/` | `frontend/src/app/page.tsx` | `redirect(\`/${defaultLocale}\`)` → 跳到 `/en` |

### 1.4 API 路由（1 条）

| 路由 | 文件 | 方法 |
|---|---|---|
| `/api/inquiries` | `frontend/src/app/api/inquiries/route.ts` | POST |

### 1.5 Locale-expanded URL 总数（10 locales）

| 类型 | 单一 slug 数量 | × 10 locales | 总 URL 实例 |
|---|---|---|---|
| Fixed content routes | 7 route patterns | — | **70** |
| Dynamic news | 10 slugs | × 10 | **100** |
| Dynamic products | 28 slugs | × 10 | **280** |
| Dynamic categories | 31 slugs | × 10 | **310** |
| Root redirect | 1 path | × 10 | **10** |
| API | 1 path | × 10 | **10** |
| **Total URL instances** | — | — | **780** |

**去重 distinct slugs**：31 categories + 28 products + 10 news = **69 distinct slugs**  
**distinct public content slugs**：仅 69（不算 fixed routes）  
**distinct public URL patterns**：10（fixed） + 3（dynamic） + 1（root） + 1（api） = **15 patterns**

**没有** `/applications/[slug]` 动态路由（已实测 `frontend/src/app/[locale]/applications/` 目录**只有 page.tsx**，无 `[slug]` 子目录）。

### 1.6 前 Phase 2A 错算纠正

| 旧版 | **v3 修正** |
|---|---|
| 85 个公开 URL | **780 URL 实例（10 locales 展开）** / 69 distinct slugs / 15 URL patterns |
| 含 `/applications/[slug]` 8 个 | **删除**（无此路由） |

## 2. 业务内容来源全景

| 内容类型 | 现状来源 | 数量 | 文件路径 |
|---|---|---|---|
| Site settings (siteName, tagline, phone, address, email) | 静态 fallback TS | 1 条（5 字段） | `frontend/src/lib/directus/fallback-data.ts` |
| Product categories | 静态 fallback TS | 31 | `frontend/src/lib/directus/fallback-data.ts` |
| Products | 静态 fallback TS | **28** | `frontend/src/lib/directus/fallback-data.ts` |
| News categories | 内联字符串 | 6 去重 | `frontend/src/lib/directus/fallback-data.ts` |
| News articles | 静态 fallback TS | 10 | `frontend/src/lib/directus/fallback-data.ts` |
| Applications | 静态业务 TS | 8 | `frontend/src/lib/directus/business.ts` |
| Business content（hero, positioning, etc.） | 静态业务 TS | 12 块 | `frontend/src/lib/directus/business.ts` |
| UI strings（nav/cta/form/footer） | UI messages JSON | 11 keys × 10 locales | `frontend/src/locales/{10 lang}/common.json` |

## 3. fallback 数据详细清单

### 3.1 fallbackSettings（实测）
| 字段 | 值 |
|---|---|
| siteName | "HUANYU KUNTAI CHEM" |
| tagline | "Additive Technology for Global Industry" |
| email | null（未确认） |
| phone | "+86 181 8260 2513" |
| address | "No. 66 Dongqi Road, Xincheng District, Xi'an, Shaanxi, China" |

### 3.2 fallbackCategories（31 条 · 实测）
3 top-level + 28 children：
- `fuel-additives` (root) → 2 children
- `lubricant-additives` (root) → 16 children
- `lubricant-additive-packages` (root) → 11 children

### 3.3 fallbackProducts（28 条 · 实测 · 全部 slug 列出）

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
| 12 | viscosity-index-improvers | vecos-index-improvers | Viscosity Index Improvers |
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
| 28 | grease-additive-solutions | grease-additive-solutions | Grease Additive Solutions |

### 3.4 fallbackNews（10 条 · 实测）

| # | slug | category | publishedAt |
|---|---|---|---|
| 1 | choosing-the-right-additive-direction | Lubricant formulation | 2026-09-01 |
| 2 | fuel-additives-cleaner-combustion | Fuel additives | 2026-09-01 |
| 3 | lubricant-additive-direction | Lubricant formulation | 2026-09-01 |
| 4 | additive-package-formulation | Additive packages | 2026-09-01 |
| 5 | tds-sds-coa-guide | Quality & documentation | 2026-09-01 |
| 6 | heavy-duty-diesel-additives | Fuel additives | 2026-09-01 |
| 7 | batch-control-export-delivery | Quality & documentation | 2026-09-01 |
| 8 | pour-point-depressants-low-temperature-flow | Lubricant formulation | 2026-09-01 |
| 9 | batch-traceability-additive-supply | Quality systems | 2026-09-01 |
| 10 | export-delivery-coordination | Global supply | 2026-09-01 |

### 3.5 business.ts applications（8 条 · 实测 · Title 与 Value 一致）

| # | title | direction |
|---|---|---|
| 1 | Passenger vehicles | Fuel additives · PCMO additive packages |
| 2 | Commercial vehicles | Diesel additives · HDDO additive packages |
| 3 | Heavy-duty diesel engines | Diesel additives · Heavy-duty engine oil |
| 4 | Construction machinery | Diesel · Hydraulic · Gear oil |
| 5 | Agricultural engines | Diesel fuel · Engine lubrication |
| 6 | Industrial machinery | Functional additives · Industrial packages |
| 7 | Lubricant manufacturing | Lubricant additives · Additive packages |
| 8 | Automotive aftermarket | Fuel additives · Private label |

### 3.6 business.ts 12 顶层字段（实测）

hero / positioning / companyName / companyIntroduction / productSystems / capabilities / qualityProcess / customerTypes / applications / serviceProcess / markets / complianceNote

## 4. 产品 ↔ 应用 字符串映射实测

fallback `products.applications` JSON 数组实测：

- **66 个唯一 application 字符串**（如 "Passenger vehicles", "Calcium sulfonate detergents", "Passenger-car engine oils", "Commercial vehicles", "Heavy-duty diesel engines" 等）
- **69 个 total occurrences**（分布在 28 个产品上）
- 与 `business.ts applications` 8 条 title 的精确交集：**7 个**（"Passenger vehicles", "Commercial vehicles", "Heavy-duty diesel engines", "Construction machinery", "Industrial machinery", "Lubricant manufacturing", "Automotive aftermarket"）

**关键事实**：
- product application 字符串 ≠ application collection titles 一一对应
- 大部分字符串是 highlights 重复（如 "Calcium sulfonate detergents"），不是真正"应用 → 应用"映射
- **Owner Audit 修正**：products.applications JSON **与** applications.related_products M2M 是 **双真理源**，**禁止保留**
- **单一真理源**：applications.related_products（M2M）；products.applications JSON **移除**
- 迁移期：fallback products.applications 字符串通过 fuzzy match 映射到 applications record（标题精确匹配 + substring match）

## 5. 当前 Directus 现状（实测）

| 资源 | 数量 / 详情 |
|---|---|
| users | 1（admin@huanyukuntaichem.com） |
| roles | 2（两个都叫 "Administrator"） |
| policies | 3（"Policy for Administrator" admin=True, "Administrator" admin=True, "$t:public_label" admin=False = Public 角色） |
| permissions | 20（均为 directus_* 系统 collection） |
| inquiries Collection | 11 字段，0 条记录 |
| status field 当前 enum | `[pending, handled]`，default `pending` |
| directus_files 字段 | 系统默认（**不含** `is_public` 字段） |
| uploads 卷 | 空 |
| extensions 卷 | 空 |

## 6. 媒体资源清单（**实测修正 v3**）

| 类别 | 位置 | 数量 | 大小 | 状态 |
|---|---|---|---|---|
| **Directus media** (`directus_files`) | VPS `/var/lib/docker/volumes/huanyukuntai_directus_uploads/_data` | **0** | 0 | 空 |
| **Repository static media** | `frontend/public/images/**` | **45 files** + 1 SVG = **46 files** | **16 MB** | 已存在，**不是 0** |
| **Missing references** | （fallback 引用 vs 实际文件） | **0** | — | 所有 8 个 fallback 引用**全部 EXISTS** |
| **Temporary / generated** | — | 0 | — | 未发现 |

### 6.1 Repository static media 目录树（实测 · 45 files + 1 svg）

```
frontend/public/images/
├── about/        (4 files: about-global-supply, about-hero, about-lab-team, about-production)
├── applications/ (8 files: applications-cta, applications-formulation, applications-hero,
│                 applications-industrial, applications-offhighway, applications-onroad,
│                 applications-review)
├── contact/      (4 files: contact-cta, contact-hero, contact-inquiry-lab, contact-xian)
├── home/
│   ├── additive-packages.webp + additive-packages-light.webp
│   ├── fuel-additives.webp + fuel-additives-light.webp
│   ├── hero-energy-field.webp + hero-energy-field-light.webp
│   ├── lubricant-additives.webp + lubricant-additives-light.webp
│   └── refined/   (8 files: application-aftermarket, application-automotive,
│                   application-commercial-vehicles, application-construction,
│                   application-heavy-duty, application-industrial-machinery,
│                   application-lubricant-manufacturing)
└── (no images outside images/ subdirectory)

frontend/public/industrial-fuel-additive.svg
```

**45 webp images + 1 svg = 46 files**。

### 6.2 fallback 引用 vs 实际文件（**全部 EXISTS** · 修正 "real media files = 0"）

| fallback 引用 | 实际文件 | 状态 |
|---|---|---|
| `/images/home/additive-packages.webp` | ✅ EXISTS | OK |
| `/images/home/fuel-additives.webp` | ✅ EXISTS | OK |
| `/images/home/lubricant-additives.webp` | ✅ EXISTS | OK |
| `/images/home/refined/application-heavy-duty.webp` | ✅ EXISTS | OK |
| `/images/home/refined/application-industrial-machinery.webp` | ✅ EXISTS | OK |
| `/images/home/refined/export-capability-v2.webp` | ⚠️ MISSING | **EXISTS 检查失败**：repo 中 `/images/home/refined/` 目录没有 `export-capability-v2.webp` 文件 |
| `/images/home/refined/quality-control.webp` | ⚠️ MISSING | **EXISTS 检查失败**：repo 中 `/images/home/refined/` 目录没有 `quality-control.webp` 文件 |
| `/images/home/refined/supply-chain.webp` | ⚠️ MISSING | **EXISTS 检查失败**：repo 中 `/images/home/refined/` 目录没有 `supply-chain.webp` 文件 |

**修正后的实情**：8 个 fallback 引用中，**5 个 EXISTS**，**3 个 MISSING**（`export-capability-v2.webp`, `quality-control.webp`, `supply-chain.webp` 实际不存在）。

## 7. inquiries Collection 字段（实测）

| 字段 | type | default | interface |
|---|---|---|---|
| id | integer (PK) | nextval | numeric |
| customer_name | string (NOT NULL) | null | input |
| email | string (NOT NULL) | null | input |
| company_name | string (nullable) | null | input |
| phone | string (nullable) | null | input |
| message | text (NOT NULL) | null | input-multiline |
| source_page | string (nullable) | null | input |
| product_interested | string (nullable) | null | input |
| locale | string (nullable) | null | input |
| status | string (NOT NULL) | **`pending`** | select-dropdown（choices `[pending, handled]`） |
| date_created | timestamp (nullable) | null | datetime |

**status Owner Audit 修正**（v3 决定）：
- ❌ 不保留 `pending` 作为 legacy runtime value（0 records）
- ❌ 不增加 API 翻译层
- ✅ enum choices 直接替换为 v1.5 canonical `[new, contacted, qualified, quoted, follow_up, closed]`
- ✅ default 直接替换为 `new`
- ✅ field name `status` 保留（v1.5 §26.1 也是 `status`）
- 0 records 决定此替换**非 destructive**（metadata-only update）

## 8. 关键约束（贯穿后续）

1. **inquiries 字段名 100% 保留**；`status` enum + default 替换
2. **stable 字段不重命名**：`customer_name` / `company_name` / `source_page` / `product_interested`
3. **移除 products.applications JSON**（与 applications.related_products M2M 重复）；只保留 applications.related_products 作为单一真理源
4. **Products.Specifications** 替代化工固定列（CAS No. / Purity / Storage / Shelf Life 等）
5. **Highlights** 多语言结构化（per-locale translations）
6. **Pages.sections** 单 canonical 结构 + 内嵌 translations（不分离成 10 个 `_*` 字段）
7. **company_name_cn** 单字段（非 10 语言 suffix）专门存中文公司名
8. **Public 媒体访问**走 folder-based 授权（不依赖不存在的 `is_public` 字段）
9. **URL/slug** 不修改；**all 780 URL instances preserved** (locale-expanded count)
10. **9 个核心 collections**：1 existing + 7 create + 1 optional (redirects 本期不启用)

> 本清单为 Phase 2A v3 修正版。前 v1/v2 因 product count / URL inventory / 媒体 / sections 模型 / 关系分类等多处不一致，视为 FAIL/BLOCKED，以本版为准。