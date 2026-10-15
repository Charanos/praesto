import { Icon } from "./icons";
import SelectField from "./SelectField";
import PharmacyGlyph from "./PharmacyGlyph";
import { PillToggle } from "./EvidenceControls";
import type { OverviewFilters, OverviewPharmacy } from "../lib/overview-types";
import { n0 } from "./ui.jsx";
import { filterAccent } from "../lib/catalogue-context";

type Sort = { key: string; dir: string };
const sortOptions = [
  ["relevance:desc", "Most stockout reports"],
  ["name:desc", "Product name A–Z"],
  ["name:asc", "Product name Z–A"],
  ["price:asc", "Listed price · low first"],
  ["price:desc", "Listed price · high first"],
  ["listed:desc", "Most pharmacies listing"],
  ["oos:desc", "Out-of-stock source count"],
  ["instock:desc", "In-stock source count"],
  ["oosShare:desc", "Out-of-stock share"],
  ["conf:desc", "Highest match confidence"],
  ["listings:desc", "Most listings"],
] as const;

export default function CatalogueToolbar({
  filters,
  shops,
  count,
  total,
  stockChoice,
  sort,
  onSort,
  view,
  onView,
  onPatch,
  onRefine,
  onReset,
  chips,
  mode = "header",
  controlsOpen = false,
  pageSize = 100,
  onPageSize,
  tone = "light",
  title = "Find & compare",
  description = "",
}: {
  filters: OverviewFilters;
  shops: OverviewPharmacy[];
  count: number;
  total: number;
  stockChoice: string;
  sort: Sort;
  onSort: (sort: Sort) => void;
  view: string;
  onView: (view: string) => void;
  onPatch: (patch: Partial<OverviewFilters>) => void;
  onRefine: () => void;
  onReset: () => void;
  chips: { key: string; label: string; clear: Partial<OverviewFilters> }[];
  mode?: "header" | "controls";
  controlsOpen?: boolean;
  tone?: "light" | "inverse";
  pageSize?: number;
  onPageSize?: (size: number) => void;
  title?: string;
  description?: string;
}) {
  const reporting = shops.filter((s) => s.publishes_oos).map((s) => s.bit);
  const selectedSort = `${sort.key}:${sort.dir}`;
  return (
    <div className={`catalogue-command catalogue-command-${mode}`}>
      {mode === "header" && (
        <div className="catalogue-command-heading">
          <div className="catalogue-title-count">
            <h1 tabIndex={-1}>{title}</h1>
            {description && (
              <p className="catalogue-scope-description">{description}</p>
            )}
            <p
              className="catalogue-result-count"
              role="status"
              aria-live="polite"
            >
              <strong className="num">{n0(count)}</strong>{" "}
              {count === 1 ? "result" : "results"}
              <span> from {n0(total)} product records</span>
            </p>
          </div>
          <PillToggle
            label="Catalogue view"
            value={view}
            onChange={onView}
            options={[
              { value: "grid", label: "List" },
              { value: "matrix", label: "Matrix" },
              { value: "charts", label: "Charts" },
            ]}
          />
          <button
            className="catalogue-controls-trigger"
            aria-label={
              controlsOpen
                ? "Collapse catalogue controls"
                : "Open catalogue controls"
            }
            aria-expanded={controlsOpen}
            aria-controls="catalogue-controls"
            onClick={onRefine}
          >
            <Icon name="filter" size={18} />
            <span>Controls</span>
            {chips.length > 0 && <b className="num">{chips.length}</b>}
          </button>
        </div>
      )}
      {mode === "controls" && (
        <>
          <div className="catalogue-command-filters">
            <label className="catalogue-filter-field">
              <Icon name="package-check" size={18} />
              <span>Stock evidence</span>
              <SelectField
                label="Stock evidence"
                value={stockChoice}
                tone={tone}
                onChange={(value) =>
                  onPatch({
                    stockIn: value === "in" ? reporting : [],
                    stockOut: value === "out" ? reporting : [],
                  })
                }
                options={[
                  { value: "all", label: "Any reported state" },
                  { value: "in", label: "In stock somewhere" },
                  { value: "out", label: "Out of stock somewhere" },
                  ...(stockChoice === "custom"
                    ? [
                        {
                          value: "custom",
                          label: "Custom stock selection",
                          disabled: true,
                        },
                      ]
                    : []),
                ]}
              />
            </label>
            <label className="catalogue-filter-field">
              <Icon name="pharmacy" size={18} />
              <span>Pharmacy</span>
              <SelectField
                label="Pharmacy"
                tone={tone}
                value={
                  filters.shopsAny.length === 1
                    ? filters.shopsAny[0]
                    : filters.shopsAny.length
                      ? "custom"
                      : "all"
                }
                onChange={(value) =>
                  onPatch({ shopsAny: value === "all" ? [] : [Number(value)] })
                }
                options={[
                  { value: "all", label: "All pharmacies" },
                  ...shops.map((shop) => ({
                    value: shop.bit,
                    label: shop.name,
                    icon: <PharmacyGlyph id={shop.pharmacy_id} size={26} />,
                  })),
                  ...(filters.shopsAny.length > 1
                    ? [
                        {
                          value: "custom",
                          label: "Multiple pharmacies",
                          disabled: true,
                        },
                      ]
                    : []),
                ]}
              />
            </label>
            <button
              className="catalogue-clinical-toggle"
              aria-pressed={filters.clinicalOnly}
              onClick={() =>
                onPatch({ clinicalOnly: !filters.clinicalOnly, types: [] })
              }
            >
              <Icon name="medical-kit" size={18} />
              Medicines &amp; devices
              <span className="catalogue-toggle-check" aria-hidden="true">
                {filters.clinicalOnly && <Icon name="check" size={12} />}
              </span>
            </button>
          </div>
          <div className="catalogue-result-tools">
            <label>
              <Icon name="sort" size={15} />
              <SelectField
                label="Sort results"
                value={selectedSort}
                tone={tone}
                onChange={(value) => {
                  const [key, dir] = value.split(":");
                  onSort({ key, dir });
                }}
                options={[
                  ...sortOptions.map(([value, label]) => ({ value, label })),
                  ...(!sortOptions.some(([value]) => value === selectedSort)
                    ? [{ value: selectedSort, label: "Current column sort" }]
                    : []),
                ]}
              />
            </label>
          </div>
          {chips.length > 0 && (
            <div className="catalogue-applied" aria-label="Applied filters">
              <header>
                <span>
                  Selected filters <b className="num">{chips.length}</b>
                </span>
                <button className="catalogue-clear" onClick={onReset}>
                  Clear all
                </button>
              </header>
              <div className="catalogue-applied-chips">
                {chips.map((c) => (
                  <button
                    key={c.key}
                    data-tone={filterAccent(c.key).tone}
                    aria-label={`Remove ${c.label}`}
                    onClick={() => onPatch(c.clear)}
                  >
                    <Icon name={filterAccent(c.key).icon} size={14} />
                    <span>{c.label}</span>
                    <Icon name="x" size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="catalogue-page-size">
            <span>Results per page</span>
            <SelectField
              label="Results per page"
              value={pageSize}
              tone={tone}
              onChange={(value) => onPageSize?.(Number(value))}
              options={[
                { value: 50, label: "50 products" },
                { value: 100, label: "100 products" },
                { value: 200, label: "200 products" },
                { value: 0, label: "Continuous scrolling" },
              ]}
            />
          </label>
        </>
      )}
    </div>
  );
}
