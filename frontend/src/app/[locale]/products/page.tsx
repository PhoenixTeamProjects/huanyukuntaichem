import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ClipboardCheck, FileCheck2, FileText, FlaskConical } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getProductCategories, getProducts } from '@/lib/directus/products';
import { getBusinessContent } from '@/lib/directus/business';
import ProductCatalog from '@/components/ProductCatalog';

const systemImages = ['/images/home/fuel-additives-light.webp', '/images/home/lubricant-additives-light.webp', '/images/home/additive-packages-light.webp'];
const applicationImages = ['/images/home/refined/application-automotive.webp', '/images/home/refined/application-commercial-vehicles.webp', '/images/home/refined/application-heavy-duty.webp', '/images/home/refined/application-lubricant-manufacturing.webp', '/images/home/refined/application-industrial-machinery.webp', '/images/home/refined/application-marine-power.webp'];

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const [categories, products, business] = await Promise.all([getProductCategories(locale), getProducts(locale), getBusinessContent(locale)]);
  const applications = business.applications.slice(0, 6);

  return <>
    <section className="products-hero">
      <Image src="/images/home/refined/hero-laboratory.webp" alt="Laboratory specialist developing additive technology" fill priority sizes="100vw" />
      <div className="products-hero-overlay" />
      <div className="container products-hero-content"><div className="eyebrow">Product portfolio</div><h1>Fuel &amp; lubricant additive solutions</h1><p>Explore focused additive systems for fuel treatment, lubricant formulation and application-oriented additive packages.</p><div className="actions"><Link className="button" href="#product-systems">Explore product systems <ArrowRight size={17} /></Link><Link className="button secondary light" href={`/${locale}/contact`}>Send product inquiry</Link></div></div>
    </section>

    <section className="product-systems-section" id="product-systems"><div className="container">
      <div className="products-section-head"><div className="eyebrow dark">Three product systems</div><h2>Choose the correct additive route</h2><p>Start with the system that matches your formulation, then narrow the selection by product family and verified technical requirement.</p></div>
      <div className="products-system-grid">{business.productSystems.map((system, index) => <article key={system.slug}><div className="products-system-image"><Image src={systemImages[index]} alt={system.title} fill sizes="(max-width:760px) 100vw, 33vw" /></div><div><span>{system.number}</span><h3>{system.title}</h3><p>{system.description}</p><small>{system.focus.slice(0, 3).join(' · ')}</small><Link href={`/${locale}/products?category=${system.slug}#product-catalog`}>Browse products <ArrowRight size={16} /></Link></div></article>)}</div>
    </div></section>

    <Suspense fallback={<section className="product-catalog-section"><div className="container catalog-loading">Loading product catalog…</div></section>}>
      <ProductCatalog locale={locale} categories={categories} products={products} />
    </Suspense>

    <section className="product-selection-section"><div className="container products-selection-layout">
      <div className="products-selection-image"><Image src="/images/home/refined/why-choose-us.webp" alt="Additive laboratory and technical selection support" fill sizes="(max-width:900px) 100vw, 55vw" /></div>
      <div className="products-selection-copy"><div className="eyebrow dark">Need help selecting?</div><h2>Technical support for additive selection</h2><p>Tell us your base formulation, application, performance objective and destination market. Our team can help identify an appropriate product route.</p><ol>{['Application review', 'Product-family selection', 'Sample & document confirmation', 'Commercial inquiry'].map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></li>)}</ol><Link className="button" href={`/${locale}/contact`}>Discuss your requirements <ArrowRight size={17} /></Link></div>
    </div></section>

    <section className="technical-quality-section"><div className="container"><div className="products-section-head"><div className="eyebrow dark">Technical &amp; quality support</div><h2>Documentation matched to the verified product</h2><p>Documents are supplied according to the verified product, batch and destination-market requirements.</p></div>
      <div className="technical-document-grid">{[[FileText, 'SDS', 'Safety documentation provided where applicable to the confirmed product.'], [FlaskConical, 'TDS', 'Technical data issued according to the verified grade and specification.'], [FileCheck2, 'COA', 'Batch-specific information available according to the supply arrangement.'], [ClipboardCheck, 'Inspection & export documents', 'Documentation coordinated for product and destination requirements.']].map(([Icon, title, copy]) => { const ItemIcon = Icon as typeof FileText; return <article key={String(title)}><ItemIcon size={27} /><h3>{String(title)}</h3><p>{String(copy)}</p></article>; })}</div>
    </div></section>

    <section className="application-discovery-section"><div className="container"><div className="products-section-head"><div className="eyebrow dark">Browse by application</div><h2>Start with the operating environment</h2><p>For buyers who do not yet know the product name, application context provides a practical route into the additive portfolio.</p></div>
      <div className="products-application-grid">{applications.map((application, index) => <article key={application.title}><div><Image src={applicationImages[index]} alt={`${application.title} additive application`} fill sizes="(max-width:760px) 100vw, 33vw" /></div><section><h3>{application.title}</h3><p>{application.description}</p><Link href={`/${locale}/applications`}>Browse application <ArrowRight size={15} /></Link></section></article>)}</div>
    </div></section>

    <section className="products-faq-section"><div className="container products-faq-layout"><div><div className="eyebrow dark">Frequently asked questions</div><h2>Product sourcing, clearly explained</h2><p>Product selection and commercial details are confirmed according to the actual formulation, documentation and destination-market requirements.</p><Link className="button secondary" href={`/${locale}/contact`}>Ask our team</Link></div>
      <div>{[['How do I select the correct additive?', 'Share the fluid system, application, performance objective and destination market so an appropriate product route can be reviewed.'], ['Can you provide samples?', 'Sample availability is confirmed according to the specific product and project requirements.'], ['Are SDS, TDS and COA available?', 'Applicable documents are confirmed for the verified product, batch and destination market.'], ['Can packaging and labels be customized?', 'Packaging, labeling and private-label requirements can be reviewed as part of a qualified project.'], ['What information is required for a quotation?', 'Provide the product or function, application, expected quantity, packaging direction and destination market.'], ['What is the typical lead time?', 'Lead time is confirmed after product, quantity, packaging and destination requirements are reviewed.']].map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
    </div></section>

    <section className="products-final-cta"><Image src="/images/home/refined/export-capability-v2.webp" alt="Reliable additive supply and international logistics" fill sizes="100vw" /><div className="products-final-overlay" /><div className="container"><div className="eyebrow">Product inquiry</div><h2>Tell us what you are formulating</h2><p>Share your application, target performance, product requirement and destination market with our team.</p><div className="actions"><Link className="button" href={`/${locale}/contact`}>Send product inquiry <ArrowRight size={17} /></Link><Link className="button secondary light" href={`/${locale}/service`}>Contact technical support</Link></div></div></section>
  </>;
}
