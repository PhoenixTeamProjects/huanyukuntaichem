import type { Locale } from '@/config/i18n';
import { fallbackSettings } from './fallback-data';
import type { SiteSettings } from './types';

export async function getSiteSettings(_locale: Locale): Promise<SiteSettings> {
  return fallbackSettings;
}
