# Overview ground-up overhaul · 14 October 2026

The client rejected refinement of the previous layout and requested new compositions using the existing data and functional contracts. This is local implementation and verification; visual acceptance remains an ongoing section-by-section review.

## Current composition

- Hero: compact ink summary, one explicitly scoped product-listing rate, three stock evidence columns, footprint and qualified collection date. An actual Recharts Pie doughnut centres 59.7% inside the ring. Unknown listings remain excluded from that denominator.
- Attention: horizontal clinical lead, compact sample signals and two supporting tiles. Source marks appear deliberately in one inset, with a visible legend and full named evidence reachable through each sample.
- Watchlist: aligned product, judged source counts and positive/available listed median fields; one row expands at a time. Reports are collapsed initially. White recessed evidence insets and slim outlined badges replace the oversized separate detail card. Product browsing, both queues and show-more remain available.
- Network: a single comparison surface combines eight pharmacies' identity, rated denominator, stock mix, exact in/out counts and in-stock rate. Order by stock share or report volume. Seven listing-only sources remain browsable and visibly excluded; three absent sources stay qualified. This replaces the duplicate dot-plot/table pair. The section title sits right and its action left.
- Composition: an eight-category treemap with exact count ledger and compact three-group listing-breadth ring. Heading left. Stockout groups use a compact disclosure.
- Price and confidence: horizontal frequency bars, direct percentile values, exact table, confidence ledger, clinical linkage, calculation sensitivity and qualified provenance. Heading right.

## Shared design and loading

Libertinus Serif, Nunito and JetBrains Mono remain self-hosted. New original glyphs distinguish stock states, clinical review, broad coverage, matching, price and reference evidence. Main section headings contain no decorative icons or visible numbers. Restrained separators fade at their ends. The watchlist description uses the same 68-character cap as section introductions.

`EvidenceControls.tsx` provides reusable evidence badges and single-choice pill controls. Phone toggle targets are 44px while the active painted pill is 28px tall. Stock badges measure approximately 26px. Overview outer phone gutters are 24px. Labels and large values stack where needed; no fixed-height evidence cards truncate content.

Recharts 3.10.1 is installed exactly. Price and coverage charts load near the viewport, without entrance animation, and have visible count/text alternatives. The worker prepares the Overview model once; below-fold sections use native content visibility. Failed chart imports remain bounded by a local error boundary.

## Data boundary

The curated app payload is unchanged: snapshot S2026-09, 43,606 resolved products, 51,350 pharmacy listings, 15 captured sources. The 59.7% headline is 23,622 / 39,593 stock-rated listings across eight reporting sources, across all pharmacy retail classifications. It does not describe national medicine availability or pharmacy availability.

The clinical queue contains 36 confidently matched medicines/devices reported out by at least two sources, from 52 candidates; 16 are withheld for matching/review. Judged broad clinical in-stock coverage is three products. Raw availability from non-reporting feeds is never substituted for judged stock.

The displayed product-grain price median is KES 1,700 across 43,401 positive product median prices. The original exported snapshot headline median, KES 1,730, remains unchanged and visible in provenance. URL grammar, filters, CSV columns and source payloads remain compatible. No staged captures or clinical API content were promoted.

## Verification

`npm run check` passes TypeScript, scoped formatting, ESLint, 29 tests, 96 contract assertions and the production build. Five additional Overview tests independently check listing denominators, queue/drill-down membership, coverage partitioning, histogram boundaries and judged named evidence. Source-file identities are retained.

Browser checks cover queue switching, twelve/three row expansion, per-product report expansion/collapse, phone focus, exact product browsing and source ordering. Responsive and accessibility evidence is stored in `evidence/overview-overhaul/`. Automated checks are bounded evidence, not conformance certification. The older phase reports remain historical measurements of earlier screens.

Performance measurements and final responsive results are recorded in the appended Overview section of `VERIFICATION.md`. Release, screen-reader and licensed clinical-feed gates remain in `PROJECT_TRACKER.md`.

All new Overview presentation components are strict TSX with an explicit read-model UI projection. The console uses the Praesto B lockup, a 264px navigation track, transparent topbar, 48px dark mobile launcher and separate 44px navigation pills. Brand direction A remains an alternate. The favicon listens to system colour preference independently of the light app.

Pharmacy identity now uses the shared original dimensional glyphs, always paired with source names in the comparison section. See the Catalogue design and verification milestone for the completed source-identity set.
