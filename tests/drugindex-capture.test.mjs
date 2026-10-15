import test from "node:test";
import assert from "node:assert/strict";
import {
  exactTotal,
  validateRecords,
  publicAnonKey,
  CATALOGUE_TABLES,
} from "../tools/drugindex/collect.mjs";
import { prepareCatalogue } from "../tools/drugindex/prepare.mjs";
test("reference extraction requires exact counts and unique complete identities", () => {
  assert.equal(exactTotal("0-499/2418"), 2418);
  assert.equal(exactTotal("*/0"), 0);
  for (const range of ["0-499/*", null, "bad"])
    assert.throws(() => exactTotal(range));
  assert.ok(
    validateRecords(
      [
        { a: 1, b: 2 },
        { a: 1, b: 3 },
      ],
      ["a", "b"],
      2,
    ),
  );
  for (const [rows, total] of [
    [[{ a: 1 }], 2],
    [[{ a: null }], 1],
    [[{ a: 1 }, { a: 1 }], 2],
  ])
    assert.throws(() => validateRecords(rows, ["a"], total));
});
test("collector only uses public anon configuration and excludes account/operational tables", () => {
  const jwt = (role) =>
    "eyJheaderlongxx." +
    Buffer.from(
      JSON.stringify({
        role,
        extra: "padding to make a realistic token payload",
      }),
    ).toString("base64url") +
    ".signaturelongxx";
  assert.equal(
    publicAnonKey(jwt("authenticated") + " " + jwt("anon")),
    jwt("anon"),
  );
  assert.throws(() => publicAnonKey(jwt("service_role")));
  for (const name of [
    "profiles",
    "subscription_grants",
    "transactions",
    "recent_searches",
    "active_ingredient_parse_jobs",
  ])
    assert.ok(!(name in CATALOGUE_TABLES));
});
test("preparation preserves monograph text, structured interactions and price editions without inventing stock", () => {
  const raw = Object.fromEntries(
    Object.keys(CATALOGUE_TABLES).map((t) => [t, []]),
  );
  Object.assign(raw, {
    active_ingredients: [
      {
        ai_key: "a",
        name: "Example",
        dosage: "Exact source\n<b>dose</b>",
        updated_at: "2026-10-15",
      },
    ],
    brands: [
      { brand_key: "b", ai_key: "a", name: "Example Brand" },
      { brand_key: "gone", name: "Deleted", deleted: true },
    ],
    variants: [{ variant_key: "v", brand_key: "b", country_key: "ke" }],
    countries: [{ country_key: "ke", currency_short: "KES" }],
    brand_variant_prices: [
      {
        brand_variant_price_id: 1,
        variant_key: "v",
        price: 10,
        edition: "older",
      },
      {
        brand_variant_price_id: 2,
        variant_key: "v",
        price: 12,
        edition: "newer",
      },
    ],
    component_interactions: [
      {
        interaction_key: "i",
        source_type: "active_ingredient",
        source_key: "a",
        target_type: "food",
        custom_target_name: "Food",
        description_key: "d",
      },
    ],
    interaction_descriptions: [
      {
        description_key: "d",
        description: "Exact source note",
        severity: "Moderate",
      },
    ],
  });
  const result = prepareCatalogue(raw, {
    finished_at: "2026-10-15T00:00:00Z",
    limitations: [],
  });
  assert.equal(result.ingredients[0].dosage, raw.active_ingredients[0].dosage);
  assert.equal(
    result.ingredients[0].interactions[0].details.description,
    "Exact source note",
  );
  assert.equal(result.brands.length, 1);
  assert.equal(result.brands[0].variants[0].prices.length, 2);
  assert.ok(!("in_stock" in result.brands[0]));
  assert.equal(result.report.counts.brands.deleted, 1);
});
import {
  referencePage,
  referenceRecord,
  clinicalFromCatalogue,
} from "../dev/reference-catalogue.js";
test("local reference adapter keeps pagination bounded and exposes orphan brands without guessing an ingredient", () => {
  const catalogue = {
    brands: [
      {
        brand_key: "b",
        name: " Example ",
        ai_key: "missing",
        variants: [{ variant_key: "v" }],
        distributors: [],
        quality_flags: [],
      },
    ],
    ingredients: [],
    manufacturers: [],
    distributors: [],
    report: {},
  };
  assert.equal(
    referencePage(catalogue, { q: "example", limit: 100 }).limit,
    50,
  );
  assert.equal(referencePage(catalogue, { q: "example" }).total, 1);
  assert.throws(() => referencePage(catalogue, { kind: "profiles" }));
  const result = referenceRecord(catalogue, "brands", "b");
  assert.equal(result.ingredient, null);
  assert.equal(result.brands[0].variants.length, 1);
  assert.equal(referenceRecord(catalogue, "brands", "absent"), null);
});
test("clinical adapter preserves source fields and keeps unlabelled pregnancy schemes out of risk-category decisions", () => {
  const ingredient = {
    ai_key: "a",
    name: "Example",
    dosage: "Exact source dose",
    updated_at: "2026-10-15T00:00:00Z",
    source_url: "https://drugindex.it/active_ingredients/a",
    interactions: [],
    pregnancy_categories: [{ name: "B", description: "Source definition" }],
    pregnancy_details: [{ risk_summary: "Source risk statement" }],
    lactation_details: [],
  };
  const catalogue = {
    ingredients: [ingredient],
    categories: [],
    subcategories: [],
    report: { snapshot_sha256: "hash", collected_at: "2026-10-15T00:00:00Z" },
  };
  const result = clinicalFromCatalogue(catalogue, "Example");
  assert.equal(result.fields.dosage, "Exact source dose");
  assert.equal(result.fields.pregnancy_risk_category, null);
  assert.equal(result.pregnancy_scheme, null);
  assert.match(
    result.fields.pregnancy_information,
    /scheme and jurisdiction not supplied/,
  );
  assert.equal(result.collected_at, catalogue.report.collected_at);
  assert.equal(
    clinicalFromCatalogue(
      { ...catalogue, ingredients: [ingredient, ingredient] },
      "Example",
    ),
    null,
  );
});
