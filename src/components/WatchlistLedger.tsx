import { Icon, kes } from "./ui.jsx";
import { productEvidence } from "../lib/overview-model.js";
import { EvidenceBadge } from "./EvidenceControls.tsx";
import type { OverviewStore, OverviewEvidence } from "../lib/overview-types";

export default function WatchlistLedger({
  store,
  rows,
  selected,
  onChoose,
  onOpen,
}: {
  store: OverviewStore;
  rows: number[];
  selected: number | null;
  onChoose: (index: number) => void;
  onOpen: (index: number) => void;
}) {
  const { P, D } = store;
  return (
    <div className="watch-ledger">
      <div className="watch-ledger-labels" aria-hidden="true">
        <span>Product & active ingredient</span>
        <span>Reporting sources</span>
        <span>Listed median</span>
      </div>
      {rows.map((i) => {
        const evidence: OverviewEvidence = productEvidence(store, i);
        const active = selected === i;
        return (
          <article
            className="watch-ledger-row"
            data-selected={active}
            key={P.key[i]}
          >
            <div className="watch-ledger-summary">
              <button
                className="watch-ledger-select"
                id={`watch-select-${i}`}
                aria-expanded={active}
                aria-label={`${active ? "Hide" : "Read"} pharmacy reports for ${P.name[i]}`}
                aria-controls={`watch-report-${i}`}
                onClick={() => onChoose(i)}
              >
                <Icon name={active ? "up" : "down"} size={16} />
                <span>
                  <strong>{P.name[i]}</strong>
                  <small>
                    {P.ingredient[i] >= 0
                      ? D.ingredient[P.ingredient[i]]
                      : "Active ingredient not linked"}
                  </small>
                </span>
              </button>
              <div className="watch-ledger-counts">
                <EvidenceBadge tone="out">
                  <b className="num">{evidence.out.length}</b> out
                </EvidenceBadge>
                <EvidenceBadge tone="in">
                  <b className="num">{evidence.countIn}</b> in stock
                </EvidenceBadge>
              </div>
              <div className="watch-ledger-price">
                <small>Listed median</small>
                <span className="num">
                  {Number.isFinite(P.priceMed[i])
                    ? kes(P.priceMed[i])
                    : "Not supplied"}
                </span>
                <button
                  onClick={() => onOpen(i)}
                  aria-label={`Inspect ${P.name[i]} in catalogue`}
                >
                  <Icon name="right" size={18} />
                </button>
              </div>
            </div>
            <div id={`watch-report-${i}`} hidden={!active}>
              {active && (
                <div className="watch-ledger-evidence" id="watchlist-evidence">
                  <h4
                    id="watchlist-product-title"
                    tabIndex={-1}
                    aria-label={`Named pharmacy reports for ${P.name[i]}`}
                  >
                    Named pharmacy reports
                  </h4>
                  <dl>
                    {[
                      {
                        label: "Out of stock",
                        names: evidence.out,
                        state: "out",
                      },
                      {
                        label: "In stock",
                        names: evidence.inStock,
                        state: "in",
                      },
                      ...(evidence.unrated.length
                        ? [
                            {
                              label: "Stock not reported",
                              names: evidence.unrated,
                              state: "unknown",
                            },
                          ]
                        : []),
                    ].map((group) => (
                      <div key={group.state} data-state={group.state}>
                        <dt>{group.label}</dt>
                        <dd>
                          {group.names.length ? (
                            group.names.map((name) => (
                              <EvidenceBadge key={name} tone={group.state}>
                                {name}
                              </EvidenceBadge>
                            ))
                          ) : (
                            <span>No source reports this state</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
