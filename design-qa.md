# Homepage Design QA

- Front-half visual source: `C:/Users/phoenix/AppData/Local/Temp/codex-clipboard-da3614f1-5286-4b4c-89d2-4c7b792115b6.png`
- Back-half visual source: `C:/Users/phoenix/AppData/Local/Temp/codex-clipboard-4c4bec53-d7f3-490f-b917-c0bfd25622e6.png`
- Final full-page capture: `output/home-balanced-spacing-loaded-final.png`
- Hero detail capture: `output/hero-design-match.png`
- Mobile detail capture: `output/home-mobile-final.png`
- Desktop viewport: 1440 × 900 CSS px
- Tablet viewport: 900 × 900 CSS px
- Mobile viewport: 390 × 844 CSS px
- State: English homepage

## Final visual review

The user-provided long screenshot exposed a P1 rendering defect: the major below-the-fold images were blank in a fresh full-page capture. The cause was Next.js default lazy loading; those images had no `currentSrc` until the browser physically scrolled near them. The major Split images, Export background and Final CTA background now load eagerly.

- Structure: header and footer are preserved. Every approved homepage module remains in the requested order and every primary business module is an independent section.
- Hero: dedicated laboratory hero now matches the design direction with a scientist on the right, a quiet dark text area on the left, and four proof points below.
- Typography: desktop major-section H2 headings render at 48px; mobile major-section H2 headings render at 34px. Eyebrow, H2, description and content hierarchy is consistent.
- Major visual scale: Why Choose Us 580px, Who We Serve 540px, Quality Control 580px, Supply Chain 580px, and OEM/ODM 540px on desktop.
- Spacing: standard desktop sections use 92px vertical padding; major Split sections use 104px; FAQ uses 84px; Knowledge Center uses 92px.
- Rhythm: white, pale brand blue, neutral and deep-navy sections alternate, while split layouts, large visual features and card grids provide clear section boundaries.
- Imagery: Hero, applications, cooperation scenarios and major split sections use project-local, non-repeated imagery. Important subjects remain visible through section-specific sizing and positioning.
- Responsive behavior: tablet and mobile switch split layouts to one column. Mobile width is 390px with a 390px document width, so no horizontal overflow is present. Major mobile images render at 420px.
- Copy: company and product claims stay within the project memory and current confirmed scope; no unsupported performance metrics were introduced.
- Runtime: browser console has zero errors. ESLint and the production Next.js build both pass.
- Full-page rendering: after a fresh navigation, all five major Split images and both full-width background images report `loading: eager`, `complete: true`, a non-zero `naturalWidth`, and a populated `currentSrc` before the screenshot is taken.
- Export Capability: replaced with a dedicated blue-hour ship/crane/truck scene matching the approved reference composition. Desktop section height is 580px, content begins 80px from the top, and the 46px H2 renders on one line; tablet remains one line and mobile wraps safely without overflow.
- Image delivery: 21 generated PNG assets were converted to high-quality WebP. Their combined project payload is about 3.97MB, and every major visual reports a completed non-zero-width load in a fresh full-page test.

## Verification

- [x] Front half checked against the first approved design.
- [x] Back half checked against the detailed second design.
- [x] Header and footer left structurally unchanged.
- [x] Section order preserved.
- [x] Major image heights meet the requested desktop minimums.
- [x] FAQ and Knowledge Center retain full independent spacing.
- [x] Desktop, tablet and mobile checked for scale and overflow.
- [x] Fresh full-page capture checked for blank below-the-fold visual anchors.
- [x] ESLint passed.
- [x] Production build passed.

final result: passed
