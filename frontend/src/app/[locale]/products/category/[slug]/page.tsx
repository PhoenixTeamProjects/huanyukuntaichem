import Link from 'next/link';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getProductCategories, getProductsByCategory } from '@/lib/directus/products';
import ProductCategoryMenu from '@/components/ProductCategoryMenu';

export default async function ProductCategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const [categories, products] = await Promise.all([
    getProductCategories(locale),
    getProductsByCategory(locale, slug)
  ]);
  const category = categories.find((item) => item.slug === slug);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{category?.name ?? messages.nav.products}</h1>
          <p>{category?.description ?? messages.products.intro}</p>
        </div>
        <div className="two-column">
          <ProductCategoryMenu locale={locale} categories={categories} activeSlug={slug} />
          <div className="grid">
            {products.map((product) => (
              <article className="card" key={product.id}>
                <h2>{product.name}</h2>
                <p>{product.summary}</p>
                <Link className="button secondary" href={`/${locale}/products/${product.slug}`}>
                  {messages.cta.viewDetails}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
