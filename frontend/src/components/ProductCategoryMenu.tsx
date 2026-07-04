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
  return (
    <aside className="sidebar">
      <div className="list">
        {categories.map((category) => (
          <Link
            key={category.id}
            className={category.slug === activeSlug ? 'button secondary' : undefined}
            href={`/${locale}/products/category/${category.slug}`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}
