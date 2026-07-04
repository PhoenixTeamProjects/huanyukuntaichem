import type { Locale } from '@/config/i18n';
import { fallbackCategories, fallbackProducts, localizeFallback } from './fallback-data';
import type { Product, ProductCategory } from './types';

export async function getProductCategories(locale: Locale): Promise<ProductCategory[]> {
  // Directus field mapping will be enabled after CMS credentials and collections are created.
  return localizeFallback(fallbackCategories, locale);
}

export async function getProducts(locale: Locale): Promise<Product[]> {
  return localizeFallback(fallbackProducts, locale);
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
