import { useMemo } from "react";
import OverviewVisuals from "./OverviewVisuals";
import { EvidenceBadge } from "./EvidenceControls";
import { Icon } from "./icons";
import PharmacyGlyph from "./PharmacyGlyph";
import { n0, n1, kes } from "./ui.jsx";
import type {
  OverviewPharmacy,
  OverviewChartDatum,
} from "../lib/overview-types";
import type { SelectionStats } from "./CatalogueSelectionStats";
type Source = {
  shop: OverviewPharmacy;
  listed: number;
  inStock: number;
  oos: number;
  rate: number | null;
};
const tones: Record<string, string> = {
  medicine: "teal",
  device: "cobalt",
  supplement: "amber",
  cosmetic: "coral",
  personal_care: "botanical",
  food: "berry",
  sexual_wellness: "ink-2",
  unclassified: "ink-3",
};
const names: Record<string, string> = {
  medicine: "Medicines",
  device: "Medical devices",
  supplement: "Supplements",
  cosmetic: "Cosmetics",
  personal_care: "Personal care",
  food: "Food & nutrition",
  sexual_wellness: "Sexual wellness",
  unclassified: "Unclassified",
};
const bands: Record<string, string> = {
  cluster: "3+ sources out",
  local: "2 sources out",
  isolated: "1 source out",
  none: "No stockout report",
};

