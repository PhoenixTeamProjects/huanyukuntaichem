export const locales = ['en', 'es', 'ru', 'ar', 'fr', 'pt', 'de', 'id', 'tr', 'fa'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const rtlLocales: Locale[] = ['ar', 'fa'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ru: 'Русский',
  ar: 'العربية',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
  id: 'Indonesia',
  tr: 'Türkçe',
  fa: 'فارسی'
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isRtlLocale(locale: Locale) {
  return rtlLocales.includes(locale);
}
