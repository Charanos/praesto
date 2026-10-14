import { Icon, n0 } from "./ui.jsx";
import { EvidenceBadge } from "./EvidenceControls.tsx";
import "./stockout-groups.css";
const markers: Readonly<Record<string, string>> = {
  cluster: "3+",
  local: "2",
  isolated: "1",
  none: "—",
};
export default function StockoutGroups({
  bands,
  counts,
  names,
  onBrowse,
}: {
  bands: string[];
  counts: ArrayLike<number>;
  names: Readonly<Record<string, readonly [string, string]>>;
  onBrowse: (index: number) => void;
}) {
  return (
    <details className="stockout-groups">
      <summary>
        <span className="stockout-group-glyph">
          <Icon name="ledger" size={21} />
        </span>
        <span className="stockout-group-heading">
          <strong>Stockout report groups</strong>
          <small>
            All product categories · one resolved product counted once
          </small>
        </span>
        <Icon name="down" size={17} />
      </summary>
      <div className="stockout-group-rows">
        {bands.map((name, index) => (
          <button
            key={name}
            onClick={() => onBrowse(index)}
            aria-label={`Browse ${names[name]?.[0] ?? name}, ${n0(counts[index])} products`}
          >
            <EvidenceBadge tone={name === "none" ? "neutral" : "out"}>
              {markers[name] ?? "?"}
            </EvidenceBadge>
            <span className="stockout-group-identity">
              <strong>{names[name]?.[0] ?? name}</strong>
              <small>{names[name]?.[1]}</small>
            </span>
            <span className="stockout-group-count">
              <b className="num">{n0(counts[index])}</b>
              <small>products</small>
            </span>
            <Icon name="right" size={15} />
          </button>
        ))}
      </div>
    </details>
  );
}
