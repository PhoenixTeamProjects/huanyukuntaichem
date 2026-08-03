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
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';
import InquiryForm from '@/components/InquiryForm';

const capabilityIcons = [FlaskConical, Beaker, Settings2, ShieldCheck, PackageCheck, Factory, Globe2, CheckCircle2];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const business = await getBusinessContent(locale);

  return (
    <>
      <section className="hero">
        <div className="container hero-layout">
          <div className="hero-content">
            <div className="eyebrow">{business.hero.eyebrow}</div>
            <h1>{business.hero.title}</h1>
            <p>{business.hero.summary}</p>
            <div className="actions">
              <Link className="button" href={`/${locale}/products`}>
                Explore product systems
                <ArrowRight size={18} />
              </Link>
              <Link className="button secondary light" href={`/${locale}/contact`}>
                Discuss your requirement
              </Link>
            </div>
          </div>
          <aside className="hero-panel" aria-label="Company positioning">
            <span>HUANYU KUNTAI CHEM</span>
            <strong>{business.positioning}</strong>
            <p>Manufacturing · Formulation · Quality Control · Global Supply</p>
          </aside>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><strong>Since 2008</strong><span>Industry & international supply experience</span></div>
          <div><strong>3 product systems</strong><span>Fuel, lubricant and package solutions</span></div>
          <div><strong>Technical support</strong><span>Formula, sample and application assistance</span></div>
          <div><strong>Global B2B</strong><span>Importers, brands, manufacturers and blenders</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head split-head">
            <div>
              <div className="eyebrow dark">Product architecture</div>
              <h2>Three focused additive systems</h2>
            </div>
            <p>Every product route stays within fuel and lubricant additive technology. Unrelated industrial divisions are intentionally excluded.</p>
          </div>
          <div className="product-system-grid">
            {business.productSystems.map((system) => (
              <article className="system-card" key={system.number}>
                <span className="system-number">{system.number}</span>
                <h3>{system.title}</h3>
                <p>{system.description}</p>
                <ul className="check-list">
                  {system.focus.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Link className="text-link" href={`/${locale}/products/category/${system.slug}`}>
                  View this product system <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="section-head split-head">
            <div>
              <div className="eyebrow">Technical capability</div>
              <h2>From product selection to long-term supply</h2>
            </div>
            <p>We combine additive knowledge, controlled manufacturing, customization and export execution for international B2B programs.</p>
          </div>
          <div className="capability-grid">
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

      <section className="section">
        <div className="container two-panel">
          <div>
            <div className="eyebrow dark">Quality control</div>
            <h2>A controlled route from raw material to export</h2>
            <p className="lead">Quality communication is based on the specific product, batch and applicable documentation—not broad unsupported claims.</p>
            <Link className="button secondary" href={`/${locale}/service`}>See our service system</Link>
          </div>
          <ol className="process-list compact">
            {business.qualityProcess.map((stage, index) => (
              <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span>{stage}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow dark">Who we serve</div>
            <h2>Built for professional additive buyers</h2>
            <p>Our workflows are designed around technical confirmation, supply continuity and repeat business.</p>
          </div>
          <div className="grid customer-grid">
            {business.customerTypes.map((customer) => (
              <article className="card" key={customer.title}>
                <h3>{customer.title}</h3>
                <p>{customer.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section inquiry-section">
        <div className="container inquiry-layout">
          <div>
            <div className="eyebrow">Start a technical conversation</div>
            <h2>Tell us the application, market and performance direction.</h2>
            <p>Share the product name, intended use, destination market, packaging direction and any available technical target. Exact MOQ, lead time, grade and documentation will be confirmed against the real product.</p>
          </div>
          <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}`} />
        </div>
      </section>
    </>
  );
}
