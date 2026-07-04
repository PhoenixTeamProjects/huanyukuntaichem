import Link from 'next/link';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getNews } from '@/lib/directus/news';

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const articles = await getNews(locale);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{messages.nav.news}</h1>
          <p>{messages.news.intro}</p>
        </div>
        <div className="grid">
          {articles.map((article) => (
            <article className="card" key={article.id}>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <Link className="button secondary" href={`/${locale}/news/${article.slug}`}>
                {messages.cta.readMore}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
