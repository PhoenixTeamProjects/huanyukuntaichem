# Existing Content Inventory — 现有前台内容盘点

> 来源：v1.5 §14、§29 现有网站接入 Directus 流程  
> 编制时间：2026-10-01 UTC  
> 编制执行者：Claude（只读盘点）  
> 范围：huanyukuntaichem.com 现有正式前台内容

## 1. 业务内容来源全景

| 内容类型 | 现状来源 | 数量 | 文件路径 | 加载位置 |
|---|---|---|---|---|
| Site settings (siteName, tagline, phone, address, email) | 静态 fallback TS | 1 | `frontend/src/lib/directus/fallback-data.ts` (`fallbackSettings`) | 全站 Header / Footer / 联系方式 |
| Product categories | 静态 fallback TS | 31 | `frontend/src/lib/directus/fallback-data.ts` (`fallbackCategories`) | `/products` `/products/category/[slug]` |
| Products | 静态 fallback TS | 10 | `frontend/src/lib/directus/fallback-data.ts` (`fallbackProducts`) | `/products` `/products/[slug]` |
| News categories | 内联字符串 | 5 | `frontend/src/lib/directus/fallback-data.ts`（每条 news 的 category 字段） | `/news` |
| News articles | 静态 fallback TS | 10 | `frontend/src/lib/directus/fallback-data.ts` (`fallbackNews`) | `/news` `/news/[slug]` |
| Applications | 静态业务 TS | 8 | `frontend/src/lib/directus/business.ts` (`applications`) | `/applications` |
| Business content (hero, positioning, companyIntro, capabilities, qualityProcess, customerTypes, applications, serviceProcess, markets, complianceNote) | 静态业务 TS | 12 块 | `frontend/src/lib/directus/business.ts` | `/`, `/about`, `/service`, `/applications` |
| Footer intro | 静态 UI messages | n/a | `frontend/src/locales/*/common.json` (`footer.intro` 等) | 全站 Footer |
| Header nav labels | 静态 UI messages | n/a | `frontend/src/locales/*/common.json` (`nav.*`) | 全站 Header |
| Inquiries 表单（API 入口） | Next.js Route Handler | n/a | `frontend/src/app/api/inquiries/route.ts` | `/contact`, `/products/[slug]` 等 |
| 图片（fallback 引用） | 静态路径字符串 | 10 个引用 | `frontend/src/lib/directus/fallback-data.ts`（image 字段） | 各种 fallback 渲染 |

## 2. 各页面 → 数据来源映射

| 路由 | 数据来源 | 调用 |
|---|---|---|
| `/[locale]` (Home) | `getBusinessContent(locale)` | `frontend/src/app/[locale]/page.tsx` |
| `/[locale]/products` | `getProductCategories(locale)` + `getProducts(locale)` + `getBusinessContent(locale)` | `frontend/src/app/[locale]/products/page.tsx` |
| `/[locale]/products/[slug]` | `getProductBySlug(locale, slug)` | `frontend/src/app/[locale]/products/[slug]/page.tsx` |
| `/[locale]/products/category/[slug]` | `getProductCategories(locale)` + `getProductsByCategory(locale, slug)` | `frontend/src/app/[locale]/products/category/[slug]/page.tsx` |
| `/[locale]/news` | （UI messages only） | `frontend/src/app/[locale]/news/page.tsx` |
| `/[locale]/news/[slug]` | `getNewsBySlug(locale, slug)` | `frontend/src/app/[locale]/news/[slug]/page.tsx` |
| `/[locale]/applications` | `getBusinessContent(locale)` | `frontend/src/app/[locale]/applications/page.tsx` |
| `/[locale]/service` | `getBusinessContent(locale)` | `frontend/src/app/[locale]/service/page.tsx` |
| `/[locale]/about` | `getBusinessContent(locale)` | `frontend/src/app/[locale]/about/page.tsx` |
| `/[locale]/contact` | UI messages only | `frontend/src/app/[locale]/contact/page.tsx` |

## 3. 现有 fallback 数据详细清单

### 3.1 fallbackSettings（SiteSettings）
| 字段 | 当前值 |
|---|---|
| siteName | "HUANYU KUNTAI CHEM" |
| tagline | "Additive Technology for Global Industry" |
| email | `null`（未确认，不写入） |
| phone | "+86 181 8260 2513" |
| address | "No. 66 Dongqi Road, Xincheng District, Xi'an, Shaanxi, China" |

### 3.2 fallbackCategories（31 条）
3 top-level + 27 children + 1 root catch-all：

