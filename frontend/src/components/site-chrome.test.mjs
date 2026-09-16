import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const header = readFileSync(new URL('./Header.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('./Footer.tsx', import.meta.url), 'utf8');

test('header follows the approved information-bar, brand, desktop-tools and mobile-menu structure', () => {
  assert.match(header, /header-brand-mark/);
  assert.match(header, /header-tools/);
  assert.match(header, /mobile-nav-toggle/);
  assert.match(header, /mobile-nav-panel/);
  assert.match(header, /settings\.phone/);
  assert.match(header, /settings\.email/);
});

test('footer uses the reference four-column structure without a duplicate CTA', () => {
  assert.match(footer, /footer-brand-mark/);
  assert.match(footer, /footer-link-groups/);
  assert.match(footer, /footer-contact/);
  assert.doesNotMatch(footer, /footer-cta/);
  assert.match(footer, /settings\.phone/);
  assert.match(footer, /settings\.email/);
});
