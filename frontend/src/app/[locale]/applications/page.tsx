import Link from 'next/link';
import Image from 'next/image';
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
        <div className="container reference-image-split">
          <div className="reference-split-image"><Image src="/images/home/lubricant-additives-light.webp" alt="Lubricant additive application system" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <div className="reference-split-copy"><div className="eyebrow dark">Selection framework</div><h2>Match chemistry to the operating environment.</h2><p className="lead">A qualified recommendation starts with the fluid system, equipment duty, climate, performance target and destination market.</p><ul className="feature-list">{['Fuel or lubricant system', 'Operating condition and equipment duty', 'Target additive function', 'Market and documentation requirements'].map((item) => <li key={item}>{item}</li>)}</ul><Link className="button" href={`/${locale}/contact`}>Review an application <ArrowRight size={17} /></Link></div>
        </div>
      </section>
      <section className="section">
        <div className="container"><div className="section-head"><div className="eyebrow dark">Application process</div><h2>Four steps to a suitable direction</h2></div><div className="reference-process-grid">{business.serviceProcess.slice(0,4).map((step,index)=><article key={step.title}><span>{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></div>
      </section>
      <section className="section section-dark">
        <div className="container two-panel">
          <div>
            <div className="eyebrow">Application matching</div>
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
