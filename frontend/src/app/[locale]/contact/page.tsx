import { CheckCircle2 } from 'lucide-react';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import InquiryForm from '@/components/InquiryForm';
import InnerPageHero from '@/components/InnerPageHero';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);

  return (
    <>
      <InnerPageHero
        locale={locale}
        eyebrow="Contact Huanyu Kuntai Chem"
        title="Discuss your additive requirement"
        summary="Provide the application and market context so our team can identify the correct product or development route."
        primary={{ href: '#inquiry-form', label: 'Send inquiry' }}
        secondary={{ href: '/products', label: 'View products' }}
        highlights={['Product and application review', 'Technical selection support', 'Commercial details confirmed per inquiry']}
      />
      <section className="section inner-content-section" id="inquiry-form">
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
