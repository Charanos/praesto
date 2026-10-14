import { Icon, n0, n1 } from "./ui.jsx";
import "./catalogue-landscape.css";
import type {
  OverviewChart,
  OverviewModel,
  OverviewMeta,
  OverviewCategory,
  OverviewCoverage,
} from "../lib/overview-types";
const tones: Readonly<Record<string, string>> = {
  medicine: "teal",
  device: "cobalt",
  supplement: "amber",
  cosmetic: "coral",
  unclassified: "ink-3",
  personal_care: "botanical",
  food: "berry",
  sexual_wellness: "ink-2",
};
export default function CatalogueLandscape({
  Chart,
  model,
  meta,
  categories,
  names,
  onCategory,
  onCoverage,
  onQuality,
}: {
  Chart: OverviewChart;
  model: OverviewModel;
  meta: OverviewMeta;
  categories: OverviewCategory[];
  names: Readonly<Record<string, string>>;
  onCategory: (index: number) => void;
  onCoverage: (group: OverviewCoverage) => void;
  onQuality: () => void;
}) {
  const total = meta.headline.products;
  const composition = categories.map((c) => ({
    ...c,
    label: names[c.name] ?? c.name,
    fill: `var(--${tones[c.name] ?? "ink-3"})`,
  }));
  const coverage = model.coverage.map((c, i) => ({
    ...c,
    fill: ["var(--cobalt)", "var(--teal)", "var(--berry)"][i],
  }));
  const oneSource = coverage[0]?.count ?? 0;
  return (
    <div className="catalogue-landscape">
      <article className="catalogue-composition">
        <header>
          <div className="catalogue-panel-title">
            <span className="catalogue-glyph">
              <Icon name="categories" size={21} />
            </span>
            <div>
              <span className="eyebrow">Product mix</span>
              <h3>An all-category catalogue</h3>
            </div>
          </div>
          <div className="catalogue-classified">
            <b className="num">
              {n1(
                total
                  ? 100 * (1 - meta.coverage.products_unclassified / total)
                  : 0,
              )}
              %
            </b>
            <span>
              classified · <b className="num">{n0(total)}</b> products
            </span>
          </div>
        </header>
        <div className="catalogue-composition-body">
          <figure className="catalogue-map">
            <Chart
              kind="composition"
              data={composition}
              label={`Category composition, one resolved product counted once: ${composition.map((c) => `${c.label}, ${n0(c.count)}`).join("; ")}`}
              className="catalogue-treemap"
            />
            <figcaption>
              Area follows product count. Exact counts and browsing actions are
              beside the map.
            </figcaption>
          </figure>
          <div
            className="catalogue-category-list"
            role="group"
            aria-label="Browse product categories"
          >
            <div className="catalogue-category-labels" aria-hidden="true">
              <span>Category</span>
              <span>Products / share</span>
            </div>
            {composition.map((c) => (
              <button
                key={c.name}
                onClick={() => onCategory(c.index)}
                aria-label={`Browse ${c.label}, ${n0(c.count)} products`}
              >
                <span className="catalogue-category-name">
                  <i style={{ background: c.fill }} />
                  {c.label}
                </span>
                <span className="catalogue-category-amount">
                  <b className="num">{n0(c.count)}</b>
                  <small className="num">
                    {n1(total ? (100 * c.count) / total : 0)}%
                  </small>
                </span>
                <Icon name="right" size={13} />
              </button>
            ))}
          </div>
        </div>
        <p className="catalogue-composition-note">
          Classification combines source categories with an incomplete local
          reference. “Unclassified” is a data gap, not a medical classification.
        </p>
      </article>
      <article className="catalogue-coverage">
        <div className="catalogue-coverage-intro">
          <div className="catalogue-panel-title">
            <span className="catalogue-glyph">
              <Icon name="layers" size={21} />
            </span>
            <span className="eyebrow">Source coverage</span>
          </div>
          <h3>
            <span className="num">
              {n1(total ? (100 * oneSource) / total : 0)}%
            </span>{" "}
            appear at just one source.
          </h3>
          <p>
            Most products offer limited cross-source comparison. Listing breadth
            describes captured catalogues, rather than stock availability.
          </p>
        </div>
        <div className="catalogue-coverage-data">
          <Chart
            kind="coverage-ring"
            data={coverage}
            label={`Listing breadth: ${coverage.map((c) => `${c.label}, ${n0(c.count)} products`).join("; ")}`}
            className="catalogue-coverage-ring"
          />
          <div className="catalogue-coverage-list">
            {coverage.map((c) => (
              <button
                key={c.label}
                onClick={() => onCoverage(c)}
                aria-label={`Browse products listed at ${c.label}, ${n0(c.count)} products`}
              >
                <span>
                  <i style={{ background: c.fill }} />
                  {c.label}
                </span>
                <b className="num">{n0(c.count)}</b>
                <small className="num">
                  {n1(total ? (100 * c.count) / total : 0)}%
                </small>
                <Icon name="right" size={13} />
              </button>
            ))}
          </div>
        </div>
      </article>
      <aside className="catalogue-reference-note">
        <Icon name="book" size={20} />
        <p>
          <b className="num">{n0(meta.coverage.products_awaiting_drugindex)}</b>{" "}
          products await reference linkage. Missing clinical fields stay
          unknown.
        </p>
        <button className="brief-link" onClick={onQuality}>
          Read the limits <Icon name="right" size={15} />
        </button>
      </aside>
    </div>
  );
}
