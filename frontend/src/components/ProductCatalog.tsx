'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, FileText, Search, SlidersHorizontal } from 'lucide-react';
import type { Locale } from '@/config/i18n';
import type { Product, ProductCategory } from '@/lib/directus/types';

const PRODUCTS_PER_PAGE = 20;
const productFallbackImages = [
  '/images/home/refined/featured-clear.webp',
  '/images/home/refined/featured-amber.webp',
  '/images/home/fuel-additives-light.webp',
  '/images/home/lubricant-additives-light.webp',
  '/images/home/additive-packages-light.webp'
];

export default function ProductCatalog({ locale, categories, products }: { locale: Locale; categories: ProductCategory[]; products: Product[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? 'all';
  const query = searchParams.get('q') ?? '';
  const requestedPage = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const parents = categories.filter((category) => !category.parent);

  const descendants = (rootId: string) => {
    const ids = new Set([rootId]);
    let grew = true;
    while (grew) {
      grew = false;
      categories.forEach((category) => {
        if (category.parent && ids.has(category.parent) && !ids.has(category.id)) { ids.add(category.id); grew = true; }
      });
    }
    return ids;
  };

  const categoryCounts = Object.fromEntries(categories.map((category) => [category.slug, products.filter((product) => product.category && descendants(category.id).has(product.category)).length]));
  const active = categories.find((category) => category.slug === activeCategory);
  const allowedCategoryIds = active ? descendants(active.id) : null;
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const inCategory = !allowedCategoryIds || (!!product.category && allowedCategoryIds.has(product.category));
    const searchable = [product.name, product.summary, product.description, ...(product.applications ?? [])].filter(Boolean).join(' ').toLowerCase();
    return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const visibleProducts = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    router.push(`/${locale}/products${params.size ? `?${params}` : ''}`, { scroll: false });
  };

  const selectCategory = (slug: string) => updateParams({ category: slug === 'all' ? null : slug, page: null });
  const productCategoryName = (product: Product) => categories.find((category) => category.id === product.category)?.name ?? 'Additive technology';

  return (
    <section className="product-catalog-section" id="product-catalog">
      <div className="container">
        <div className="catalog-section-heading">
          <div>
            <div className="eyebrow dark">Product catalog</div>
            <h2>Browse products and filter by category</h2>
            <p>Use the category tree to identify a product family, then review its technical direction or send your requirements for selection support.</p>
          </div>
          <span>{parents.length} core product systems</span>
        </div>

        <div className="catalog-mobile-controls">
          <label><SlidersHorizontal size={18} /> Category<select value={activeCategory} onChange={(event) => selectCategory(event.target.value)}><option value="all">All products</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select><ChevronDown size={17} /></label>
        </div>

        <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-label="Product categories">
            <div className="catalog-sidebar-head"><strong>Product Categories</strong><span>Filter by additive system and product family.</span></div>
            <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => selectCategory('all')}><span>All Products</span><b>{products.length}</b></button>
            <div className="catalog-category-tree">
              {parents.map((parent) => {
                const children = categories.filter((category) => category.parent === parent.id);
                const parentActive = parent.slug === activeCategory || children.some((child) => child.slug === activeCategory);
                return <div className={parentActive ? 'catalog-category-group open' : 'catalog-category-group'} key={parent.id}>
                  <button className={parent.slug === activeCategory ? 'active' : ''} onClick={() => selectCategory(parent.slug)}><span><ChevronRight size={15} />{parent.name}</span><b>{categoryCounts[parent.slug]}</b></button>
                  <div className="catalog-children">{children.map((child) => <button className={child.slug === activeCategory ? 'active' : ''} key={child.id} onClick={() => selectCategory(child.slug)}><span>{child.name}</span><b>{categoryCounts[child.slug]}</b></button>)}</div>
                </div>;
              })}
            </div>
          </aside>

          <div className="catalog-results">
            <div className="catalog-results-bar">
              <div><span>Showing</span><h3>{active?.name ?? 'All Products'}</h3></div>
              <form onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('search')?.toString() ?? ''; updateParams({ q: value || null, page: null }); }}>
                <Search size={18} /><input name="search" defaultValue={query} placeholder="Search by product name or application..." /><button type="submit">Search</button>
              </form>
              <strong>{filtered.length} {filtered.length === 1 ? 'product' : 'products'}</strong>
            </div>

            {visibleProducts.length ? <div className="catalog-product-grid">
              {visibleProducts.map((product, index) => (
                <article className="catalog-product-card" key={product.id}>
                  <div className="catalog-product-image"><span>PRODUCT FAMILY</span><Image src={product.image || productFallbackImages[index % productFallbackImages.length]} alt={product.imageAlt || product.name || 'Additive product family'} fill sizes="(max-width:760px) 100vw, (max-width:1180px) 33vw, 240px" /></div>
                  <div className="catalog-product-copy">
                    <small>{productCategoryName(product)}</small><h3>{product.name}</h3><p>{product.summary}</p>
                    <div className="catalog-product-meta"><FileText size={15} /><span>Technical information confirmed by product and market.</span></div>
                    <div className="catalog-product-actions"><Link href={`/${locale}/products/${product.slug}`}>View Details</Link><Link href={`/${locale}/contact?product=${product.slug}`}>Request Information <ArrowRight size={15} /></Link></div>
                  </div>
                </article>
              ))}
            </div> : <div className="catalog-empty"><Search size={30} /><h3>No matching products</h3><p>Try another category or remove the search term.</p><button onClick={() => updateParams({ category: null, q: null, page: null })}>Clear filters</button></div>}

            {totalPages > 1 ? <nav className="catalog-pagination" aria-label="Product pages">
              <button disabled={page === 1} onClick={() => updateParams({ page: String(page - 1) })}><ArrowLeft size={16} /> Previous</button>
              <div>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button className={number === page ? 'active' : ''} key={number} onClick={() => updateParams({ page: String(number) })}>{number}</button>)}</div>
              <button disabled={page === totalPages} onClick={() => updateParams({ page: String(page + 1) })}>Next <ArrowRight size={16} /></button>
            </nav> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
