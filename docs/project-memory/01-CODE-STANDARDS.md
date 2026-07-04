# 01 - Code Standards

## Stack

- Frontend: Next.js App Router, TypeScript, Server Components by default.
- CMS: Directus.
- Database: PostgreSQL.
- Process manager: PM2.
- Reverse proxy: Nginx.

## Rendering

Plan A uses Next.js on the VPS. Do not default to static export. Dynamic content should use Server Components, ISR, or controlled revalidation once Directus is connected.

## Multilingual Rules

- Supported locales: `en`, `es`, `ru`, `ar`, `fr`, `pt`, `de`, `id`, `tr`, `fa`.
- Default locale: `en`.
- RTL locales: `ar`, `fa`.
- Routes live under `frontend/src/app/[locale]`.
- Fixed UI copy lives in `frontend/src/locales/[locale]`.
- Product/news/page body content and SEO fields belong in Directus.

## Directus API Rules

Directus API wrappers belong under `frontend/src/lib/directus`.
Queries must eventually use explicit fields, limits, filters, and locale-specific field selection.

## UI Rules

- Use semantic HTML.
- Use responsive layouts for desktop, tablet, and mobile.
- Use clear inquiry paths on home, products, product detail, applications, service, about, and contact pages.
- Images must have dimensions and alt text when production assets are added.
