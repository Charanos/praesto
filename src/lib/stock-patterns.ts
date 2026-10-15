import type { OverviewStore, OverviewPharmacy } from "./overview-types";
export type EvidenceState = "in" | "out" | "unknown" | "unlisted" | "conflict";
export type StockPattern = "in" | "mixed" | "out" | "unknown";
export function pharmacyEvidence(store: OverviewStore, index: number) {
  const groups: Record<EvidenceState, OverviewPharmacy[]> = {
    in: [],
    out: [],
    unknown: [],
    unlisted: [],
    conflict: [],
  };
  for (const shop of store.shops) {
    const bit = 1 << shop.bit;
    let state: EvidenceState = "unknown";
    if (!(store.P.listedMask[index] & bit)) state = "unlisted";
    else if (shop.publishes_oos) {
      const stocked = !!(store.P.inMask[index] & bit),
        out = !!(store.P.oosMask[index] & bit);
      state =
        stocked && out ? "conflict" : out ? "out" : stocked ? "in" : "unknown";
    }
    groups[state].push(shop);
  }
  return groups;
}
export function productPattern(store: OverviewStore, index: number) {
  const groups = pharmacyEvidence(store, index),
    inStock = groups.in.length + groups.conflict.length,
    out = groups.out.length + groups.conflict.length;
  const kind: StockPattern =
    inStock && out ? "mixed" : inStock ? "in" : out ? "out" : "unknown";
  return { index, inStock, out, kind };
}
export function stockPatternPoints(store: OverviewStore, rows: number[]) {
  const map = new Map<
    string,
    {
      inStock: number;
      out: number;
      count: number;
      kind: StockPattern;
      names: string[];
    }
  >();
  for (const index of rows) {
    const point = productPattern(store, index),
      key = `${point.inStock}:${point.out}`,
      existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.names.push(store.P.name[index]);
    } else
      map.set(key, {
        inStock: point.inStock,
        out: point.out,
        count: 1,
        kind: point.kind,
        names: [store.P.name[index]],
      });
  }
  return Array.from(map.values());
}
