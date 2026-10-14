# Design system — Catalogue / Evidence / Reference

The dashboard is a white, editorial workspace. Product identity and source evidence lead; uncertainty stays beside the number it qualifies. Self-hosted Libertinus Serif titles, Nunito interface text and JetBrains Mono numerals provide an editorial hierarchy without external font requests.

## Foundations

`src/tokens.css` owns semantic colors, inverse pairs, type, space, geometry, motion, depth and layout widths. `src/app.css` composes existing analytical views. `src/console.css` and `ConsoleShell.tsx` own the dedicated sidebar/topbar. `src/workspace.css` owns the catalogue, overlays and clinical reader. The fixed light palette has no alternate theme, storage or system-theme branching.

| Decision | Usability rationale |
|---|---|
| Bounded ink sidebar, white reading surfaces, selected dark actions | Contrast defines the workspace without turning the main reading canvas dark. |
| 14px body; 12px secondary; restrained display headings | Dense data remains readable without giving every number equal emphasis. |
| Compact 36px desktop controls; 44px mobile/coarse targets; 56px catalogue rows | Touch targets and product names need space; virtual rendering keeps density affordable. |
| Phone navigation collapses to a dark bottom-right launcher; expanded actions retain labels | The dashboard keeps its canvas while destinations remain recognizable. Search occupies a full row. |
| Mobile facets use a modal with a result-count action | Filters stay available without consuming the result viewport. |
| Native modal dialog, Escape and focus return | Browser focus containment prevents interaction behind overlays. |
| Stock text and source-level detail accompany barcodes | Color is supplemental evidence, never the only way to read stock. |
| Clinical reader uses expandable sections and explicit source gaps | Long source text becomes navigable without implying complete clinical coverage. |
| Detail data loads on demand | Visitors inspecting summary views do not download the full listing payload. |

## Components and states

| Component | Variants / states | Interaction and accessibility |
|---|---|---|
| Navigation | Default, current, hover, focus | Four labeled destinations, `aria-current=page`; preserves query routes. |
| Button | Primary ink, secondary outline, ghost, icon; disabled/loading | Visible focus, explicit icon names, 44px primary target. |
| Field / range | Text, number, empty, focus | Search and numeric bounds have accessible names. Blank remains unbounded. |
| Facet / checkbox | Expanded/collapsed, selected/unselected | Native checkbox with visible tick; full label target. |
| Chip | Applied; removable | Specific remove name; query stays in URL. |
| Result row | Default, hover, focused, selected | Native button with product/evidence/price accessible summary; Arrow keys move within the virtual list. |
| Stock tag | In stock, out of stock, no signal | Always words; no invented low-stock or quantity status. |
| Detail / mobile filters | Opening, loaded, retry, closed | Native modal, contained scroll, Escape, close button, focus return. |
| Source ledger | Collapsed/expanded | Native disclosure button; identity and denominator retained. |
| Reference reader | Loading, supplied, missing, unavailable, retry | Source-provided text only; null dates remain unknown; no source code interpreted as a pregnancy category. |
| Feedback | Progress, empty, offline, recoverable failure, fatal failure | Labeled progress; polite announcements; explicit retry. |
| Charts | Named figure, direct labels, selected/disabled, data alternative | Keyboard activation and text/table evidence accompany marks. |

The development-only `?v=design` catalogue demonstrates the system. `?audit=1` exposes a development accessibility check. Both are excluded from production navigation and the audit module is removed from production bundles.

## Breakpoints and content

Desktop uses a 264px navigation track with a 244px inset ink sidebar. Catalogue adds an independent 272px light control extension, collapsible to recover horizontal reading space. At 1100px the sidebar becomes a compact labeled horizontal navigation bar. At 760px navigation becomes a 48px bottom-right launcher, dark in both collapsed and expanded states. Four separate 184px by 44px floating navigation pills expand upward; selection, outside click, focus leaving the group and Escape close it. Escape and selection return focus to the launcher; arrow/Home/End keys move between destinations. Safe-area offsets and content padding keep the final rows reachable. The header wraps, filters become a modal, grid columns condense to product/evidence, and chart sections stack. At 320px content reflows; intrinsically two-dimensional tables/matrices scroll inside labeled regions. Do not hide a workflow to fit a breakpoint.

Primary actions are ink on white with a white inverse foreground. Blue identifies links/focus; green/red/ochre encode evidence. All text tokens target >=4.5:1 on their intended light surfaces. Charts may use lighter fills with direct labels and data alternatives. Motion is brief and honors reduced motion. No decorative page gradients or glass surfaces. The client-requested pharmacy glyph set alone uses a subtle two-tone highlight and inset shading to give small source identifiers depth.

## Section execution and loading

`WorkspaceIntro.tsx` owns persistent route titles; the shell and search remain usable while verified data is prepared in a worker. Export stays disabled until readiness. The Overview leads with a centered Recharts availability ring and explicitly scoped stock summary. Category treemap, breadth ring, exact counts, horizontal price bars and confidence evidence follow in distinct compositions; calculation sensitivity and provenance use native disclosures. `SourceDirectory.tsx` aligns pharmacy identity, listing-grain rates and browsing, with reporting groups and name search. `ReviewPaths.tsx` turns data quality into actionable queues. Product detail uses focus-moving shortcuts and grouped supplied fields, with missing fields still explicit. At 620px and below the native detail dialog spans the full viewport; its navigation labels fit at 320px.

Below-fold analysis uses native content visibility; facet calculations and selection statistics run on intent. Collection denominators and rates retain their grain. Broad in-stock coverage and related-product ranking use judged masks; raw aggregate export definitions remain compatible. See [Phases 3–6](docs/revamp/PHASE_3_6.md) and [verification](docs/revamp/VERIFICATION.md).

