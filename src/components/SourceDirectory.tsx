import { useMemo, useState } from "react";
import { Icon } from "./icons";

export type PharmacySource = {
  pharmacy_id: string;
  name: string;
  platform: string;
  listings: number;
  in_stock: number;
  out_of_stock: number;
  publishes_oos: boolean;
  scrape_method: string;
  listing_key_strategy: string;
  distinct_status_values: number;
  rows_skipped: number;
  urls_repaired: number;
  health_detail: string | null;
  health_flags: string | null;
  bit: number;
};
const number = new Intl.NumberFormat("en-KE");
const groups = [
  { id: "all", label: "All sources" },
  { id: "reporting", label: "Reporting stock" },
  { id: "listings", label: "Listings only" },
] as const;
type Group = (typeof groups)[number]["id"];

export default function SourceDirectory({
  sources,
  onBrowse,
}: {
  sources: PharmacySource[];
  onBrowse: (source: PharmacySource) => void;
}) {
  const [group, setGroup] = useState<Group>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const visible = useMemo(
    () =>
      sources.filter(
        (source) =>
          (group === "all" ||
            (group === "reporting"
              ? source.publishes_oos
              : !source.publishes_oos)) &&
          source.name
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
      ),
    [sources, group, query],
  );
  return (
    <section
      className="source-directory section"
      aria-labelledby="source-directory-title"
    >
      <header className="section-head">
        <div className="titles">
          <div className="eyebrow">Find a pharmacy source</div>
          <h2 className="section-title" id="source-directory-title">
            Pharmacy directory
          </h2>
        </div>
        <span className="source-directory-count" role="status">
          {visible.length} of {sources.length} sources
        </span>
      </header>
      <div className="source-directory-tools">
        <div className="seg" role="group" aria-label="Source reporting filter">
          {groups.map((item) => (
            <button
              key={item.id}
              aria-pressed={group === item.id}
              onClick={() => setGroup(item.id)}
            >
              {item.label}
              <span className="mono">
                {
                  sources.filter(
                    (source) =>
                      item.id === "all" ||
                      (item.id === "reporting"
                        ? source.publishes_oos
                        : !source.publishes_oos),
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <label className="field source-search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a pharmacy"
            aria-label="Find a pharmacy source"
          />
          {query && (
            <button
              aria-label="Clear pharmacy search"
              onClick={() => setQuery("")}
            >
              <Icon name="x" />
            </button>
          )}
        </label>
      </div>
      <div className="source-directory-columns" aria-hidden="true">
        <span>Pharmacy / evidence</span>
        <span>Listings</span>
        <span>In-stock reports</span>
        <span>Explore</span>
      </div>
      <ul className="source-directory-list" aria-label="Pharmacy sources">
        {visible.map((source) => {
          const expanded = open === source.pharmacy_id;
          const rated = source.in_stock + source.out_of_stock;
          const rate =
            source.publishes_oos && rated > 0
              ? (100 * source.in_stock) / rated
              : null;
          return (
            <li
              key={source.pharmacy_id}
              className="source-directory-item"
              data-expanded={expanded}
            >
              <div className="source-directory-row">
                <div className="source-directory-identity">
                  <span className="source-monogram" aria-hidden="true">
                    {source.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <button
                      className="source-name"
                      aria-expanded={expanded}
                      aria-controls={`source-${source.pharmacy_id}`}
                      onClick={() =>
                        setOpen(expanded ? null : source.pharmacy_id)
                      }
                    >
                      {source.name}
                      <Icon name={expanded ? "up" : "down"} size={13} />
                    </button>
                    <span
                      className={`source-signal ${source.publishes_oos ? "source-signal-reporting" : ""}`}
                    >
                      <i aria-hidden="true" />
                      {source.publishes_oos
                        ? "Reports stock states"
                        : "Stock not reported"}
                    </span>
                  </div>
                </div>
                <div className="source-listing-count">
                  <span className="mono">{number.format(source.listings)}</span>
                  <small>listings captured</small>
                </div>
                <div className="source-rate">
                  {source.publishes_oos && rate != null ? (
                    <>
                      <span className="mono">
                        {rate.toFixed(1)}
                        <small>%</small>
                      </span>
                      <span className="source-rate-track" aria-hidden="true">
                        <i
                          style={{
                            width: `${Math.max(0, Math.min(100, rate))}%`,
                          }}
                        />
                      </span>
                      <small>
                        {number.format(source.in_stock)} in ·{" "}
                        {number.format(source.out_of_stock)} out
                      </small>
                    </>
                  ) : (
                    <>
                      <span className="source-no-rate">No rate available</span>
                      <small>Excluded from stock calculations</small>
                    </>
                  )}
                </div>
                <button
                  className="btn btn-ghost source-browse"
                  aria-label={`Browse ${source.name} listings`}
                  onClick={() => onBrowse(source)}
                >
                  Browse
                  <Icon name="right" size={14} />
                </button>
              </div>
              <div
                id={`source-${source.pharmacy_id}`}
                className="source-directory-detail"
                hidden={!expanded}
              >
                <div>
                  <h3>Collection & evidence</h3>
                  <p>
                    Collection date is inferred from file timestamps. Confirm
                    current stock and listed prices with the pharmacy.
                  </p>
                  {source.health_detail && (
                    <p className="source-health-note">
                      {source.health_flags === "implausible_row_count"
                        ? "Small capture: this source has too few rows to support a reliable stock rate."
                        : "This feed has no usable out-of-stock signal. Its listings remain searchable."}
                    </p>
                  )}
                </div>
                <dl className="source-detail-facts">
                  <dt>Platform</dt>
                  <dd>{source.platform}</dd>
                  <dt>Collection method</dt>
                  <dd>{source.scrape_method}</dd>
                  <dt>Listing identity</dt>
                  <dd>{source.listing_key_strategy}</dd>
                  <dt>Distinct stock values</dt>
                  <dd className="mono">{source.distinct_status_values}</dd>
                  {source.rows_skipped > 0 && (
                    <>
                      <dt>Rows skipped</dt>
                      <dd className="mono">
                        {number.format(source.rows_skipped)}
                      </dd>
                    </>
                  )}
                  {source.urls_repaired > 0 && (
                    <>
                      <dt>URLs repaired</dt>
                      <dd className="mono">
                        {number.format(source.urls_repaired)}
                      </dd>
                    </>
                  )}
                  {source.health_detail && (
                    <>
                      <dt>Source diagnostic</dt>
                      <dd>{source.health_detail}</dd>
                    </>
                  )}
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
      {!visible.length && (
        <div className="source-directory-empty">
          <Icon name="search" size={22} />
          <h3>No pharmacy sources found</h3>
          <p>Try a different name or reporting group.</p>
          <button
            className="btn"
            onClick={() => {
              setQuery("");
              setGroup("all");
            }}
          >
            Reset source filters
          </button>
        </div>
      )}
      <p className="caption">
        Rates describe captured listing reports. They do not measure shelf
        inventory or pharmacy service quality.
      </p>
    </section>
  );
}
