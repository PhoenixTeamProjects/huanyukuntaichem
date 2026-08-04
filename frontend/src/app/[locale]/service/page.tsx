import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, FileCheck2, PackageCheck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';
import InnerPageHero from '@/components/InnerPageHero';

export default async function ServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);

  return (
    <>
      <InnerPageHero
        locale={locale}
        eyebrow="Technical & supply services"
        title="From formulation support to global delivery"
        summary="Technical confirmation, customization, controlled production and export execution are managed as one connected B2B workflow."
        primary={{ href: '/contact', label: 'Send service inquiry' }}
        secondary={{ href: '/applications', label: 'View applications' }}
        highlights={['Formula and sample support', 'OEM, ODM and Private Label', 'Quality, documents and export coordination']}
      />
      <section className="section inner-content-section">
        <div className="container">
          <div className="section-head split-head">
            <div><div className="eyebrow dark">Capabilities</div><h2>Support around the real application</h2></div>
            <p>OEM, ODM and Private Label are service capabilities that support qualified fuel and lubricant additive programs—not a separate product category.</p>
          </div>
          <div className="capability-grid light-grid reference-card-grid">
            {business.capabilities.map((capability) => (
              <article className="capability-card" key={capability.title}>
                <CheckCircle2 size={22} />
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container reference-image-split">
          <div className="reference-split-image"><Image src="/images/home/additive-packages-light.webp" alt="Additive package development support" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <div className="reference-split-copy"><div className="eyebrow dark">Connected support</div><h2>Technical and commercial work stay connected.</h2><p className="lead">The same requirement follows through selection, sample, production, packaging, documentation and delivery.</p><ul className="feature-list">{business.serviceProcess.slice(0,4).map((step)=><li key={step.title}><strong>{step.title}</strong> — {step.description}</li>)}</ul></div>
        </div>
      </section>
      <section className="section section-dark">
        <div className="container two-panel">
          <div>
            <div className="eyebrow">Cooperation route</div>
            <h2>A clear path from requirement to repeat supply</h2>
            <p className="lead">Commercial figures such as MOQ, lead time, packaging volume and payment terms are confirmed for the actual product and order.</p>
          </div>
          <ol className="process-list">
            {business.serviceProcess.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="section">
        <div className="container document-grid">
          <article className="detail-card">
            <FileCheck2 size={28} />
            <h2>Technical documents</h2>
            <p>SDS, TDS, COA, inspection records and applicable specifications can be provided according to the verified product.</p>
          </article>
          <article className="detail-card">
            <PackageCheck size={28} />
            <h2>Packaging customization</h2>
            <p>Bottle, volume, label, carton and industrial packaging directions are confirmed against real production capability.</p>
          </article>
          <article className="detail-card compliance-card">
            <h2>Compliance principle</h2>
            <p>{business.complianceNote}</p>
            <Link className="text-link" href={`/${locale}/contact`}>Discuss your requirement <ArrowRight size={16} /></Link>
          </article>
        </div>
      </section>
      <section className="section reference-final-cta"><Image src="/images/home/fuel-additives-light.webp" alt="Fuel additive service" fill sizes="100vw" /><div className="reference-final-shade" /><div className="container"><div className="eyebrow">Technical support</div><h2>Build the right supply route from the start.</h2><p>Tell us the application and market so the correct service path can be confirmed.</p><Link className="button" href={`/${locale}/contact`}>Start a service inquiry <ArrowRight size={17} /></Link></div></section>
    </>
  );
}
