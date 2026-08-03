import Link from 'next/link';
import type { Locale } from '@/config/i18n';
import type { ProductCategory } from '@/lib/directus/types';

export default function ProductCategoryMenu({
  locale,
  categories,
  activeSlug
}: {
  locale: Locale;
  categories: ProductCategory[];
  activeSlug?: string;
}) {
  const parents = categories.filter((category) => !category.parent);

  return (
    <aside className="sidebar product-tree" aria-label="Product categories">
      {parents.map((parent) => {
        const children = categories.filter((category) => category.parent === parent.id);

        return (
          <div className="category-group" key={parent.id}>
            <Link
              className={parent.slug === activeSlug ? 'category-parent active' : 'category-parent'}
              href={`/${locale}/products/category/${parent.slug}`}
            >
              {parent.name}
            </Link>
            {children.length ? (
              <div className="category-children">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    className={child.slug === activeSlug ? 'active' : undefined}
                    href={`/${locale}/products/category/${child.slug}`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </aside>
  );
}
