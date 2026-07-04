import { normalizeLocale, getMessages } from '@/lib/i18n/messages';

export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(normalizeLocale(locale));

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{messages.nav.applications}</h1>
          <p>{messages.applications.intro}</p>
        </div>
      </div>
    </section>
  );
}
