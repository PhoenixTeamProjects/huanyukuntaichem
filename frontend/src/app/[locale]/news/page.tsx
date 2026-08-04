import Link from 'next/link';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getNews } from '@/lib/directus/news';
import InnerPageHero from '@/components/InnerPageHero';

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const articles = await getNews(locale);

  return (
    <>
    <InnerPageHero
      locale={locale}
      eyebrow="Knowledge center"
      title="Additive technology and application guidance"
      summary={messages.news.intro}
      primary={{ href: '/products', label: 'Browse products' }}
      secondary={{ href: '/contact', label: 'Send inquiry' }}
      highlights={['Reviewed technical content', 'Application-oriented guidance', 'Verified information only']}
    />
    <section className="section inner-content-section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow dark">Technical articles</div>
          <h2>Practical additive knowledge</h2>
          <p>Browse reviewed product knowledge, application guidance and company updates.</p>
        </div>
        <div className="grid reference-card-grid">
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
    </>
  );
}
