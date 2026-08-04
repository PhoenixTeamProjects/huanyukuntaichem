import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import type { Locale } from '@/config/i18n';
import type { Messages } from '@/lib/i18n/messages';
import type { SiteSettings } from '@/lib/directus/types';

export default function Footer({
  locale,
  messages,
  settings
}: {
  locale: Locale;
  messages: Messages;
  settings: SiteSettings;
}) {
  const productSystems = [
    ['fuel-additives', 'Fuel Additives'],
    ['lubricant-additives', 'Lubricant Additives'],
    ['lubricant-additive-packages', 'Lubricant Additive Packages']
  ];

  const quickLinks = [
    ['products', messages.nav.products],
    ['applications', messages.nav.applications],
    ['service', messages.nav.service],
    ['about', messages.nav.about],
    ['contact', messages.nav.contact]
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-cta">
        <div>
          <span>Technical &amp; commercial support</span>
          <h2>Discuss your additive requirements with our team.</h2>
        </div>
        <Link className="button footer-cta-button" href={`/${locale}/contact`}>
          Send an inquiry <ArrowRight size={17} />
        </Link>
      </div>

      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>{settings.siteName}</h3>
          <strong>{settings.tagline}</strong>
          <p className="footer-company">Xi&apos;an Huanyu Kuntai Industrial Technology Co., Ltd.</p>
          <p>Fuel additive, lubricant additive and additive-package solutions for global industrial B2B customers.</p>
        </div>
        <div className="footer-column">
          <h3>Product systems</h3>
          <nav aria-label="Product systems">
            {productSystems.map(([slug, label]) => (
              <Link key={slug} href={`/${locale}/products?category=${slug}`}>{label}</Link>
            ))}
          </nav>
        </div>
        <div className="footer-column">
          <h3>{messages.footer.quickLinks}</h3>
          <nav aria-label={messages.footer.quickLinks}>
            {quickLinks.map(([href, label]) => (
              <Link key={href} href={`/${locale}/${href}`}>{label}</Link>
            ))}
          </nav>
        </div>
        <div className="footer-column footer-contact">
          <h3>{messages.footer.contact}</h3>
          {settings.email ? <a href={`mailto:${settings.email}`}><Mail size={16} />{settings.email}</a> : null}
          {settings.phone ? <a href={`tel:${settings.phone}`}><Phone size={16} />{settings.phone}</a> : null}
          {settings.address ? <span><MapPin size={16} />{settings.address}</span> : null}
          <p>Send your product, application and destination-market requirements through our inquiry form.</p>
          <Link className="footer-contact-link" href={`/${locale}/contact`}>Contact our team <ArrowRight size={15} /></Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Xi&apos;an Huanyu Kuntai Industrial Technology Co., Ltd.</span>
        <span>Product data and certifications are published only after verification.</span>
      </div>
    </footer>
  );
}
