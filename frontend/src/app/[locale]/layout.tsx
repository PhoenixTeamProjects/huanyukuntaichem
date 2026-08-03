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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://huanyukuntaichem.com';
  const siteName = settings.siteName ?? 'HUANYU KUNTAI CHEM';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`
    },
    description:
      'Global fuel additives, lubricant additives and lubricant additive packages with formulation, OEM, quality control and supply support.',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        'x-default': '/en'
      }
    },
    openGraph: {
      type: 'website',
      siteName,
      title: siteName,
      description:
        'Fuel additives, lubricant additives and additive-package solutions for global industrial B2B customers.',
      url: `/${locale}`
    },
    robots: locale === 'en' ? { index: true, follow: true } : { index: false, follow: true }
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
