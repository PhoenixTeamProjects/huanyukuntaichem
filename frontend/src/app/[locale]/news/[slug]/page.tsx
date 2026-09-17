import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getNewsBySlug } from '@/lib/directus/news';
import InquiryForm from '@/components/InquiryForm';

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const article = await getNewsBySlug(locale, slug);

  if (!article) notFound();
  const paragraphs = (article.content ?? '').split(/\n\n+/).filter(Boolean);

  return <>
    <section className="news-detail-hero">
      {article.image && <Image src={article.image} alt={article.imageAlt ?? article.title ?? 'Technical article'} fill priority sizes="100vw"/>}
      <div className="news-detail-overlay"/>
      <div className="news-container news-detail-hero-inner"><Link href={`/${locale}/news`}><ArrowLeft size={16}/> Knowledge center</Link><div className="eyebrow">{article.category ?? 'Technical insight'}</div><h1>{article.title}</h1><p>{article.excerpt}</p><div className="news-detail-meta"><span>Reviewed technical content</span><span>Application-oriented guidance</span></div></div>
    </section>

    <section className="news-detail-body"><div className="news-container news-detail-layout"><article><div className="eyebrow dark">Technical overview</div>{paragraphs.map((paragraph,index)=><p className={index===0?'lead':''} key={paragraph}>{paragraph}</p>)}<aside><CheckCircle2 size={23}/><p>Published content provides general technical direction. Final product, dosage, specification and compliance details require confirmation against the actual application.</p></aside></article><nav><span>In this article</span><a href="#technical-inquiry">Technical inquiry</a><Link href={`/${locale}/products`}>Browse products</Link><Link href={`/${locale}/applications`}>View applications</Link></nav></div></section>

    <section className="news-detail-inquiry" id="technical-inquiry"><div className="news-container"><div className="news-detail-inquiry-head"><div><div className="eyebrow dark">Technical / Product Inquiry</div><h2>Apply this guidance to your requirement.</h2></div><div><p>{messages.contact.intro}</p><Link href={`/${locale}/contact`}>Open contact page <ArrowRight size={15}/></Link></div></div><InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/news/${article.slug}`}/></div></section>
  </>;
}
