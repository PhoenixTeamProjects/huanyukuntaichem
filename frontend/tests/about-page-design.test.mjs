import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../src/app/[locale]/about/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');

test('about page follows the approved company-story architecture', () => {
  for (const section of ['about-hero', 'about-profile', 'about-facts', 'about-focus', 'about-capabilities', 'about-process', 'about-quality', 'about-global', 'about-principles', 'about-cta']) {
    assert.match(page, new RegExp(section));
  }
});

test('about page uses only confirmed headline facts', () => {
  assert.match(page, /Since 2008/);
  assert.match(page, /3 Product Systems/);
  assert.match(page, /B2B Industrial Supply/);
  assert.match(page, /OEM \/ ODM \/ Private Label/);
  assert.doesNotMatch(page, /countries|employees|tons|patents/i);
});

test('about page preserves the 1200px site grid and large visual sections', () => {
  assert.match(css, /\.about-container\s*\{[^}]*1200px/s);
  assert.match(css, /\.about-quality-media/);
  assert.match(css, /\.about-global-media/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
});

test('working principles include the verified-information rule', () => {
  assert.match(page, /Verified Information/);
  assert.match(page, /Unverified product data, certificates and commercial claims remain unpublished/);
});

test('about page uses the dedicated HYKT visual suite', () => {
  for (const image of ['about-hero-hykt.webp', 'about-lab-team-hykt.webp', 'about-production-hykt.webp', 'about-global-supply-hykt.webp']) {
    assert.match(page, new RegExp(image));
  }
});
