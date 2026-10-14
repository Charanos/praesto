# Local revamp verification · 14 October 2026

The shared design foundations and core usability pass are implemented and locally verified. Section-by-section visual refinement remains available against these foundations. This report describes local evidence; it does not certify clinical content, accessibility conformance or a production deployment.

## Reproducible engineering checks

From `06_Dashboard`, run `npm run check`: strict TypeScript for the new TS/TSX modules, ESLint across the frontend/development bridge, 19 Node tests, 96 pipeline contract assertions and a Vite production build. All passed. Legacy JavaScript is retained with `allowJs`; the repository has not been fully converted to strict TypeScript.

Tests independently verify every 16-bit population count, URL round trips, filter membership, ANY/ALL masks, facet exclusions, pack format, CSV schema/quoting, lazy/deduplicated listing requests with retry, clinical schema/provenance/path validation, pregnancy-category context, local font licenses and semantic contrast. They use the real curated snapshot. The pipeline verification is read-only; no refresh/build pipeline was used to promote staged captures.

`git diff --exit-code -- static/app` passes against the implementation baseline. The curated September snapshot remains 43,606 products / 51,350 listings / 15 sources. Headline stock evidence remains gated to 8 reporting sources; 7 are excluded and 3 absent. Inferred dates stay explicitly qualified.

## Browser evidence

`qa/browser-checks.mjs` runs through the documented Codex browser API. It asserts the actual `innerWidth`, preventing a requested viewport from being mistaken for the active one.

| Coverage | Result / evidence |
|---|---|
| Four routes at 375, 768, 1280 and 1920 CSS pixels | No document overflow; 16 matched final route captures in `evidence/after-{view}-{width}.jpg`; `responsive-metrics.json`. |
| Four routes at 320px | No document overflow; two-dimensional tables retain contained scrolling; `reflow-320.json`. |
| Catalogue workflow at all four main widths | Search, stock/pharmacy filters, sort, virtual-row keyboard focus, advanced facets, local clinical reference, Escape/focus return, empty/reset, Matrix and Charts/List restoration pass. `workflow-*.json` and state screenshots. |
| Phone navigation | Always-dark 52px bottom-right launcher, approximately 16px edge offsets, hidden destinations when collapsed, current-page focus, Home/End/arrows, Escape focus return, outside click and selection dismissal pass. `mobile-navigation.json`, collapsed/open captures. |
| Core routes, 375 and 1280px | Axe reports zero violations in all eight route checks; `axe-mobile.json`, `axe-desktop.json`. |
| Expanded facets, clinical dialog, Matrix, Charts, empty results and source ledger | Axe reports zero violations in sampled phone/desktop states; `axe-states-*.json`. Incomplete contrast assessments remain in the reports, especially SVG/chart and layered content. |
| CSV download | Browser download parsed independently: 458 paracetamol products, 34 columns and matching snapshot search membership; `csv-download.json`. |
| Production failure recovery | Local fixture sends one 503 for products and one for listings. Retry loading and Retry source listings recover; screenshots retained. Development accessibility control absent in production. |
| Design catalogue and data notes | Original glyphs visually inspected at `?v=design`; public `/about.html` headings, caveats and dashboard links verified. |

Keyboard checks cover actual browser interactions, native modal focus containment and return. Token contrast tests include the light glyph on the dark launcher at 17.60:1 and categorical/control marks at ≥3:1 on white. Incomplete axe results were supplemented by token review, direct labels and data alternatives; they are not silently treated as completed automated checks. A real screen-reader session, broader manual WCAG assessment and Lighthouse/field Core Web Vitals measurements were not performed.

## Measurements and boundaries

The final production entry JavaScript is approximately 336.04 kB / 100.19 kB gzip; CSS approximately 61.4 kB / 12.3 kB gzip. The pre-revamp assets were 310.55 kB / 93.00 kB gzip JS and 34.07 kB / 7.68 kB gzip CSS. The increase adds shared shell, typography, responsive states and the clinical boundary. These sizes do not include data payloads or fonts and are not load-time scores.

Self-hosted fonts total 290,672 bytes across eight subset files; the four main Latin faces total 116,832 bytes. No runtime Google Fonts request is required. A representative local filter run measured median 5.97 ms / p95 8.75 ms on this host; this is a local computation sample, not a device-wide responsiveness guarantee. Listing details and clinical text load on demand.

Production excludes the development audit, component catalogue and Vite local-reference bridge. The development clinical reader uses existing local data through exact unique ingredient identity. Production detail requires a configured same-origin endpoint, documented vendor API and licensed display rights. Missing clinical fields and unknown dates remain explicit. No paid Drug Index API has been assumed operational, and no full local monograph archive was newly bundled into production.

New source captures remain staged outside the dashboard pending quality review. No push, PR or deployment was performed. To review locally run `npm run dev`; to undo this revamp, revert its focused commits while preserving independent source captures and working data. Do not regenerate the snapshot as a UI rollback step.
