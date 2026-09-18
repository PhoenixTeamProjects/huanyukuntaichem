'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FlaskConical, Globe2, Mail, Menu, Phone, X } from 'lucide-react';
import { localeNames, locales, type Locale } from '@/config/i18n';
import type { Messages } from '@/lib/i18n/messages';
import type { SiteSettings } from '@/lib/directus/types';

export default function Header({ locale, messages, settings }: { locale: Locale; messages: Messages; settings: SiteSettings }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, '')}` : null;
  const navItems = [
    ['', messages.nav.home], ['products', messages.nav.products], ['applications', messages.nav.applications],
    ['service', messages.nav.service], ['news', messages.nav.news], ['about', messages.nav.about], ['contact', messages.nav.contact]
  ];

  const languagePicker = (
    <label className="header-language">
      <Globe2 size={16} aria-hidden="true" />
      <select aria-label={messages.nav.language} defaultValue={locale} title={messages.nav.language}>
        {locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
      </select>
    </label>
  );

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-group">
            <span><Globe2 size={14} /> Global additive solutions since 2008</span>
            <span><FlaskConical size={14} /> Fuel &amp; lubricant additive technology</span>
          </div>
          <div className="topbar-group topbar-contact">
            {settings.phone && phoneHref ? <a href={phoneHref}><Phone size={14} />{settings.phone}</a> : null}
            {settings.email ? <a href={`mailto:${settings.email}`}><Mail size={14} />{settings.email}</a> : null}
            <Link href={`/${locale}/contact`}>Technical support &amp; inquiry</Link>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container nav">
          <Link className="brand" href={`/${locale}`} onClick={() => setMobileOpen(false)}>
            <span className="header-brand-mark" aria-hidden="true"><FlaskConical size={25} /></span>
            <span className="header-brand-copy"><strong>{settings.siteName}</strong><small>{settings.tagline}</small></span>
          </Link>
          <nav className="nav-links header-desktop-nav" aria-label={messages.nav.primary}>
            {navItems.map(([href, label]) => <Link key={href || 'home'} href={`/${locale}${href ? `/${href}` : ''}`}>{label}</Link>)}
          </nav>
          <div className="header-tools">
            {languagePicker}
            <Link className="button header-inquiry" href={`/${locale}/contact`}><Mail size={16} />{messages.cta.inquiry}</Link>
          </div>
          <button className="mobile-nav-toggle" type="button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        <div className={`mobile-nav-panel${mobileOpen ? ' is-open' : ''}`}>
          <nav className="container" aria-label={`${messages.nav.primary} mobile`}>
            {navItems.map(([href, label]) => <Link key={href || 'home'} href={`/${locale}${href ? `/${href}` : ''}`} onClick={() => setMobileOpen(false)}>{label}</Link>)}
            <div className="mobile-nav-actions">
              {languagePicker}
              <Link className="button" href={`/${locale}/contact`} onClick={() => setMobileOpen(false)}><Mail size={16} />{messages.cta.inquiry}</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
