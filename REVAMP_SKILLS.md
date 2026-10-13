# Revamp skills, tools, and verification map

Reviewed 14 October 2026. Companion to [REVAMP_PLAN.md](REVAMP_PLAN.md).

This records the guidance available for the revamp and how it changes the implementation plan. Thirty relevant `SKILL.md` entrypoints have been read across the two planning passes. Supporting references were read selectively. No interface rebuild, live audit, deployment, plugin installation, or analytics collection was performed.

## 1. Skills and their use

| Skill | Where it applies | Concrete contribution |
|---|---|---|
| `ui-ux-pro-max` | Phases 0–3 | Hierarchy, restrained visual direction, interaction states, responsive behavior, and touch usability. |
| `site-architecture` | Phases 0–1, 4 | View/task mapping, navigation, contextual links, shared URLs, and indexing boundaries. |
| `design:design-system` | Phases 1–3 | Token coverage audit; component APIs, variants, states, behavior, and migration notes. |
| `design:design-critique` | Phases 1, 3, 6 | Review first impression, task completion, reading order, consistency, and accessibility using specific evidence. |
| `design:accessibility-review` | Phases 0–6 | Findings with affected users, severity, criterion, keyboard behavior, contrast evidence, and a proposed fix. |
| `design:ux-copy` | Phases 1–4 | Action labels, useful errors, honest empty states, loading expectations, consistent terminology, and localization notes. |
| `design:user-research` | Phases 0–1, 6 | Task-based research questions and usability exercises; distinguish observed user findings from internal opinions. |
| `copywriting` | Phase 4 | Plain product descriptions and specific actions, grounded in the actual capability and audience. |
| `copy-editing` | Phase 4 | Focused clarity, voice, evidence, and specificity passes; remove unsupported claims and redundant text. |
| `anthropic-skills:humanizer` | Phase 4 | Final language pass for formulaic phrasing, inflated significance, filler, and repetitive sentence shapes. |
| `seo-audit` | Phases 0, 4, 6 | Crawl/index policy, canonical behavior, metadata, semantic headings, link reachability, and performance evidence. |
| `ai-seo` | Phase 4 | Readable source attribution, methodology, dated evidence, and useful public explanations. No promised citation gains. |
| `anthropic-skills:schema-markup` | Phases 4, 6 | Accurate JSON-LD based on visible content; distinguish schema validity from supported search appearances. |
| `anthropic-skills:analytics-tracking` | Phase 4 proposal | Decision-led event naming, narrow payloads, validation, retention questions, and explicit collection boundaries. |
| `data:validate-data` | Phases 0, 3, 5–6 | Metric definitions, denominators, null handling, source comparability, independent spot-checks, and reproducibility. |
| `data:data-visualization` | Phases 1–3, 6 | Chart choice, scales, direct labels, accessible alternatives, and clear uncertainty. Retain the appropriate native chart implementation. |
| `product-management:write-spec` | All planning phases | Separate goals, requirements, dependencies, open questions, acceptance criteria, and deferred proposals. |
| `engineering:testing-strategy` | Phases 0, 2–6 | Prioritize business logic and critical workflows; combine fast logic tests, component tests, and a small E2E suite. |
| `engineering:code-review` | Phases 2–6 | Correctness, edge cases, races, security boundaries, resource cleanup, and maintainable component boundaries. |
| `engineering:debug` | When defects arise | Reproduce → isolate → diagnose → fix; preserve the exact evidence and verify the repaired path. |
| `engineering:documentation` | All phases | Keep commands and explanations current; link to authoritative documents rather than duplicating stale details. |
| `engineering:deploy-checklist` | Phase 6 / authorized release | Tested build, release target, smoke checks, rollback reference, and post-release workflow verification. |
| `vercel:react-best-practices` | Phases 2–5 | Avoid unnecessary data waterfalls, redundant derived state, event-listener leaks, and premature memoization. |
| `vercel:verification` | Phases 2–6 | Trace a real user story across browser loading, static read-model data, filtering, detail, and export boundaries. |
| `vercel:deployments-cicd` | Phase 6 / authorized release | Confirm project, environment, commit, deployment evidence, and the actual artifact tested before release. |
| `vercel:knowledge-update` | Platform decisions | Identify platform assumptions that need current documentation; does not justify adding Vercel services. |
| `computer-use:computer-use` | Conditional manual verification | Entry point for native Windows automation if needed; load its runtime/API/confirmation references before using that path. |
| `plugin-management:plugin-management` | Conditional tool discovery | Prefer existing direct capabilities; find a new integration only when it materially fills a real gap. |
| `imagegen` | Conditional share artwork | Use generated raster art only when useful; deterministic typography and existing vector assets remain suitable for a simple share image. |
| `skill-creator` | Conditional future QA reuse | Save a skill only after a repeatable, useful workflow emerges. No new skill is warranted merely because this plan exists. |

