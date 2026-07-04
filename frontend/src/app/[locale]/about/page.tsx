import { normalizeLocale, getMessages } from '@/lib/i18n/messages';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(normalizeLocale(locale));

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{messages.nav.about}</h1>
          <p>{messages.about.intro}</p>
        </div>
      </div>
    </section>
  );
}
