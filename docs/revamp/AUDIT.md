# Baseline audit — 14 October 2026

Scope: local application and the versioned September read model. The newer staged captures have not passed promotion review. No production deployment or source data was changed for this audit.

## Architecture and preserved behavior

React 19 / Vite 8, CSS tokens, custom SVG charts, URL query state (`v` plus encoded filters), typed-array browser store, windowed catalogue; DuckDB remains in the offline pipeline. No map, geolocation, branch inventory, reservation, authentication, pagination or purchase flow exists. No theme other than light will remain.

| Surface | Baseline inventory / regression requirement |
|---|---|
| Shell | Four destinations, global product/ingredient search, `/` shortcut, snapshot provenance, CSV export, loading progress, fatal load error, popstate restoration. |
| Overview | Reporting/all/excluding-Garnet sensitivity controls, pulse, source bars, classification, shortage bands, reportable stockout table, broadest coverage table, price curve, coverage plot, confidence arc, drill-downs. |
| Catalogue | Grid, matrix (first 40), charts; virtual rows; adaptive columns; sort; live facet counts excluding their own dimension; chips/reset; empty result state; detail drawer; listing links; related ingredient products; reference extract. |
| Filters | Search, product type, clinical only, bands, therapeutic class, ANY/ALL shop masks, stock-in/out masks, listing/out counts, median price, dose form, source category, confidence bands/minimum, reference link, gaps, contested classification, review state, pack kind (URL contract). |
| Sources | Reporting/quarantine/absence roster, availability bars, expandable ledger, ingest/source identity detail and catalogue drill-down. |
| Quality | Reference linkage, confidence, therapeutic coverage, review and classification queues, quarantine reasons and methods. |
| Shared | Section, KPI, tag, chip, stock tag, per-shop barcode, facet, checkbox, numeric pair, icons, tooltip, skeleton and empty state. |

## Data and measured baseline

`npm run build` passes: 310.55 kB JS / 93.00 kB gzip; 34.07 kB CSS / 7.68 kB gzip. Runtime fonts also make external Google requests. These are asset sizes, not Lighthouse or field performance scores.

`npm run verify`: **96 passed, 0 failed**, contract 1.1.0. September snapshot: 43,606 resolved products, 51,350 listings, 15 captured sources, 8 reporting stock, 7 excluded, 3 absent. Headline gated rate 59.7%; raw 68.9% is sensitivity only. All listing collection timestamps are inferred from file mtime. Reference fingerprint `05c9495478e6112c`; 2,416 ingredient records, 5,882 brands. Completeness and clinical revision dates are not known.

Product identity includes strength, pack and form. Source listing state differs from judged stock evidence. Price is a listed observation, not a current quote. Matching confidence is not clinical suitability. Reference linkage is not a complete monograph. Preserve these distinctions and the CSV columns/ordering.

Screenshots in `evidence/before-{view}-{width}.jpg` cover four views at 375, 768, 1280 and 1920. Desktop visual hierarchy is usable but too much emphasis is spent on persistent chrome. Phone catalogue loses full product names and almost half its vertical space to facets; icon-only navigation loses accessible names because its text is hidden. Wider tables and quality queues need contained scrolling/reflow.

## Prioritized defects

| Priority | Finding | Required treatment |
|---|---|---|
| P1 | Catalogue and source/table rows are mouse-only; drawer lacks dialog semantics, focus containment and return. | Native buttons where possible; keyboard-equivalent interactions; shared modal focus lifecycle. |
| P1 | Light text tokens `#8A909B` / `#B4B9C1` on white are below normal-text contrast. | Darken secondary tokens; verify semantic pairs. |
| P1 | Phone navigation hides text without accessible names; search is squeezed beside metadata/actions. | Labeled mobile navigation; search gets its own row. |
| P1 | Facets occupy up to 44vh on phones before results; row columns have an irreducible width. | Overlay filter panel with close/return; compact result identity and stock text. |
| P1 | Quality says scrape is “still running”; Overview says “verified”; reference flags imply monograph text. | State incomplete local reference and inferred dates truthfully; label reference linkage accurately. |
| P1 | Fatal load error exposes regeneration commands; listing failure silently shows an empty table. | Actionable retry states and offline feedback. |
| P2 | Dark rail, stored theme, alternate token set, gradient mark, remote font import. | One light system; sparse inverse accents; local system fonts. |
| P2 | 25–34px controls, small chart labels and 34px rows. | Larger control targets and row rhythm; preserve virtualization math. |
| P2 | Charts often rely on hover and lack keyboard/data alternatives. | Direct summaries, named SVGs, keyboard drill-downs and data tables. |
| P2 | No frontend lint/type/regression toolchain. | Scoped strict new modules; lint entire frontend; meaningful contract/filter/interaction checks. |
| P2 | Detail fetch starts for every visitor regardless of intent. | Fetch listing detail on demand with cached deduplication/retry. |

## Diagnosis

The baseline has a coherent analytical foundation. Its main weakness is that everything receives similar small typography while a large dark navigation rail gets disproportionate emphasis. Nested panels and caveats compete with the decision users came to make. The revamp will give product identity, reported evidence and price room to breathe; make uncertainty readable; and make mobile a full workspace. Existing custom charts and filtering remain useful foundations.

Qualitative audit (1 poor–5 strong): hierarchy 3, density 3, consistency 4, contrast 2, touch 2, keyboard 1, motion 4, bundle size 4, copy 3, mobile 1. These are design judgments, not measured conformance scores. Formal automated accessibility and interactive regression checks belong to the implementation validation report.
