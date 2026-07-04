import { notFound } from 'next/navigation';
import { normalizeLocale, getMessages } from '@/lib/i18n/messages';
import { getNewsBySlug } from '@/lib/directus/news';
import InquiryForm from '@/components/InquiryForm';

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam);
  const messages = getMessages(locale);
  const article = await getNewsBySlug(locale, slug);

  if (!article) {
    notFound();
  }

  return (
    <section className="section">
      <div className="container">
        <article className="card">
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <p>{article.content}</p>
        </article>
        <div className="section-head" style={{ marginTop: 40 }}>
          <h2>{messages.cta.sendInquiry}</h2>
          <p>{messages.contact.intro}</p>
        </div>
        <InquiryForm locale={locale} messages={messages} sourcePath={`/${locale}/news/${article.slug}`} />
      </div>
    </section>
  );
}
