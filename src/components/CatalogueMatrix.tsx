import type { OverviewStore } from "../lib/overview-types";
import { Icon } from "./icons";
import { n0 } from "./ui.jsx";
import PharmacyGlyph from "./PharmacyGlyph";

export default function CatalogueMatrix({
  store,
  rows,
  onPick,
}: {
  store: OverviewStore;
  rows: number[];
  onPick: (index: number) => void;
}) {
  const slice = rows.slice(0, 40);
  const stateOf = (index: number, bit: number, reporting: boolean) => {
    const mask = 1 << bit;
    if (!(store.P.listedMask[index] & mask)) return "Not listed";
    if (!reporting) return "Stock not reported";
    if (store.P.oosMask[index] & mask) return "Out of stock";
    if (store.P.inMask[index] & mask) return "In stock";
    return "Stock not reported";
  };
  return (
    <div className="catalogue-matrix-view">
      <header>
        <div>
          <h2>Compare pharmacy reports.</h2>
          <p>
            First {slice.length} of <b className="num">{n0(rows.length)}</b>{" "}
            filtered products. Select a product for its named listings and
            prices.
          </p>
        </div>
      </header>
      <div className="catalogue-matrix-legend">
        <span data-state="In stock">In · reported available</span>
        <span data-state="Out of stock">Out · reported unavailable</span>
        <span>? · stock not reported</span>
        <span>— · not listed</span>
      </div>
      <div
        className="catalogue-matrix-scroll"
        role="region"
        aria-label="Product by pharmacy stock matrix"
        tabIndex={0}
      >
        <table>
          <caption>
            Captured product stock by pharmacy. A star marks listing-only
            sources; their presence does not establish availability.
          </caption>
          <thead>
            <tr>
              <th scope="col">Product &amp; ingredient</th>
              {store.shops.map((s) => (
                <th scope="col" key={s.bit}>
                  <PharmacyGlyph id={s.pharmacy_id} />
                  <span>
                    {s.name}
                    {!s.publishes_oos && (
                      <span aria-label="Listing-only source"> *</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((index) => (
              <tr key={store.P.key[index]}>
                <th scope="row">
                  <button onClick={() => onPick(index)}>
                    {store.P.name[index]}
                    <Icon name="right" size={14} />
                  </button>
                  {store.P.ingredient[index] >= 0 && (
                    <small>
                      {store.D.ingredient[store.P.ingredient[index]]}
                    </small>
                  )}
                </th>
                {store.shops.map((s) => {
                  const state = stateOf(index, s.bit, s.publishes_oos);
                  return (
                    <td key={s.bit} aria-label={`${s.name}: ${state}`}>
                      <span data-state={state} title={`${s.name}: ${state}`}>
                        {state === "In stock"
                          ? "In"
                          : state === "Out of stock"
                            ? "Out"
                            : state === "Not listed"
                              ? "—"
                              : "?"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
