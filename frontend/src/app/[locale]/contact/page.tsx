import Image from 'next/image';
import { Beaker, CheckCircle2, ClipboardCheck, PackageCheck, Send } from 'lucide-react';
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
      <section className="section section-tint"><div className="container reference-contact-cards">
        <article><Beaker size={24}/><h3>Product review</h3><p>Identify the additive family and intended function.</p></article>
        <article><ClipboardCheck size={24}/><h3>Technical context</h3><p>Share the fuel, lubricant, formulation and performance direction.</p></article>
        <article><PackageCheck size={24}/><h3>Market &amp; packaging</h3><p>Confirm destination, volume and private-label direction.</p></article>
        <article><Send size={24}/><h3>Commercial reply</h3><p>Receive verified grade, MOQ, lead time and documentation details.</p></article>
      </div></section>
      <section className="section inner-content-section" id="inquiry-form">
        <div className="container reference-contact-form contact-layout">
          <div>
            <div className="eyebrow dark">Helpful inquiry details</div>
            <h2>What to include</h2>
            <ul className="feature-list contact-checklist">
              {['Product name or additive function', 'Fuel, lubricant or formulation application', 'Destination market', 'Target performance direction', 'Packaging or private-label requirement', 'Available sample or technical reference'].map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}
            </ul>
            <p className="note">Exact grade, MOQ, lead time, packaging specification and technical documents will be confirmed after product review.</p>
          </div>
          <div><InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/contact`} /></div>
          <aside className="reference-contact-aside"><div className="reference-contact-image"><Image src="/images/home/additive-packages-light.webp" alt="Chemical additive inquiry support" fill sizes="(max-width: 900px) 100vw, 24rem" /></div><h3>Helpful starting point</h3><p>You do not need a final specification before contacting us. Begin with the application and the performance problem to solve.</p></aside>
        </div>
      </section>
    </>
  );
}