| slug | name | parent | level |
|---|---|---|---|
| fuel-additives | Fuel Additives | (root) | 1 |
| gasoline-fuel-additives | Gasoline Fuel Additives | fuel-additives | 2 |
| diesel-fuel-additives | Diesel Fuel Additives | fuel-additives | 2 |
| lubricant-additives | Lubricant Additives | (root) | 1 |
| detergents | Detergents | lubricant-additives | 2 |
| dispersants | Dispersants | lubricant-additives | 2 |
| anti-wear-additives | Anti-Wear Additives | lubricant-additives | 2 |
| extreme-pressure-additives | Extreme Pressure Additives | lubricant-additives | 2 |
| antioxidants | Antioxidants | lubricant-additives | 2 |
| friction-modifiers | Friction Modifiers | lubricant-additives | 2 |
| corrosion-inhibitors | Corrosion Inhibitors | lubricant-additives | 2 |
| rust-inhibitors | Rust Inhibitors | lubricant-additives | 2 |
| pour-point-depressants | Pour Point Depressants | lubricant-additives | 2 |
| viscosity-index-improvers | Viscosity Index Improvers | lubricant-additives | 2 |
| anti-foam-additives | Anti-Foam Additives | lubricant-additives | 2 |
| demulsifiers | Demulsifiers | lubricant-additives | 2 |
| emulsifiers | Emulsifiers | lubricant-additives | 2 |
| tackifiers | Tackifiers | lubricant-additives | 2 |
| other-functional-lubricant-additives | Other Functional Additives | lubricant-additives | 2 |
| lubricant-additive-packages | Lubricant Additive Packages | (root) | 1 |
| passenger-car-motor-oil-packages | Passenger Car Motor Oil Packages | lubricant-additive-packages | 2 |
| heavy-duty-diesel-engine-oil-packages | Heavy-Duty Diesel Engine Oil Packages | lubricant-additive-packages | 2 |
| motorcycle-oil-packages | Motorcycle Oil Packages | lubricant-additive-packages | 2 |
| gear-oil-packages | Gear Oil Packages | lubricant-additive-packages | 2 |
| hydraulic-oil-packages | Hydraulic Oil Packages | lubricant-additive-packages | 2 |
| atf-packages | ATF Additive Packages | lubricant-additive-packages | 2 |
| compressor-oil-packages | Compressor Oil Packages | lubricant-additive-packages | 2 |
| turbine-oil-packages | Turbine Oil Packages | lubricant-additive-packages | 2 |
| industrial-oil-packages | Industrial Oil Packages | lubricant-additive-packages | 2 |
| metalworking-fluid-packages | Metalworking Fluid Packages | lubricant-additive-packages | 2 |
| grease-additive-solutions | Grease Additive Solutions | lubricant-additive-packages | 2 |

### 3.3 fallbackProducts（10 条）
每个 top-level category 一个代表产品：

| slug | category (slug) | 名称 |
|---|---|---|
| fuel-additives-system | fuel-additives | Fuel Additives System |
| gasoline-fuel-additives | gasoline-fuel-additives | Gasoline Fuel Additives |
| diesel-fuel-additives | diesel-fuel-additives | Diesel Fuel Additives |
| lubricant-additives-system | lubricant-additives | Lubricant Additives System |
| industrial-oil-packages | industrial-oil-packages | Industrial Oil Additive Packages |
| metalworking-fluid-packages | metalworking-fluid-packages | Metalworking Fluid Additive Packages |
| grease-additive-solutions | grease-additive-solutions | Grease Additive Solutions |

（实际只有 7 条记录在 fallback-products 中。需复核总数。）

### 3.4 fallbackNews（10 条）
| slug | category | title |
|---|---|---|
| choosing-the-right-additive-direction | Lubricant formulation | How to choose the right additive direction... |
| fuel-additives-cleaner-combustion | Fuel additives | How fuel additives support cleaner combustion |
| lubricant-additive-direction | Lubricant formulation | Choosing the right lubricant additive direction |
| additive-package-formulation | Additive packages | What an additive package does in a formulation |
| tds-sds-coa-guide | Quality & documentation | Understanding TDS, SDS and COA documentation |
| heavy-duty-diesel-additives | Fuel additives | Additive selection for heavy-duty diesel |
| batch-control-export-delivery | Quality & documentation | From batch control to export delivery |
| pour-point-depressants-low-temperature-flow | Lubricant formulation | Low-temperature flow and pour point depressants |
| batch-traceability-additive-supply | Quality systems | Why batch traceability matters |
| export-delivery-coordination | Global supply | Coordinating packaging, documents and export delivery |

所有 news 都用相同的 `publishedAt = '2026-09-01'`。

