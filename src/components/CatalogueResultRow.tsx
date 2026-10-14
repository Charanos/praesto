import { EvidenceBadge } from "./EvidenceControls";
import { Icon } from "./icons";
import { kes } from "./ui.jsx";
import { PharmacyStack } from "./PharmacyGlyph";

/** A product identity first, then explicit source evidence and a comparable price. */
export default function CatalogueResultRow({
  index,
  name,
  ingredient,
  sourceCount,
  inStock,
  out,
  price,
  active,
  onSelect,
  onMove,
  template,
  showSources = true,
  pharmacies,
}: {
  index: number;
  name: string;
  ingredient: string | null;
  sourceCount: number;
  inStock: number;
  out: number;
  price: number;
  active: boolean;
  onSelect: () => void;
  onMove: (direction: number) => void;
  template?: string;
  showSources?: boolean;
  pharmacies: { pharmacy_id: string; name: string }[];
}) {
  return (
    <button
      type="button"
      className="catalogue-row catalogue-product-row"
      data-product-index={index}
      data-active={active}
      aria-label={`${name}; ${inStock} sources report in stock; ${out} out of stock; ${sourceCount} sources listing; listed median ${kes(price)}`}
      style={template ? { gridTemplateColumns: template } : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          onMove(e.key === "ArrowDown" ? 1 : -1);
        }
      }}
    >
      <span className="catalogue-product-identity">
        <strong>{name}</strong>
        <small>{ingredient || "Active ingredient not linked"}</small>
      </span>
      <span className="catalogue-product-stock">
        {inStock || out ? (
          <>
            <EvidenceBadge tone={inStock ? "in" : "neutral"}>
              {inStock} in stock
            </EvidenceBadge>
            <EvidenceBadge tone={out ? "out" : "neutral"}>
              {out} out
            </EvidenceBadge>
          </>
        ) : (
          <EvidenceBadge>Stock unknown</EvidenceBadge>
        )}
      </span>
      {showSources && (
        <span className="catalogue-product-sources">
          <PharmacyStack shops={pharmacies} />
          <small>sources listing</small>
        </span>
      )}
      <span className="catalogue-product-price num">
        {kes(price)}
        <Icon name="right" size={15} />
      </span>
    </button>
  );
}
