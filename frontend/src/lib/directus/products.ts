import type { Locale } from '@/config/i18n';
import { fallbackCategories, fallbackProducts, localizeFallback } from './fallback-data';
import type { Product, ProductCategory } from './types';

export async function getProductCategories(locale: Locale): Promise<ProductCategory[]> {
  const localeField = safeLocale(locale);
  const rows = await fetchDirectusRows<DirectusCategory>('product_categories', {
    fields: ['id', 'slug', 'parent_category', `category_name_${localeField}`, 'category_name_en', `category_description_${localeField}`, 'category_description_en'].join(','),
    sort: 'sort,id',
    limit: '-1'
  });

  if (!rows?.length) {
    return localizeFallback(fallbackCategories, locale);
  }

  return rows.map((row) => ({
    id: String(row.id),
    slug: row.slug,
    parent: row.parent_category == null ? null : String(row.parent_category),
    name: localized(row, 'category_name', localeField),
    description: localized(row, 'category_description', localeField)
  }));
}

export async function getProducts(locale: Locale): Promise<Product[]> {
  const localeField = safeLocale(locale);
  const rows = await fetchDirectusRows<DirectusProduct>('products', {
    fields: ['id', 'slug', 'product_category', 'main_image', `product_name_${localeField}`, 'product_name_en', `short_description_${localeField}`, 'short_description_en', `detailed_description_${localeField}`, 'detailed_description_en', `image_alt_${localeField}`, 'image_alt_en'].join(','),
    sort: 'sort,id',
    limit: '-1'
  });

  if (!rows?.length) {
    return localizeFallback(fallbackProducts, locale);
  }

  const fallbackBySlug = new Map(fallbackProducts.map((product) => [product.slug, product]));
  return rows.map((row) => {
    const fallback = fallbackBySlug.get(row.slug);
    return {
      id: String(row.id),
      slug: row.slug,
      category: row.product_category == null ? null : String(row.product_category),
      name: localized(row, 'product_name', localeField),
      summary: localized(row, 'short_description', localeField),
      description: localized(row, 'detailed_description', localeField),
      image: directusAssetUrl(row.main_image),
      imageAlt: localized(row, 'image_alt', localeField),
      highlights: fallback?.highlights,
      applications: fallback?.applications
    };
  });
}

export async function getProductBySlug(locale: Locale, slug: string): Promise<Product | null> {
  const products = await getProducts(locale);
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductsByCategory(locale: Locale, categorySlug: string): Promise<Product[]> {
  const [products, categories] = await Promise.all([getProducts(locale), getProductCategories(locale)]);
  const activeCategory = categories.find((category) => category.slug === categorySlug);

  if (!activeCategory) {
    return [];
  }

  const categoryIds = collectCategoryIds(categories, activeCategory.id);
  return products.filter((product) => product.category && categoryIds.has(product.category));
}

export function collectCategoryIds(categories: ProductCategory[], rootId: string) {
  const ids = new Set<string>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const category of categories) {
      if (category.parent && ids.has(category.parent) && !ids.has(category.id)) {
        ids.add(category.id);
        changed = true;
      }
    }
  }

  return ids;
}

type DirectusRow = Record<string, string | number | null>;

interface DirectusCategory extends DirectusRow {
  id: number;
  slug: string;
  parent_category: number | null;
}

interface DirectusProduct extends DirectusRow {
  id: number;
  slug: string;
  product_category: number | null;
  main_image: string | null;
}

function safeLocale(locale: Locale) {
  return /^[a-z]{2}$/.test(locale) ? locale : 'en';
}

function localized(row: DirectusRow, field: string, locale: string) {
  const value = row[`${field}_${locale}`] || row[`${field}_en`];
  return typeof value === 'string' && value.trim() ? value : null;
}

function directusAssetUrl(id: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, '');
  return id && baseUrl ? `${baseUrl}/assets/${id}` : null;
}

async function fetchDirectusRows<T>(collection: string, params: Record<string, string>): Promise<T[] | null> {
  const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace(/\/$/, '');
  if (!baseUrl) return null;

  const query = new URLSearchParams({ ...params, 'filter[status][_eq]': 'published' });
  try {
    const response = await fetch(`${baseUrl}/items/${collection}?${query}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: T[] };
    return body.data ?? null;
  } catch {
    return null;
  }
}
