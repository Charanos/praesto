import { Icon } from "./ui.jsx";
import { productEvidence } from "../lib/overview-model.js";
import type { OverviewStore, OverviewPharmacy } from "../lib/overview-types";

/** A visual sample only; each row opens the full named pharmacy evidence. */
export default function StockSignalPreview({
  store,
  rows,
  onChoose,
}: {
  store: OverviewStore;
  rows: number[];
  onChoose: (index: number) => void;
}) {
  const shops = store.shops
    .filter((s) => s.publishes_oos)
    .sort((a, b) => a.bit - b.bit);
  const stateOf = (i: number, shop: OverviewPharmacy) =>
    !(store.P.listedMask[i] & (1 << shop.bit))
      ? "Not listed"
      : store.P.oosMask[i] & (1 << shop.bit)
        ? "Out of stock"
        : store.P.inMask[i] & (1 << shop.bit)
          ? "In stock"
          : "Stock unknown";
  return (
    <figure className="attention-signals">
      <figcaption>
        From the review queue <span>One mark per reporting pharmacy</span>
      </figcaption>
      <div className="attention-signal-rows">
        {rows.slice(0, 3).map((i) => {
          const evidence = productEvidence(store, i);
          return (
            <button
              key={store.P.key[i]}
              onClick={() => onChoose(i)}
              aria-label={`Read pharmacy reports for ${store.P.name[i]}. ${evidence.out.length} out of stock, ${evidence.countIn} in stock.`}
            >
              <span className="attention-signal-name">{store.P.name[i]}</span>
              <span
                className="attention-signal-marks"
                role="img"
                aria-label={shops
                  .map((s) => `${s.name}: ${stateOf(i, s)}`)
                  .join("; ")}
              >
                {shops.map((s) => (
                  <i key={s.pharmacy_id} data-state={stateOf(i, s)}>
                    {stateOf(i, s) === "In stock" ? (
                      <Icon name="check" size={11} />
                    ) : stateOf(i, s) === "Out of stock" ? (
                      <Icon name="x" size={11} />
                    ) : stateOf(i, s) === "Stock unknown" ? (
                      "?"
                    ) : (
                      "–"
                    )}
                  </i>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      {!rows.length && <p>No clinical products qualify in this snapshot.</p>}
      <div className="attention-signal-legend">
        <span>
          <i data-state="Out of stock">×</i>Out
        </span>
        <span>
          <i data-state="In stock">✓</i>In stock
        </span>
        <span>
          <i>–</i>Not listed
        </span>
        <span>
          <i>?</i>Unknown
        </span>
      </div>
    </figure>
  );
}
