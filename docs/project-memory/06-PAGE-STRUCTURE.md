# 06 - Page Structure

## Routes

- `/[locale]`
- `/[locale]/products`
- `/[locale]/products/category/[slug]`
- `/[locale]/products/[slug]`
- `/[locale]/news`
- `/[locale]/news/[slug]`
- `/[locale]/applications`
- `/[locale]/service`
- `/[locale]/about`
- `/[locale]/contact`

## Product Pages

Products and product categories use a parent/child product tree with three top-level systems: Fuel Additives, Lubricant Additives, and Lubricant Additive Packages. OEM, ODM, and Private Label remain service capabilities.

## Page Content Direction

- Home: industrial additive positioning, three product systems, technical capabilities, quality flow, buyer groups, and inquiry.
- Products: hierarchical category navigation and verified product-family routes.
- Applications: transport, machinery, lubricant manufacturing, and automotive-aftermarket application directions.
- Service: formulation, testing, OEM/ODM/Private Label, quality, documentation, export, and long-term supply workflow.
- About: verified company identity, 2008 industry start, chemical-division boundary, technical positioning, and market focus.
- Contact: structured technical inquiry guidance without invented public contact facts.

## Inquiry Entrances

Inquiry forms are present on home, product detail, news detail, and contact. The API must write to Directus and must never return a false success when persistence is unavailable.
