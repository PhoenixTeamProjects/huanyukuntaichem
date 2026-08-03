import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Beaker,
  CheckCircle2,
  Factory,
  FlaskConical,
  Globe2,
  PackageCheck,
  Settings2,
  ShieldCheck
} from 'lucide-react';
import HomeMotion from '@/components/HomeMotion';
import InquiryForm from '@/components/InquiryForm';
import { getBusinessContent } from '@/lib/directus/business';
import { getMessages, normalizeLocale } from '@/lib/i18n/messages';

const capabilityIcons = [FlaskConical, Beaker, Settings2, ShieldCheck, PackageCheck, Factory, Globe2, CheckCircle2];
const productImages = [
  '/images/home/fuel-additives.webp',
  '/images/home/lubricant-additives.webp',
  '/images/home/additive-packages.webp'
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const business = await getBusinessContent(locale);

  return (
    <HomeMotion>
      <section className="energy-hero" data-hero>
        <div className="energy-hero-media" data-hero-image>
          <Image
            src="/images/home/hero-energy-field.webp"
            alt="Emerald and amber additive fluids flowing into a precision vessel"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="container energy-hero-layout">
          <div className="energy-hero-content">
            <div className="eyebrow" data-hero-reveal>{business.hero.eyebrow}</div>
            <h1 data-hero-reveal>{business.hero.title}</h1>
            <p data-hero-reveal>{business.hero.summary}</p>
            <div className="actions">
              <Link className="button energy-primary" href={`/${locale}/products`} data-hero-reveal>
                Explore product systems <ArrowRight size={18} />
              </Link>
              <Link className="button secondary light" href={`/${locale}/contact`} data-hero-reveal>
                Discuss your requirement
              </Link>
            </div>
          </div>
        </div>
        <div className="container energy-trust" aria-label="Company strengths">
          <div data-trust-item><strong>Global B2B supply</strong><span>For importers, brands, manufacturers and blenders</span></div>
          <div data-trust-item><strong>Three product systems</strong><span>Fuel, lubricant and additive package solutions</span></div>
          <div data-trust-item><strong>Technical support</strong><span>Formula, sample and application assistance</span></div>
        </div>
      </section>

      <section className="energy-products" id="product-systems" data-product-stage>
        <div className="container energy-products-head" data-scroll-reveal>
          <div className="section-head split-head">
            <div>
              <div className="eyebrow">Product architecture</div>
              <h2>Three focused additive systems</h2>
            </div>
            <p>Every product route stays within fuel and lubricant additive technology. Unrelated industrial divisions are intentionally excluded.</p>
          </div>
        </div>
        <div className="energy-product-rail" data-product-rail>
          {business.productSystems.map((system, index) => (
            <article className="energy-product-card" key={system.number}>
              <Image src={productImages[index]} alt={`${system.title} technology`} fill sizes="(max-width: 1023px) 100vw, 72vw" />
              <div className="energy-product-shade" />
              <div className="energy-product-copy">
                <span>{String(index + 1).padStart(2, '0')} / 03</span>
                <h3>{system.title}</h3>
                <p>{system.description}</p>
                <Link href={`/${locale}/products/category/${system.slug}`}>
                  Explore system <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section energy-capabilities" id="capabilities">
        <div className="container">
          <div className="section-head split-head" data-scroll-reveal>
            <div>
              <div className="eyebrow">Technical capability</div>
              <h2>From product selection to long-term supply</h2>
            </div>
            <p>We combine additive knowledge, controlled manufacturing, customization and export execution for international B2B programs.</p>
          </div>
          <div className="capability-grid" data-scroll-reveal>
            {business.capabilities.map((capability, index) => {
              const Icon = capabilityIcons[index];
              return (
                <article className="capability-card" key={capability.title}>
                  <Icon size={24} />
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section energy-quality" id="quality">
        <div className="container two-panel" data-scroll-reveal>
          <div>
            <div className="eyebrow dark">Quality control</div>
            <h2>A controlled route from raw material to export</h2>
            <p className="lead">Quality communication is based on the specific product, batch and applicable documentation, not broad unsupported claims.</p>
            <Link className="button secondary" href={`/${locale}/service`}>See our service system</Link>
          </div>
          <ol className="process-list compact">
            {business.qualityProcess.map((stage, index) => (
              <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span>{stage}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint energy-customers" id="buyers">
        <div className="container">
          <div className="section-head" data-scroll-reveal>
            <div className="eyebrow dark">Who we serve</div>
            <h2>Built for professional additive buyers</h2>
            <p>Our workflows are designed around technical confirmation, supply continuity and repeat business.</p>
          </div>
          <div className="grid customer-grid" data-scroll-reveal>
            {business.customerTypes.map((customer) => (
              <article className="card" key={customer.title}>
                <h3>{customer.title}</h3>
                <p>{customer.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section inquiry-section energy-inquiry" id="inquiry">
        <div className="container inquiry-layout" data-scroll-reveal>
          <div>
            <div className="eyebrow">Start a technical conversation</div>
            <h2>Tell us the application, market and performance direction.</h2>
            <p>Share the product name, intended use, destination market, packaging direction and any available technical target. Exact MOQ, lead time, grade and documentation will be confirmed against the real product.</p>
          </div>
          <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}`} />
        </div>
      </section>
    </HomeMotion>
  );
}
