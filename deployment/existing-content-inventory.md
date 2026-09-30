# Existing Content Inventory — 现有前台内容盘点（重新实测）

> 来源：v1.5 §14、§29 现有网站接入 Directus 流程  
> 编制时间：2026-10-01 UTC（Owner Audit 修正版）  
> 编制执行者：Claude（只读实测，不依赖先前记录）  
> 范围：huanyukuntaichem.com 现有正式前台内容

## 1. 业务内容来源全景

| 内容类型 | 现状来源 | 数量 | 文件路径 | 加载位置 |
|---|---|---|---|---|
| Site settings (siteName, tagline, phone, address, email) | 静态 fallback TS | 1 条（5 字段） | `frontend/src/lib/directus/fallback-data.ts` (`fallbackSettings`) | 全站 Header / Footer / 联系方式 |
| Product categories | 静态 fallback TS | **31** | `frontend/src/lib/directus/fallback-data.ts` (`fallbackCategories`) | `/products` `/products/category/[slug]` |
| Products | 静态 fallback TS | **28**（重新实测） | `frontend/src/lib/directus/fallback-data.ts` (`fallbackProducts`) | `/products` `/products/[slug]` |
| News categories | 内联字符串 | **6** (去重后) | `frontend/src/lib/directus/fallback-data.ts`（news() 第二个参数） | `/news` |
| News articles | 静态 fallback TS | **10** | `frontend/src/lib/directus/fallback-data.ts` (`fallbackNews`) | `/news` `/news/[slug]` |
| Applications | 静态业务 TS | **8** | `frontend/src/lib/directus/business.ts` (`applications`) | `/applications` |
| Business content (hero, positioning, companyName, companyIntroduction, productSystems, capabilities, qualityProcess, customerTypes, serviceProcess, markets, complianceNote) | 静态业务 TS | **12 块** | `frontend/src/lib/directus/business.ts` | `/`, `/about`, `/service`, `/applications` |
| Footer intro / 导航 / 表单标签 / 错误提示 | UI messages JSON | 11 keys × 10 lang | `frontend/src/locales/{en,es,ru,ar,fr,pt,de,id,tr,fa}/common.json` | Header / Footer / Forms |
| Inquiries 表单（API 入口） | Next.js Route Handler | 1 | `frontend/src/app/api/inquiries/route.ts` | `/contact`, `/products/[slug]` |
| 图片（fallback 引用） | 静态路径字符串 | **8 个唯一路径** | `frontend/src/lib/directus/fallback-data.ts`（image 字段） | 各种 fallback 渲染 |

**Total fallback record counts**:
- categories: 31
- products: 28
- news: 10
- news categories (unique strings): 6 ("Lubricant formulation" 3, "Fuel additives" 2, "Quality & documentation" 2, "Additive packages" 1, "Quality systems" 1, "Global supply" 1)
- applications: 8
- business sections (per page_key): 12 distinct keys

## 2. 各页面 → 数据来源映射（重新实测）

| 路由 | 文件 | 数据来源（实测） |
|---|---|---|
| `/` (Home) | `frontend/src/app/[locale]/page.tsx` | `business.hero`, `business.productSystems` |
| `/[locale]/products` | `frontend/src/app/[locale]/products/page.tsx` | `getProductCategories()` + `getProducts()` + `getBusinessContent()` |
| `/[locale]/products/[slug]` | `frontend/src/app/[locale]/products/[slug]/page.tsx` | `getProductBySlug(locale, slug)` |
| `/[locale]/products/category/[slug]` | `frontend/src/app/[locale]/products/category/[slug]/page.tsx` | `getProductCategories()` + `getProductsByCategory(locale, slug)` |
| `/[locale]/news` | `frontend/src/app/[locale]/news/page.tsx` | UI messages only |
| `/[locale]/news/[slug]` | `frontend/src/app/[locale]/news/[slug]/page.tsx` | `getNewsBySlug(locale, slug)` |
| `/[locale]/applications` | `frontend/src/app/[locale]/applications/page.tsx` | `business.applications`, `business.serviceProcess` |
| `/[locale]/service` | `frontend/src/app/[locale]/service/page.tsx` | `business.capabilities`, `business.complianceNote`, `business.qualityProcess`, `business.serviceProcess` |
| `/[locale]/about` | `frontend/src/app/[locale]/about/page.tsx` | `business.companyIntroduction`, `business.companyName`, `business.serviceProcess` |
| `/[locale]/contact` | `frontend/src/app/[locale]/contact/page.tsx` | UI messages + `<InquiryForm>` |
| API | `frontend/src/app/api/inquiries/route.ts` | POST → Directus `inquiries` |

## 3. 现有 fallback 数据详细清单

### 3.1 fallbackSettings
| 字段 | 值 |
|---|---|
| siteName | "HUANYU KUNTAI CHEM" |
| tagline | "Additive Technology for Global Industry" |
| email | `null`（未确认） |
| phone | "+86 181 8260 2513" |
| address | "No. 66 Dongqi Road, Xincheng District, Xi'an, Shaanxi, China" |

