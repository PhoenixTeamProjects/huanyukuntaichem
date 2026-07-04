import Link from 'next/link';
import { Mail } from 'lucide-react';
import { localeNames, locales, type Locale } from '@/config/i18n';
import type { Messages } from '@/lib/i18n/messages';
import type { SiteSettings } from '@/lib/directus/types';

export default function Header({
  locale,
  messages,
  settings
}: {
  locale: Locale;
  messages: Messages;
  settings: SiteSettings;
}) {
  const navItems = [
    ['products', messages.nav.products],
    ['applications', messages.nav.applications],
    ['service', messages.nav.service],
    ['news', messages.nav.news],
    ['about', messages.nav.about],
    ['contact', messages.nav.contact]
  ];

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" href={`/${locale}`}>
          {settings.siteName}
          <span>{settings.tagline}</span>
        </Link>
        <nav className="nav-links" aria-label={messages.nav.primary}>
          {navItems.map(([href, label]) => (
            <Link key={href} href={`/${locale}/${href}`}>
              {label}
            </Link>
          ))}
          <select
            aria-label={messages.nav.language}
            defaultValue={locale}
            title={messages.nav.language}
          >
            {locales.map((item) => (
              <option key={item} value={item}>
                {localeNames[item]}
              </option>
            ))}
          </select>
          <Link className="button" href={`/${locale}/contact`}>
            <Mail size={16} />
            {messages.cta.inquiry}
          </Link>
        </nav>
      </div>
    </header>
  );
}
