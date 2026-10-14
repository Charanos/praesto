# Clinical reference boundary

The local preview is operational without credentials: start Vite, search an ingredient, open a product, then choose **Read clinical reference**. Vite reads `../04_Working Data/drugindex_active_ingredients.json` on request. Only an exact, unique ingredient name returns a record. Combinations remain intact. No new reference text is copied into `static/` or production bundles.

The development bridge runs only with `vite serve`; it is absent from preview/build. Bind development to localhost (the normal `npm run dev` default). Do not expose it as a public reference service.

For a licensed integration, implement a server route and configure `VITE_CLINICAL_REFERENCE_URL=/api/clinical-reference`. This variable is a **same-origin route path**, not a vendor URL or secret. Credentials stay on the server. No undocumented Drug Index URL, authentication scheme or paid API field is assumed here.

`GET <route>?ingredient=<encoded exact ingredient name>` returns 404 for an unmatched/ambiguous record or a schema-version-1 record from `src/lib/clinical.ts`. Required metadata: ingredient ID/name, source/version, nullable source URL, collection/revision/review dates, pregnancy scheme/jurisdiction, local-preview flag. All clinical fields are required keys with string or null values. Null means not supplied. The client validates identity, schema, dates, link protocol and pregnancy category context; it renders text, never source HTML.

Production adapter work, once docs and license are supplied:

1. Confirm allowed fields, countries/formulations, caching duration, public-display/export rights, attribution, revision semantics, bulk limits and deletion obligations.
2. Fetch with server-only credentials, bounded timeouts, retries for transient faults, rate limiting and provider cursors. Retain raw versions and source hashes in private storage.
3. Resolve provider ingredient IDs through explicit mappings. Replace the exact-name lookup with verified IDs without changing the availability contract. Do not fuzzy-match clinical combinations.
4. Map source fields verbatim. Keep approved/off-label indication scope and dosage context when supplied. Preserve missing, removed and conflicting values. Review clinical display with an appropriately qualified reviewer.
5. Validate and stage a new immutable reference version; produce a field-coverage/delta report and normalized workbook export. Promotion must not silently replace current reference text.
6. Enable the route only after licensed display is confirmed; keep restricted content out of browser snapshots and CSV exports.

Current local export contains no dedicated interactions, pregnancy narrative or risk-category field. Labelling codes are kept as source codes. No completeness, frequency, current prescribing validity or independent clinical review is implied.