### 3.2 fallbackCategories（31 条）
3 top-level + 28 children：
```
fuel-additives (root, level 1)
├── gasoline-fuel-additives (level 2)
└── diesel-fuel-additives (level 2)
lubricant-additives (root, level 1)
├── detergents (level 2)
├── dispersants (level 2)
├── anti-wear-additives (level 2)
├── extreme-pressure-additives (level 2)
├── antioxidants (level 2)
├── friction-modifiers (level 2)
├── corrosion-inhibitors (level 2)
├── rust-inhibitors (level 2)
├── pour-point-depressants (level 2)
├── viscosity-index-improvers (level 2)
├── anti-foam-additives (level 2)
├── demulsifiers (level 2)
├── emulsifiers (level 2)
├── tackifiers (level 2)
└── other-functional-lubricant-additives (level 2)
lubricant-additive-packages (root, level 1)
├── passenger-car-motor-oil-packages (level 2)
├── heavy-duty-diesel-engine-oil-packages (level 2)
├── motorcycle-oil-packages (level 2)
├── gear-oil-packages (level 2)
├── hydraulic-oil-packages (level 2)
├── atf-packages (level 2)
├── compressor-oil-packages (level 2)
├── turbine-oil-packages (level 2)
├── industrial-oil-packages (level 2)
├── metalworking-fluid-packages (level 2)
└── grease-additive-solutions (level 2)
```

### 3.3 fallbackProducts（28 条 · 全部实测）

| # | slug | category slug | name (英文) |
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
| 12 | viscosity-index-improvers | viscosity-index-improvers | Viscosity Index Improvers |
| 13 | anti-foam-additives | anti-foam-additives | Anti-Foam Additives |
| 14 | demulsifiers | Demulsifiers | Demulsifiers |
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

**注意**：之前的 Phase 2A 错误地记录为 10 个 products（只看到末尾 + 错误截取）。正确数量是 **28**。

### 3.4 fallbackNews（10 条）

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

所有 news 共用 `publishedAt = '2026-09-01'`。

### 3.5 business.ts applications（8 条）
| # | title | direction 摘要 |
|---|---|---|
| 1 | Passenger vehicles | Fuel additives · PCMO additive packages |
| 2 | Commercial vehicles | Diesel additives · HDDO additive packages |
| 3 | Heavy-duty diesel engines | Diesel additives · Heavy-duty engine oil |
| 4 | Construction machinery | Diesel · Hydraulic · Gear oil |
| 5 | Agricultural engines | Diesel fuel · Engine lubrication |
| 6 | Industrial machinery | Functional additives · Industrial packages |
| 7 | Lubricant manufacturing | Lubricant additives · Additive packages |
| 8 | Automotive aftermarket | Fuel additives · Private label |

### 3.6 business.ts 顶层字段（12 块）
- `hero` (eyebrow + title + summary)
- `positioning` (string)
- `companyName` (string)
- `companyIntroduction` (3 段 array)
- `productSystems` (3 大类)
- `capabilities` (8 项)
- `qualityProcess` (8 步骤)
- `customerTypes` (6 类)
- `applications` (8 个应用) — 重复 3.5
- `serviceProcess` (6 步骤)
- `markets` (6 个区域)
- `complianceNote` (1 段)

### 3.7 image 字段引用（实测）
fallback-data.ts 里 image 字段出现 2 次定义（products 默认 null，news image 字符串），共引用 8 个唯一图片路径：
```
/images/home/additive-packages.webp
/images/home/fuel-additives.webp
/images/home/lubricant-additives.webp
/images/home/refined/application-heavy-duty.webp
/images/home/refined/application-industrial-machinery.webp
/images/home/refined/export-capability-v2.webp
/images/home/refined/quality-control.webp
/images/home/refined/supply-chain.webp
```

**注**：这些是前端占位路径，**实际图片文件不存在于 uploads**。所有 image 字符串仅是开发期占位。

## 4. 当前 Directus 现状（Schema 侧）

### 4.1 自定义 Collections
**只有 1 个**：`inquiries`（11 字段，0 条记录）

### 4.2 inquiries Collection 字段（实测，含 status options）

| 字段 | type | nullable | default | interface | choices |
|---|---|---|---|---|---|
| `id` | integer (PK) | NO | nextval | numeric | — |
| `customer_name` | string | NO | null | input | — |
| `email` | string | NO | null | input | — |
| `company_name` | string | YES | null | input | — |
| `phone` | string | YES | null | input | — |
| `message` | text | NO | null | input-multiline | — |
| `source_page` | string | YES | null | input | — |
| `product_interested` | string | YES | null | input | — |
| `locale` | string | YES | null | input | — |
| `status` | string | NO | `'pending'` | **select-dropdown** | **[{Pending/pending}, {Handled/handled}]** |
| `date_created` | timestamp | YES | null | datetime | — |

**status 现状重要事实**：
- 当前 enum choices = `['pending', 'handled']`
- 默认值 = `'pending'`
- 实际记录 = 0 条
- **Owner Audit 修正指令**：因为 0 条记录，**不保留 `pending` 作为 legacy 值**，**不增加 API 翻译层**，**直接将 DB enum 改为 v1.5 §26.1 canonical enum**：`new / contacted / qualified / quoted / follow_up / closed`，默认 `new`

