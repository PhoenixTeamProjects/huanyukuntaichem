import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/app/[locale]/service/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const businessSource = readFileSync(new URL('../src/lib/directus/business.ts', import.meta.url), 'utf8');

test('services page contains the approved B2B service architecture', () => {
  const requiredSections = [
    'services-hero',
    'services-overview',
    'services-technical',
    'services-oem',
    'services-packaging',
    'services-quality',
    'services-documents',
    'services-delivery',
    'services-process',
    'services-faq',
    'services-cta',
  ];
  for (const section of requiredSections) assert.match(source, new RegExp(section));
});

test('services page uses verified service language and distinct scene assets', () => {
  for (const phrase of ['Formula development', 'OEM / ODM / Private Label', 'Quality & batch control', 'SDS', 'TDS', 'COA']) {
    assert.match(`${source}\n${businessSource}`, new RegExp(phrase.replaceAll('/', '\\/'), 'i'));
  }
  const assets = source.match(/\/images\/[a-z0-9/_-]+\.webp/g) ?? [];
  assert.ok(new Set(assets).size >= 6);
});

test('packaging uses a dedicated band instead of another split layout', () => {
  assert.match(source, /services-packaging-band/);
  assert.doesNotMatch(source, /services-packaging[^\n]*services-split/);
});

test('services content follows the 1200px site grid', () => {
  assert.match(css, /\.services-container\s*\{[^}]*width:\s*min\(1200px,\s*calc\(100% - 40px\)\)/s);
});
