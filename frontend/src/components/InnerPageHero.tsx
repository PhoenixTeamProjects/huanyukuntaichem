import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Locale } from '@/config/i18n';

interface HeroAction {
  href: string;
  label: string;
}

interface HeroMatrixItem {
  title: string;
  href: string;
  image: string;
}

export default function InnerPageHero({
  locale,
  eyebrow,
  title,
  summary,
  primary,
  secondary,
  highlights = [],
  matrixItems = []
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  summary: string;
  primary?: HeroAction;
  secondary?: HeroAction;
  highlights?: string[];
  matrixItems?: HeroMatrixItem[];
}) {
  const resolveHref = (href: string) => href.startsWith('#') ? href : `/${locale}${href}`;

  return (
    <>
      <section className="inner-page-hero">
        <Image className="inner-page-hero-image" src="/images/home/hero-energy-field-light.webp" alt="" fill loading="eager" sizes="100vw" />
        <div className="inner-page-hero-overlay" />
        <div className={`container inner-page-hero-content ${matrixItems.length ? 'inner-page-hero-matrix-layout' : ''}`}>
          <div>
          <div className="eyebrow">{eyebrow}</div>
          <span className="inner-page-badge">Fuel &amp; lubricant additive supply since 2008</span>
          <h1>{title}</h1>
          <p>{summary}</p>
          {primary || secondary ? (
            <div className="inner-page-actions">
              {primary ? <Link className="button" href={resolveHref(primary.href)}>{primary.label}<ArrowRight size={17} /></Link> : null}
              {secondary ? <Link className="button secondary" href={resolveHref(secondary.href)}>{secondary.label}<ArrowRight size={17} /></Link> : null}
            </div>
          ) : null}
          {highlights.length ? (
            <ul className="inner-page-highlights">
              {highlights.map((item) => <li key={item}><CheckCircle2 size={17} />{item}</li>)}
            </ul>
          ) : null}
          </div>
          {matrixItems.length ? <div className="inner-page-matrix">{matrixItems.map((item, index) => <Link className={index === 2 ? 'matrix-wide' : ''} href={resolveHref(item.href)} key={item.title}><Image src={item.image} alt={item.title} fill sizes="(max-width: 760px) 100vw, 30vw" /><span>{item.title}<ArrowRight size={16} /></span></Link>)}</div> : null}
        </div>
      </section>
      <section className="inner-page-stats" aria-label="Company capability summary">
        <div className="container inner-page-stats-grid">
          <div><strong>Since 2008</strong><span>Industry experience</span></div>
          <div><strong>3</strong><span>Focused product systems</span></div>
          <div><strong>B2B</strong><span>Global supply support</span></div>
          <div><strong>Technical</strong><span>Formulation &amp; application support</span></div>
        </div>
      </section>
    </>
  );
}