### 4.3 系统级 Collections（29 个 directus_*）
所有 `directus_*` 系统表保留不动。

### 4.4 当前数据量
| 资源 | 数量 |
|---|---|
| inquiries 记录 | **0** 条 |
| products 记录 | 0 条（未建） |
| product_categories 记录 | 0 条（未建） |
| news 记录 | 0 条（未建） |
| news_categories 记录 | 0 条（未建） |
| applications 记录 | 0 条（未建） |
| pages 记录 | 0 条（未建） |
| site_settings 记录 | 0 条（未建） |
| users | 1（admin@huanyukuntaichem.com） |
| roles | 2（两个都叫 Administrator） |
| policies | 3 |
| permissions | 20 |

### 4.5 当前 RBAC 实测
- **Roles**：2 条都叫 "Administrator"
  - id=00d19e33-1a51-4840-9344-9f1c718fab70，users=0，admin=None
  - id=6bdc716e-5e30-49cf-b302-357be132af3a，users=1（admin 用户），admin=None
- **Policies**：3 条
  - "Policy for Administrator"（id=0c2980e0-e4bb-4c95-a828-d9143345c7c3）：admin=True，app=True
  - "Administrator"（id=223e98c3-2392-46be-9d4c-e8f427f192dd）：admin=True，app=True
  - "$t:public_label"（id=abf8a154-5b1c-4a46-ac9c-7300570f4f17）：admin=False，app=False（**这就是 v1.5 Public 角色**）
- **Permissions**：20 条，分布在 directus_comments / directus_presets / directus_users 等系统 collection，**未见业务 collection 的自定义 permissions**（因为业务 collections 尚未建立）

## 5. SEO 与多语言现状

| 项 | 状态 |
|---|---|
| 10 语言路由 | ✅ 已实现（en/es/ru/ar/fr/pt/de/id/tr/fa） |
| RTL 标记 | ✅ `ar` + `fa` |
| Hreflang | ❌ 未实现 |
| Schema.org | ❌ 未实现 |
| /sitemap.xml | ✅ 200 OK |
| /robots.txt | ✅ 200 OK |
| Open Graph（首页） | ✅ og:title / og:url / og:site_name |
| 默认 locale | en |
| 每页 metadata | 仅 Home 有 SEO meta |

## 6. 图片与媒体（实测）

| 资源 | 状态 |
|---|---|
| uploads 卷（Directus） | 空（156B tar） |
| extensions 卷（Directus） | 空（89B tar） |
| fallback image 字段定义 | 2 处（products 默认 `null`、news image 字符串路径） |
| fallback 引用图片路径（unique） | **8 个**（占位路径，**实际文件不存在**） |

## 7. Inquiry API 现状

| 项 | 状态 |
|---|---|
| `/api/inquiries` Route Handler | ✅ 存在 |
| Directus 写入连通性 | ❌ 502（缺 DIRECTUS_STATIC_TOKEN + status enum 待更新） |
| Honeypot / 限流 / 严格字段白名单 | ❌ 待 v1.5 §43 实施 |

## 8. 公开 URL/slug 完整性清单（实测 · 全量）

迁移后必须保留 slug 与 URL 形状不变：

| URL 类型 | 数量 | slug 来源 |
|---|---|---|
| `/products/category/[slug]` | **31 个** slug | product_categories 31 条 fallback |
| `/products/[slug]` | **28 个** slug | products 28 条 fallback |
| `/news/[slug]` | **10 个** slug | news 10 条 fallback |
| 固定路由 | 10 条 | `/[locale]/{about,service,applications,contact,products,news}` + 根路由 |
| **总公开 URL 形状** | **79 个**（31 + 28 + 10 + 10） | **全部保留** |

## 9. 关键约束（贯穿后续工作）

1. **inquiries Collection 保留 + 差异审计**：11 字段 unchanged + 7 字段 new + `status` field's choices/default **replace** `pending/handled` → v1.5 `new/contacted/qualified/quoted/follow_up/closed`，default `new`。**禁止增加 API 翻译层**。
2. **其他稳定字段不重命名**：`customer_name` / `company_name` / `source_page` / `product_interested` 等保留。
3. **数据零迁移**：当前 fallback 数据保留在 fallback-data.ts，正式上线时再按需逐条 import 至 Directus。
4. **URL/slug 不修改**：所有 79 个公开 URL 形状保持不变。
5. **9 个核心 collections**：
   - 1 个 existing（inquiries，diff 模式）
   - 7 个需新建（site_settings / product_categories / products / news_categories / news / applications / pages）
   - 1 个可选（redirects，本期不启用）

---

> 本清单为 Phase 2A 重新审计版。前 Phase 2A 文档因 product count 错误（10 vs 28），视为 FAIL/BLOCKED，须以本版及后续 compat-mapping.md / schema-gap.md / frontend-cms-mapping.md 修正版为准。