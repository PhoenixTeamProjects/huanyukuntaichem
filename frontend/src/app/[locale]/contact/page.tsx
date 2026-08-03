import { CheckCircle2 } from 'lucide-react';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import InquiryForm from '@/components/InquiryForm';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Contact</div>
          <h1>Discuss your additive requirement</h1>
          <p>Provide the application and market context so our team can identify the correct product or development route.</p>
        </div>
      </section>
      <section className="section">
        <div className="container inquiry-layout contact-layout">
          <div>
            <div className="eyebrow dark">Helpful inquiry details</div>
            <h2>What to include</h2>
            <ul className="feature-list contact-checklist">
              {['Product name or additive function', 'Fuel, lubricant or formulation application', 'Destination market', 'Target performance direction', 'Packaging or private-label requirement', 'Available sample or technical reference'].map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}
            </ul>
            <p className="note">Exact grade, MOQ, lead time, packaging specification and technical documents will be confirmed after product review.</p>
          </div>
          <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/contact`} />
        </div>
      </section>
    </>
  );
}
