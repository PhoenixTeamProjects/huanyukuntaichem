'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const topics = ['All insights', 'Fuel additives', 'Lubricant formulation', 'Additive packages', 'Quality & documentation'];
const articles = [
  { category:'Fuel additives', title:'How fuel additives support cleaner combustion', excerpt:'A practical overview of deposit control, combustion quality and system cleanliness.', image:'/images/home/fuel-additives.webp', slug:'fuel-additives-cleaner-combustion', read:'7 min read' },
  { category:'Lubricant formulation', title:'Choosing the right lubricant additive direction', excerpt:'Start with the base oil, application duty and required performance balance.', image:'/images/home/lubricant-additives.webp', slug:'lubricant-additive-direction', read:'8 min read' },
  { category:'Additive packages', title:'What an additive package does in a formulation', excerpt:'How coordinated components simplify application-oriented formulation development.', image:'/images/home/additive-packages.webp', slug:'additive-package-formulation', read:'6 min read' },
  { category:'Quality & documentation', title:'Understanding TDS, SDS and COA documentation', excerpt:'The role of product, safety and batch documents in a verified B2B supply route.', image:'/images/home/refined/quality-control.webp', slug:'tds-sds-coa-guide', read:'5 min read' },
  { category:'Fuel additives', title:'Additive selection for heavy-duty diesel applications', excerpt:'Operating duty, fuel quality and climate all influence the technical direction.', image:'/images/home/refined/application-heavy-duty.webp', slug:'heavy-duty-diesel-additives', read:'7 min read' },
  { category:'Quality & documentation', title:'From batch control to export delivery', excerpt:'Why inspection, traceability, packaging and documents should remain connected.', image:'/images/home/refined/supply-chain.webp', slug:'batch-control-export-delivery', read:'6 min read' },
  { category:'Lubricant formulation', title:'Low-temperature flow and pour point depressants', excerpt:'What formulators should review when balancing base oil behavior and cold-flow targets.', image:'/images/home/refined/application-industrial-machinery.webp', slug:'pour-point-depressants-low-temperature-flow', read:'6 min read' },
];

export default function NewsHub({ locale }:{ locale:string }) {
  const [activeTopic, setActiveTopic] = useState(topics[0]);
  const filteredArticles = useMemo(() => activeTopic === topics[0] ? articles : articles.filter(article => article.category === activeTopic), [activeTopic]);
  return <>
    <section className="news-topics"><div className="news-container"><div className="news-topics-intro"><div><div className="eyebrow dark">Explore by topic</div><h2>Find the guidance relevant to your work.</h2></div><p>Select a technical direction to filter the latest reviewed insights.</p></div><div className="news-topic-nav" role="tablist" aria-label="News topics">{topics.map(topic => <button type="button" role="tab" aria-selected={activeTopic===topic} className={activeTopic===topic?'active':''} onClick={()=>setActiveTopic(topic)} key={topic}><span>{topic}</span><b>{topic===topics[0]?articles.length:articles.filter(article=>article.category===topic).length}</b></button>)}</div></div></section>
    <section className="news-latest" id="latest-insights"><div className="news-container"><div className="news-section-head"><div><div className="eyebrow dark">Latest insights</div><h2>{activeTopic}</h2></div><p>{filteredArticles.length} reviewed {filteredArticles.length===1?'article':'articles'} in this direction.</p></div><div className="news-article-grid">{filteredArticles.map((article,index)=><article className={index===0&&activeTopic==='All insights'?'wide':''} key={article.slug}><div className="news-card-media"><Image src={article.image} alt={article.title} fill unoptimized loading="eager" sizes={index===0?'(max-width:760px) 100vw, 58vw':'(max-width:760px) 100vw, 33vw'}/></div><div className="news-card-copy"><div className="news-card-meta"><span>{article.category}</span><small>{article.read}</small></div><h3>{article.title}</h3><p>{article.excerpt}</p><Link href={`/${locale}/news/${article.slug}`}>Read article <ArrowRight size={15}/></Link></div></article>)}</div></div></section>
  </>;
}
