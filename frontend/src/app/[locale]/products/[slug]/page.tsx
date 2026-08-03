import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, FileCheck2 } from 'lucide-react';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getProductBySlug } from '@/lib/directus/products';
import InquiryForm from '@/components/InquiryForm';

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const product = await getProductBySlug(locale, slug);

  if (!product) notFound();

  return (
    <>
      <section className="page-hero product-hero">
        <div className="container">
          <Link className="back-link" href={`/${locale}/products`}><ArrowLeft size={16} /> All products</Link>
          <div className="eyebrow">Huanyu Kuntai Chem product family</div>
          <h1>{product.name}</h1>
          <p>{product.summary}</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail-grid">
          <article>
            <div className="section-head">
              <h2>Product scope</h2>
              <p>{product.description}</p>
            </div>
            {product.highlights?.length ? (
              <div className="detail-card">
                <h3>Available directions</h3>
                <ul className="feature-list">
                  {product.highlights.map((item) => <li key={item}><CheckCircle2 size={18} />{item}</li>)}
                </ul>
              </div>
            ) : null}
            {product.applications?.length ? (
              <div className="detail-card">
                <h3>Typical application areas</h3>
                <div className="tag-list">{product.applications.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            ) : null}
          </article>
          <aside className="technical-note">
            <FileCheck2 size={28} />
            <h2>Technical confirmation first</h2>
            <p>Exact grade, dosage, specification, packaging, SDS, TDS, COA and compliance documents depend on the verified product and destination market.</p>
            <p>No unsupported technical data or universal certification claim is published.</p>
          </aside>
        </div>
      </section>
      <section className="section inquiry-section">
        <div className="container inquiry-layout">
          <div>
            <div className="eyebrow">Product inquiry</div>
            <h2>Discuss {product.name}</h2>
            <p>Tell us the intended application, target market, required performance direction and packaging requirement.</p>
          </div>
          <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/products/${product.slug}`} productSlug={product.slug} />
        </div>
      </section>
    </>
  );
}
