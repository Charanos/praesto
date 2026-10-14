import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PharmacySource } from "./SourceDirectory";
import PharmacyGlyph from "./PharmacyGlyph";
import { Icon } from "./icons";
import { n0, n1 } from "./ui.jsx";
export type SourceProductCounts = {
  shop: PharmacySource;
  listed: number;
  inStock: number;
  oos: number;
  rate: number | null;
};
const Balance = lazy(() => import("./SourceBalanceVisual"));
class BalanceBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="source-chart-placeholder">
        Visual unavailable. Read exact counts below.
      </p>
    ) : (
      this.props.children
    );
  }
}
export default function SourceProductEvidence({
  counts,
  onBrowse,
  topThreeShare,
  topThree,
  listings,
  unknown,
  onLimits,
}: {
  counts: SourceProductCounts[];
  onBrowse: (source: PharmacySource) => void;
  topThreeShare: number;
  topThree: PharmacySource[];
  listings: number;
  unknown: number;
  onLimits: () => void;
}) {
  const reporting = counts
    .filter((row) => row.shop.publishes_oos)
    .sort((a, b) => b.listed - a.listed);
  const root = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="source-product-section">
      <header className="source-section-heading">
        <div>
          <h2>Stock reports, at product level.</h2>
          <p>
            See the balance of stock reports across resolved products. These
            counts use product identities; directory rates above use captured
            listings.
          </p>
        </div>
      </header>
      <div className="source-product-bento">
        <article className="source-balance-panel">
          <div className="source-balance-legend">
            <span data-state="out">
              <i />
              Out-of-stock reports
            </span>
            <span data-state="in">
              <i />
              In-stock reports
            </span>
          </div>
          <div
            ref={root}
            className="source-balance-chart"
            role="img"
            aria-label={reporting
              .map(
                (row) =>
                  `${row.shop.name}: ${n0(row.oos)} out-of-stock and ${n0(row.inStock)} in-stock product reports`,
              )
              .join("; ")}
          >
            {near && (
              <BalanceBoundary>
                <Suspense
                  fallback={
                    <p className="source-chart-placeholder">
                      Preparing product report chart…
                    </p>
                  }
                >
                  <Balance
                    data={reporting.map((row) => ({
                      name: row.shop.name.replace(" Pharmacy", ""),
                      inStock: row.inStock,
                      out: -row.oos,
                    }))}
                  />
                </Suspense>
              </BalanceBoundary>
            )}
          </div>
          <p className="source-balance-caveat">
            A product can have both stock states at one source when its captured
            listings disagree. Counts may overlap; they are not a disjoint
            inventory total.
          </p>
          <details className="source-product-table">
            <summary>
              Read exact product counts
              <Icon name="down" size={14} />
            </summary>
            <div
              role="region"
              aria-label="Product report counts by pharmacy"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    <th>Pharmacy</th>
                    <th>Products listed</th>
                    <th>In stock</th>
                    <th>Out</th>
                    <th>Reported share</th>
                  </tr>
                </thead>
                <tbody>
                  {counts.map((row) => (
                    <tr key={row.shop.pharmacy_id}>
                      <th scope="row">
                        <button onClick={() => onBrowse(row.shop)}>
                          {row.shop.name}
                          <Icon name="right" size={13} />
                        </button>
                      </th>
                      <td className="num">{n0(row.listed)}</td>
                      <td className="num">
                        {row.shop.publishes_oos ? n0(row.inStock) : "Unknown"}
                      </td>
                      <td className="num">
                        {row.shop.publishes_oos ? n0(row.oos) : "Unknown"}
                      </td>
                      <td className="num">
                        {row.shop.publishes_oos && row.rate != null
                          ? `${n1(row.rate)}%`
                          : "Excluded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </article>
        <aside className="source-concentration">
          <h3>Capture size matters.</h3>
          <strong className="source-concentration-value num">
            {n1(topThreeShare)}
            <small>%</small>
          </strong>
          <p>of captured listings come from the three largest catalogues.</p>
          <div className="source-largest-captures">
            {topThree.map((source) => (
              <button key={source.pharmacy_id} onClick={() => onBrowse(source)}>
                <PharmacyGlyph id={source.pharmacy_id} size={28} />
                <span>{source.name}</span>
                <b className="num">{n0(source.listings)}</b>
              </button>
            ))}
          </div>
          <dl>
            <div>
              <dt>All captured listings</dt>
              <dd className="num">{n0(listings)}</dd>
            </div>
            <div>
              <dt>Stock unknown</dt>
              <dd className="num">{n0(unknown)}</dd>
            </div>
          </dl>
          <p>
            Larger catalogues carry more weight in the combined rate. This does
            not rank pharmacy quality.
          </p>
          <button className="source-limits-action" onClick={onLimits}>
            Understand the data limits
            <Icon name="right" size={15} />
          </button>
        </aside>
      </div>
    </section>
  );
}
