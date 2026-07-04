import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import InquiryForm from '@/components/InquiryForm';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{messages.nav.contact}</h1>
          <p>{messages.contact.intro}</p>
        </div>
        <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/contact`} />
      </div>
    </section>
  );
}