`frontend-design` was not found in the supplied catalogue or searched local skill roots. No replacement skill was installed. The reviewed design-system, critique, UI/UX, accessibility, and chart guidance cover the relevant decisions.

## 2. Guidance that needs adaptation

### Preserve the actual stack and brief

The installed UI/UX skill contains React Native-specific instructions and generic dark-mode guidance. Apply the useful principles to this web dashboard and preserve the explicitly requested light theme. Do not run React Native scaffolding or introduce a second theme.

The React skill includes Next.js examples and a preference for certain libraries. Use stack-appropriate React/Vite patterns. Keep plain CSS and the existing lightweight data model unless a demonstrated problem justifies a scoped change. Independent work can run concurrently; dependencies between metadata, dictionary indexes, and product/listing files must remain respected.

The data-visualization skill contains Python examples. Its chart-design guidance applies to the existing SVG charts; it does not require shipping Python, Plotly, or a new chart library to users.

### Preserve uncertainty while editing copy

Use the copy skills to improve comprehension. Keep “reported,” “inferred,” “unknown,” and classification caveats where they carry real meaning. Avoid fear-based persuasion, invented testimonials, unsupported medical reassurance, and claims of zero risk. Humanizing copy must not invent people, experiences, or evidence.

### Use current accessibility criteria

