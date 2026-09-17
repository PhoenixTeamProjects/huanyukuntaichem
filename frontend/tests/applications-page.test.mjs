import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/app/[locale]/applications/page.tsx', import.meta.url), 'utf8');

test('applications page contains the approved section architecture', () => {
  const requiredSections = [
    'applications-hero',
    'applications-explorer',
    'applications-onroad',
    'applications-offhighway',
    'applications-industrial',
    'applications-formulation',
    'applications-matrix',
    'applications-review',
    'applications-pathways',
    'applications-process',
    'applications-cta',
  ];
  for (const section of requiredSections) assert.match(source, new RegExp(section));
});

test('applications page exposes all eight verified application routes', () => {
  const requiredApplications = [
    'Passenger vehicles', 'Commercial vehicles', 'Heavy-duty diesel engines',
    'Construction machinery', 'Agricultural engines', 'Industrial machinery',
    'Lubricant manufacturing', 'Automotive aftermarket',
  ];
  for (const application of requiredApplications) assert.match(source, new RegExp(application, 'i'));
});

test('applications page uses the selected scene assets', () => {
  const requiredAssets = [
    'applications-hero.webp', 'applications-onroad.webp',
    'applications-offhighway.webp', 'applications-industrial.webp',
    'applications-formulation.webp', 'applications-cta.webp',
    'applications-review.webp',
  ];
  for (const asset of requiredAssets) assert.match(source, new RegExp(asset.replace('.', '\\.')));
});

test('split application stories use a bounded inner container on large screens', () => {
  const innerContainers = source.match(/applications-story-inner/g) ?? [];
  assert.equal(innerContainers.length, 3);
});

test('split application stories follow the site container width and scene-image scale', () => {
  const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
  assert.match(css, /\.applications-story-inner\s*\{[^}]*width:\s*min\(1200px,\s*calc\(100% - 40px\)\)/s);
  assert.match(css, /\.applications-story-media\s*\{[^}]*min-height:\s*560px/s);
});
