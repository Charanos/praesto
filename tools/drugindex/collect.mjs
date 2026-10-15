import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
export const CATALOGUE_TABLES = {
  active_ingredients: ["ai_key"],
  categories: ["category_key"],
  subcategories: ["subcategory_key"],
  pregnancy_categories: ["pregnancy_key"],
  countries: ["country_key"],
  guidelines: ["id"],
  manufacturers: ["manufacturer_key"],
  distributors: ["distributor_key"],
  brands: ["brand_key"],
  variants: ["variant_key"],
  brand_variant_prices: ["brand_variant_price_id"],
  component_interactions: ["interaction_key"],
  interaction_descriptions: ["description_key"],
  atc_codes: ["atc_code"],
  active_ingredient_atc: ["ai_key", "atc_code"],
  active_ingredient_components: ["component_id"],
  active_ingredient_dose_regimens: ["dose_regimen_id"],
  active_ingredient_clinical_statements: ["clinical_statement_id"],
  active_ingredient_pregnancy_details: ["pregnancy_detail_id"],
  active_ingredient_lactation_details: ["lactation_detail_id"],
  active_ingredient_field_status: ["field_status_id"],
  variant_components: ["variant_component_id"],
  join_ai_and_categories: ["ai_key", "category_key"],
  join_ai_and_subcategories: ["ai_key", "subcategory_key"],
  join_ai_and_pregnancy_categories: ["ai_key", "pregnancy_key"],
  join_ai_and_base_ai: ["ai_key", "base_ai_key"],
  join_brands_and_distributors: ["brand_key", "distributor_key"],
  guideline_sources: ["source_id"],
  guideline_sections: ["section_id"],
  guideline_recommendations: ["recommendation_id"],
  guideline_medicine_links: ["recommendation_id", "ai_key"],
  pharma_products: ["id"],
};
const ORIGIN = "https://drugindex.it";
const API = "https://ipkbpevmnowttyyejmar.supabase.co/rest/v1";
const OMIT = new Set(["embedding", "search_vector"]);
export const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function request(url, headers = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, {
      headers,
      credentials: "omit",
      signal: AbortSignal.timeout(60000),
    });
    if (response.ok) return response;
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3)
      throw new Error(
        `Source request failed: HTTP ${response.status} at ${new URL(url).pathname}`,
      );
    const retry = Number(response.headers.get("retry-after"));
    await pause(
      Number.isFinite(retry) && retry > 0
        ? Math.min(60000, retry * 1000)
        : 1000 * 2 ** attempt,
    );
  }
  throw new Error("Request retry exhausted");
}
export function publicAnonKey(html) {
  for (const candidate of html.match(
    /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}/g,
  ) || []) {
    try {
      if (
        JSON.parse(Buffer.from(candidate.split(".")[1], "base64url")).role ===
        "anon"
      )
        return candidate;
    } catch {}
  }
  throw new Error(
    "No public anon configuration found. Browser credentials are never extracted.",
  );
}
export function exactTotal(range) {
  const suffix = range?.split("/").at(-1);
  if (!/^\d+$/.test(suffix ?? ""))
    throw new Error("Source did not return an exact row count");
  return Number(suffix);
}
export function validateRecords(rows, keys, total) {
  if (!Array.isArray(rows) || rows.length !== total)
    throw new Error(
      `Incomplete table: expected ${total}, received ${rows?.length}`,
    );
  const seen = new Set();
  for (const row of rows) {
    if (
      !row ||
      typeof row !== "object" ||
      keys.some((key) => row[key] === null || row[key] === undefined)
    )
      throw new Error("Missing source identity");
    const identity = JSON.stringify(keys.map((key) => row[key]));
    if (seen.has(identity))
      throw new Error("Duplicate source identity; table cannot be promoted");
    seen.add(identity);
  }
  return true;
}
async function atomicJson(filename, value) {
  const bytes = JSON.stringify(value);
  await writeFile(filename + ".tmp", bytes);
  await rename(filename + ".tmp", filename);
  return { sha256: sha256(bytes), bytes: Buffer.byteLength(bytes) };
}
export async function collect(out, { pageSize = 500, resume = false } = {}) {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000)
    throw new Error("Page size must be 1–1000");
  out = path.resolve(out);
  await mkdir(path.join(out, "raw"), { recursive: true });
  await mkdir(path.join(out, "pages"), { recursive: true });
  const manifestPath = path.join(out, "manifest.json");
  let manifest;
  if (resume) manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  else {
    try {
      await readFile(manifestPath);
      throw new Error("Snapshot already exists; use a new folder or --resume");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  manifest ??= {
    schema_version: "drugindex-capture/1",
    started_at: new Date().toISOString(),
    source: ORIGIN,
    access:
      "Public frontend catalogue API. No browser cookies, passwords or user tokens exported.",
    scope:
      "32 catalogue/reference datasets observed in the first-party offline sync model. Account, subscription, payment, search-history and parser-job tables excluded.",
    discovery_source: "https://drugindex.it/_app/immutable/chunks/4g9y3GTf.js",
    status: "collecting",
    tables: {},
    limitations: [
      "Counts are verified against the API-visible catalogue, not an assumed global medicines inventory.",
      "The source is not a transactionally frozen export; collection times and start/end counts are retained.",
      "Source clinical text and structured extraction records are not independently clinically reviewed.",
      "Reference prices and editions are distinct from captured pharmacy stock and current retail prices.",
    ],
  };
  const html = await (await request(ORIGIN + "/active_ingredients")).text();
  const key = publicAnonKey(html);
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "count=exact",
    Accept: "application/json",
  };
  await atomicJson(manifestPath, manifest);
  try {
    for (const [table, keys] of Object.entries(CATALOGUE_TABLES)) {
      const probe = await request(`${API}/${table}?select=*&limit=1`, headers);
      const first = await probe.json();
      const total = exactTotal(probe.headers.get("content-range"));
      const columns = Object.keys(first[0] || {}).filter(
        (column) => !OMIT.has(column),
      );
      let state = manifest.tables[table];
      if (state?.total !== undefined && state.total !== total)
        throw new Error(
          `${table}: source row count changed during capture; start a new snapshot`,
        );
      if (state?.status === "complete") {
        const bytes = await readFile(path.join(out, state.file));
        if (sha256(bytes) !== state.sha256)
          throw new Error(`${table}: saved file integrity failed`);
        console.log(`${table}: ${total} verified saved records`);
        continue;
      }
      state ??= {
        started_at: new Date().toISOString(),
        total,
        keys,
        columns,
        omitted_columns: Object.keys(first[0] || {}).filter((c) => OMIT.has(c)),
        pages: [],
        status: "collecting",
      };
      manifest.tables[table] = state;
      let offset = state.pages.reduce((sum, p) => sum + p.rows, 0);
      const selection = columns.length ? columns.join(",") : "*";
      while (offset < total) {
        const url = new URL(`${API}/${table}`);
        url.search = new URLSearchParams({
          select: selection,
          order: keys.map((key) => key + ".asc").join(","),
          offset: String(offset),
          limit: String(pageSize),
        }).toString();
        const response = await request(url, headers);
        const count = exactTotal(response.headers.get("content-range"));
        if (count !== total)
          throw new Error(`${table}: source count changed while paging`);
        const batch = await response.json();
        if (
          !Array.isArray(batch) ||
          !batch.length ||
          batch.length > pageSize ||
          offset + batch.length > total
        )
          throw new Error(`${table}: invalid or truncated page at ${offset}`);
        const file = `pages/${table}-${String(offset).padStart(7, "0")}.json`;
        const digest = await atomicJson(path.join(out, file), batch);
        state.pages.push({ offset, rows: batch.length, file, ...digest });
        offset += batch.length;
        await atomicJson(manifestPath, manifest);
        await pause(180);
      }
      const rows = [];
      for (const page of state.pages) {
        const bytes = await readFile(path.join(out, page.file));
        if (sha256(bytes) !== page.sha256)
          throw new Error(`${table}: page hash mismatch`);
        rows.push(...JSON.parse(bytes));
      }
      validateRecords(rows, keys, total);
      const end = await request(
        `${API}/${table}?select=${keys.join(",")}&limit=1`,
        headers,
      );
      if (exactTotal(end.headers.get("content-range")) !== total)
        throw new Error(`${table}: final count changed`);
      const file = `raw/drugindex_${table}.json`;
      Object.assign(state, {
        file,
        ...(await atomicJson(path.join(out, file), rows)),
        status: "complete",
        finished_at: new Date().toISOString(),
        deleted: rows.filter((row) => row.deleted === true).length,
      });
      await atomicJson(manifestPath, manifest);
      console.log(
        `${table}: ${rows.length} records, ${state.pages.length} pages, hash verified`,
      );
    }
    manifest.status = "complete";
    delete manifest.error;
    delete manifest.interrupted_at;
    manifest.finished_at = new Date().toISOString();
    manifest.record_count = Object.values(manifest.tables).reduce(
      (n, t) => n + t.total,
      0,
    );
    await atomicJson(manifestPath, manifest);
    console.log(
      `Complete: ${Object.keys(manifest.tables).length} tables; ${manifest.record_count} records`,
    );
    return manifest;
  } catch (error) {
    manifest.status = "incomplete";
    manifest.error = error.message;
    manifest.interrupted_at = new Date().toISOString();
    await atomicJson(manifestPath, manifest);
    throw error;
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const { values } = parseArgs({
    options: {
      out: { type: "string" },
      resume: { type: "boolean", default: false },
      "page-size": { type: "string", default: "500" },
    },
  });
  if (!values.out)
    throw new Error(
      "Usage: node tools/drugindex/collect.mjs --out <private snapshot folder> [--resume]",
    );
  await collect(values.out, {
    resume: values.resume,
    pageSize: Number(values["page-size"]),
  });
}
