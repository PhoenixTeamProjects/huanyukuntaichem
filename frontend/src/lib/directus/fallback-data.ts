import type { Locale } from '@/config/i18n';
import type { NewsArticle, Product, ProductCategory, SiteSettings } from './types';

export const fallbackSettings: SiteSettings = {
  siteName: 'Huanyu Kuntai Chemical',
  tagline: 'Industrial fuel additive and chemical product solutions',
  email: 'info@huanyukuntaichem.com',
  phone: null,
  address: 'China'
};

export const fallbackCategories: ProductCategory[] = [
  {
    id: 'fuel-additives',
    slug: 'fuel-additives',
    parent: null,
    name: 'Fuel Additives',
    description: 'Core additive categories for industrial and transportation fuel applications.'
  }
];

export const fallbackProducts: Product[] = [
  {
    id: 'diesel-fuel-additive',
    slug: 'diesel-fuel-additive',
    category: 'fuel-additives',
    name: 'Diesel Fuel Additive',
    summary: 'A placeholder product entry reserved for Directus-managed product data.',
    description:
      'This page is wired for Directus content. Replace this temporary fallback through the CMS before production content launch.',
    image: null,
    imageAlt: 'Diesel fuel additive product placeholder'
  }
];

export const fallbackNews: NewsArticle[] = [
  {
    id: 'cms-content-preparation',
    slug: 'cms-content-preparation',
    category: null,
    title: 'CMS content preparation started',
    excerpt: 'News content will be managed in Directus with multilingual SEO fields.',
    content:
      'This fallback article confirms the news detail route. Production news must be maintained in Directus.',
    image: null,
    imageAlt: 'CMS content preparation',
    publishedAt: '2026-07-04'
  }
];

export function localizeFallback<T>(items: T[], _locale: Locale): T[] {
  return items;
}
