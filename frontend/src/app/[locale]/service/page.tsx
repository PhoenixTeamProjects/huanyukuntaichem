import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileCheck2, PackageCheck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';

export default async function ServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Technical & supply services</div>
          <h1>From formulation support to global delivery</h1>
          <p>Technical confirmation, customization, controlled production and export execution are managed as one connected B2B workflow.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head split-head">
            <div><div className="eyebrow dark">Capabilities</div><h2>Support around the real application</h2></div>
            <p>OEM, ODM and Private Label are service capabilities that support qualified fuel and lubricant additive programs—not a separate product category.</p>
          </div>
          <div className="capability-grid light-grid">
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
    </>
  );
}
