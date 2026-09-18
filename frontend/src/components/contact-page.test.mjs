import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../app/[locale]/contact/page.tsx', import.meta.url), 'utf8');
const form = readFileSync(new URL('./InquiryForm.tsx', import.meta.url), 'utf8');
const fallback = readFileSync(new URL('../lib/directus/fallback-data.ts', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('contact page uses the approved international contact details', () => {
  assert.match(page, /\+86 181 8260 2513/);
  assert.match(page, /No\. 66 Dongqi Road, Xincheng District, Xi[’']an, Shaanxi, China/);
  assert.doesNotMatch(page, /陕西省西安市新城区东七路66号/);
});

test('contact inquiry form includes customer email and international context fields', () => {
  assert.match(form, /name="email"/);
  assert.match(form, /name="country"/);
  assert.match(form, /name="productInterest"/);
  assert.match(form, /\+86 181 8260 2513/);
});

test('public fallback settings use international phone and the verified English address', () => {
  assert.match(fallback, /phone: '\+86 181 8260 2513'/);
  assert.match(fallback, /address: 'No\. 66 Dongqi Road, Xincheng District, Xi[’']an, Shaanxi, China'/);
});

test('contact sections use the approved balanced vertical rhythm', () => {
  assert.match(styles, /\.contact-help\{padding:52px 0/);
  assert.match(styles, /\.contact-inquiry\{padding:52px 0 16px/);
  assert.match(styles, /\.contact-process\{padding:56px 0/);
  assert.match(styles, /\.contact-location\{padding:56px 0/);
});
