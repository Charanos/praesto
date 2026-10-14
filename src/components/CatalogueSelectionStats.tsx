import { n0, n1, kes } from "./ui.jsx";
import { Icon } from "./icons";
export interface SelectionStats {
  clinical: number;
  oosAny: number;
  avgListed: number;
  withMono: number;
  price: {
    p10: number | null;
    p50: number | null;
    p90: number | null;
    n?: number;
  };
  prices: number[];
  byType: ArrayLike<number>;
  byBand: ArrayLike<number>;
}
export default function CatalogueSelectionStats({
  stats,
  onToggle,
}: {
  stats: SelectionStats;
  onToggle: (open: boolean) => void;
}) {
  return (
    <details
      className="catalogue-selection-summary"
      onToggle={(e) => onToggle(e.currentTarget.open)}
    >
      <summary>
        <Icon name="chart" size={16} />
        Selection statistics
        <Icon name="down" size={13} />
      </summary>
      <dl className="catalogue-selection-metrics">
        {[
          ["Medicines & devices", n0(stats.clinical)],
          ["With a stockout report", n0(stats.oosAny)],
          ["Average sources listing", n1(stats.avgListed)],
          ["Positive price median", kes(stats.price.p50)],
          ["Reference-linked", n0(stats.withMono)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className="num">{value}</dd>
          </div>
        ))}
      </dl>
      <p>
        Product-level summaries of the current filters. Reference linkage does
        not establish complete prescribing information.
      </p>
    </details>
  );
}
