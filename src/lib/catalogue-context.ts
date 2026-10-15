import type { OverviewFilters, OverviewPharmacy } from "./overview-types";
type Dictionaries = Partial<
  Record<
    | "type"
    | "therapeutic"
    | "matchBand"
    | "gap"
    | "band"
    | "form"
    | "packKind"
    | "category",
    string[]
  >
>;
const typeNames: Record<string, string> = {
  medicine: "Medicines",
  device: "Medical devices",
  supplement: "Supplements",
  cosmetic: "Cosmetics",
  personal_care: "Personal care",
  food: "Food & nutrition",
  sexual_wellness: "Sexual wellness",
  unclassified: "Unclassified products",
};
/** Presentation only: every title describes the unchanged catalogue predicate. */
export function catalogueContext(
  filters: OverviewFilters,
  dictionaries: Dictionaries = {},
  shops: Pick<OverviewPharmacy, "bit" | "name">[] = [],
) {
  const q = filters.q.trim().replace(/\s+/g, " ");
  const source =
    filters.shopsAny.length === 1
      ? shops.find((shop) => shop.bit === filters.shopsAny[0])?.name
      : null;
  const type =
    filters.types.length === 1 ? dictionaries.type?.[filters.types[0]] : null;
  const therapeutic =
    filters.therapeutic.length === 1
      ? dictionaries.therapeutic?.[filters.therapeutic[0]]
      : null;
  let title = "Find & compare";
  if (q) title = q.length <= 70 ? `“${q}”` : "Search results";
  else if (source) title = `${source} catalogue`;
  else if (filters.review === "needs_review")
    title = "Product matches to review";
  else if (filters.gaps.length) title = "Products with reference gaps";
  else if (filters.clinicalOnly) title = "Medicines & devices";
  else if (type) title = typeNames[type] ?? type.replaceAll("_", " ");
  else if (therapeutic) title = therapeutic;
  else if (filters.stockIn.length && filters.stockOut.length)
    title = "Mixed stock reports";
  else if (filters.stockIn.length) title = "Products reported in stock";
  else if (filters.stockOut.length) title = "Products reported out of stock";
  else if (filters.matchBands.length === 1)
    title = `${dictionaries.matchBand?.[filters.matchBands[0]] ?? "Selected"} confidence products`;
  else if (filters.monograph === "with") title = "Reference-linked products";
  else if (filters.monograph === "without")
    title = "Products without a reference link";
  else if (
    filters.types.length ||
    filters.therapeutic.length ||
    filters.shopsAll.length ||
    filters.bands.length ||
    filters.forms.length ||
    filters.packKinds.length ||
    filters.categories.length ||
    filters.contested ||
    filters.review !== "all" ||
    filters.priceMin != null ||
    filters.priceMax != null ||
    filters.listedMin ||
    filters.listedMax ||
    filters.oosMin ||
    filters.oosMax ||
    filters.confMin
  )
    title = "Filtered products";
  const scope: string[] = [];
  if (q.length > 70) scope.push(`Search: ${q}`);
  if (source) scope.push(`Listed at ${source}`);
  else if (filters.shopsAny.length > 1)
    scope.push(
      `Listed at any of ${filters.shopsAny.length} selected pharmacies`,
    );
  if (filters.shopsAll.length)
    scope.push(`Listed at all ${filters.shopsAll.length} selected pharmacies`);
  if (filters.clinicalOnly) scope.push("Medicines & devices");
  else if (type) scope.push(typeNames[type] ?? type.replaceAll("_", " "));
  if (filters.stockIn.length)
    scope.push("At least one selected source reports in stock");
  if (filters.stockOut.length)
    scope.push("At least one selected source reports out of stock");
  if (filters.review === "needs_review")
    scope.push("Product identity or classification needs review");
  return { title, description: scope.join(" · ") };
}
/** Facet accents distinguish selection categories, never replace stock-state text. */
export function filterAccent(key: string): { tone: string; icon: string } {
  if (key === "q") return { tone: "cobalt", icon: "search" };
  if (key === "clinicalOnly" || key.startsWith("type:"))
    return { tone: "berry", icon: "medical-kit" };
  if (key === "price") return { tone: "amber", icon: "coins" };
  if (key.startsWith("in:")) return { tone: "teal", icon: "package-check" };
  if (key.startsWith("out:") || key === "oos" || key.startsWith("band:"))
    return { tone: "coral", icon: "package-minus" };
  if (/^(any:|all:)/.test(key)) return { tone: "cobalt", icon: "pharmacy" };
  if (/^(mb:|conf|review|contested)/.test(key))
    return { tone: "amber", icon: "scan" };
  if (/^(gap:|tx:|mono)/.test(key)) return { tone: "berry", icon: "book" };
  return { tone: "slate", icon: "filter" };
}
