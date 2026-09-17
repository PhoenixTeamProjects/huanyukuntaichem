import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Beaker, Boxes, Check, ClipboardCheck, Factory, FileCheck2, FlaskConical, Globe2, PackageCheck, Palette, Settings2, ShieldCheck, Tags, Truck } from 'lucide-react';
import { normalizeLocale } from '@/lib/i18n/messages';
import { getBusinessContent } from '@/lib/directus/business';

const overview = [
  [Beaker, 'Technical support', 'Application review, product direction, samples and formulation communication.'],
  [Factory, 'OEM / ODM', 'Development and controlled production support for qualified additive programs.'],
  [Tags, 'Private Label', 'Brand-ready product, label, carton and packaging coordination.'],
  [Globe2, 'Global supply', 'Documents, export execution, logistics and repeat-order communication.'],
] as const;
const packaging = [
  [FlaskConical, 'Product format', 'Packaging matched to the confirmed additive and intended use.'],
  [Palette, 'Label & identity', 'Customer-supplied or coordinated label direction for qualified projects.'],
  [Boxes, 'Carton & industrial pack', 'Outer-carton and industrial options confirmed by product.'],
  [PackageCheck, 'Packing confirmation', 'Final format, marks and shipment requirements reviewed before production.'],
] as const;
const documents = [
  ['SDS', 'Safety documentation supplied where applicable to the verified product.'],
  ['TDS', 'Technical data issued according to the confirmed grade and specification.'],
  ['COA', 'Batch-related information provided according to the supply arrangement.'],
  ['Inspection & export files', 'Applicable inspection and shipment documents coordinated for the destination.'],
];
const faqs = [
  ['Can you support a new formulation?', 'The review starts with the fluid system, application, performance objective and intended market.'],
  ['Do you provide samples?', 'Sample availability and evaluation arrangements are confirmed for the specific product and qualified project.'],
  ['Can packaging and labels be customized?', 'Bottle, label, carton and industrial-packaging directions can be reviewed against the confirmed product.'],
  ['Which documents are available?', 'Applicable SDS, TDS, COA, inspection and export documents are confirmed for the verified supply.'],
  ['What are your MOQ and lead time?', 'MOQ and lead time are confirmed after product, quantity, packaging and destination requirements are reviewed.'],
];

