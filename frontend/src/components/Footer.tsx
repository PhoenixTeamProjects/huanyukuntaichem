import Link from 'next/link';
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
  return (
    <footer className="site-footer">
      <div className="container grid">
        <div>
          <h3>{settings.siteName}</h3>
          <p>{settings.tagline}</p>
        </div>
        <div>
          <h3>{messages.footer.quickLinks}</h3>
          <p>
            <Link href={`/${locale}/products`}>{messages.nav.products}</Link>
            <br />
            <Link href={`/${locale}/news`}>{messages.nav.news}</Link>
            <br />
            <Link href={`/${locale}/contact`}>{messages.nav.contact}</Link>
          </p>
        </div>
        <div>
          <h3>{messages.footer.contact}</h3>
          <p>
            {settings.email}
            <br />
            {settings.address}
          </p>
        </div>
      </div>
    </footer>
  );
}
