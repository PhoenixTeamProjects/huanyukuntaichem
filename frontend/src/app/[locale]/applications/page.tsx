import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';

export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Applications</div>
          <h1>Additive directions for transport and industry</h1>
          <p>Connect the operating environment with the correct fuel additive, functional component or lubricant additive package.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="application-grid">
            {business.applications.map((application, index) => (
              <article className="application-card" key={application.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{application.title}</h2>
                  <p>{application.description}</p>
                  <strong>{application.direction}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container two-panel">
          <div>
            <div className="eyebrow dark">Application matching</div>
            <h2>Start with the real operating requirement</h2>
          </div>
          <div>
            <p className="lead">Product selection should consider the fuel or lubricant system, operating conditions, market, technical target and available verification data.</p>
            <Link className="button" href={`/${locale}/contact`}>Discuss an application <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