export default function CatalogueAnalytics({
  stats,
  sources,
  total,
  types,
  bandLabels,
  selectedTypes,
  selectedBands,
  selectedSources,
  onType,
  onBand,
  onSource,
}: {
  stats: SelectionStats;
  sources: Source[];
  total: number;
  types: string[];
  bandLabels: string[];
  selectedTypes: number[];
  selectedBands: number[];
  selectedSources: number[];
  onType: (index: number) => void;
  onBand: (index: number) => void;
  onSource: (bit: number) => void;
}) {
  const price = useMemo(() => {
    const edges = [250, 500, 1000, 2500, 5000, 10000, Infinity];
    const labels = [
      "≤250",
      "250–500",
      "500–1k",
      "1k–2.5k",
      "2.5k–5k",
      "5k–10k",
      ">10k",
    ];
    const bins = edges.map((max, index) => ({
      label: labels[index],
      max,
      count: 0,
    }));
    for (const value of stats.prices) {
      const bucket = bins.find((b) => value <= b.max);
      if (bucket) bucket.count++;
    }
    return bins;
  }, [stats.prices]);
  const composition: OverviewChartDatum[] = types.map((type, index) => ({
    label: names[type] || type,
    count: stats.byType[index],
    fill: `var(--${tones[type] || "ink-3"})`,
  }));
  const reporting = sources
    .filter((s) => s.shop.publishes_oos)
    .sort((a, b) => b.listed - a.listed);
  const listedOnly = sources.filter((s) => !s.shop.publishes_oos);
  return (
    <div className="catalogue-analytics">
      <header className="catalogue-analysis-heading">
        <h2>Read the selection.</h2>
        <p>
          Explore <b className="num">{n0(total)}</b> products across source
          evidence, price ranges and classification. Select a source or category
          to refine the results.
        </p>
      </header>
      <div className="catalogue-analysis-bento">
        <article className="catalogue-price-analysis">
          <header>
            <Icon name="coins" size={22} />
            <h3>Price distribution</h3>
            <span>Product medians · KES</span>
          </header>
          <div className="catalogue-price-percentiles">
            <span>
              Median <b className="num">{kes(stats.price.p50)}</b>
            </span>
            <span>
              10th percentile <b className="num">{kes(stats.price.p10)}</b>
            </span>
            <span>
              90th percentile <b className="num">{kes(stats.price.p90)}</b>
            </span>
          </div>
          {stats.prices.length ? (
            <div
              className="catalogue-price-visual"
              role="img"
              aria-label={price
                .map((b) => `${b.label} KES: ${n0(b.count)} products`)
                .join("; ")}
            >
              <OverviewVisuals kind="price" data={price} />
            </div>
          ) : (
            <p>No positive median prices are supplied for this selection.</p>
          )}
          <details>
            <summary>Read exact price counts</summary>
            <table>
              <thead>
                <tr>
                  <th>Price band · KES</th>
                  <th>Products</th>
                </tr>
              </thead>
              <tbody>
                {price.map((b) => (
                  <tr key={b.label}>
                    <th scope="row">{b.label}</th>
                    <td className="num">{n0(b.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
          <p>
            {n0(stats.prices.length)} products have positive listed median
            prices. Each band excludes the preceding upper bound and includes
            its own upper bound. Strengths, forms and packs vary; this is not
            treatment cost.
          </p>
        </article>
        <article className="catalogue-type-analysis">
          <header>
            <Icon name="categories" size={22} />
            <h3>Classification mix</h3>
          </header>
          <div
            className="catalogue-type-visual"
            role="img"
            aria-label={composition
              .map((c) => `${c.label}: ${n0(c.count)}`)
              .join("; ")}
          >
            <OverviewVisuals
              kind="composition"
              data={composition.filter((c) => c.count > 0)}
            />
          </div>
          <div className="catalogue-analysis-category-list">
            {types.map((type, index) => (
              <button
                key={type}
                aria-pressed={selectedTypes.includes(index)}
                onClick={() => onType(index)}
              >
                <i style={{ background: `var(--${tones[type] || "ink-3"})` }} />
                <span>{names[type] || type}</span>
                <b className="num">{n0(stats.byType[index])}</b>
                <Icon
                  name={selectedTypes.includes(index) ? "check" : "right"}
                  size={14}
                />
              </button>
            ))}
          </div>
          <p>
            Area follows product count. Classification uses source categories
            and an incomplete local reference.
          </p>
        </article>
      </div>
      <article className="catalogue-source-analysis">
        <header>
          <Icon name="network" size={22} />
          <div>
            <h3>Availability by source</h3>
            <p>
              Product reports within this selection. A source may have a smaller
              catalogue; these counts do not measure pharmacy quality.
            </p>
          </div>
        </header>
        <div className="catalogue-analysis-source-labels" aria-hidden="true">
          <span>Reporting pharmacy</span>
          <span>In stock</span>
          <span>Out</span>
          <span>Listing</span>
          <span>Reported rate</span>
        </div>
        <div className="catalogue-analysis-source-rows">
          {reporting.map((s) => (
            <button
              key={s.shop.bit}
              aria-pressed={selectedSources.includes(s.shop.bit)}
              onClick={() => onSource(s.shop.bit)}
            >
              <strong>
                <PharmacyGlyph id={s.shop.pharmacy_id} size={28} />
                {s.shop.name}
              </strong>
              <span>
                <small>In stock</small>
                <b className="num">{n0(s.inStock)}</b>
              </span>
              <span>
                <small>Out</small>
                <b className="num">{n0(s.oos)}</b>
              </span>
              <span>
                <small>Listing</small>
                <b className="num">{n0(s.listed)}</b>
              </span>
              <span>
                <small>Reported rate</small>
                <b className="num">
                  {s.rate == null ? "Unknown" : `${n1(s.rate)}%`}
                </b>
              </span>
              <Icon
                name={selectedSources.includes(s.shop.bit) ? "check" : "right"}
                size={16}
              />
            </button>
          ))}
        </div>
        <div className="catalogue-analysis-listing-only">
          <h4>Listed without usable stock reports</h4>
          <div>
            {listedOnly.map((s) => (
              <button
                key={s.shop.bit}
                aria-pressed={selectedSources.includes(s.shop.bit)}
                onClick={() => onSource(s.shop.bit)}
              >
                {s.shop.name}
                <span className="num">{n0(s.listed)}</span>
                {selectedSources.includes(s.shop.bit) && (
                  <Icon name="check" size={13} />
                )}
              </button>
            ))}
          </div>
          <p>
            Listing presence remains searchable and is excluded from stock
            rates.
          </p>
        </div>
      </article>
      <article className="catalogue-band-analysis">
        <header>
          <Icon name="ledger" size={22} />
          <h3>Stockout report groups</h3>
        </header>
        <div>
          {bandLabels.map((band, index) => (
            <button
              key={band}
              aria-pressed={selectedBands.includes(index)}
              onClick={() => onBand(index)}
            >
              <span>{bands[band] || band}</span>
              <EvidenceBadge tone={band === "none" ? "neutral" : "out"}>
                {n0(stats.byBand[index])}
              </EvidenceBadge>
              <Icon
                name={selectedBands.includes(index) ? "check" : "right"}
                size={14}
              />
            </button>
          ))}
        </div>
        <p>
          No stockout report includes products with unknown stock. Reports do
          not confirm a national shortage.
        </p>
      </article>
    </div>
  );
}
