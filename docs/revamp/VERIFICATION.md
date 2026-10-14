# Local revamp verification · 14 October 2026

The shared foundations, section revamp and engineering hardening are implemented and locally verified. See [Phases 3–6](PHASE_3_6.md) for the later section work, data-grain corrections and worker architecture. This report describes local evidence; it does not certify clinical content, accessibility conformance or a production deployment.

## Reproducible engineering checks

From `06_Dashboard`, run `npm run check`: strict TypeScript and scoped Prettier for TS/TSX modules, ESLint across the frontend/development bridge, 23 Node tests, 96 pipeline contract assertions and a Vite production build. All passed. Legacy JavaScript and the worker transport remain JavaScript; the repository has not been fully converted to strict TypeScript.

Tests independently verify every 16-bit population count, URL round trips, filter membership, ANY/ALL masks, facet exclusions, pack format, CSV schema/quoting, lazy/deduplicated listing requests with retry, clinical schema/provenance/path validation, pregnancy-category context, local font licenses and semantic contrast. They use the real curated snapshot. The pipeline verification is read-only; no refresh/build pipeline was used to promote staged captures.

`git diff --exit-code cdb1f9e -- static/app` passes against the implementation baseline. The curated September snapshot remains 43,606 products / 51,350 listings / 15 sources. Headline stock evidence remains gated to 8 reporting sources; 7 are excluded and 3 absent. Inferred dates stay explicitly qualified.

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

Keyboard checks cover actual browser interactions, native modal focus containment and return. Token contrast tests include the light glyph on the dark launcher at 17.60:1 and categorical/control marks at ≥3:1 on white. Incomplete axe results were supplemented by token review, direct labels and data alternatives; they are not silently treated as completed automated checks. A real screen-reader session, broader manual WCAG assessment and deployed field Core Web Vitals measurements were not performed. Mobile Lighthouse lab measurements were completed in the later pass below.

## Measurements and boundaries

The final production entry JavaScript is approximately 346.04 kB / 103.11 kB gzip; CSS 73.34 kB / 14.15 kB gzip; the separate worker is 8.67 kB before compression. The pre-revamp assets were 310.55 kB / 93.00 kB gzip JS and 34.07 kB / 7.68 kB gzip CSS. The increase adds shared shell, typography, responsive states, directory, clinical boundary and integrity/worker loading. These sizes do not include data payloads or fonts and are not load-time scores.

Self-hosted fonts total 290,672 bytes across eight subset files; the four main Latin faces total 116,832 bytes. No runtime Google Fonts request is required. The final representative local filter run measured median 5.61 ms / p95 8.16 ms on this host; this is a local computation sample, not a device-wide responsiveness guarantee. Listing details and clinical text load on demand.

Production excludes the development audit, component catalogue and Vite local-reference bridge. The development clinical reader uses existing local data through exact unique ingredient identity. Production detail requires a configured same-origin endpoint, documented vendor API and licensed display rights. Missing clinical fields and unknown dates remain explicit. No paid Drug Index API has been assumed operational, and no full local monograph archive was newly bundled into production.

New source captures remain staged outside the dashboard pending quality review. No push, PR or deployment was performed. To review locally run `npm run dev`; to undo this revamp, revert its focused commits while preserving independent source captures and working data. Do not regenerate the snapshot as a UI rollback step.

## Final section and release-candidate evidence

`evidence/phase3/` contains 16 core route captures at 375/768/1280/1920, four 320px reflow captures, four-width catalogue workflows, desktop/phone source and review drill-downs, expanded Overview analysis, and seven interactive axe states at both phone and desktop widths. Eight core axe scans and fourteen state scans report zero violations. A further 320px clinical-dialog scan also reports zero violations; its width is exactly 320px and its section navigation does not overflow.

Production fixtures verify exhausted transient retries, explicit recovery, listing recovery, same-size metadata corruption rejection and successful reload. A delayed product read verifies that search works before data readiness, Export remains disabled until verification, and the query/pharmacy selection produces 16 results when ready. The new worker-prepared 458-product / 34-column CSV is byte-for-byte identical to the earlier independently verified export.

Lighthouse 13.5.0 audited the production bundle using its default mobile configuration, fresh headless Chrome and simulated throttling. Initial reports exposed main-thread work; all four initial unfavorable reports are retained. Final single-run lab results are:

| View | Performance | Automated accessibility | Best practices | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Overview | 96 | 100 | 100 | 2.23s | 118ms | 0.0004 |
| Catalogue | 92 | 100 | 100 | 2.32s | 238ms | 0.0004 |
| Sources | 97 | 100 | 100 | 2.29s | 19ms | 0.0006 |
| Data quality | 96 | 100 | 100 | 2.32s | 87ms | 0.0173 |

These are lab samples, not guarantees or field measurements. Catalogue TBT remains above 200ms in the final sample and varies across runs; earlier post-optimization samples measured 156–160ms. The intentional noindex policy yields SEO 63 for interactive views. Noindex was retained; scores were not raised by changing that policy. See full reports and `performance-summary.json` for settings, timestamps and raw measurements.

Reproduce with a production preview on port 4173 and `npm exec --yes --package=lighthouse@13.5.0 -- lighthouse "http://127.0.0.1:4173/?v=catalogue" --chrome-flags="--headless=new" --no-enable-error-reporting --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=report.json`. Fault fixtures run through `node qa/fixture-server.mjs`; `KPAD_TEST_SCENARIO` selects `retry`, `corrupt` or `slow`. Fixtures bind only to localhost and are excluded from deployment.

## Praesto full-surface overhaul · 14 October 2026

The current implementation replaces the Overview, Catalogue, Sources and Data Quality layouts, console, product modal and select primitives. Earlier reports above describe earlier commits and are not the release status of this overhaul.

- 29 tests, 96 local pipeline contract assertions, TypeScript, formatting, lint and Vite build passed. The curated static/app files remain byte-identical.
- Catalogue workflows at 1280 and 375px pass thirteen checks each, including the shared custom select inside the native filter dialog, named listing evidence, identity/clinical tabs, Escape/focus return, exact chart bins, matrix and drill-downs. Four audited states at each width report zero violations; incomplete results remain recorded.
- Sources and Data Quality workflows at 320/375/1280px pass eleven checks each. Evidence includes 15/8/7 partitions, source record fields, exact product table, six coverage denominators, class search/full expansion, queue switching, source diagnostics and exact low-confidence drill-down (172 products). Three expanded states at each width report zero axe violations; incomplete contrast results are retained.
- Pagination was exercised through Next, direct page 437, disabled final-page Next, First and Back to top. Page two begins at the next product, the final range is 43,601–43,606, page changes restore top position, and Back to top restores H1 focus.
- Dynamic favicon unit coverage verifies initial light, dark change, light change and listener cleanup. SVG also has a prefers-color-scheme fallback; PNG variants retain theme media queries. The application itself stays light.

Evidence: evidence/overview-overhaul/catalogue/review-1280.json, review-375.json; evidence-pages/review-320.json, review-375.json, review-1280.json and associated real UI captures. Manual screen-reader/contrast follow-through remains distinct from automated results. Licensed clinical feed activation and new snapshot promotion remain gated.
