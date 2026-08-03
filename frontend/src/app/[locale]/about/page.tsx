import Link from 'next/link';
import { ArrowRight, Factory, FlaskConical, Globe2, ShieldCheck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const business = await getBusinessContent(locale);

  return (
    <>
      <section className="page-hero about-hero">
        <div className="container">
          <div className="eyebrow">About Huanyu Kuntai Chem</div>
          <h1>{business.positioning}</h1>
          <p>{business.companyName}</p>
        </div>
      </section>
      <section className="section">
        <div className="container about-layout">
          <div>
            <div className="eyebrow dark">Company profile</div>
            <h2>Focused exclusively on fuel and lubricant additive systems</h2>
          </div>
          <div className="prose">
            {business.companyIntroduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container value-grid">
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