### 3.5 Business content（business.ts）
- hero (eyebrow + title + summary)
- positioning
- companyName
- companyIntroduction (3 段)
- productSystems (3 大类)
- capabilities (8 项)
- qualityProcess (8 步骤)
- customerTypes (6 类)
- applications (8 个应用)
- serviceProcess (6 步骤)
- markets (6 个区域)
- complianceNote (1 段)

## 4. 当前 Directus 现状（Schema 侧）

### 4.1 用户自定义 Collections
**只有 1 个**：`inquiries`（11 字段）

### 4.2 inquiries Collection 字段（保持现状，禁止删除重建）
| 字段 | type | nullable | default | 说明 |
|---|---|---|---|---|
| `id` | integer (PK) | NO | nextval | 主键 |
| `customer_name` | string | NO | null | 询盘客户姓名 |
| `email` | string | NO | null | 邮箱 |
| `company_name` | string | YES | null | 公司 |
| `phone` | string | YES | null | 电话 |
| `message` | text | NO | null | 留言 |
| `source_page` | string | YES | null | 来源页面 |
| `product_interested` | string | YES | null | 感兴趣的产品 slug |
| `locale` | string | YES | null | 提交语言 |
| `status` | string (select-dropdown) | NO | `'pending'` | 跟进状态 |
| `date_created` | timestamp | YES | null | 创建时间 |

### 4.3 系统级 Collections（29 个 directus_*）
所有 `directus_*` 系统表保留不动。

### 4.4 当前数据量
| 资源 | 数量 |
|---|---|
| inquiries 记录 | 0 条 |
| products 记录 | 0 条（未建） |
| product_categories 记录 | 0 条（未建） |
| news 记录 | 0 条（未建） |
| news_categories 记录 | 0 条（未建） |
| applications 记录 | 0 条（未建） |
| pages 记录 | 0 条（未建） |
| site_settings 记录 | 0 条（未建） |
| users | 1（admin@huanyukuntaichem.com） |
| roles | 系统默认 |
| policies | 3 |
| permissions | 20 |

## 5. SEO 与多语言现状

| 项 | 状态 |
|---|---|
| 10 语言路由 | ✅ 已实现（en/es/ru/ar/fr/pt/de/id/tr/fa） |
| RTL 标记 | ✅ `ar` + `fa` |
| Hreflang | ❌ 未实现（CMS 后内容稳定后补） |
| Schema.org | ❌ 未实现 |
| 默认 sitemap | ✅ 200 OK |
| robots.txt | ✅ 200 OK |
| Open Graph | ✅ 首页 og:title/og:url/og:site_name |
| 默认 locale | en |
| per-page metadata | 仅 Home 有 SEO meta，其他页面用 Next.js metadata 默认 |

## 6. 图片与媒体

| 资源 | 状态 |
|---|---|
| uploads 目录 | 空（156B tar） |
| extensions 目录 | 空（89B tar） |
| fallback 引用的图片路径 | 10 处（如 `/images/home/lubricant-additives.webp`）— **frontend 静态资源，未在 Directus 中** |
| 真实图片 | **不存在**（仅占位路径） |

## 7. Inquiry API 现状（前端已有，但连不上 CMS）

| 项 | 状态 |
|---|---|
| `/api/inquiries` Route Handler | ✅ 存在 |
| Directus 写入连通性 | ❌ 502（Directus 在 huanyukuntaichem-directus 容器中，等待 schema 与 token 注入） |
| Honeypot / 限流 / 严格字段白名单 | ❌ 待 v1.5 §43 实施 |

## 8. 关键约束（贯穿后续工作）

1. **inquiries Collection 保留并做差异审计**：禁止删除重建；只补充缺失字段、权限、状态模型。
2. **现存字段不重命名**：`customer_name` / `company_name` / `source_page` / `product_interested` 等已存在字段保留，通过 Compatibility Map 与 v1.5 Canonical Dictionary 建立映射。
3. **数据零迁移**：当前 fallback 数据是**临时验证内容**，按 v1.5 §14 流程需逐项 import 至 Directus；但用户禁止批量导入假数据，所以 fallback 内容**保留在 fallback-data.ts** 作为开发期支持，正式上线时再按需逐条 import。
4. **URL/slug 不修改**：当前 URL（如 `/products/category/fuel-additives`）=fallback slugs，迁移到 Directus 后保留同一 slug 以保持 SEO URL 稳定。
5. **9 个核心 collections 中，1 个已存在（inquiries），7 个需新建（site_settings / product_categories / products / news_categories / news / applications / pages），1 个为推荐（redirects）**。

---

> 本清单为 Phase 2A 的事实基线。后续 `frontend-cms-mapping.md` / `compatibility-map.md` / `schema-gap.md` 均基于本文。