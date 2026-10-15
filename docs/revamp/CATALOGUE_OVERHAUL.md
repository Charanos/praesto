# Catalogue overhaul · 14 October 2026

The Catalogue is rebuilt around product identity and explicit source evidence. The established snapshot, filter semantics, URL grammar, 34-column CSV, virtual scrolling and licensed-reference boundary are retained.

## Workspace structure

Most controls live in a 272px inverse extension (#111316) beside the dark Praesto navigation: stock evidence, pharmacy selection, clinical scope, sort, applied filters/reset, statistics, analysis columns and all advanced facets. Its scroll is independent of the results. The header contains result count, List/Matrix/Charts and a controls toggle. Collapse the extension for a wider ledger. Controls are portalled into the shell dock, entirely outside main and the page heading/results layout. The dock joins the dark navigation at its edge and shares its full-height silhouette; controls use flat labelled fields and whitespace instead of a second stack of cards. At 1100px and below controls open on intent in a native modal; resizing never opens it automatically.

The white results ledger puts product and ingredient first, then explicit judged-stock badges, compact pharmacy stacks when width permits, and listed median price. Seventy-two-pixel desktop rows and 104px mobile rows exactly match virtualizer geometry. Analysis columns remain an opt-in evidence view. Phone rows have their own composition and two-line product titles rather than shrinking the desktop table.

All filters remain available: types, clinical-only, therapeutic classes, stockout bands, ANY/ALL pharmacy listing masks, judged stock masks, source-count bounds, positive median-price bounds, form, pack kind, source categories, confidence, reference linkage, classification gaps, automatic/review status and contested classification. Live facet counts retain their existing self-exclusion semantics.

## Source identity system

PharmacyGlyph.tsx defines 18 original Praesto source identifiers, keyed by pharmacy_id. Each has a distinct 24-unit rounded motif, a stable accent and subtle inset depth. They are not official pharmacy logos. Source accent never encodes availability; stock badges carry separate text and semantic colours.

PharmacyStack shows up to three identities plus a remainder. Its accessible label includes every source name and the total; the underlying row also states the listing count. Narrow rows recover product space by omitting the stack column, while named glyphs remain in details. The same identifiers are reused in filters, matrix headers, analytic source rows, per-listing observations, Overview comparison and the source directory. The dev component catalogue displays all 18 at two sizes.

## Comparison and reading surfaces

The Matrix is now a visual comparison workspace. A Recharts scatter map groups the first 40 filtered products by their in-stock and out-of-stock source counts; labelled circles show the number of products in each pattern. Four pattern controls and an arrow-key product chooser connect the overview to a selected product's named pharmacy evidence. Every captured source belongs to exactly one displayed state: in stock, out of stock, conflicting reports, stock not reported, or not listed. Conflicting source listings retain both count memberships. Listing-only feeds remain unknown; missing listings never imply unavailable stock. Inspect product retains the full source-listing reader. The chart loads only when this view is opened and uses native keyboard-operable controls.

Selection Charts pair horizontal price-frequency bars with percentile values and an exact table; an eight-category treemap with counts; a source ledger with product-grain evidence; seven listing-only source links; and selectable stockout report groups. Each visual has a direct text alternative. Chart and category actions retain the existing filter grammar. A product-level rate here is explicitly distinct from the Overview's listing-level headline.

Product detail is a content-sized 1040px native reading room and a full-height phone reader. A full-width title and slim section switcher sit above the named-listing ledger. Price, source counts and match context occupy a narrow side column; only the selected evidence, clinical or identity panel is shown. Matching details and related products remain disclosures. The grouped clinical reader preserves exact source strings, dosage caveats, missing fields and provenance. Native modality retains inert background, Escape and focus return. Loading and retry states remain; production reference content requires the licensed same-origin adapter.

Route presentation bundles load on intent under a local recovery boundary so the console and query remain usable. The optional chart engine is separate from the default Catalogue list.

## Verification

Full browser workflows cover stock/pharmacy masks, sort, clinical facet, analysis columns, ingredient search, bounded virtual rows, ArrowDown focus, named observations, identity/reference shortcuts, local reference disclosure, Escape/focus return, empty/reset, 40-by-15 matrix, exact price bins, category/source partitions and analytics drill-down. Evidence is in evidence/overview-overhaul/catalogue/; final width and state reports are listed in VERIFICATION.md.

The main check passes strict TypeScript, scoped formatting, ESLint, 29 tests, 96 contract assertions and Vite production build. static/app remains unchanged. Cross-route mobile Lighthouse reports and screen-reader/release limits are recorded separately; local automated checks are not a production deployment or accessibility certification.

Shared Radix Select 2.4.1 menus replace native dropdowns, with consistent light/inverse colours, keyboard navigation and scroll affordances. Menus opened inside a native dialog portal into that dialog. Pagination offers 50/100/200 products or continuous results; search/filter/sort resets the page. Chart and CSV scopes remain the entire filtered set. The flowing heading and column labels preserve reading space. The dark back-to-top glyph restores heading focus and respects reduced motion.

