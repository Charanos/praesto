import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { CATALOGUE_TABLES, sha256, validateRecords } from "./collect.mjs";
const active = (rows) => (rows ?? []).filter((row) => row.deleted !== true);
const index = (rows, key) =>
  new Map(active(rows).map((row) => [row[key], row]));
const group = (rows, key) => {
  const map = new Map();
  for (const row of active(rows)) {
    const list = map.get(row[key]) ?? [];
    list.push(row);
    map.set(row[key], list);
  }
  return map;
};
const keysFor = (rows, key) =>
  [...new Set((rows ?? []).map((row) => row[key]).filter(Boolean))].sort();
const present = (value) =>
  typeof value === "string"
    ? !!value.replace(/<[^>]*>/g, "").trim()
    : value != null;
export function prepareCatalogue(raw, manifest) {
  const ingredients = index(raw.active_ingredients, "ai_key"),
    brands = index(raw.brands, "brand_key"),
    manufacturers = index(raw.manufacturers, "manufacturer_key"),
    distributors = index(raw.distributors, "distributor_key"),
    countries = index(raw.countries, "country_key"),
    categories = index(raw.categories, "category_key"),
    subcategories = index(raw.subcategories, "subcategory_key"),
    pregnancy = index(raw.pregnancy_categories, "pregnancy_key"),
    atc = index(raw.atc_codes, "atc_code"),
    descriptions = index(raw.interaction_descriptions, "description_key");
  const joins = Object.fromEntries(
    [
      "join_ai_and_categories",
      "join_ai_and_subcategories",
      "join_ai_and_base_ai",
      "join_ai_and_pregnancy_categories",
      "active_ingredient_atc",
      "active_ingredient_components",
      "active_ingredient_dose_regimens",
      "active_ingredient_clinical_statements",
      "active_ingredient_pregnancy_details",
      "active_ingredient_lactation_details",
    ].map((table) => [
      table,
      group(
        raw[table],
        table === "active_ingredient_components" ? "parent_ai_key" : "ai_key",
      ),
    ]),
  );
  const byIngredient = group([...brands.values()], "ai_key"),
    variants = group(raw.variants, "brand_key"),
    prices = group(raw.brand_variant_prices, "variant_key"),
    brandDistributors = group(raw.join_brands_and_distributors, "brand_key");
  const interactions = new Map();
  for (const row of active(raw.component_interactions)) {
    const ids = new Set(
      [
        row.source_type === "active_ingredient" ? row.source_key : null,
        row.target_type === "active_ingredient" ? row.target_key : null,
      ].filter(Boolean),
    );
    for (const id of ids) {
      const list = interactions.get(id) ?? [];
      const resolvedName = (side) =>
        row[`${side}_name`] ??
        row[`custom_${side}_name`] ??
        ingredients.get(row[`${side}_key`])?.name ??
        subcategories.get(row[`${side}_key`])?.name ??
        categories.get(row[`${side}_key`])?.name ??
        null;
      list.push({
        ...row,
        resolved_source_name: resolvedName("source"),
        resolved_target_name: resolvedName("target"),
        details: descriptions.get(row.description_key) ?? null,
      });
      interactions.set(id, list);
    }
  }
  const builtIngredients = [...ingredients.values()].map((row) => {
    const id = row.ai_key;
    return {
      ...row,
      source_url: `https://drugindex.it/active_ingredients/${encodeURIComponent(id)}`,
      category_keys: keysFor(
        joins.join_ai_and_categories.get(id),
        "category_key",
      ),
      subcategory_keys: keysFor(
        joins.join_ai_and_subcategories.get(id),
        "subcategory_key",
      ),
      base_ai_keys: keysFor(joins.join_ai_and_base_ai.get(id), "base_ai_key"),
      pregnancy_categories: (
        joins.join_ai_and_pregnancy_categories.get(id) ?? []
      )
        .map((j) => pregnancy.get(j.pregnancy_key))
        .filter(Boolean),
      atc_classifications: (joins.active_ingredient_atc.get(id) ?? []).map(
        (link) => ({ ...link, code: atc.get(link.atc_code) ?? null }),
      ),
      components: joins.active_ingredient_components.get(id) ?? [],
      dose_regimens: joins.active_ingredient_dose_regimens.get(id) ?? [],
      clinical_statements:
        joins.active_ingredient_clinical_statements.get(id) ?? [],
      pregnancy_details:
        joins.active_ingredient_pregnancy_details.get(id) ?? [],
      lactation_details:
        joins.active_ingredient_lactation_details.get(id) ?? [],
      interactions: interactions.get(id) ?? [],
      brand_keys: (byIngredient.get(id) ?? []).map((b) => b.brand_key),
    };
  });
  const builtBrands = [...brands.values()].map((row) => ({
    ...row,
    source_url: row.ai_key
      ? `https://drugindex.it/active_ingredients/${encodeURIComponent(row.ai_key)}?brand=${encodeURIComponent(row.brand_key)}`
      : `https://drugindex.it/brands/${encodeURIComponent(row.brand_key)}`,
    ingredient_name: ingredients.get(row.ai_key)?.name ?? null,
    manufacturer: manufacturers.get(row.manufacturer_key) ?? null,
    distributors: (brandDistributors.get(row.brand_key) ?? [])
      .map((j) => distributors.get(j.distributor_key))
      .filter(Boolean),
    variants: (variants.get(row.brand_key) ?? []).map((variant) => ({
      ...variant,
      country: countries.get(variant.country_key) ?? null,
      prices: prices.get(variant.variant_key) ?? [],
    })),
    quality_flags: [
      ...(!ingredients.has(row.ai_key) ? ["ingredient_link_missing"] : []),
      ...(!manufacturers.has(row.manufacturer_key)
        ? ["manufacturer_link_missing"]
        : []),
      ...(/^(?:test|demo)(?:\s|$)|\bjames$/i.test(row.name ?? "")
        ? ["possible_editorial_or_test_name"]
        : []),
    ],
  }));
  const votes = new Map();
  for (const ingredient of builtIngredients) {
    for (const sub of ingredient.subcategory_keys) {
      const tally = votes.get(sub) ?? new Map();
      for (const category of ingredient.category_keys.filter((key) =>
        categories.has(key),
      ))
        tally.set(category, (tally.get(category) ?? 0) + 1);
      votes.set(sub, tally);
    }
  }
  const linkedSubcategories = [...subcategories.values()].map((row) => {
    if (row.category_key)
      return {
        ...row,
        category_key_source: "source",
        category_key_confidence: 1,
      };
    const tally = [
      ...(votes.get(row.subcategory_key) ?? new Map()).entries(),
    ].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return {
      ...row,
      source_category_key: row.category_key ?? null,
      category_key: tally[0]?.[0] ?? null,
      category_key_source: tally.length
        ? "derived_via_ingredients"
        : "unlinked",
      category_key_confidence: tally.length
        ? Math.round(
            (1000 * tally[0][1]) / tally.reduce((n, v) => n + v[1], 0),
          ) / 1000
        : null,
    };
  });
  const references = [
    ["brands", "ai_key", "active_ingredients", "ai_key"],
    ["brands", "manufacturer_key", "manufacturers", "manufacturer_key"],
    ["variants", "brand_key", "brands", "brand_key"],
    ["variants", "country_key", "countries", "country_key"],
    ["brand_variant_prices", "variant_key", "variants", "variant_key"],
    ["join_ai_and_categories", "ai_key", "active_ingredients", "ai_key"],
    ["join_ai_and_categories", "category_key", "categories", "category_key"],
    ["join_ai_and_subcategories", "ai_key", "active_ingredients", "ai_key"],
    [
      "join_ai_and_subcategories",
      "subcategory_key",
      "subcategories",
      "subcategory_key",
    ],
    ["join_brands_and_distributors", "brand_key", "brands", "brand_key"],
    [
      "join_brands_and_distributors",
      "distributor_key",
      "distributors",
      "distributor_key",
    ],
    ["active_ingredient_atc", "ai_key", "active_ingredients", "ai_key"],
    ["active_ingredient_atc", "atc_code", "atc_codes", "atc_code"],
    [
      "active_ingredient_components",
      "component_ai_key",
      "active_ingredients",
      "ai_key",
    ],
  ];
  const linkage = references.map(([table, key, parent, parentKey]) => {
    const known = new Set(active(raw[parent]).map((row) => row[parentKey]));
    const rows = active(raw[table]);
    const missing = rows.filter((row) => !row[key]);
    const orphan = rows.filter((row) => row[key] && !known.has(row[key]));
    return {
      table,
      field: key,
      parent,
      records: rows.length,
      missing: missing.length,
      dangling: orphan.length,
      examples: orphan.slice(0, 5).map((row) => row[key]),
    };
  });
  const fieldCoverage = Object.fromEntries(
    [
      "indications",
      "mode_of_action",
      "dosage",
      "precautions",
      "contraindications",
      "side_effects",
      "breastfeeding",
      "special_information",
      "considerations",
      "additional_labelling",
    ].map((key) => [
      key,
      {
        provided: builtIngredients.filter((row) => present(row[key])).length,
        total: builtIngredients.length,
      },
    ]),
  );
  const report = {
    schema_version: "drugindex-reference/1",
    prepared_at: new Date().toISOString(),
    collected_at: manifest.finished_at,
    source: "Drug Index",
    source_url: "https://drugindex.it",
    snapshot_sha256: sha256(JSON.stringify(manifest)),
    counts: Object.fromEntries(
      Object.entries(raw).map(([table, rows]) => [
        table,
        {
          captured: rows.length,
          active: active(rows).length,
          deleted: rows.filter((row) => row.deleted === true).length,
        },
      ]),
    ),
    field_coverage: fieldCoverage,
    linkage,
    editorial_flags: builtBrands
      .filter((row) =>
        row.quality_flags.includes("possible_editorial_or_test_name"),
      )
      .map(({ brand_key, name }) => ({ brand_key, name })),
    limitations: manifest.limitations,
  };
  return {
    schema_version: 1,
    report,
    ingredients: builtIngredients,
    brands: builtBrands,
    manufacturers: [...manufacturers.values()],
    distributors: [...distributors.values()],
    categories: [...categories.values()],
    subcategories: linkedSubcategories,
    countries: [...countries.values()],
    pregnancy_categories: [...pregnancy.values()],
  };
}
export async function prepare(snapshot, out) {
  const manifest = JSON.parse(
    await readFile(path.join(snapshot, "manifest.json"), "utf8"),
  );
  if (
    manifest.status !== "complete" ||
    Object.keys(manifest.tables).length !== Object.keys(CATALOGUE_TABLES).length
  )
    throw new Error("Only a verified complete capture can be prepared");
  const raw = {};
  for (const [table, keys] of Object.entries(CATALOGUE_TABLES)) {
    const entry = manifest.tables[table],
      bytes = await readFile(path.join(snapshot, entry.file));
    if (sha256(bytes) !== entry.sha256)
      throw new Error(`${table}: file integrity failed`);
    raw[table] = JSON.parse(bytes);
    validateRecords(raw[table], keys, entry.total);
  }
  const catalogue = prepareCatalogue(raw, manifest);
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, "catalogue.json"), JSON.stringify(catalogue));
  await writeFile(
    path.join(out, "coverage.json"),
    JSON.stringify(catalogue.report, null, 2),
  );
  await copyFile(
    path.join(snapshot, "manifest.json"),
    path.join(out, "capture-manifest.json"),
  );
  // The six legacy reference files remain backward compatible; derived hierarchy links are explicit.
  const compatible = path.join(out, "compatible");
  await mkdir(compatible, { recursive: true });
  const records = catalogue.ingredients.map((row) => ({
    ...raw.active_ingredients.find((source) => source.ai_key === row.ai_key),
    category_keys: row.category_keys,
    subcategory_keys: row.subcategory_keys,
    category_key: row.category_keys[0] ?? null,
    subcategory_key: row.subcategory_keys[0] ?? null,
  }));
  const tables = {
    active_ingredients: records,
    brands: active(raw.brands),
    manufacturers: active(raw.manufacturers),
    distributors: active(raw.distributors),
    categories: active(raw.categories),
    subcategories: catalogue.subcategories,
    join_ai_and_categories: active(raw.join_ai_and_categories),
    join_ai_and_subcategories: active(raw.join_ai_and_subcategories),
    join_brands_and_distributors: active(raw.join_brands_and_distributors),
  };
  for (const [table, rows] of Object.entries(tables))
    await writeFile(
      path.join(compatible, `drugindex_${table}.json`),
      JSON.stringify(rows),
    );
  console.log(
    JSON.stringify(
      {
        ingredients: catalogue.ingredients.length,
        brands: catalogue.brands.length,
        tables: Object.keys(raw).length,
        records: manifest.record_count,
        coverage_file: path.resolve(out, "coverage.json"),
      },
      null,
      2,
    ),
  );
  return catalogue;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const { values } = parseArgs({
    options: { snapshot: { type: "string" }, out: { type: "string" } },
  });
  if (!values.snapshot || !values.out)
    throw new Error(
      "Usage: node tools/drugindex/prepare.mjs --snapshot <capture folder> --out <prepared folder>",
    );
  await prepare(path.resolve(values.snapshot), path.resolve(values.out));
}
