import type { Locale } from '@/config/i18n';
import { fallbackNews, localizeFallback } from './fallback-data';
import type { NewsArticle } from './types';

export async function getNews(locale: Locale): Promise<NewsArticle[]> {
  return localizeFallback(fallbackNews, locale);
}

export async function getNewsBySlug(locale: Locale, slug: string): Promise<NewsArticle | null> {
  const articles = await getNews(locale);
  return articles.find((article) => article.slug === slug) ?? null;
}
