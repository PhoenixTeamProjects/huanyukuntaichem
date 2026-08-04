import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';
import InnerPageHero from '@/components/InnerPageHero';

export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);

  return (
    <>
      <InnerPageHero
        locale={locale}
        eyebrow="Industry applications"
        title="Additive directions for transport and industry"
        summary="Connect the operating environment with the correct fuel additive, functional component or lubricant additive package."
        primary={{ href: '/products', label: 'View products' }}
        secondary={{ href: '/contact', label: 'Discuss an application' }}
        highlights={['Application-led selection', 'Operating-condition review', 'Technical confirmation before supply']}
      />
      <section className="section inner-content-section">
        <div className="container">
          <div className="section-head split-head">
            <div><div className="eyebrow dark">Application matching</div><h2>Find solutions by operating scenario</h2></div>
            <p>Each application route connects the equipment environment with suitable additive functions and package directions.</p>
          </div>
          <div className="application-grid reference-card-grid">
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
