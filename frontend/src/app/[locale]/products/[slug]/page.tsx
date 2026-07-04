import { notFound } from 'next/navigation';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getProductBySlug } from '@/lib/directus/products';
import InquiryForm from '@/components/InquiryForm';

export default async function ProductDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const product = await getProductBySlug(locale, slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{product.name}</h1>
          <p>{product.summary}</p>
        </div>
        <article className="card">
          <p>{product.description}</p>
        </article>
        <div className="section-head" style={{ marginTop: 40 }}>
          <h2>{messages.cta.sendInquiry}</h2>
          <p>{messages.contact.intro}</p>
        </div>
        <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/products/${product.slug}`} productSlug={product.slug} />
      </div>
    </section>
  );
}
