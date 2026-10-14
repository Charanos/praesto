# Kenya Pharmacy Availability · Revamp tracker

**Current position:** shared foundations and core usability pass implemented and locally verified; ready for section-by-section design refinement. **Release:** local preview only. **Active branch:** `codex/pharmacy-revamp`.

Updated 14 October 2026. Update this tracker after each completed milestone: record the outcome, check evidence and remaining gates together. A passed build is not a deployment or a clinical-content approval.

## Milestone board

| Milestone | State | Concrete outcome | Evidence / next gate |
|---|---|---|---|
| 00 · Baseline & data boundary | Complete | Four routes audited at four widths; existing snapshot and contract retained; refreshed captures staged separately. | [Baseline audit](docs/revamp/AUDIT.md), [clinical data plan](CLINICAL_DATA_PLAN.md). |
| 01 · Design foundations | Complete locally | Light reading canvas, deliberate inverse surfaces, expanded semantic accents, self-hosted typography and shared original glyphs. | [Design system](DESIGN.md); glyph catalogue at `?v=design`. |
| 02 · Console & usability | Verified locally | Dedicated sidebar/topbar; one search; stock/pharmacy controls first; advanced analysis one level deeper; dark bottom-right phone launcher with labeled floating actions. | Search-to-reference workflow passed at 375/768/1280/1920; launcher keyboard/dismissal checks pass. Section-specific refinement remains open. |
| 03 · Clinical reference preparation | Complete locally · licensed feed gated | Exact ingredient reference from existing local data; expandable source sections, explicit gaps, safe schema and provenance. | [Integration boundary](docs/revamp/CLINICAL_INTEGRATION.md). Production activation needs vendor docs and licensed display rights. |
| 04 · Quality & regression | Verified locally · limits recorded | Strict new TypeScript modules; frontend lint; 19 tests; 96 pipeline contract assertions; browser interactions, contrast and error retries. | [Verification report](docs/revamp/VERIFICATION.md); automated axe reports zero violations in sampled views/states. Manual assistive-technology and field-performance review remain. |
| 05 · Public reading & metadata | Verified locally | Light theme metadata, favicon, crawlable data notes, JavaScript fallback; no added third-party analytics. | `/about.html`; development audit and local clinical bridge excluded from production bundle. |
| 06 · Review & release handoff | Local handoff ready · release pending | Before/after evidence, asset measurements, validation report and local preview. | Section-by-section visual review next. No push or production deployment performed. |

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
| Section refinements | Review each section against the accepted shell, type, spacing, color and glyph foundations. |
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
