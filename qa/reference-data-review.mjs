import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url),
  before = new URL(
    "../../outputs/drugindex/2026-10-15/before/app/",
    import.meta.url,
  );
const old = JSON.parse(await readFile(new URL("products.json", before))),
  fresh = JSON.parse(await readFile(new URL("static/app/products.json", root)));
const columns = [
  "key",
  "name",
  "form",
  "packKind",
  "packValue",
  "packSig",
  "strengthValue",
  "listings",
  "nListed",
  "nEligible",
  "nOos",
  "nIn",
  "oosShare",
  "band",
  "matchConf",
  "matchBand",
  "priceCv",
  "matchFlags",
  "priceMin",
  "priceMed",
  "priceMax",
  "listedMask",
  "inMask",
  "oosMask",
  "categories",
];
for (const column of columns)
  assert.deepEqual(
    fresh[column],
    old[column],
    column + " must not change during a reference refresh",
  );
const prior = await readFile(new URL("listings.json", before)),
  current = await readFile(new URL("static/app/listings.json", root));
assert.equal(
  createHash("sha256").update(current).digest("hex"),
  createHash("sha256").update(prior).digest("hex"),
);
const oldMeta = JSON.parse(await readFile(new URL("meta.json", before))),
  meta = JSON.parse(await readFile(new URL("static/app/meta.json", root)));
assert.deepEqual(meta.headline, oldMeta.headline);
const result = {
  checked_at: new Date().toISOString(),
  preserved_product_columns: columns,
  products: fresh.key.length,
  listing_bytes_unchanged: true,
  headline_unchanged: true,
  old_reference: oldMeta.coverage.fingerprint,
  new_reference: meta.coverage.fingerprint,
  original_ingest_reference: meta.run.drugindex_fingerprint,
};
await writeFile(
  new URL(
    "../../outputs/drugindex/2026-10-15/data-regression.json",
    import.meta.url,
  ),
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
