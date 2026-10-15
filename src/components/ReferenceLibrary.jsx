import { useEffect, useState } from "react";
import Modal from "./Modal";
import SelectField from "./SelectField";
import { PillToggle, EvidenceBadge } from "./EvidenceControls";
import { Icon } from "./icons";
import { clinicalFields } from "../lib/clinical";
import { n0 } from "./ui.jsx";
import "./reference-library.css";
const kinds = [
  { value: "brands", label: "Brands" },
  { value: "ingredients", label: "Active ingredients" },
  { value: "manufacturers", label: "Manufacturers" },
  { value: "distributors", label: "Distributors" },
];
const label = (value) => String(value ?? "Not supplied");
const sourceDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown";
const safeUrl = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
const interactionName = (link, ingredient) =>
  (link.source_key === ingredient.ai_key
    ? link.resolved_target_name
    : link.resolved_source_name) ?? "Unnamed source interaction";
function SourceText({ title, children }) {
  return (
    children && (
      <details className="reference-source-text">
        <summary>
          {title}
          <Icon name="down" size={14} />
        </summary>
        <p>{children}</p>
      </details>
    )
  );
}
function BrandVariants({ brands }) {
  return (
    <div className="reference-brand-groups">
      {brands.map((brand) => (
        <article key={brand.brand_key}>
          <header>
            <div>
              <h4>{brand.name}</h4>
              <p>{brand.manufacturer?.name ?? "Manufacturer not linked"}</p>
            </div>
            {brand.quality_flags?.includes(
              "possible_editorial_or_test_name",
            ) && (
              <EvidenceBadge tone="warn">
                Source name needs review
              </EvidenceBadge>
            )}
          </header>
          {!brand.variants.length ? (
            <p className="reference-muted">
              No active variants linked in the source.
            </p>
          ) : (
            brand.variants.map((variant) => (
              <section className="reference-variant" key={variant.variant_key}>
                <div>
                  <strong>
                    {[variant.formulation, variant.strength]
                      .filter(Boolean)
                      .join(" · ") || "Form and strength not supplied"}
                  </strong>
                  <span>
                    {variant.pack_size || "Pack not supplied"}
                    {variant.unit ? " " + variant.unit : ""} ·{" "}
                    {variant.country?.name ?? "Country not supplied"}
                  </span>
                </div>
                <details>
                  <summary>
                    {variant.prices.length} price{" "}
                    {variant.prices.length === 1 ? "record" : "records"}
                    <Icon name="down" size={14} />
                  </summary>
                  <p className="reference-muted">
                    Reference editions ·{" "}
                    {variant.country?.currency_short ?? "currency not supplied"}
                    . These are not current pharmacy quotes.
                  </p>
                  {variant.prices.map((price) => (
                    <div
                      className="reference-price-edition"
                      key={price.brand_variant_price_id}
                    >
                      <span>{label(price.edition)}</span>
                      <b className="num">{label(price.price)}</b>
                      <span>Retail: {label(price.retail_price)}</span>
                      <span>
                        {price.discontinued
                          ? "Discontinued"
                          : "No discontinuation flag"}
                      </span>
                    </div>
                  ))}
                </details>
              </section>
            ))
          )}
          {brand.distributors.length > 0 && (
            <p className="reference-muted">
              Distributors: {brand.distributors.map((d) => d.name).join(" · ")}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
function Evidence({ ingredient }) {
  const groups = [
    [
      "Dose regimens",
      ingredient.dose_regimens,
      [
        "dose_line",
        "raw_text",
        "indication_text",
        "population",
        "route",
        "frequency_text",
        "duration_text",
        "source_title",
        "review_status",
      ],
    ],
    [
      "Pregnancy details",
      ingredient.pregnancy_details,
      [
        "pregnancy_category",
        "risk_summary",
        "fetal_risk_level",
        "first_trimester_notes",
        "second_third_trimester_notes",
        "labor_delivery_notes",
        "source_title",
        "review_status",
      ],
    ],
    [
      "Lactation details",
      ingredient.lactation_details,
      [
        "safety_category",
        "risk_summary",
        "infant_effects",
        "maternal_effects",
        "recommendations",
        "source_title",
        "review_status",
      ],
    ],
    [
      "Clinical statements",
      ingredient.clinical_statements,
      [
        "section",
        "statement_text",
        "severity",
        "source_title",
        "review_status",
      ],
    ],
  ];
  return (
    <div>
      <p className="reference-muted">
        Structured source records preserve their original statuses. A source
        status is not independent clinical review.
      </p>
      {groups.map(([title, rows, fields]) => (
        <details className="reference-evidence-group" key={title}>
          <summary>
            {title}
            <b className="num">{rows.length}</b>
            <Icon name="down" size={14} />
          </summary>
          {rows.length ? (
            rows.map((row, i) => (
              <article key={i}>
                <dl>
                  {fields
                    .filter(
                      (key) => row[key] != null && String(row[key]).trim(),
                    )
                    .map((key) => (
                      <div key={key}>
                        <dt>{key.replaceAll("_", " ")}</dt>
                        <dd>{String(row[key])}</dd>
                      </div>
                    ))}
                </dl>
                {safeUrl(row.source_url) && (
                  <a href={row.source_url} target="_blank" rel="noreferrer">
                    Source document
                  </a>
                )}
              </article>
            ))
          ) : (
            <p className="reference-muted">Not supplied in this capture.</p>
          )}
        </details>
      ))}
    </div>
  );
}
function RecordView({ detail, mode, setMode }) {
  const { record, ingredient, brands, report } = detail;
  return (
    <>
      <header className="reference-record-heading">
        <span>Drug Index reference</span>
        <h3>{record.name}</h3>
        <p>
          {record.ingredient_name ??
            (ingredient?.is_compound
              ? "Combination ingredient"
              : "Source catalogue record")}
        </p>
        {safeUrl(record.source_url) && (
          <a href={record.source_url} target="_blank" rel="noreferrer">
            Open original record
            <Icon name="external" size={14} />
          </a>
        )}
      </header>
      {["email", "phone", "address", "website"].some((key) => record[key]) && (
        <dl className="reference-contact-fields">
          {["email", "phone", "address", "website"]
            .filter((key) => record[key])
            .map((key) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>
                  {key === "website" && safeUrl(record[key]) ? (
                    <a href={record[key]} target="_blank" rel="noreferrer">
                      {record[key]}
                    </a>
                  ) : (
                    String(record[key])
                  )}
                </dd>
              </div>
            ))}
        </dl>
      )}
      {!ingredient && (
        <p className="reference-muted">
          No active ingredient reference is linked to this record. Missing
          linkage does not establish clinical equivalence.
        </p>
      )}
      <PillToggle
        label="Reference reading section"
        value={mode}
        onChange={setMode}
        options={[
          { value: "clinical", label: "Monograph" },
          { value: "brands", label: "Brands & packs", count: brands.length },
          { value: "evidence", label: "Structured evidence" },
        ]}
      />
      {mode === "brands" ? (
        <BrandVariants brands={brands} />
      ) : ingredient ? (
        mode === "evidence" ? (
          <Evidence ingredient={ingredient} />
        ) : (
          <div className="reference-monograph">
            {ingredient.atc_classifications.length > 0 && (
              <section className="reference-atc">
                <h4>ATC classification</h4>
                {ingredient.atc_classifications.map((a) => (
                  <p key={a.atc_code}>
                    <b className="num">{a.atc_code}</b>
                    {a.code?.name ?? "Label not supplied"}
                  </p>
                ))}
              </section>
            )}
            {ingredient.components.length > 0 && (
              <details className="reference-source-text">
                <summary>
                  Ingredient composition · {ingredient.components.length}
                  <Icon name="down" size={14} />
                </summary>
                {ingredient.components.map((c) => (
                  <p key={c.component_id}>
                    {c.component_name_raw ?? c.component_ai_key}
                    {c.raw_strength_text ? " · " + c.raw_strength_text : ""}
                  </p>
                ))}
              </details>
            )}
            {clinicalFields
              .filter(
                ([key]) =>
                  ![
                    "drug_interactions",
                    "pregnancy_information",
                    "pregnancy_risk_category",
                  ].includes(key),
              )
              .map(([key, title]) => (
                <SourceText key={key} title={title}>
                  {ingredient[key]}
                </SourceText>
              ))}
            <details className="reference-evidence-group">
              <summary>
                Drug interactions
                <b className="num">{ingredient.interactions.length}</b>
                <Icon name="down" size={14} />
              </summary>
              {ingredient.interactions.map((link) => (
                <article key={link.interaction_key}>
                  <header>
                    <strong>{interactionName(link, ingredient)}</strong>
                    <EvidenceBadge tone="warn">
                      {link.details?.severity ?? "Severity not supplied"}
                    </EvidenceBadge>
                  </header>
                  <p>
                    {link.details?.description ?? "Description not supplied"}
                  </p>
                  <small>
                    Source effect: {link.details?.effect ?? "Not supplied"}
                  </small>
                </article>
              ))}
            </details>
            {ingredient.pregnancy_categories.length > 0 && (
              <SourceText title="Source pregnancy labels">
                {ingredient.pregnancy_categories
                  .map((c) => `${c.name}: ${c.description ?? ""}`)
                  .join("\n\n") +
                  "\n\nScheme and jurisdiction are not specified by these source records."}
              </SourceText>
            )}
          </div>
        )
      ) : null}
      {!ingredient && brands.length > 0 && mode !== "brands" && (
        <BrandVariants brands={brands} />
      )}
      <footer className="reference-record-provenance">
        Captured {sourceDate(report.collected_at)} · Source revised{" "}
        {sourceDate(record.updated_at)}. Clinical review unverified. Reference
        prices do not report pharmacy stock.
      </footer>
    </>
  );
}
export default function ReferenceLibrary({ onClose }) {
  const [kind, setKind] = useState("brands"),
    [query, setQuery] = useState(""),
    [offset, setOffset] = useState(0),
    [page, setPage] = useState(null),
    [selected, setSelected] = useState(null),
    [detail, setDetail] = useState(null),
    [mode, setMode] = useState("brands"),
    [error, setError] = useState(false),
    [loading, setLoading] = useState(true),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(false);
      fetch(
        `/__reference-library?${new URLSearchParams({ kind, q: query, offset: String(offset), limit: "25" })}`,
        { signal: controller.signal, credentials: "same-origin" },
      )
        .then((r) => {
          if (!r.ok) throw new Error("Unavailable");
          return r.json();
        })
        .then((value) => {
          if (controller.signal.aborted) return;
          setPage(value);
          setSelected(value.rows[0]?.id ?? null);
          setLoading(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setError(true);
            setLoading(false);
          }
        });
    }, 180);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [kind, query, offset, attempt]);
  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setDetail(null);
    fetch(
      `/__reference-library/record?${new URLSearchParams({ kind, id: selected })}`,
      { signal: controller.signal, credentials: "same-origin" },
    )
      .then((r) => {
        if (!r.ok) throw new Error("Unavailable");
        return r.json();
      })
      .then((value) => {
        if (!controller.signal.aborted) setDetail(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [kind, selected, attempt]);
  const report = page?.report;
  return (
    <Modal
      className="reference-library"
      labelledBy="reference-library-title"
      onClose={onClose}
    >
      <header className="reference-library-heading">
        <div>
          <span>Private reference capture</span>
          <h2 id="reference-library-title">The medicines library.</h2>
          <p>
            {report
              ? `${n0(report.counts.brands.active)} active brands · ${n0(report.counts.active_ingredients.active)} ingredients · captured ${sourceDate(report.collected_at)}`
              : "Opening the verified local capture…"}
          </p>
        </div>
        <button aria-label="Close reference library" onClick={onClose}>
          <Icon name="x" size={20} />
        </button>
      </header>
      <div className="reference-library-controls">
        <label>
          <Icon name="search" size={18} />
          <input
            aria-label="Search reference library"
            value={query}
            placeholder="Search brands, ingredients or manufacturers"
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
          />
        </label>
        <SelectField
          label="Reference record type"
          value={kind}
          options={kinds}
          onChange={(value) => {
            setKind(value);
            setOffset(0);
            setSelected(null);
            setMode(value === "brands" ? "brands" : "clinical");
          }}
        />
      </div>
      {error ? (
        <div className="reference-library-error" role="alert">
          <h3>Reference capture could not load.</h3>
          <p>
            The library uses the private local data adapter. Detailed source
            text is not bundled into a public build.
          </p>
          <button className="btn" onClick={() => setAttempt((a) => a + 1)}>
            Retry library
          </button>
        </div>
      ) : (
        <div className="reference-library-body">
          <aside aria-label="Reference search results">
            <div role="status">
              {loading ? "Searching…" : `${n0(page?.total ?? 0)} records`}
            </div>
            <div className="reference-library-list">
              {page?.rows.map((row) => (
                <button
                  key={row.id}
                  aria-pressed={selected === row.id}
                  onClick={() => setSelected(row.id)}
                >
                  <strong>{row.name}</strong>
                  <span>
                    {row.ingredient_name ??
                      row.manufacturer_name ??
                      (row.brands != null
                        ? `${row.brands} brands linked`
                        : "Reference record")}
                  </span>
                  {row.variants != null && (
                    <small>{row.variants} active variants</small>
                  )}
                </button>
              ))}
              {!loading && page?.total === 0 && (
                <p>No records match this search.</p>
              )}
            </div>
            <footer className="reference-library-pages">
              <button
                aria-label="Previous reference page"
                disabled={!offset || loading}
                onClick={() => setOffset((n) => Math.max(0, n - 25))}
              >
                <Icon name="left" size={18} />
              </button>
              <span className="num">
                {page?.total
                  ? `${offset + 1}–${Math.min(offset + 25, page.total)}`
                  : "0"}{" "}
                / {n0(page?.total ?? 0)}
              </span>
              <button
                aria-label="Next reference page"
                disabled={loading || offset + 25 >= (page?.total ?? 0)}
                onClick={() => setOffset((n) => n + 25)}
              >
                <Icon name="right" size={18} />
              </button>
            </footer>
          </aside>
          <section
            className="reference-library-detail"
            aria-label="Selected reference record"
            aria-busy={!detail && !!selected}
            key={selected}
          >
            {detail ? (
              <RecordView detail={detail} mode={mode} setMode={setMode} />
            ) : (
              <p className="reference-muted" role="status">
                {selected
                  ? "Loading source record…"
                  : "Choose a reference record."}
              </p>
            )}
          </section>
        </div>
      )}
      <footer className="reference-library-footnote">
        <Icon name="info" size={15} />
        <span>
          Source-deleted records remain in the raw archive and are excluded
          here. Full capture:{" "}
          {report
            ? n0(
                Object.values(report.counts).reduce(
                  (sum, c) => sum + c.captured,
                  0,
                ),
              )
            : "…"}{" "}
          records across 32 datasets.
        </span>
      </footer>
    </Modal>
  );
}
