import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, FileText, FlaskConical, MapPin, MessageCircle, Phone, Settings, Tags } from 'lucide-react';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import InquiryForm from '@/components/InquiryForm';

const publicPhone = '+86 181 8260 2513';
const phoneHref = 'tel:+8618182602513';
const whatsappHref = 'https://wa.me/8618182602513';
const address = 'No. 66 Dongqi Road, Xincheng District, Xi’an, Shaanxi, China';

const pathways = [
  [FlaskConical, 'Product inquiry', 'Find the right additive direction for your application.'],
  [Settings, 'Technical support', 'Discuss formulation, application and operating conditions.'],
  [Tags, 'OEM / Private label', 'Develop a customized supply and packaging route.'],
  [FileText, 'Export & documentation', 'Align destination-market and document requirements.']
] as const;

const checklist = [
  'Application — fuel, lubricant or intended end use',
  'Target performance or technical direction',
  'Current product or formulation, if applicable',
  'Expected volume and destination market',
  'OEM, packaging or documentation requirements'
];

const process = [
  ['Requirement review', 'We review the application, target and key operating conditions.'],
  ['Technical confirmation', 'The product direction is evaluated against the shared requirement.'],
  ['Commercial response', 'Supply, packaging and commercial details are confirmed per inquiry.'],
  ['Sample / order coordination', 'Samples or order execution proceed after the route is agreed.']
];

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);

  return <>
    <section className="contact-hero">
      <Image src="/images/contact/contact-hero.png" alt="Additive specialists reviewing an application requirement" fill priority sizes="100vw" />
      <div className="contact-hero-overlay" />
      <div className="contact-container contact-hero-inner">
        <div className="eyebrow">Contact &amp; inquiry</div>
        <h1>Build the right additive solution from a clear requirement.</h1>
        <p>Share your application, technical direction, packaging and destination requirements so our team can review the appropriate route.</p>
        <div className="actions">
          <Link className="button" href="#inquiry-form">Send your inquiry <ArrowRight size={17} /></Link>
          <a className="button secondary light" href={phoneHref}><Phone size={17} /> Call {publicPhone}</a>
        </div>
      </div>
    </section>

    <section className="contact-direct" aria-label="Direct contact methods">
      <div className="contact-container contact-direct-grid">
        <a href={phoneHref}><Phone size={25} /><span><small>Phone</small><strong>{publicPhone}</strong></span></a>
        <a href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={25} /><span><small>WhatsApp</small><strong>{publicPhone}</strong></span></a>
        <div><MessageCircle size={25} /><span><small>WeChat</small><strong>{publicPhone}</strong></span></div>
        <div><MapPin size={25} /><span><small>Address</small><strong>Xi’an, Shaanxi, China</strong></span></div>
      </div>
    </section>

    <section className="contact-help">
      <div className="contact-container">
        <div className="contact-section-head centered"><div className="eyebrow dark">How we can help</div><h2>Start with the application. We’ll help define the route.</h2></div>
        <div className="contact-pathways">{pathways.map(([Icon, title, text]) => <article key={title}><Icon size={30} /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </div>
    </section>

    <section className="contact-inquiry" id="inquiry-form">
      <div className="contact-container contact-inquiry-grid">
        <div className="contact-inquiry-visual">
          <div className="contact-inquiry-image"><Image src="/images/contact/contact-inquiry-lab.png" alt="Additive specialist preparing a laboratory sample" fill sizes="(max-width: 900px) 100vw, 44vw" /></div>
          <div className="contact-inquiry-checklist"><h3>A useful inquiry includes</h3><ul>{checklist.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul></div>
        </div>
        <div className="contact-form-panel">
          <div className="eyebrow dark">Start your inquiry</div>
          <h2>Discuss your requirement</h2>
          <p>Tell us about the application and the result you need. Our team will review the information before confirming a product or development route.</p>
          <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/contact`} variant="contact" />
        </div>
      </div>
    </section>

    <section className="contact-process">
      <div className="contact-process-overlay" />
      <div className="contact-container contact-process-inner">
        <div className="eyebrow">Our working process</div><h2>From your requirement to a practical solution.</h2>
        <div className="contact-process-grid">{process.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p>{index < 3 ? <ArrowRight size={19} /> : null}</article>)}</div>
      </div>
    </section>

    <section className="contact-location">
      <div className="contact-container contact-location-grid">
        <div className="contact-location-copy">
          <div className="eyebrow dark">Our location</div><h2>Visit or contact our Xi’an team.</h2><p>Share your additive requirement with our team through the channel that is most convenient for you.</p>
          <address>
            <div><MapPin size={21} /><span>{address}</span></div>
            <a href={phoneHref}><Phone size={20} /><strong>{publicPhone}</strong><small>Phone</small></a>
            <a href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={20} /><strong>{publicPhone}</strong><small>WhatsApp</small></a>
            <div><MessageCircle size={20} /><strong>{publicPhone}</strong><small>WeChat</small></div>
          </address>
        </div>
        <div className="contact-location-image"><Image src="/images/contact/contact-xian.png" alt="Xi’an city at blue hour" fill sizes="(max-width: 900px) 100vw, 55vw" /></div>
      </div>
    </section>

    <section className="contact-cta">
      <Image src="/images/contact/contact-cta.png" alt="Industrial additive production and supply environment" fill sizes="100vw" />
      <div className="contact-cta-overlay" />
      <div className="contact-container contact-cta-inner">
        <div className="eyebrow">Let’s start a conversation</div><h2>Ready to discuss your additive requirement?</h2><p>Share the application, target performance and market context so the next step starts with clear information.</p>
        <div className="actions"><Link className="button" href="#inquiry-form">Start your inquiry <ArrowRight size={17} /></Link><a className="button secondary light" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp {publicPhone}</a></div>
      </div>
    </section>
  </>;
}
