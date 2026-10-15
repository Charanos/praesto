/** Private, development-only access to the verified local reference capture. */
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const cataloguePath = fileURLToPath(
  new URL(
    "../../04_Working Data/drugindex-reference/catalogue.json",
    import.meta.url,
  ),
);
let cache;
export async function loadReferenceCatalogue() {
  const info = await stat(cataloguePath);
  if (cache?.mtime === info.mtimeMs) return cache.promise;
  const promise = readFile(cataloguePath, "utf8").then(JSON.parse);
  cache = { mtime: info.mtimeMs, promise };
  try {
    return await promise;
  } catch (error) {
    cache = undefined;
    throw error;
  }
}
export function referencePage(
  catalogue,
  { kind = "brands", q = "", offset = 0, limit = 25 } = {},
) {
  if (
    !["brands", "ingredients", "manufacturers", "distributors"].includes(kind)
  )
    throw new Error("Unknown reference entity");
  const needle = String(q).trim().toLocaleLowerCase().slice(0, 200);
  const rows = catalogue[kind]
    .filter(
      (row) =>
        !needle ||
        [
          row.name,
          row.ingredient_name,
          row.manufacturer?.name,
          row.country_key,
          ...(row.atc_classifications ?? []).map((a) => a.atc_code),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(needle),
    )
    .sort((a, b) =>
      (a.name ?? "").trim().localeCompare((b.name ?? "").trim(), "en"),
    );
  limit = Math.max(1, Math.min(50, Number(limit) || 25));
  offset = Math.max(0, Math.trunc(Number(offset) || 0));
  return {
    schema_version: 1,
    kind,
    total: rows.length,
    offset,
    limit,
    report: catalogue.report,
    rows: rows.slice(offset, offset + limit).map((row) => ({
      id:
        row.brand_key ??
        row.ai_key ??
        row.manufacturer_key ??
        row.distributor_key,
      name: row.name,
      ingredient_name: row.ingredient_name ?? null,
      manufacturer_name: row.manufacturer?.name ?? null,
      variants: row.variants?.length ?? null,
      brands: row.brand_keys?.length ?? null,
      quality_flags: row.quality_flags ?? [],
    })),
  };
}
export function referenceRecord(catalogue, kind, id) {
  const primary = {
    brands: "brand_key",
    ingredients: "ai_key",
    manufacturers: "manufacturer_key",
    distributors: "distributor_key",
  }[kind];
  if (!primary) return null;
  const record = catalogue[kind].find((row) => row[primary] === id);
  if (!record) return null;
  const ingredient =
    kind === "ingredients"
      ? record
      : kind === "brands"
        ? (catalogue.ingredients.find((a) => a.ai_key === record.ai_key) ??
          null)
        : null;
  const brands =
    kind === "brands"
      ? [record]
      : ingredient
        ? catalogue.brands.filter((b) => b.ai_key === ingredient.ai_key)
        : kind === "manufacturers"
          ? catalogue.brands.filter((b) => b.manufacturer_key === id)
          : kind === "distributors"
            ? catalogue.brands.filter((b) =>
                b.distributors.some((d) => d.distributor_key === id),
              )
            : [];
  return { record, ingredient, brands, report: catalogue.report };
}
function detailText(records, fields) {
  return records
    .map((row) =>
      fields
        .filter(([key]) => row[key] != null && String(row[key]).trim())
        .map(([key, label]) => `${label}: ${row[key]}`)
        .join("\n"),
    )
    .filter(Boolean)
    .join("\n\n");
}
export function clinicalFromCatalogue(catalogue, ingredientName) {
  const matches = catalogue.ingredients.filter(
    (row) => row.name === ingredientName,
  );
  if (matches.length !== 1) return null;
  const row = matches[0];
  const fields = [
    "indications",
    "mode_of_action",
    "precautions",
    "contraindications",
    "drug_interactions",
    "side_effects",
    "dosage",
    "special_information",
    "pregnancy_information",
    "pregnancy_risk_category",
    "breastfeeding",
    "considerations",
    "additional_labelling",
  ];
  const values = Object.fromEntries(
    fields.map((key) => [
      key,
      typeof row[key] === "string" && row[key].trim() ? row[key] : null,
    ]),
  );
  const names = new Map([
    ...catalogue.ingredients.map((r) => [r.ai_key, r.name]),
    ...catalogue.categories.map((r) => [r.category_key, r.name]),
    ...catalogue.subcategories.map((r) => [r.subcategory_key, r.name]),
  ]);
  const interactions = row.interactions
    .map((link) => {
      const opposite = link.source_key === row.ai_key ? "target" : "source";
      const name =
        link[`${opposite}_name`] ??
        link[`custom_${opposite}_name`] ??
        names.get(link[`${opposite}_key`]) ??
        "Unnamed source interaction";
      return [
        name,
        link.details?.severity && `Source severity: ${link.details.severity}`,
        link.details?.effect && `Source effect: ${link.details.effect}`,
        link.details?.description,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
  if (interactions) values.drug_interactions = interactions;
  const pregnancy = detailText(row.pregnancy_details, [
    ["risk_summary", "Source risk summary"],
    ["first_trimester_notes", "First trimester"],
    ["second_third_trimester_notes", "Second/third trimester"],
    ["labor_delivery_notes", "Labour/delivery"],
    ["source_title", "Source"],
    ["review_status", "Source review status"],
  ]);
  const categories = row.pregnancy_categories
    .map((c) => `${c.name}: ${c.description ?? ""}`)
    .join("\n");
  if (pregnancy || categories)
    values.pregnancy_information = [
      pregnancy,
      categories &&
        `Source pregnancy category labels (scheme and jurisdiction not supplied):\n${categories}`,
    ]
      .filter(Boolean)
      .join("\n\n");
  values.pregnancy_risk_category = null;
  if (!values.breastfeeding)
    values.breastfeeding =
      detailText(row.lactation_details, [
        ["risk_summary", "Source summary"],
        ["infant_effects", "Infant effects"],
        ["maternal_effects", "Maternal effects"],
        ["recommendations", "Source recommendations"],
        ["source_title", "Source"],
        ["review_status", "Source review status"],
      ]) || null;
  return {
    schema_version: 1,
    ingredient_id: row.ai_key,
    ingredient_name: row.name,
    source: "Drug Index · verified local capture",
    source_version: catalogue.report.snapshot_sha256,
    source_url: row.source_url,
    source_updated_at: row.updated_at ?? null,
    collected_at: catalogue.report.collected_at,
    clinical_reviewed_at: null,
    pregnancy_scheme: null,
    jurisdiction: null,
    local_preview: true,
    fields: values,
  };
}
export function referenceLibrary() {
  return {
    name: "private-reference-library",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(
        "/__reference-library",
        async (request, response) => {
          response.setHeader("Content-Type", "application/json; charset=utf-8");
          response.setHeader("Cache-Control", "no-store");
          if (request.method !== "GET") {
            response.statusCode = 405;
            response.end("{}");
            return;
          }
          try {
            const url = new URL(request.url, "http://localhost"),
              catalogue = await loadReferenceCatalogue();
            const kind = url.searchParams.get("kind") ?? "brands";
            const result =
              url.pathname === "/record"
                ? referenceRecord(catalogue, kind, url.searchParams.get("id"))
                : referencePage(catalogue, {
                    kind,
                    q: url.searchParams.get("q") ?? "",
                    offset: url.searchParams.get("offset"),
                    limit: url.searchParams.get("limit"),
                  });
            if (!result) {
              response.statusCode = 404;
              response.end("{}");
              return;
            }
            response.end(JSON.stringify(result));
          } catch (error) {
            response.statusCode = error.code === "ENOENT" ? 404 : 503;
            response.end(
              JSON.stringify({
                error: "Local reference capture is unavailable",
              }),
            );
          }
        },
      );
    },
  };
}
