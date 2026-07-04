import Link from 'next/link';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getProductCategories, getProducts } from '@/lib/directus/products';
import ProductCategoryMenu from '@/components/ProductCategoryMenu';

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const [categories, products] = await Promise.all([getProductCategories(locale), getProducts(locale)]);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{messages.nav.products}</h1>
          <p>{messages.products.intro}</p>
        </div>
        <div className="two-column">
          <ProductCategoryMenu locale={locale} categories={categories} />
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
