# Verification: integrate branch (orch/improve-loyly/integrate)

Verifier run capturing execution evidence for the integration of
`content-sections` + `seo-meta-and-tests` into `orch/improve-loyly/integrate`.

## Automated results
- `npm ci` → success (383 packages)
- `npm run lint` → "✔ No ESLint warnings or errors"
- `npm test` → Test Files 10 passed (10); Tests 68 passed (68)
- `npm run build` → exit 0; static pages 8/8; routes include `/`, `/manifest.webmanifest`,
  `/robots.txt`, `/sitemap.xml`, `/api/book`

## Branch integration
- Both upstream branches are ancestors of HEAD (merge commits cd2ca9e, 8c9b784).
- `content-sections IS ancestor`, `seo-meta IS ancestor`.

## Manual / runtime checks (production server on :3100)
- `GET /` → HTTP 200, ~105 KB HTML.
- page.tsx renders 11 sections in funnel order: Hero, ProcessVisual, Problem, Method,
  ProofBand, LocalStrip, Guarantee, Services, HowItWorks, Faq, Booking.
- Free-first-deep-clean offer present in Hero, FAQ, Booking copy.
- layout.tsx twitter card `summary_large_image` present; served DOM has twitter meta.
- `<link rel="manifest" href="/manifest.webmanifest">` present; `GET /manifest.webmanifest` → 200 JSON.
- Footer renders `ABN 00 000 000 000`, legal entity, `$20M public liability` from siteConfig.
- `GET /robots.txt` → `Disallow: /` (staging noindex); layout robots noindex,nofollow.
- `siteConfig.isStaging === true`; ABN placeholder, `sameAs: []` (no fabricated facts).
- `src/components/ui/BeforeAfterCard.tsx` removed; no references in src/.

## PR
- Single draft PR #1 `orch/improve-loyly/integrate` → `main` (isDraft: true).
