import Link from 'next/link';
import { ArrowRight, FlaskConical, Fuel, ShieldCheck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getMessages } from '@/lib/i18n/messages';
import { getProducts } from '@/lib/directus/products';
import InquiryForm from '@/components/InquiryForm';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const products = await getProducts(locale);

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="eyebrow">{messages.home.eyebrow}</div>
          <h1>{messages.home.title}</h1>
          <p>{messages.home.summary}</p>
          <div className="actions">
            <Link className="button" href={`/${locale}/products`}>
              {messages.nav.products}
              <ArrowRight size={18} />
            </Link>
            <Link className="button secondary" href={`/${locale}/contact`}>
              {messages.cta.contact}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{messages.home.capabilitiesTitle}</h2>
            <p>{messages.home.capabilitiesText}</p>
          </div>
          <div className="grid">
            <article className="card">
              <Fuel size={28} />
              <h3>{messages.home.capabilityFuel}</h3>
              <p>{messages.home.capabilityFuelText}</p>
            </article>
            <article className="card">
              <FlaskConical size={28} />
              <h3>{messages.home.capabilityChemical}</h3>
              <p>{messages.home.capabilityChemicalText}</p>
            </article>
            <article className="card">
              <ShieldCheck size={28} />
              <h3>{messages.home.capabilityQuality}</h3>
              <p>{messages.home.capabilityQualityText}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{messages.nav.products}</h2>
            <p>{messages.products.intro}</p>
          </div>
          <div className="grid">
            {products.map((product) => (
              <article className="card" key={product.id}>
                <h3>{product.name}</h3>
                <p>{product.summary}</p>
                <Link className="button secondary" href={`/${locale}/products/${product.slug}`}>
                  {messages.cta.viewDetails}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>{messages.cta.sendInquiry}</h2>
            <p>{messages.contact.intro}</p>
          </div>
          <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}`} />
        </div>
      </section>
    </>
  );
}
