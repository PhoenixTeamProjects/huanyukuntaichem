import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getProductCategories, getProducts } from '@/lib/directus/products';
import { getBusinessContent } from '@/lib/directus/business';
import ProductCategoryMenu from '@/components/ProductCategoryMenu';

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const [categories, products, business] = await Promise.all([
    getProductCategories(locale),
    getProducts(locale),
    getBusinessContent(locale)
  ]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Product systems</div>
          <h1>Fuel & lubricant additive portfolio</h1>
          <p>Explore three clearly separated systems for fuel treatment, functional lubricant additives and lubricant additive packages.</p>
        </div>
      </section>
      <section className="section">
        <div className="container two-column product-layout">
          <ProductCategoryMenu locale={locale} categories={categories} />
          <div>
            <div className="product-system-grid product-overview">
              {business.productSystems.map((system) => (
                <article className="system-card" key={system.number}>
                  <span className="system-number">{system.number}</span>
                  <h2>{system.title}</h2>
                  <p>{system.description}</p>
                  <Link className="text-link" href={`/${locale}/products/category/${system.slug}`}>
                    Browse system <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
            <div className="section-head subsection-head">
              <h2>Product families</h2>
              <p>Browse verified product families. Exact grades, performance data, dosage and commercial specifications are published only when supporting product documents are available.</p>
            </div>
            <div className="grid product-grid">
              {products.map((item) => (
                <article className="card product-card" key={item.id}>
                  <span className="card-kicker">Technical product family</span>
                  <h3>{item.name}</h3>
                  <p>{item.summary}</p>
                  <Link className="text-link" href={`/${locale}/products/${item.slug}`}>
                    {messages.cta.viewDetails} <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
