import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Beaker, CheckCircle2, Factory, FlaskConical, Globe2, PackageCheck, Settings2, ShieldCheck } from 'lucide-react';
import HomeMotion from '@/components/HomeMotion';
import InquiryForm from '@/components/InquiryForm';
import { getBusinessContent } from '@/lib/directus/business';
import { getMessages, normalizeLocale } from '@/lib/i18n/messages';

const capabilityIcons = [FlaskConical, Beaker, Settings2, ShieldCheck, PackageCheck, Factory, Globe2, CheckCircle2];
const productImages = ['/images/home/fuel-additives-light.webp', '/images/home/lubricant-additives-light.webp', '/images/home/additive-packages-light.webp'];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const business = await getBusinessContent(locale);

  return (
    <HomeMotion>
      <section className="reference-home-hero" data-hero>
        <div className="reference-home-media" data-hero-image><Image src="/images/home/hero-energy-field-light.webp" alt="Additive fluids in a precision production environment" fill priority sizes="100vw" /></div>
        <div className="oil-flow-layer oil-flow-layer-primary" data-oil-layer="primary" aria-hidden="true" />
        <div className="oil-flow-layer oil-flow-layer-secondary" data-oil-layer="secondary" aria-hidden="true" />
        <div className="oil-flow-sheen" data-oil-sheen aria-hidden="true" />
        <div className="container reference-home-content">
          <span className="reference-pill" data-hero-reveal>{business.hero.eyebrow}</span>
          <h1 data-hero-reveal>{business.hero.title}</h1>
          <p data-hero-reveal>{business.hero.summary}</p>
          <div className="actions" data-hero-reveal>
            <Link className="button" href={`/${locale}/products`}>Explore product systems <ArrowRight size={18} /></Link>
            <Link className="button secondary light" href={`/${locale}/contact`}>Discuss your requirement</Link>
          </div>
          <div className="reference-hero-proof">
            <div data-trust-item><strong>2008</strong><span>Established</span></div>
            <div data-trust-item><strong>3</strong><span>Product systems</span></div>
            <div data-trust-item><strong>OEM</strong><span>Private label support</span></div>
            <div data-trust-item><strong>B2B</strong><span>Global supply</span></div>
          </div>
        </div>
      </section>

      <div className="container reference-inquiry-dock">
        <span className="reference-inquiry-label">Start an inquiry</span>
        <div><small>01 / PRODUCT</small><strong>Select an additive system</strong></div>
        <div><small>02 / APPLICATION</small><strong>Share the operating context</strong></div>
        <div><small>03 / MARKET</small><strong>Confirm destination &amp; packaging</strong></div>
        <Link className="button" href={`/${locale}/contact`}>Send requirement <ArrowRight size={17} /></Link>
      </div>

      <section className="section reference-home-products" data-product-stage>
        <div className="container">
          <div className="section-head split-head" data-scroll-reveal>
            <div><div className="eyebrow dark">Product categories</div><h2>Three focused additive systems</h2></div>
            <p>Structured for fuel treatment, lubricant formulation and application-oriented additive packages.</p>
          </div>
          <div className="reference-category-grid" data-scroll-reveal>
            {business.productSystems.map((system, index) => (
              <Link className={`reference-category-card category-${index + 1}`} href={`/${locale}/products/category/${system.slug}`} key={system.number}>
                <Image src={productImages[index]} alt={`${system.title} technology`} fill sizes="(max-width: 760px) 100vw, 40vw" />
                <span className="reference-category-shade" />
                <span className="reference-category-copy"><small>{system.number}</small><strong>{system.title}</strong><em>{system.description}</em><b>Explore system <ArrowRight size={16} /></b></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container reference-image-split" data-scroll-reveal>
          <div className="reference-split-image"><Image src="/images/home/additive-packages-light.webp" alt="Additive package development and supply" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <div className="reference-split-copy">
            <div className="eyebrow dark">Inquiry &amp; supply support</div><h2>A direct route from requirement to reliable supply.</h2>
            <p className="lead">We connect product selection, sample confirmation, controlled production, documentation and export coordination in one B2B workflow.</p>
            <ul className="feature-list">{business.serviceProcess.slice(0, 4).map((step) => <li key={step.title}><CheckCircle2 size={18} /><span><strong>{step.title}</strong><br />{step.description}</span></li>)}</ul>
            <Link className="button" href={`/${locale}/service`}>Explore our service <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="section reference-capability-dark">
        <div className="container">
          <div className="section-head split-head" data-scroll-reveal><div><div className="eyebrow">Technical capability</div><h2>Built around the actual additive application.</h2></div><p>Formula support, controlled manufacturing and export execution for qualified international programs.</p></div>
          <div className="capability-grid" data-scroll-reveal>{business.capabilities.map((item, index) => { const Icon = capabilityIcons[index]; return <article className="capability-card" key={item.title}><Icon size={24} /><h3>{item.title}</h3><p>{item.description}</p></article>; })}</div>
        </div>
      </section>

      <section className="section">
        <div className="container reference-process" data-scroll-reveal>
          <div className="section-head"><div className="eyebrow dark">Cooperation process</div><h2>Clear milestones, fewer surprises.</h2><p>Commercial details are confirmed against the real product, destination and order.</p></div>
          <div className="reference-process-grid">{business.serviceProcess.slice(0, 4).map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
        </div>
      </section>

      <section className="section reference-final-cta">
        <Image src="/images/home/fuel-additives-light.webp" alt="Fuel additive application" fill sizes="100vw" />
        <div className="reference-final-shade" />
        <div className="container" data-scroll-reveal><div className="eyebrow">Start a technical conversation</div><h2>Tell us what the product needs to do.</h2><p>Share the application, destination market, technical direction and packaging requirement.</p><Link className="button" href={`/${locale}/contact`}>Send your inquiry <ArrowRight size={17} /></Link></div>
      </section>

      <section className="section inquiry-section energy-inquiry" id="inquiry">
        <div className="container inquiry-layout" data-scroll-reveal><div><div className="eyebrow">Detailed inquiry</div><h2>Ready to discuss specifications?</h2><p>Provide the known product and application details. Exact MOQ, grade, lead time and documents will be confirmed after review.</p></div><InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}`} /></div>
      </section>
    </HomeMotion>
  );
}
