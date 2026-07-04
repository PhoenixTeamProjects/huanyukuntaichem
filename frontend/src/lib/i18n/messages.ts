import { defaultLocale, isLocale, type Locale } from '@/config/i18n';
import en from '@/locales/en/common.json';
import es from '@/locales/es/common.json';
import ru from '@/locales/ru/common.json';
import ar from '@/locales/ar/common.json';
import fr from '@/locales/fr/common.json';
import pt from '@/locales/pt/common.json';
import de from '@/locales/de/common.json';
import id from '@/locales/id/common.json';
import tr from '@/locales/tr/common.json';
import fa from '@/locales/fa/common.json';

const dictionaries = { en, es, ru, ar, fr, pt, de, id, tr, fa } satisfies Record<Locale, typeof en>;

export type Messages = typeof en;

export function normalizeLocale(locale: string): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