## Data and clinical boundary

Keep the existing URL grammar, filtering semantics, CSV schema and contract 1.1.0. “Reference-linked” means the existing reference-link flag, not a complete monograph. Clinical text comes from an optional same-origin, versioned endpoint. The Vite development server can read existing local reference files; production contains no newly bundled monographs. A licensed server adapter must implement the documented boundary before enabling production reference detail. No credentials belong in browser configuration.

Collection dates inferred from file timestamps are visibly marked. Source clinical revision dates are unknown in current local data. Never claim all indications, common adverse-event frequencies, clinical review or current prescribing guidance from this dataset.

## Typography and progress

Titles use Libertinus Serif 400/600 with comfortable line heights and restrained negative tracking. Interface text uses Nunito 400–700; numerical data uses JetBrains Mono 400–600 and tabular figures. Latin and Latin-extended WOFF2 files use `font-display: swap`; the primary Nunito Latin file is preloaded. Font assets total 290,672 bytes across subsets, with approximately 116 kB for the four main Latin faces. Font source URLs and weights are recorded in `static/fonts/manifest.json`, alongside each OFL license. Upstream projects: [Libertinus](https://github.com/alerque/libertinus), [Nunito](https://github.com/googlefonts/nunito), [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono).

Track milestone completion and evidence in [PROJECT_TRACKER.md](PROJECT_TRACKER.md). The client's later usability and typography directions authorize one persistent search, first-level stock/pharmacy controls, collapsed advanced filters and source-first detail, while keeping the URL grammar and export columns.

## Accent expansion

Deep teal anchors actions and the availability summary; cobalt supports source and matching information; amber denotes caution; coral supports stockout/absence context. Botanical and berry tones extend categorical chart marks. Every family has an explicit strong/soft pairing in `tokens.css`. Stock-status meaning stays stable, while category marks always retain labels/counts. Pale fills provide grouping without adding heavy card borders or decoration. Inverse sidebar colors have their own readable foreground tokens.

## Glyph direction for subsequent sections

`src/components/icons.tsx` is the single reusable original glyph set: a 24-unit optical grid, 1.65-unit strokes, rounded joins/caps and consistent margins. Use the collapsed launcher's restrained four-cell glyph as the quality reference for later section work. Soft squared containers belong to navigation and selected controls; ordinary inline actions use the bare glyph. Avoid filling every heading or data label with an icon. Pharmaceutical, evidence, reading and navigation symbols share the same construction. Decorative SVGs are hidden from assistive technology; icon-only controls carry explicit accessible names. The development catalogue includes every glyph for visual comparison. These are original SVGs, with no dependency on Apple's platform assets.

## Overview composition · current section review

The Overview is now a ground-up composition, independent of the old functional layout. Use a compact ink hero, a horizontal clinical lead, an expandable product evidence ledger and one source comparison surface. Avoid repeated equal three-card rows and repeated barcodes. A small clinical sample may use source marks once, with a legend and named evidence drill-down.

`EvidenceControls.jsx` owns slim rounded evidence badges and pill toggles. White badges use restrained semantic ink/borders. Phone toggles preserve 44px hit areas with a slimmer painted active state. Named pharmacy reports sit in a white recessed inset against a neutral ledger. No fixed-height blank regions should be added to align unrelated card contents.

Main section titles have no glyphs or visible sequence numbers. Introductions use a 68ch reading cap; section dividers fade at their ends. Overview phone gutters are 24px, and stock counts stack below their labels. Heading alignment follows the client's section review: the pharmacy section is right aligned, with its browsing action left. Keep this explicit alignment rather than imposing an outdated alternation rule over later feedback.

Additional glyph roles include package-check/minus for stock evidence, medical-alert for the clinical queue, network for broad coverage, clipboard-alert for review, categories for classification, coins for price and link-check for matching. Reuse a meaning consistently; avoid the same decorative capsule or pulse on unrelated tiles.

Recharts price/coverage visuals are lazy and supplement directly readable values. Source comparisons combine the visual mix and exact counts in each pharmacy row. See [current Overview implementation](docs/revamp/OVERVIEW_OVERHAUL.md) and the current tracker before treating older phase completion as visual acceptance.

## Catalogue controls and source identity

Most Catalogue configuration lives in the shell-owned extension that grows directly from the dark navigation, entirely outside the page: stock evidence, pharmacy scope, clinical scope, sorting, applied filters, selection statistics, analysis columns and every advanced facet. The main header contains only the result count, List/Matrix/Charts and a controls trigger. Above 1100px controls scroll independently beside the virtualized list; at 1100px and below they open in a native modal with explicit close, reset and live result-count actions. Resizing never opens a mobile modal automatically. Product rows are 72px on desktop and 104px at 760px and below, matching the virtualizer.

`PharmacyGlyph.tsx` owns 18 original source identifiers, keyed by stable pharmacy_id. The 24-unit rounded glyphs share stroke 1.65 and optically scale within restrained dimensional tiles. Each source has one motif/accent pairing. Names remain visible in detailed contexts; compact stacks reveal up to three sources plus a remainder and expose the complete named membership to assistive technology. These are Praesto identifiers, not official pharmacy logos, and colours never imply stock. Reuse in filters, product source stacks, matrix headers, named observations, Overview and source directory.

Product detail is a centered 920px native reading room with a quiet summary, section shortcuts, white observation surfaces and grouped clinical reference disclosures; on phones it fills the viewport. The established light app theme stays unchanged. Only favicon assets follow the system colour preference, as expressly requested by the client.

Route presentation bundles load on intent under a local recovery boundary, keeping the console/search available and retaining URL filters when a view load fails.
