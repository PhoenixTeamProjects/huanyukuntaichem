import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Factory, FlaskConical, Globe2, ShieldCheck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';
import InnerPageHero from '@/components/InnerPageHero';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);

  return (
    <>
      <InnerPageHero
        locale={locale}
        eyebrow="About Huanyu Kuntai Chem"
        title={business.positioning}
        summary={`${business.companyName} focuses on fuel additives, lubricant additives and additive-package solutions for global industrial customers.`}
        primary={{ href: '/contact', label: 'Start a conversation' }}
        secondary={{ href: '/products', label: 'View products' }}
        highlights={['Chemical manufacturing & stable supply', 'Formulation and laboratory support', 'International B2B delivery']}
      />
      <section className="section inner-content-section">
        <div className="container reference-image-split">
          <div className="reference-split-image"><Image src="/images/home/fuel-additives-light.webp" alt="Huanyu Kuntai chemical additive focus" fill sizes="(max-width: 900px) 100vw, 50vw" /></div>
          <div className="reference-split-copy prose">
            <div className="eyebrow dark">Company profile</div>
            <h2>Focused exclusively on fuel and lubricant additive systems</h2>
            {business.companyIntroduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>
      <section className="section section-tint"><div className="container"><div className="section-head"><div className="eyebrow dark">How we work</div><h2>From chemistry to long-term delivery</h2></div><div className="reference-process-grid">{business.serviceProcess.slice(0,4).map((step,index)=><article key={step.title}><span>{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></div></section>
      <section className="section section-tint">
        <div className="container value-grid reference-card-grid">
          <article><Factory size={28} /><h3>Manufacturing & supply</h3><p>Production, blending, filling, industrial packaging and stable batch supply.</p></article>
          <article><FlaskConical size={28} /><h3>R&D & laboratory</h3><p>Formula development, optimization, compatibility, stability and sample support.</p></article>
          <article><ShieldCheck size={28} /><h3>Quality control</h3><p>Raw-material, process, batch, packaging and finished-product controls.</p></article>
          <article><Globe2 size={28} /><h3>Global delivery</h3><p>Export documentation, logistics coordination and long-term international supply.</p></article>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head"><div className="eyebrow dark">Global markets</div><h2>Regional demand, product-specific execution</h2><p>Every market is served according to its application, documentation and destination requirements.</p></div>
          <div className="grid market-grid">
            {business.markets.map((market) => <article className="card" key={market.title}><h3>{market.title}</h3><p>{market.description}</p></article>)}
          </div>
        </div>
      </section>
      <section className="section section-dark">
        <div className="container two-panel">
          <div><div className="eyebrow">Our working principle</div><h2>Advanced chemistry. Reliable performance.</h2></div>
          <div><p className="lead">We publish only verified company facts, product data, certification scope and technical claims. Missing data remains unpublished until confirmed.</p><Link className="button" href={`/${locale}/contact`}>Start a conversation <ArrowRight size={17} /></Link></div>
        </div>
      </section>
    </>
  );
}
