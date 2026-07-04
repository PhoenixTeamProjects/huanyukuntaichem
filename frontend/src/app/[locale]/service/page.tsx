import { normalizeLocale, getMessages } from '@/lib/i18n/messages';

export default async function ServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(normalizeLocale(locale));

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{messages.nav.service}</h1>
          <p>{messages.service.intro}</p>
        </div>
      </div>
    </section>
  );
}
