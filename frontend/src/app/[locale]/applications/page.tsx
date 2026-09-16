import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Beaker, Boxes, CarFront, Check, Cog, Factory, FileText, FlaskConical, Fuel, Gauge, Sprout, Tags, Target, Tractor, Truck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';

const applicationImages = [
  '/images/home/refined/application-automotive.webp',
  '/images/home/refined/application-commercial-vehicles.webp',
  '/images/home/refined/application-heavy-duty.webp',
  '/images/home/refined/application-construction.webp',
  '/images/applications/applications-offhighway.webp',
  '/images/home/refined/application-industrial-machinery.webp',
  '/images/home/refined/application-lubricant-manufacturing.webp',
  '/images/home/refined/application-aftermarket.webp',
];

const applicationIds = ['passenger-vehicles', 'commercial-vehicles', 'heavy-duty-diesel', 'construction-machinery', 'agricultural-engines', 'industrial-machinery', 'lubricant-manufacturing', 'automotive-aftermarket'];
const applicationIcons = [CarFront, Truck, Gauge, Tractor, Sprout, Factory, FlaskConical, Tags];

export default async function ApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);
  const app = Object.fromEntries(business.applications.map((item) => [item.title, item]));
  const contactHref = `/${locale}/contact`;
  const productsHref = `/${locale}/products`;

  return (
    <main className="applications-page">
      <section className="applications-hero">
        <Image className="applications-hero-image" src="/images/applications/applications-hero.webp" alt="Passenger car, commercial truck and construction equipment serving industrial applications" fill priority sizes="100vw" />
        <div className="applications-hero-overlay" />
        <div className="container applications-hero-inner">
          <div className="applications-hero-copy">
            <div className="eyebrow dark">Industry applications</div>
            <h1>Performance begins with the application.</h1>
            <p>Tailored additive directions for real operating conditions across on-road, off-highway and industrial equipment.</p>
            <div className="applications-actions">
              <a className="button" href="#explore-applications">View all applications <ArrowRight size={17} /></a>
              <Link className="button secondary" href={contactHref}>Contact our experts</Link>
            </div>
          </div>
        </div>
      </section>

      <nav className="applications-quicknav" aria-label="Application categories">
        <div className="container applications-quicknav-grid">
          {business.applications.map((item, index) => { const Icon = applicationIcons[index]; return <a key={item.title} href={`#${applicationIds[index]}`}><Icon size={24} /><span>{item.title}</span></a>; })}
        </div>
      </nav>

      <section id="explore-applications" className="applications-explorer">
        <div className="container">
          <div className="applications-section-head">
            <div><div className="eyebrow dark">Explore by application</div><h2>Find the right direction for your operating environment.</h2></div>
            <p>Start with the equipment or formulation scenario, then connect it with a suitable additive function or package direction.</p>
          </div>
          <div className="applications-explorer-grid">
            {business.applications.map((item, index) => (
              <a className="applications-explorer-card" href={`#${applicationIds[index]}`} key={item.title}>
                <Image src={applicationImages[index]} alt={item.title} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 25vw" />
                <span className="applications-card-shade" />
                <span className="applications-card-copy"><strong>{item.title}</strong><small>{item.direction}</small><i><ArrowRight size={17} /></i></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="passenger-vehicles" className="applications-story applications-onroad">
        <div className="applications-story-inner">
          <div className="applications-story-media"><Image src="/images/applications/applications-onroad.webp" alt="Passenger car and commercial truck on the road" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
          <div className="applications-story-copy">
          <span className="applications-index">01</span><div className="eyebrow dark">On-road mobility</div>
          <h2>Protection for passenger and commercial transport.</h2>
          <p>Application-led selection for gasoline and diesel systems operating across daily mobility and demanding transport duty.</p>
          <div className="applications-story-items">
            {[app['Passenger vehicles'], app['Commercial vehicles']].map((item, index) => { const Icon = index === 0 ? CarFront : Truck; return <article id={index === 1 ? 'commercial-vehicles' : undefined} key={item.title}><Icon size={27} /><h3>{item.title}</h3><p>{item.description}</p><strong>{item.direction}</strong></article>; })}
          </div>
          <Link className="applications-text-link" href={productsHref}>View relevant products <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section id="heavy-duty-diesel" className="applications-story applications-offhighway">
        <div className="applications-story-inner">
          <div className="applications-story-copy">
          <span className="applications-index">02</span><div className="eyebrow dark">Heavy-duty &amp; off-highway</div>
          <h2>Additive directions for equipment working in tough environments.</h2>
          <p>Fuel and lubricant systems for heavy loads, varied duty cycles and equipment operating away from the highway.</p>
          <div className="applications-story-items applications-story-items-three">
            {[app['Heavy-duty diesel engines'], app['Construction machinery'], app['Agricultural engines']].map((item, index) => { const Icon = [Gauge, Tractor, Sprout][index]; return <article id={index === 1 ? 'construction-machinery' : index === 2 ? 'agricultural-engines' : undefined} key={item.title}><Icon size={27} /><h3>{item.title}</h3><p>{item.description}</p><strong>{item.direction}</strong></article>; })}
          </div>
          <Link className="applications-text-link" href={productsHref}>View heavy-duty products <ArrowRight size={16} /></Link>
          </div>
          <div className="applications-story-media"><Image src="/images/applications/applications-offhighway.webp" alt="Construction excavator and agricultural tractor" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
        </div>
      </section>

      <section id="industrial-machinery" className="applications-industrial">
        <Image src="/images/applications/applications-industrial.webp" alt="Industrial processing facility at blue hour" fill sizes="100vw" />
        <div className="applications-industrial-overlay" />
        <div className="container applications-industrial-inner"><div className="applications-industrial-copy">
          <span className="applications-index light">03</span><div className="eyebrow">Industrial reliability</div>
          <h2>Lubrication support for demanding industrial environments.</h2>
          <p>{app['Industrial machinery'].description}</p>
          <ul><li><Check size={17} /> Hydraulic, gear and compressor oil directions</li><li><Check size={17} /> Application-focused functional additives</li><li><Check size={17} /> Industrial additive package options</li></ul>
          <Link className="button" href={productsHref}>View industrial solutions <ArrowRight size={17} /></Link>
        </div></div>
      </section>

      <section id="lubricant-manufacturing" className="applications-story applications-formulation">
        <div className="applications-story-inner">
          <div className="applications-story-media"><Image src="/images/applications/applications-formulation.webp" alt="Lubricant formulation laboratory and controlled filling environment" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
          <div className="applications-story-copy">
          <span className="applications-index">04</span><div className="eyebrow dark">From formulation to market</div>
          <h2>Supporting lubricant producers and aftermarket brands.</h2>
          <p>From component selection to customized, market-ready programs, the route begins with the intended formulation and customer need.</p>
          <div className="applications-story-items">
            {[app['Lubricant manufacturing'], app['Automotive aftermarket']].map((item, index) => { const Icon = index === 0 ? FlaskConical : Tags; return <article id={index === 1 ? 'automotive-aftermarket' : undefined} key={item.title}><Icon size={27} /><h3>{item.title}</h3><p>{item.description}</p><strong>{item.direction}</strong></article>; })}
          </div>
          <Link className="applications-text-link" href={contactHref}>Discuss your program <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="applications-matrix">
        <div className="container">
          <div className="applications-matrix-head">
            <div><div className="eyebrow">Application-to-chemistry matrix</div><h2>A clear view of the available product directions.</h2></div>
            <div className="applications-matrix-intro">
              <p>This matrix provides directional guidance across our three product systems. Final selection requires technical confirmation based on the fluid system, formulation and operating conditions.</p>
              <div className="applications-matrix-legend"><span><i className="matrix-dot primary" />Primary direction</span><span><i className="matrix-dot applicable" />Applicable route</span><span><i className="matrix-dot confirm" />Confirm on request</span></div>
            </div>
          </div>
          <div className="applications-matrix-scroll">
            <table>
              <thead><tr><th>Application</th><th>Fuel Additives</th><th>Lubricant Additives</th><th>Additive Packages</th></tr></thead>
              <tbody>
                {[
                  ['Passenger vehicles', 'primary', 'applicable', 'applicable'],
                  ['Commercial vehicles', 'primary', 'applicable', 'primary'],
                  ['Heavy-duty diesel engines', 'primary', 'applicable', 'primary'],
                  ['Construction machinery', 'applicable', 'primary', 'primary'],
                  ['Agricultural engines', 'primary', 'primary', 'applicable'],
                  ['Industrial machinery', 'confirm', 'primary', 'primary'],
                  ['Lubricant manufacturing', 'confirm', 'primary', 'primary'],
                  ['Automotive aftermarket', 'primary', 'applicable', 'applicable'],
                ].map(([title, fuel, lubricant, packages]) => <tr key={title}><th>{title}</th>{[fuel, lubricant, packages].map((status, index) => <td key={`${title}-${index}`}><i className={`matrix-dot ${status}`} aria-label={status} /></td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <p className="applications-matrix-note">Directional overview only. Product compatibility, dosage, claims and applicable documentation must be verified for the specific product and intended use.</p>
        </div>
      </section>

      <section className="applications-review">
        <div className="container">
          <div className="applications-review-head">
            <div><div className="eyebrow dark">Technical review</div><h2>What we review before recommending a direction.</h2><p>We begin with the real equipment, operating environment and commercial target—not a generic product list.</p></div>
            <div className="applications-review-image"><Image src="/images/applications/applications-review.webp" alt="Laboratory evaluation of additive samples" fill sizes="(max-width: 900px) 100vw, 52vw" /></div>
          </div>
          <div className="applications-review-grid">
            {[
              { icon: Beaker, title: 'Fuel or lubricant system', text: 'Fuel type, base oil, current formulation and system design.' },
              { icon: Cog, title: 'Equipment duty', text: 'Engine or machinery type, load profile and duty cycle.' },
              { icon: Gauge, title: 'Climate & operating environment', text: 'Temperature range, storage, altitude, dust and water conditions.' },
              { icon: Target, title: 'Performance target', text: 'Cleanliness, wear protection, stability, flow or formulation goals.' },
              { icon: FileText, title: 'Market & documentation', text: 'Destination market, packaging direction and applicable documents.' },
            ].map(({ icon: Icon, title, text }) => <article key={title}><Icon size={29} /><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="applications-pathways">
        <div className="container">
          <div className="applications-section-head"><div><div className="eyebrow dark">Solution pathways</div><h2>One application, three solution pathways.</h2></div><p>Move from a specific operating need to a single-function additive or a complete application-oriented package.</p></div>
          <div className="applications-pathways-grid">
            {[
              { icon: Fuel, title: 'Fuel Additives', text: 'Components for gasoline and diesel fuel treatment, selected around the operating requirement.', href: `${productsHref}?category=fuel-additives` },
              { icon: Beaker, title: 'Lubricant Additives', text: 'Functional components supporting lubricant performance and formulation development.', href: `${productsHref}?category=lubricant-additives` },
              { icon: Boxes, title: 'Lubricant Additive Packages', text: 'Application-oriented package directions for automotive and industrial lubricant systems.', href: `${productsHref}?category=lubricant-additive-packages` },
            ].map(({ icon: Icon, title, text, href }) => <article key={title}><Icon size={32} /><div><h3>{title}</h3><p>{text}</p><Link href={href}>Explore products <ArrowRight size={15} /></Link></div></article>)}
          </div>
        </div>
      </section>

      <section className="applications-process">
        <div className="container">
          <div className="applications-process-head"><div><div className="eyebrow dark">Working process</div><h2>From your application to a confirmed direction.</h2></div><p>Technical confirmation stays connected to the real fluid system, duty and market requirement.</p></div>
          <div className="applications-process-grid">{business.serviceProcess.slice(0, 5).map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{step.title}</h3><p>{step.description}</p></div>{index < 4 && <ArrowRight className="applications-process-arrow" size={18} />}</article>)}</div>
        </div>
      </section>

      <section className="applications-cta">
        <Image src="/images/applications/applications-cta.webp" alt="Industrial supply route through a mountain landscape" fill sizes="100vw" />
        <div className="applications-cta-overlay" />
        <div className="container applications-cta-inner"><div className="eyebrow">Let&apos;s find your solution</div><h2>Tell us about your application.</h2><p>Share your equipment, fluid system, operating environment and target. Our team will help identify a suitable product direction.</p><Link className="button" href={contactHref}>Get technical support <ArrowRight size={17} /></Link></div>
      </section>
    </main>
  );
}
