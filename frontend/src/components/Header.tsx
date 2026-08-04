import Link from 'next/link';
import { FlaskConical, Globe2, Mail, Phone } from 'lucide-react';
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
    ['', messages.nav.home],
    ['products', messages.nav.products],
    ['applications', messages.nav.applications],
    ['service', messages.nav.service],
    ['news', messages.nav.news],
    ['about', messages.nav.about],
    ['contact', messages.nav.contact]
  ];

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-group">
            <span><Globe2 size={14} /> Global additive solutions since 2008</span>
            <span><FlaskConical size={14} /> Fuel &amp; lubricant additive technology</span>
          </div>
          <div className="topbar-group topbar-contact">
            {settings.phone ? <a href={`tel:${settings.phone}`}><Phone size={14} />{settings.phone}</a> : null}
            {settings.email ? <a href={`mailto:${settings.email}`}><Mail size={14} />{settings.email}</a> : null}
            <Link href={`/${locale}/contact`}>Technical support &amp; inquiry</Link>
          </div>
        </div>
      </div>
      <div className="container nav">
        <Link className="brand" href={`/${locale}`}>
          {settings.siteName}
          <span>{settings.tagline}</span>
        </Link>
        <nav className="nav-links" aria-label={messages.nav.primary}>
          {navItems.map(([href, label]) => (
            <Link key={href || 'home'} href={`/${locale}${href ? `/${href}` : ''}`}>
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
