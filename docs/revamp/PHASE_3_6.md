# Section revamp and hardening · 14 October 2026

This continues the original execution plan after the shared console, typography, color and glyph foundations. No source captures were promoted, and no push or deployment was performed.

## Phase 3 · Remaining surfaces

Overview now leads with reported availability, its denominator and sensitivity controls. Task entry points follow the evidence. Technical provenance and supporting price/coverage/confidence analysis are expandable. Source bars explicitly count resolved products rather than captured listings.

Sources now starts with a searchable pharmacy directory. Reporting groups retain all 15 captured sources, with 8 reporting stock and 7 listings-only sources. Each row places identity, listing count, listing-based in-stock rate and Browse together. Keyboard-operable disclosures retain platform, method, identity, stock-value counts, skipped/repaired rows and original diagnostics. Capture-size comparison and all three absent pharmacies remain visible below the directory.

Data quality starts with actionable match review, reference gaps and excluded sources. Its actions reproduce the 3,398-product review queue and 9,041-product reference gap selection. Supporting linkage, confidence, therapeutic classes, queues and excluded-feed diagnostics remain available. Copy no longer predicts that scraping is still running or that additional reference data must resolve every ambiguity.

Product detail exposes the ingredient immediately and provides focus-moving section shortcuts. Supplied clinical text is grouped into use/action, safety, dosage/special populations and additional information. Missing fields remain explicitly available in their own disclosure. Clinical source strings, combination identity, dosage context, pregnancy scheme requirements and unverified revision dates are preserved.

Two evidence-grain corrections matter: directory rates now use the listing counts displayed alongside them; broad in-stock coverage uses judged `inMask` rather than the raw `nIn` aggregate. The snapshot contains 11 products with in-stock reports at five or more sources, including 3 medicines/devices. The legacy raw aggregate gives 126 and remains unchanged in CSV for compatibility. Related-ingredient ranking also uses judged reports. No new filter grammar was introduced.

## Phase 4 · Copy and discoverability

The public static data notes remain crawlable. Interactive dashboard and query variants use `noindex,follow`, preventing medicine-search URLs and duplicate filter combinations from becoming intended search results. `robots.txt` excludes `/app/`, and Vercel configuration marks JSON artifacts `X-Robots-Tag: noindex, nofollow`. Response headers must still be verified on a real deployment.

No production origin was guessed for canonical or sitemap URLs. No unverified medical structured data or analytics was added. The indexing policy intentionally lowers the dashboard's Lighthouse SEO score; removing noindex merely to raise that score would contradict the chosen policy.

## Phase 5 · Engineering hardening

Every build/dev start stamps SHA-256 and byte lengths for the exact curated metadata, product and listing files. Runtime checks validate bytes before parsing. Transient network and selected HTTP failures retry once; identity errors and non-transient responses do not. Mismatched data produces a specific reload state. This detects mixed or corrupted release artifacts; it does not establish source truth or replace clinical review.

The shell, route title and search render while data preparation runs. Export stays disabled until verified data is ready. A module worker performs reading, identity checks, JSON parsing, typed-column preparation and full-snapshot aggregates. Typed buffers transfer directly, while large arrays/maps cross in bounded chunks to avoid one long main-thread clone. Closing an aborted mount terminates its worker. Direct loading remains available when workers are unavailable.

Advanced facet counts, source analysis and selection statistics compute when their corresponding surfaces are opened. Below-fold analytical sections use native content visibility. Existing query semantics, sorting, facet exclusions, virtual rendering and listing-fetch deduplication remain covered by tests.

`npm run check` runs strict typing for TS/TSX modules, scoped Prettier verification, frontend lint, 23 Node tests, 96 pipeline contract assertions and production build. Legacy JS/JSX, including the worker transport, is not claimed as fully strict-typed. Build/refresh/CI scripts converge on the stamped build step; mutating pipeline commands were not run during this revamp.

## Phase 6 · Local evidence

Final viewport, workflow, axe, CSV, Lighthouse and failure-recovery results live under `evidence/phase3/`. Initial unfavorable Lighthouse reports are retained as `lighthouse-*-initial.json`; final reports use `lighthouse-{view}.json`. These are local mobile lab samples of the production bundle, not deployed field Core Web Vitals or accessibility certification. The [official Lighthouse CLI guidance](https://github.com/GoogleChrome/lighthouse#using-the-node-cli) and CLI help informed the audit invocation; error reporting was disabled.

Real screen-reader testing, production-origin metadata, deployment header checks, licensed clinical activation and source-capture promotion remain explicit release/data gates. The tracker separates these from implemented and locally tested work.