The accessibility skill's quick reference is framed around WCAG 2.1 and mixes in a stronger touch-size goal. The project target remains WCAG 2.2 AA. Its target-size minimum is 24 × 24 CSS px with specified exceptions; the brief's 44 px goal is a stronger product requirement. Keep those distinct in reports. [W3C target-size explanation](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Add explicit testing that sticky headers, sheets, and other author-created content do not entirely hide the focused control. Aim to keep the complete focused control visible where practical. [W3C focus-not-obscured explanation](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

Use an applicability matrix for the full standard; these highlighted checks are not a substitute for a complete assessment. Keep actual screen-reader testing separate from semantic inspection and automated axe output.

### Treat discoverability claims carefully

Do not turn the SEO skills' numerical uplift examples, fixed content lengths, or proposed AI files into project guarantees or mandatory additions. Google states that its AI search features do not require special AI files or special schema. Prioritize useful public content, accurate sources, and normal search fundamentals. [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features).

Do not promise a Google search-box result through `SearchAction`: Google removed the sitelinks search box starting in November 2024. Any proposed structured data must have a current purpose, accurately match the page, and undergo the relevant validation. [Google's removal announcement](https://developers.google.com/search/blog/2024/10/sitelinks-search-box).

Inspect both delivered HTML and the rendered page before concluding that structured data or content is absent. A text extraction tool may omit script blocks, while source HTML cannot show later client-rendered additions. Do not classify this catalogue intelligence tool as a dispensing pharmacy merely because it links to pharmacy listings.

### Adapt verification to static data delivery

The actual flow is browser → static metadata/products/listings → columnar store → filters/charts/details → CSV or pharmacy link. Do not invent an API/server layer to satisfy a generic verification template. Diagnose the first broken boundary, repair it, then resume checks until the authorized workflow is verified.

## 3. Tool availability and limits

These are discovery findings, not completed production checks.

| Capability | Current evidence | Use during implementation |
|---|---|---|
| Repository and shell | Filesystem, PowerShell, Git, text search, and patch tools available. | Read/edit source, run existing commands, review focused diffs, and save reports. |
| Node and Python | Bundled executable paths returned by workspace-dependency discovery; both files exist. | Use explicit bundled paths where PATH is unreliable. |
| UI/UX helper | Referenced `scripts/search.py` is absent from this installed skill package. | Use written guidance; do not report a generated design-system recommendation. |
| Browser UI automation | CUA browser APIs exposed in the session. Not initialized for this skills review. | Inspect the rendered application, interact, capture screenshots, and verify responsive states. |
| Playwright | Package exists in the bundled Node module directory. | Check import/runtime and browser-binary readiness before using it. Presence alone does not prove executable E2E tests. |
| Test runner / Lighthouse / axe | `@playwright/test`, `lighthouse`, and `axe-core` were not found at the checked bundled package paths. | Check project/global tooling during Phase 0; add only justified development tooling within implementation scope. Do not claim universal absence. |
| GitHub / CI | Repository and workflow-read capabilities exposed. No account/repository access was exercised. | Inspect the intended commit and CI results if access is available during review/release. |
| Vercel | Deployment/project inspection, documentation search, and deployment fetch capabilities exposed. No live account/project inspection performed. | Confirm the correct project and inspect build/deploy evidence when required. |
| Web references | Official W3C and Google sources consulted for the points above. | Resolve current platform/standards questions with primary sources. |
| Images and previews | Image generation, local image viewing, and file-opening tools exposed. | Inspect captures and prepare share assets when needed. |
| Additional integrations | Plugin discovery available; no new connection required for this review. | Add integrations only for concrete unmet needs and within authorized scope. |

The skill read does not establish that assistive technology, mobile hardware, browser binaries, account access, analytics, or field performance data are ready. Record verification gaps honestly. No new plugins, dependencies, runtimes, trackers, or services were installed.

## 4. Concrete regression matrix

| Area | Representative cases | Evidence |
|---|---|---|
| Filters and facets | Single/multiple filters; ANY versus ALL source selection; zero results; removing one chip; reset; facet counts excluding their own dimension. | Logic fixtures plus UI assertions. |
| URL state | Existing shared URLs, encoded text, invalid/unknown parameters, reload, and browser navigation. | Round-trip tests and browser observations; record baseline history behavior before changing it. |
| Results | Every existing sort direction; ties; null prices; large result sets; virtualized rows at boundaries. | Deterministic result fixtures and interaction checks. |
| Detail loading | Open before listings finish; close/reopen; switch products quickly; fetch failure/retry. | Correct product binding, no stale responses, and no focus loss. |
| Stock evidence | In/out/unknown, not published, not listed, absent sources, quarantine, and zero eligible sources. | Contract-aligned expected labels and denominators. |
| Freshness | Verified source timestamp; inferred timestamp; missing timestamp; timezone and date-boundary cases. | Formatter tests and visible qualifiers. |
| Prices and identity | Missing price, zero if valid in the contract, different pack/strength/form, confidence and review flags. | No false zero, hidden mismatch, or unsupported equivalence. |
| CSV export | Filtered population, agreed schema, quotes/commas/newlines, Unicode, missing values, and provenance filename. | Parsed exported file compared with the agreed contract. Sorting follows the recorded baseline unless changed deliberately. |
| Charts | Denominator changes; missing evidence versus zero; comparable scales; keyboard access and textual/table alternative. | Source-derived calculations, chart review, and manual interaction. |
| Accessibility | Open/close overlays, restore focus, visible/unobscured controls, logical reading order, sort announcements, live result updates. | Automated results plus keyboard and real screen-reader notes. |
| Resilience | Metadata/product/listing failure; partial background load; slow/offline network; mismatched snapshot files. | Recoverable state and explicit data age, with no false success. |
| Release | Correct repository/project/commit; tested build; shared URLs; static asset delivery; export; rollback reference. | Build/CI output and deployment smoke evidence when release is authorized. |

Add targeted tests for meaningful invariants. Avoid broad snapshot churn or tests that only repeat component markup.

## 5. Minimal measurement proposal

Proposal only. No collection or third-party tracking is enabled by this document.

| Decision to inform | Candidate event | Minimal allowed properties |
|---|---|---|
| Is Catalogue discovery usable? | `catalogue_search_completed` | `result_count_bucket`; trigger once after a completed interaction, not on every keystroke. |
| Are filter controls understandable? | `catalogue_filters_changed` | `active_filter_count_bucket`, `control_location`; exclude selected values and filter names that reveal health interests. |
| Do results lead to useful detail? | `product_detail_opened` | `entry_view`; exclude product identifiers and names. |
| Is export used and successful? | `catalogue_export_completed` | `row_count_bucket`; emit only after the application completes export generation. |
| Where does loading fail? | `read_model_load_failed` | Allowlisted `load_stage` and `error_code`; no raw exception, URL query, or record payload. |

Exclude medicine queries, product/ingredient/category identifiers, full URLs/referrers, location, personal identifiers, and inferred health conditions. Review automatic pageview/referrer capture as well as custom events, since the existing query string can contain search/filter state. Decide provider, retention, aggregation, and access before enabling collection. Do not promise user-level funnel measurement without an explicitly agreed identification design.

## 6. How this changes execution

Phase 0 now establishes metric definitions and a tooling-readiness matrix alongside screenshots and feature inventory. Phase 1 documents component behavior and applicability, not just styling. Phases 2–3 protect the fast filter engine and evidence semantics while completing the full user workflow. Phase 4 applies restrained copy and verified discoverability guidance. Phases 5–6 use the regression matrix, reproducible reports, and authorized release evidence.

The next execution step remains Phase 0. Reading the skills has improved the plan; it has not validated or rebuilt the application.
