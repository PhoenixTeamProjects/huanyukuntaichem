import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/app/[locale]/news/page.tsx', import.meta.url), 'utf8');
const hub = readFileSync(new URL('../src/components/NewsHub.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const fallback = readFileSync(new URL('../src/lib/directus/fallback-data.ts', import.meta.url), 'utf8');
const detail = readFileSync(new URL('../src/app/[locale]/news/[slug]/page.tsx', import.meta.url), 'utf8');

test('news page follows the approved knowledge-center architecture', () => {
  for (const section of ['news-hero', 'news-featured', 'news-topics', 'news-latest', 'news-application-focus', 'news-guide', 'news-resources', 'news-company', 'news-inquiry']) {
    assert.match(`${page}\n${hub}`, new RegExp(section));
  }
});

test('page depth comes from distinct application and resource sections', () => {
  assert.match(page, /Fuel quality/);
  assert.match(page, /Operating duty/);
  assert.match(page, /Climate conditions/);
  assert.match(page, /Product selection guide/);
  assert.match(page, /TDS \/ SDS \/ COA explained/);
});

test('topic navigation controls the article collection', () => {
  assert.match(hub, /useState/);
  assert.match(hub, /setActiveTopic/);
  assert.match(hub, /filteredArticles/);
  assert.match(hub, /All insights/);
});

test('featured article is followed by a complete six-card grid', () => {
  const articleEntries = hub.match(/\{ category:/g) ?? [];
  assert.equal(articleEntries.length, 7);
});

test('design uses a 1200px grid and responsive article layouts', () => {
  assert.match(css, /\.news-container\s*\{[^}]*1200px/s);
  assert.match(css, /\.news-article-grid/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
});

test('conversion section is a technical inquiry rather than a newsletter', () => {
  assert.match(page, /Technical \/ Product Inquiry/);
  assert.doesNotMatch(page, /Newsletter/i);
});

test('every visible sample article has a fallback detail entry', () => {
  for (const slug of [
    'choosing-the-right-additive-direction', 'fuel-additives-cleaner-combustion',
    'lubricant-additive-direction', 'additive-package-formulation', 'tds-sds-coa-guide',
    'heavy-duty-diesel-additives', 'batch-control-export-delivery',
    'pour-point-depressants-low-temperature-flow', 'batch-traceability-additive-supply',
    'export-delivery-coordination'
  ]) assert.match(fallback, new RegExp(`news\\('${slug}'`));
});

test('article detail page uses the knowledge-center visual structure', () => {
  assert.match(detail, /news-detail-hero/);
  assert.match(detail, /article\.image/);
  assert.match(detail, /news-detail-body/);
  assert.match(detail, /Technical \/ Product Inquiry/);
});