export default async function ServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const business = await getBusinessContent(locale);
  const contact = `/${locale}/contact`;
  return <main className="services-page">
    <section className="services-hero"><Image src="/images/home/refined/why-choose-us.webp" alt="Additive laboratory and technical service support" fill priority sizes="100vw"/><div className="services-hero-overlay"/><div className="services-container services-hero-inner"><div className="eyebrow">Technical &amp; supply services</div><h1>From formulation support to global delivery.</h1><p>Technical confirmation, customization, controlled production and export execution managed as one connected B2B workflow.</p><div className="actions"><Link className="button" href={contact}>Send service inquiry <ArrowRight size={17}/></Link><Link className="button secondary light" href={`/${locale}/applications`}>View applications</Link></div></div></section>

    <section className="services-overview"><div className="services-container"><Header eyebrow="Connected capabilities" title="Support built around the real project." text="One requirement stays connected from technical review through production, documents and delivery." centered/><div className="services-overview-grid">{overview.map(([Icon,title,text])=><article key={title}><Icon size={29}/><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="services-technical services-split"><div className="services-container services-split-inner"><Media src="/images/applications/applications-review.webp" alt="Laboratory technical evaluation of additive samples"/><div className="services-split-copy"><div className="eyebrow dark">Formulation &amp; technical support</div><h2>Start with the application, not a generic product list.</h2><p>We review the fluid system, operating environment, performance direction and market requirement before recommending a route.</p><ul>{business.capabilities.slice(0,5).map(item=><li key={item.title}><Check size={17}/><span><strong>{item.title}</strong>{item.description}</span></li>)}</ul><Link className="button" href={contact}>Discuss your application <ArrowRight size={17}/></Link></div></div></section>

    <section className="services-oem"><Image src="/images/home/refined/oem-odm.webp" alt="Controlled additive production and private-label filling" fill sizes="100vw"/><div className="services-oem-overlay"/><div className="services-container services-oem-inner"><div className="services-oem-copy"><div className="eyebrow">OEM / ODM / Private Label</div><h2>From a confirmed direction to a market-ready program.</h2><p>Customization is managed around verified products, production feasibility and the intended market.</p><div className="services-oem-points">{[[Settings2,'OEM production','Production coordinated around the confirmed product.'],[FlaskConical,'ODM development','Support from application direction to technical confirmation.'],[Tags,'Private Label','Brand, label and packaging coordination.']].map(([Icon,title,text])=>{const I=Icon as typeof Settings2;return <article key={String(title)}><I size={26}/><h3>{String(title)}</h3><p>{String(text)}</p></article>})}</div><Link className="button" href={contact}>Discuss a custom program <ArrowRight size={17}/></Link></div></div></section>

    <section className="services-packaging"><div className="services-container"><Header eyebrow="Packaging customization" title="A coordinated route from product to shipment." text="Packaging is confirmed against the product, production route, brand requirement and destination."/></div><div className="services-packaging-band"><Image src="/images/home/refined/cooperation-private-label.webp" alt="Private-label additive packaging and brand supply" fill sizes="100vw"/><div className="services-packaging-shade"/><div className="services-container services-packaging-grid">{packaging.map(([Icon,title,text])=><article key={title}><Icon size={29}/><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="services-quality"><div className="services-container services-quality-inner"><div className="services-quality-copy"><div className="eyebrow dark">Quality control</div><h2>Controlled quality. Clear traceability.</h2><p>Quality steps stay connected across materials, production, packaging and release.</p><ol>{business.qualityProcess.map((step,index)=><li key={step}><span>{String(index+1).padStart(2,'0')}</span><strong>{step}</strong></li>)}</ol></div><Media className="services-quality-media" src="/images/home/refined/quality-control.webp" alt="Laboratory quality inspection and batch control"/></div></section>

    <section className="services-documents"><div className="services-container"><Header eyebrow="Documentation support" title="Documents matched to the verified supply." text="Availability follows the confirmed product, batch and destination; no document or compliance statement is universal." centered/><div className="services-document-grid">{documents.map(([title,text])=><article key={title}><FileCheck2 size={28}/><h3>{title}</h3><p>{text}</p></article>)}</div><p className="services-compliance"><ShieldCheck size={22}/>{business.complianceNote}</p></div></section>

    <section className="services-delivery services-split"><div className="services-container services-split-inner reverse"><div className="services-split-copy"><div className="eyebrow dark">Global delivery</div><h2>Supply coordination beyond the factory door.</h2><p>Product release, packing, documents and logistics are coordinated as one export workflow.</p><ul>{[[ClipboardCheck,'Order review','Product, quantity, packaging and destination.'],[PackageCheck,'Packing release','Marks, packaging and batch information.'],[FileCheck2,'Document coordination','Applicable technical and export files.'],[Truck,'Logistics communication','Shipment and repeat-order support.']].map(([Icon,title,text])=>{const I=Icon as typeof Truck;return <li key={String(title)}><I size={19}/><span><strong>{String(title)}</strong>{String(text)}</span></li>})}</ul></div><Media src="/images/home/refined/supply-chain.webp" alt="Warehouse and international additive supply coordination"/></div></section>

    <section className="services-process"><div className="services-container"><Header eyebrow="Cooperation process" title="A clear route from requirement to repeat supply." text="Commercial details remain subject to the actual product, project and destination."/><div className="services-process-grid">{business.serviceProcess.slice(0,5).map((step,index)=><article key={step.title}><span>{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></div></section>

    <section className="services-faq"><div className="services-container services-faq-inner"><div className="services-faq-intro"><div className="eyebrow dark">Frequently asked questions</div><h2>Service questions, clearly answered.</h2><p>Start with the application and intended market. Specific details follow the confirmed product route.</p><Link className="button secondary" href={contact}>Ask our team</Link></div><div className="services-faq-list">{faqs.map(([q,a],index)=><details key={q} open={index===0}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></div></section>

    <section className="services-cta"><Image src="/images/home/refined/export-capability-v2.webp" alt="International delivery route for additive supply" fill sizes="100vw"/><div className="services-cta-overlay"/><div className="services-container services-cta-inner"><div className="eyebrow">Start with your requirement</div><h2>Build the right service route from the start.</h2><p>Share the product direction, application, market and packaging requirement with our team.</p><Link className="button" href={contact}>Start a service inquiry <ArrowRight size={17}/></Link></div></section>
  </main>;
}

function Header({eyebrow,title,text,centered=false}:{eyebrow:string;title:string;text:string;centered?:boolean}){return <div className={`services-heading${centered?' centered':''}`}><div className="eyebrow dark">{eyebrow}</div><h2>{title}</h2><p>{text}</p></div>}
function Media({src,alt,className='services-split-media'}:{src:string;alt:string;className?:string}){return <div className={className}><Image src={src} alt={alt} fill sizes="(max-width:900px) 100vw, 55vw"/></div>}
