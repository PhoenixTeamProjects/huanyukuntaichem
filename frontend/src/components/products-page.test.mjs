import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/[locale]/products/page.tsx', import.meta.url), 'utf8');
const catalogPath = new URL('./ProductCatalog.tsx', import.meta.url);
let catalog = '';
try { catalog = readFileSync(catalogPath, 'utf8'); } catch {}

test('products page contains the approved B2B section sequence', () => {
  const renderedSources = `${page}\n${catalog}`;
  const required = [
    'products-hero', 'product-systems-section', 'product-catalog-section',
    'product-selection-section', 'technical-quality-section',
    'application-discovery-section', 'products-faq-section', 'products-final-cta'
  ];
  required.forEach((className) => assert.match(renderedSources, new RegExp(className)));
});

test('catalog implements category-linked search, counts and pagination', () => {
  assert.match(catalog, /useSearchParams/);
  assert.match(catalog, /categoryCounts/);
  assert.match(catalog, /PRODUCTS_PER_PAGE\s*=\s*20/);
  assert.match(catalog, /catalog-product-grid/);
  assert.match(catalog, /Request Information/);
  assert.match(catalog, /router\.push/);
});

test('URL-driven catalog is rendered inside a suspense boundary', () => {
  assert.match(page, /import \{ Suspense \} from 'react'/);
  assert.match(page, /<Suspense[\s\S]*<ProductCatalog[\s\S]*<\/Suspense>/);
});

test('catalog avoids automotive-parts and retail purchasing language', () => {
  assert.doesNotMatch(`${page}\n${catalog}`, /OE Number|VIN|Truck Parts|Shopping Cart|Buy Now/i);
});
