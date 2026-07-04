# 05 - CMS Schema

Create or verify Directus collections in this order:

1. `site_settings`
2. `product_categories`
3. `products`
4. `news_categories`
5. `news`
6. `applications`
7. `pages`
8. `inquiries`

## Multilingual Field Pattern

For translatable content, reserve fields for:

- `*_en`
- `*_es`
- `*_ru`
- `*_ar`
- `*_fr`
- `*_pt`
- `*_de`
- `*_id`
- `*_tr`
- `*_fa`

## Product Categories

- `id`
- `status`
- `slug`
- `parent`
- `sort`
- `name_*`
- `description_*`
- `seo_title_*`
- `seo_description_*`
- `image`
- `image_alt_*`

## Products

- `id`
- `status`
- `slug`
- `category`
- `sort`
- `name_*`
- `summary_*`
- `description_*`
- `specifications`
- `applications`
- `seo_title_*`
- `seo_description_*`
- `image`
- `gallery`
- `image_alt_*`

## News

- `id`
- `status`
- `slug`
- `category`
- `published_at`
- `title_*`
- `excerpt_*`
- `content_*`
- `seo_title_*`
- `seo_description_*`
- `image`
- `image_alt_*`

## Inquiries

- `id`
- `date_created`
- `name`
- `email`
- `company`
- `phone`
- `message`
- `source_path`
- `product_slug`
- `locale`
- `status`
