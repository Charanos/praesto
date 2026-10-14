# Kenya Pharmacy Availability · Revamp tracker

**Current position:** Phases 0–5 implemented; Phase 6 local verification complete. Release and external data gates remain below. **Release:** local preview only. **Active branch:** `codex/pharmacy-revamp`.

Updated 14 October 2026. Update this tracker after each completed milestone: record the outcome, check evidence and remaining gates together. A passed build is not a deployment or a clinical-content approval.

## Milestone board

| Milestone | State | Concrete outcome | Evidence / next gate |
|---|---|---|---|
| 00 · Baseline & data boundary | Complete | Four routes audited at four widths; existing snapshot and contract retained; refreshed captures staged separately. | [Baseline audit](docs/revamp/AUDIT.md), [clinical data plan](CLINICAL_DATA_PLAN.md). |
| 01 · Design foundations | Complete locally | Light reading canvas, deliberate inverse surfaces, expanded semantic accents, self-hosted typography and shared original glyphs. | [Design system](DESIGN.md); glyph catalogue at `?v=design`. |
| 02 · Console & usability | Verified locally | Shared shell/search available during loading; advanced controls on demand; dark phone launcher; availability-first Overview, pharmacy directory, review paths and grouped reference. | Four-width workflows and section drill-downs pass. Phone detail is full-width with non-overflowing shortcuts at 320px. |
| 03 · Clinical reference preparation | Complete locally · licensed feed gated | Exact ingredient reference from existing local data; expandable source sections, explicit gaps, safe schema and provenance. | [Integration boundary](docs/revamp/CLINICAL_INTEGRATION.md). Production activation needs vendor docs and licensed display rights. |
| 04 · Quality & regression | Verified locally · limits recorded | 23 tests, strict TS modules/formatting, lint, 96 contract assertions, exact data identities, bounded reads and worker preparation. | Zero violations in 22 core/state axe checks plus the 320px dialog; retry, corruption and delayed-search fixtures pass. CSV remains byte-identical. |
| 05 · Public reading & metadata | Implemented locally | Crawlable static data notes; interactive/query pages explicitly noindex; JSON excluded from crawl/indexing; no added third-party analytics. | Production-domain canonical/sitemap and response headers require deployment validation. |
| 06 · Review & release handoff | Local verification complete · release gated | Responsive/state captures, mobile Lighthouse and production recovery evidence. | Mobile lab performance 92–97; automated accessibility/best-practices 100. Real assistive-technology and deployment checks remain. No push performed. |

## Original plan phases

| Phase | Position |
|---|---|
| Data preparation | Local exports and staged captures complete; licensed feed and capture promotion gated. |
| 0 · Audit | Complete. |
| 1 · Information architecture / design system | Complete. |
| 2 · Foundations / first workflow | Complete locally. |
| 3 · Remaining surfaces | Complete locally. |
| 4 · Copy / public discoverability | Local policy and implementation complete; production origin and headers require release validation. |
| 5 · Engineering hardening | Complete locally. |
| 6 · Verification / release | Local verification complete; manual assistive-technology review and deployment remain gates. |

## Accepted design decisions

- **Usability first:** arrange the work around finding a product, comparing pharmacy reports and understanding evidence. Preserve the full analytical toolset without requiring it for the first useful answer.
- **Sleek, spacious console:** compact desktop controls, generous group spacing, fine separators and fewer enclosing boxes. Keep mobile targets comfortable.
- **Mixed surface contrast:** white reading surfaces with a bounded ink sidebar and selected dark actions. Inverse foreground/border tokens are fixed component pairs; there is no alternate theme.
- **Intentional typography:** Libertinus Serif titles, Nunito interface/body text and JetBrains Mono for data. Fonts are self-hosted with their license files.
- **Expanded accents:** teal, cobalt, amber, coral, botanical and berry semantic families, with paired foreground/surface tokens.
- **Reusable glyph craft:** the collapsed launcher's restrained geometry guides later section icons. Use the shared 24-unit original SVG set sparingly and consistently.
- **Phone navigation:** always-dark 52px launcher at the bottom right, including when collapsed; four labeled actions expand upward. Preserve comfortable safe-area offsets and reachable content.
- **Honest clinical depth:** existing local source text can be explored in development; restricted/unlicensed monographs are not newly bundled into production.

## Remaining gates

| Gate | Status / owner |
|---|---|
| Production stock refresh | Staged captures need source-quality review; the September app snapshot remains active. |
| Drug Index paid integration | User/vendor documentation and license scope needed. The local boundary is prepared. |
| Accessibility follow-through | Automated checks and token contrast pass; axe incomplete contrast results retained. Real screen-reader review and broader manual conformance assessment remain. |
| Production discoverability | Verify the real publication domain before absolute canonical/sitemap metadata; validate configured headers on deployment. |
| Production release | Requires an authorized release request and deployment checks. |

## Milestone log

| Date | Completed work |
|---|---|
| 14 Oct | Reference workbooks, coverage preflight and staged source captures prepared without promoting unreviewed rows. |
| 14 Oct | Baseline audit committed as `cdb1f9e`; 96 existing contract checks passed. |
| 14 Oct | Core console, typography, source-first product detail and local clinical reader implemented; desktop/phone workflow regression passed. |
| 14 Oct | Core implementation committed as `6c0c367`; existing browser snapshot retained. |
| 14 Oct | Client direction expanded to usability, slimmer custom shell, ample spacing, serif/sans/mono typography and deliberate dark accents; integrated into the design system and this tracker. |
| 14 Oct | Expanded semantic accents (teal, cobalt, amber, coral, botanical and berry), dark inverse sidebar and deliberate dark actions. Final contrast/responsive checks refreshed after these refinements. |
| 14 Oct | Original glyph primitive and always-dark bottom-right mobile launcher implemented; desktop/phone axe checks, four-width workflows and 320px reflow verified. Design direction recorded for later sections. |
| 14 Oct | Phase 3: availability-first Overview, searchable pharmacy directory, actionable review priorities and grouped clinical reference implemented. Listing-grain source rates and judged broad-stock coverage corrected. |
| 14 Oct | Phases 4–5: indexing policy, source-file identity checks, bounded reads, worker preparation, precomputed snapshot analysis, chunked transfer and on-demand facets implemented. |
| 14 Oct | Phase 6 local evidence complete: 23 tests, 96 contract checks, four-width workflows, 320px reflow/detail, zero automated accessibility violations, unchanged CSV and production retry/corruption/delayed-load recovery. Mobile Lighthouse: Overview 96, Catalogue 92, Sources 97, Quality 96. |
| 14 Oct | Section revamp and verified worker loading committed as `eb7fa66`; local release evidence and external gates recorded for review. |
