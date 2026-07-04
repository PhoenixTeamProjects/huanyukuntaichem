import type { Metadata } from 'next';
import { locales, type Locale, isRtlLocale } from '@/config/i18n';
import { getMessages, normalizeLocale } from '@/lib/i18n/messages';
import { getSiteSettings } from '@/lib/directus/settings';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const settings = await getSiteSettings(locale);

  return {
    title: {
      default: settings.siteName ?? 'Huanyu Kuntai Chemical',
      template: `%s | ${settings.siteName ?? 'Huanyu Kuntai Chemical'}`
    },
    description: settings.tagline ?? 'Industrial chemical and fuel additive solutions',
    alternates: {
      canonical: `/${locale}`
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const settings = await getSiteSettings(locale);

  return (
    <html lang={locale} dir={isRtlLocale(locale as Locale) ? 'rtl' : 'ltr'}>
      <body>
        <Header locale={locale} messages={messages} settings={settings} />
        <main>{children}</main>
        <Footer locale={locale} messages={messages} settings={settings} />
      </body>
    </html>
  );
}
