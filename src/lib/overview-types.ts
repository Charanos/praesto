import type { ComponentType } from "react";

/** UI projection of contract 1.1.0. The worker and curated payload stay unchanged. */
export interface OverviewPharmacy {
  pharmacy_id: string;
  name: string;
  bit: number;
  present_in_snapshot: boolean;
  publishes_oos: boolean;
  in_stock: number;
  out_of_stock: number;
  listings: number;
}
export interface OverviewMeta {
  headline: {
    products: number;
    listings: number;
    pharmacies: number;
    in_stock: number;
    out_of_stock: number;
    not_published: number;
    snapshot_at: string;
    median_price_kes: number | null;
  };
  run: {
    snapshot_id: string;
    snapshot_at_inferred: boolean;
    match_algo_version: string;
    classifier_version: string;
    drugindex_fingerprint: string;
  };
  coverage: {
    products_unclassified: number;
    products_with_active_ingredient: number;
    products_awaiting_drugindex: number;
  };
  contract_version: string;
  pharmacies: OverviewPharmacy[];
}
export type OverviewFilters = Record<
  | "types"
  | "bands"
  | "matchBands"
  | "gaps"
  | "forms"
  | "shopsAny"
  | "shopsAll"
  | "stockIn"
  | "stockOut"
  | "packKinds"
  | "categories"
  | "therapeutic",
  number[]
> &
  Record<"listedMin" | "listedMax" | "oosMin" | "oosMax" | "confMin", number> &
  Record<"priceMin" | "priceMax", number | null> & {
    q: string;
    review: string;
    monograph: string;
    clinicalOnly: boolean;
    contested: boolean;
  };
export interface OverviewScenario {
  key: string;
  label: string;
  inStock: number;
  total: number;
  rate: number | null;
  note: string;
}
export interface OverviewCoverage {
  label: string;
  min: number;
  max: number;
  count: number;
}
export interface OverviewChartDatum {
  [field: string]: unknown;
  label: string;
  count: number;
  fill?: string;
}
export interface OverviewChartProps {
  kind: "composition" | "coverage-ring" | "availability-ring" | "price";
  data: OverviewChartDatum[];
  label: string;
  className?: string;
}
export type OverviewChart = ComponentType<OverviewChartProps>;
export interface OverviewModel {
  stats: {
    clinical: number;
    byType: ArrayLike<number>;
    byBand: ArrayLike<number>;
    byMatch: ArrayLike<number>;
    price: {
      p10: number | null;
      p50: number | null;
      p90: number | null;
      n: number;
    };
  };
  rows: number[];
  reportable: number[];
  clinicalMulti: number;
  clinicalPatch: Partial<OverviewFilters>;
  broad: number[];
  broadClinical: number[];
  reporting: (OverviewPharmacy & { rated: number; rate: number | null })[];
  listedOnly: OverviewPharmacy[];
  coverage: OverviewCoverage[];
  price: (OverviewChartDatum & { max: number })[];
  scenarios: OverviewScenario[];
  reviewCount: number;
}
export interface OverviewStore {
  meta: OverviewMeta;
  shops: OverviewPharmacy[];
  absent: OverviewPharmacy[];
  overviewModel?: OverviewModel;
  P: {
    key: string[];
    name: string[];
    ingredient: ArrayLike<number>;
    priceMed: ArrayLike<number>;
    listedMask: ArrayLike<number>;
    inMask: ArrayLike<number>;
    oosMask: ArrayLike<number>;
  };
  D: {
    type: string[];
    band: string[];
    matchBand: string[];
    ingredient: string[];
  };
}
export interface OverviewCategory {
  name: string;
  count: number;
  index: number;
}
export interface OverviewEvidence {
  inStock: string[];
  out: string[];
  unrated: string[];
  countIn: number;
}
