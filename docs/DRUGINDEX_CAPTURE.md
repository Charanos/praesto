# Drug Index local reference capture

Captured 15 October 2026 from the first-party catalogue API: **84,800 records across 32 datasets**. This is the API-visible catalogue at collection time, not a claim to cover every medicine globally. No browser session, account, payment or search-history data is exported.

## Local files

Paths below are relative to the parent `James Kamindo` workspace, outside this Git repository:

- `outputs/drugindex/2026-10-15/full/raw/drugindex_*.json`: original catalogue tables, including source-deleted records.
- `outputs/drugindex/2026-10-15/full/manifest.json`: exact source counts, capture times, page and file SHA-256 hashes.
- `outputs/drugindex/2026-10-15/prepared/coverage.json`: active/deleted totals, missing fields, dangling references and source-name review flags.
- `04_Working Data/drugindex-reference/catalogue.json`: joined local reader model.
- `04_Working Data/drugindex_*.json`: nine backward-compatible pipeline reference files. Previous files are retained in the dated capture's `before/` directory.

| Entity | Captured | Active |
|---|---:|---:|
| Ingredients | 2,418 | 2,372 |
| Brands | 6,096 | 6,016 |
| Pack variants | 9,926 | 9,511 |
| Price editions | 19,102 | 18,194 |
| Manufacturers | 637 | 637 |
| Distributors | 100 | 100 |

The archive also includes ATC codes, hierarchy joins, interactions, dose regimens, clinical statements, pregnancy/lactation records and guideline datasets. Three datasets are empty at source; their empty JSON arrays and counts are retained.

## Refresh

Run from `06_Dashboard`, with a new dated output directory for each capture:

```powershell
node tools/drugindex/collect.mjs --out ../outputs/drugindex/YYYY-MM-DD/full
# To continue an interrupted capture at that same path:
node tools/drugindex/collect.mjs --out ../outputs/drugindex/YYYY-MM-DD/full --resume
node tools/drugindex/prepare.mjs --snapshot ../outputs/drugindex/YYYY-MM-DD/full --out ../outputs/drugindex/YYYY-MM-DD/prepared
```

Collection checkpoints deterministic pages, respects rate-limit/server retries, and verifies exact counts, identities and hashes. Preparation rejects incomplete or corrupt snapshots. Capture is not a transactionally frozen upstream database export; unchanged counts cannot rule out concurrent record edits.

After reviewing `coverage.json`, copy the prepared catalogue and coverage into `04_Working Data/drugindex-reference/` and the nine `prepared/compatible/` files into `04_Working Data/`. Back up the previous files first. Then run:

```powershell
npm run reclassify
npm run verify
npm run export:app
npm run check:app
```

## Reader and publication boundary

`npm run dev -- --host 127.0.0.1` exposes the local library through Catalogue controls or Data quality's **Browse Drug Index library**. It searches brands, ingredients, manufacturers and distributors, with paginated results and individual detail requests. It reads local files after capture; it does not require another Drug Index login. The development adapter and complete clinical payload are excluded from the production bundle. Public clinical display still uses the existing configured feed boundary.

Drug Index is a reference provider, separate from the pharmacy source roster. Reference prices/editions do not indicate live retail prices or pharmacy stock. Source review labels are preserved without claiming independent clinical review. Pregnancy labels have no declared scheme/jurisdiction, so the clinical adapter leaves those typed fields unknown. Missing hierarchy parents are explicitly marked as derived from ingredient memberships. Source-deleted records remain in the archive, excluded from active matching and reading.

## Verified effect of this capture

- Reference-linked dashboard products: **11,697**, up 162. Active ingredients linked to dashboard products: 11,429.
- Pharmacy product identities, stock masks/counts and prices remain unchanged; all listing JSON bytes are identical to the pre-refresh backup. The stock snapshot remains September 2026 and the gated rate remains 59.7%.
- The current reference fingerprint is `db5dcbefbb37ea55`, in `meta.coverage.fingerprint`. `meta.run.drugindex_fingerprint` retains the historical ingestion reference, accurately preserving original run provenance.
- Pipeline verification: 96 checks passed. App validation: 41 tests, TypeScript, formatting, lint and production build passed. Repeatable manual data comparison: `node qa/reference-data-review.mjs` (requires the dated local backup).
