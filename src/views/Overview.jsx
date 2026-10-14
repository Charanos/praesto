/**
 * Overview.
 *
 * Reads top to bottom as an argument, not as a wall of tiles: the headline
 * figures and their caveats, then the network shape, then the thing the
 * dashboard exists to surface, then the supporting distributions.
 *
 * Every figure carries its denominator and provenance in the same block as
 * the number.
 */

import { useMemo, useState } from 'react';
import { runFilter, summarise, sourceBreakdown, inStockCoverage, EMPTY } from '../lib/filters.js';
import { popcount } from '../lib/store.js';
import { Section, Kpi, Icon, Strip, n0, n1, compact, fmtDate } from '../components/ui.jsx';
import {
  useTip, SourceBars, TypeMix, PriceCurve, CoveragePlot, BandSteps, ConfidenceArc,
} from '../components/charts.jsx';

/**
 * Sensitivity scenarios for the headline availability rate.
 *
 * A single availability number over a mixed panel is not a fact, it is a
 * choice about who counts. Publishing one without showing how it moves is how
 * a scrape artefact gets reported as a market condition, so the scenarios are
 * always on screen rather than hidden behind a footnote.
 *
 * The scenarios are derived from feed behaviour, never from hard-coded shop
 * names: the outlier this month is not the outlier next month.
 */
function scenarios(pharmacies) {
  const present = pharmacies.filter((p) => p.present_in_snapshot);
  const reporting = present.filter((p) => p.publishes_oos);

  const rate = (rows) => {
    const inS = rows.reduce((a, p) => a + p.in_stock, 0);
    const out = rows.reduce((a, p) => a + p.out_of_stock, 0);
    return inS + out ? { pct: (100 * inS) / (inS + out), inS, denom: inS + out } : null;
  };

  // The single feed contributing the most out-of-stock rows. In September that
  // is Garnet, at 27% of listings but 65% of every stockout in the panel.
  const dominant = [...reporting].sort((a, b) => b.out_of_stock - a.out_of_stock)[0];
  const withoutDominant = reporting.filter((p) => p.pharmacy_id !== dominant?.pharmacy_id);

  const all = rate(present.map((p) => ({
    // A non-reporting feed counted "as published" treats every listing it has
    // as available -- which is exactly the inflation being demonstrated.
    in_stock: p.publishes_oos ? p.in_stock : p.listings,
    out_of_stock: p.publishes_oos ? p.out_of_stock : 0,
  })));

  return [
    {
      key: 'reporting',
      label: 'Reporting feeds',
      value: rate(reporting),
      note: `${reporting.length} of ${present.length} sources publish a stock signal`,
    },
    {
      key: 'all',
      label: 'All feeds',
      value: all,
      note: `counts ${present.length - reporting.length} non-reporting feeds as fully available`,
    },
    dominant && withoutDominant.length ? {
      key: 'exdominant',
      label: `Excl. ${dominant.name.split(' ')[0]}`,
      value: rate(withoutDominant),
      note: `${dominant.name} alone is ${Math.round((100 * dominant.out_of_stock)
        / Math.max(1, reporting.reduce((a, p) => a + p.out_of_stock, 0)))}% of all stockouts`,
    } : null,
  ].filter(Boolean);
}

export default function Overview({ store, onNavigate, setFilters }) {
  const { meta, P, D } = store;
  const h = meta.headline;
  const cov = meta.coverage;
  const tip = useTip();

  const all = useMemo(() => store.allRows ?? runFilter(store, EMPTY, { key: 'oos', dir: 'desc' }).rows, [store]);
  const stats = useMemo(() => store.allStats ?? summarise(store, all), [store, all]);
  const sources = useMemo(() => store.allSources ?? sourceBreakdown(store, all), [store, all]);

  const reportable = useMemo(() => store.overview?.reportable ?? all.filter((i) => (
    P.clinical[i] === 1
    && P.nOos[i] >= 2
    && D.matchBand[P.matchBand[i]] !== 'low'
    && D.review[P.review[i]] === 'auto'
  )), [all, P, D]);
  const shortage = reportable.slice(0, 12);

  const quarantined = meta.pharmacies.filter((p) => p.present_in_snapshot && p.quarantined);
  const absent = meta.pharmacies.filter((p) => !p.present_in_snapshot);
  const snapshotDate = fmtDate(h.snapshot_at);

  const scen = useMemo(() => scenarios(meta.pharmacies), [meta.pharmacies]);
  const [basis, setBasis] = useState('reporting');
  const [analysisOpen,setAnalysisOpen] = useState(false);
  const active = scen.find((s) => s.key === basis) ?? scen[0];

  // James's "widely available" KPI: the products with enough independent
  // in-stock coverage to route a patient to, as distinct from the shortage
  // signal. Clinical first, because a routing pool of face creams is no use.
  const widelyAvailable = useMemo(
    () => store.overview?.widelyAvailable ?? inStockCoverage(store,all),
    [all, P],
  );
  const widelyClinical = useMemo(
    () => widelyAvailable.filter((i) => P.clinical[i] === 1),
    [widelyAvailable, P],
  );
  const reviewCount = useMemo(
    () => store.overview?.reviewCount ?? all.reduce((a, i) => a + (D.review[P.review[i]] === 'needs_review' ? 1 : 0), 0),
    [all, D, P],
  );

  const jump = (patch) => { setFilters({ ...EMPTY, ...patch }); onNavigate('catalogue'); };

  return (
    <div className="page overview-page section-pass">
      {tip.node}

      <div className="stack">
        {/* ------------------------------------------------- headline --- */}
        <section className="section overview-pulse">
          <header className="section-head overview-pulse-head">
            <div className="titles">
              <div className="eyebrow">Snapshot at a glance</div>
              <h2 className="section-title">Reported availability</h2>
            </div>
            <div className="seg overview-sensitivity" role="group" aria-label="Availability basis">
              {scen.map((s) => (
                <button key={s.key} aria-pressed={basis === s.key}
                  onClick={() => setBasis(s.key)}
                  onMouseMove={(e) => tip.show(e, <><b>{s.label}</b><br />{s.note}</>)}
                  onMouseLeave={tip.hide}
                >{s.label}</button>
              ))}
            </div>
          </header>
          <p className="section-explainer">{basis === 'reporting' ? 'The rate below counts only sources that publish stock states. A missing signal does not mean a product is available.' : basis === 'all' ? 'Sensitivity only: this calculation assumes non-reporting feeds are fully available. It is not the headline availability measure.' : 'Sensitivity only: this calculation excludes the source contributing the most stockout reports.'}</p>
          <div className="pulse">
            {/* -- the state: one figure, encoded, not eight competing tiles - */}
            <div className="pulse-hero">
              <div className="pulse-figure">
                <span className="pulse-pct num">{n1(active.value?.pct)}<sup>%</sup></span>
                <div className="pulse-figure-meta">
                  <span className="eyebrow">{basis === 'reporting' ? 'Rated listings in stock' : 'Sensitivity calculation'}</span>
                  <span><b className="num pulse-number">{n0(active.value?.inS)}</b> of{' '}
                    <b className="num pulse-number">{n0(active.value?.denom)}</b> {basis === 'all' ? 'listings under this assumption' : 'rated listings'}</span>
                  <span className="dim">{active.note}</span>
                </div>
              </div>

              {/* Composition of the whole panel. The bar IS the headline: how
                  much of the catalogue is actually rated, and how the rated
                  part splits. */}
              <div className="pulse-bar" role="img"
                aria-label={`${n0(h.in_stock)} in stock, ${n0(h.out_of_stock)} out of stock, ${n0(h.not_published)} unrated`}>
                {[
                  ['in', h.in_stock, 'In stock', 'var(--in)'],
                  ['out', h.out_of_stock, 'Out of stock', 'var(--out)'],
                  ['nosig', h.not_published, 'No stock signal', 'var(--nosig)'],
                ].map(([k, v, label, tone]) => (
                  <div key={k} className={`pulse-seg pulse-seg-${k}`}
                    style={{ flexGrow: v, background: k === 'nosig' ? undefined : tone }}
                    onMouseMove={(e) => tip.show(e, (
                      <><b>{label}</b><br /><span className="num pulse-number">{n0(v)}</span> listings ·{' '}
                        {n1((100 * v) / h.listings)}% of the panel</>
                    ))}
                    onMouseLeave={tip.hide}
                  />
                ))}
              </div>
              <div className="pulse-legend">
                {[
                  ['In stock', h.in_stock, 'var(--in)'],
                  ['Out of stock', h.out_of_stock, 'var(--out)'],
                  ['No stock signal', h.not_published, 'var(--nosig)'],
                ].map(([label, v, tone]) => (
                  <span key={label}>
                    <i style={{ background: tone }} />{label}
                    <b className="num pulse-number">{compact(v)}</b>
                  </span>
                ))}
              </div>

              {/* The sensitivity spread, shown rather than asserted: you can
                  see how far the headline moves depending on who counts. */}
              <div className="pulse-scale">
                <span className="eyebrow">Compare calculation bases</span>
                <div className="pulse-scale-track">
                  {scen.map((s) => {
                    const lo = Math.min(...scen.map((x) => x.value?.pct ?? 0)) - 6;
                    const hi = Math.max(...scen.map((x) => x.value?.pct ?? 0)) + 6;
                    const at = (100 * ((s.value?.pct ?? 0) - lo)) / Math.max(1, hi - lo);
                    return (
                      <button key={s.key} className="pulse-tick" data-on={basis === s.key}
                        style={{ left: `${at}%` }}
                        onClick={() => setBasis(s.key)}
                        onMouseMove={(e) => tip.show(e, <><b>{s.label}</b><br />{s.note}</>)}
                        onMouseLeave={tip.hide}
                      >
                        <i />
                        <em className="num pulse-number">{n1(s.value?.pct)}</em>
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* -- what it is made of ------------------------------------- */}
            <div className="pulse-list" role="group" aria-label="Catalogue coverage">
              <div className="pulse-list-head"><span className="eyebrow">Catalogue coverage</span></div>
              <div><span className="pulse-label">Resolved products</span><span className="num pulse-number">{compact(h.products)}</span></div>
              <div><span className="pulse-label">Catalogue listings</span><span className="num pulse-number">{n0(h.listings)}</span></div>
              <div><span className="pulse-label">Sources reporting</span>
                <span className="num pulse-number">{h.pharmacies_publishing_oos}<span className="faint">/{h.pharmacies}</span></span></div>
              <div><span className="pulse-label">Median price</span>
                <span className="num pulse-number">{n0(h.median_price_kes)}<span className="faint"> KES</span></span></div>
              <div><span className="pulse-label">In stock at 5+ sources</span><span className="num pulse-number">{n0(widelyAvailable.length)}</span></div>
            </div>

            {/* -- what needs attention ----------------------------------- */}
            <div className="pulse-list pulse-list-alert" role="group" aria-label="Worth investigating">
              <div className="pulse-list-head"><span className="eyebrow">Worth investigating</span></div>
              <button onClick={() => jump({ clinicalOnly: true, oosMin: 2 })}>
                <span className="pulse-label">Clinical stockouts</span><span className="num pulse-number">{n0(reportable.length)}</span>
              </button>
              <button onClick={() => onNavigate('quality')}>
                <span className="pulse-label">Stock not reported</span><span className="num pulse-number">{compact(h.not_published)}</span>
              </button>
              <button onClick={() => onNavigate('quality')}>
                <span className="pulse-label">Awaiting reference</span><span className="num pulse-number">{compact(cov.products_awaiting_drugindex)}</span>
              </button>
              <button onClick={() => jump({ review: 'needs_review' })}>
                <span className="pulse-label">In review</span><span className="num pulse-number">{compact(reviewCount)}</span>
              </button>
              <button onClick={() => onNavigate('sources')}>
                <span className="pulse-label">Sources absent</span><span className="num pulse-number">{absent.length}</span>
              </button>
            </div>
          </div>

          <details className="snapshot-provenance"><summary>Snapshot provenance <Icon name="info" size={13} /></summary><div className="provenance overview-provenance">
            <Icon name="info" size={11} />
            <span>Snapshot <b style={{ color: 'var(--ink-2)' }}>{meta.run.snapshot_id}</b></span>
            <span className="sep">·</span>
            <span>{snapshotDate}{meta.run.snapshot_at_inferred && ' — inferred from file mtime'}</span>
            <span className="sep">·</span>
            <span>match {meta.run.match_algo_version}</span>
            <span className="sep">·</span>
            <span>classifier {meta.run.classifier_version}</span>
            <span className="sep">·</span>
            <span>register {meta.run.drugindex_fingerprint?.slice(0, 8)}</span>
            <span className="sep">·</span>
            <span>contract {meta.contract_version}</span>
          </div></details>

          {(quarantined.length > 0 || absent.length > 0) && (
            <div className="notice" style={{ marginTop: 12 }}>
              <Icon name="alert" size={13} />
              <div>
              <b>{quarantined.length} feeds have no usable stock signal</b> and are excluded
                from network availability. <b>{absent.length} pharmacies are absent</b> from this
                snapshot — {absent.map((a) => a.name).join(', ')}. Counting non-reporting feeds as
                available would read <span className="num pulse-number">{n1(h.in_stock_rate_raw)}%</span> instead.
              </div>
            </div>
          )}
        </section>

        <hr className="rule" />

        <section className="task-entry" aria-label="Start an investigation">
          <button className="task-primary" onClick={() => { onNavigate('catalogue'); requestAnimationFrame(() => document.querySelector('[data-search] input')?.focus()); }}><span className="section-glyph"><Icon name="capsule" size={20} /></span><span><b>Find &amp; compare</b><small>Product names and active ingredients</small></span><Icon name="right" size={16} /></button>
          <button onClick={() => jump({ clinicalOnly: true, oosMin: 2 })}><span className="section-glyph" data-tone="amber"><Icon name="pulse" size={20} /></span><span><b>Investigate stockouts</b><small>Medicines and devices across sources</small></span><Icon name="right" size={16} /></button>
          <button onClick={() => onNavigate('sources')}><span className="section-glyph" data-tone="cobalt"><Icon name="pharmacy" size={20} /></span><span><b>Explore pharmacies</b><small>Catalogues and reporting coverage</small></span><Icon name="right" size={16} /></button>
        </section>

        {/* -------------------------------------------------- network --- */}
        <div className="overview-network-grid">
          <Section
            className="overview-source-section"
            eyebrow="Network signal"
            title="Availability by source"
            actions={<button className="btn btn-sm btn-ghost" onClick={() => onNavigate('sources')}>
              All sources <Icon name="right" size={11} />
            </button>}
            caption="Bars count resolved products: solid for in-stock reports, full length for products listed. Hatched sources have no usable stock signal."
            fill
          >
            <SourceBars rows={sources} tip={tip} onPick={(bit) => jump({ shopsAny: [bit] })} />
          </Section>

          <div className="overview-network-side">
            <Section
              className="overview-type-section"
              eyebrow="Product universe"
              title="Classification mix"
              caption={<>
                <b>{n1(100 * (1 - cov.products_unclassified / h.products))}%</b> classified.
                Classification depends on the incomplete local reference and source categories.
              </>}
            >
              <TypeMix counts={stats.byType} labels={D.type} tip={tip}
                onPick={(i) => jump({ types: [i] })} />
            </Section>

            <Section
              className="overview-band-section"
              eyebrow="Cross-source"
              title="Shortage bands"
              caption="Counted against sources that publish a stock signal — eight of fifteen."
              fill
            >
              <BandSteps counts={stats.byBand} labels={D.band} tip={tip}
                onPick={(i) => jump({ bands: [i] })} />
            </Section>
          </div>
        </div>

        <hr className="rule" />

        {/* ------------------------------------------------- shortage --- */}
        <Section
          className="overview-shortage"
          eyebrow="Clinical shortage signal"
          title="Out of stock across multiple sources"
          actions={
            <button className="btn btn-sm" onClick={() => jump({ clinicalOnly: true, oosMin: 2 })}>
              Open in catalogue <Icon name="right" size={11} />
            </button>
          }
          caption={<>
            Medicines and devices only, confidently matched and not in review.
            <b> No clinical product reaches three sources</b> in this snapshot.
          </>}
          flush
        >
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Active ingredient</th>
                <th style={{ width: 160 }}>By source</th>
                <th className="r" style={{ width: 78 }}>Out</th>
                <th className="r" style={{ width: 96 }}>Median</th>
              </tr>
            </thead>
            <tbody>
              {shortage.map((i) => (
                <tr key={P.key[i]}>
                  <td className="cell-name"><button className="table-action" onClick={() => jump({ q: P.name[i] })}>{P.name[i]}</button></td>
                  <td className="cell-name dim tiny">
                    {P.ingredient[i] >= 0 ? D.ingredient[P.ingredient[i]] : '—'}
                  </td>
                  <td>
                    <Strip store={store} listedMask={P.listedMask[i]} inMask={P.inMask[i]}
                      oosMask={P.oosMask[i]}
                      onHover={(e, s, cls) => tip.show(e, <><b>{s.name}</b><br />{
                        cls === 'cell-none' ? 'not listed' : cls === 'cell-out' ? 'out of stock'
                          : cls === 'cell-in' ? 'in stock' : 'no stock signal'}</>)}
                      onLeave={tip.hide} />
                  </td>
                  <td className="r num" style={{ color: 'var(--out)' }}>
                    {P.nOos[i]}<span className="faint">/{P.nEligible[i]}</span>
                  </td>
                  <td className="r num">{Number.isFinite(P.priceMed[i]) ? n0(P.priceMed[i]) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <hr className="rule" />

        {/* ------------------------------------------------ coverage --- */}
        <Section
          className="overview-coverage-table"
          eyebrow={`${n0(widelyClinical.length)} clinical · ${n0(widelyAvailable.length)} overall`}
          title="Broadest in-stock coverage"
          actions={
            <button className="btn btn-sm" onClick={() => jump({ clinicalOnly: true, listedMin: 5 })}>
              Open in catalogue <Icon name="right" size={11} />
            </button>
          }
          caption={<>
            Medicines and devices with broad reported in-stock coverage in this snapshot.
            Confirm current stock, strength, form and price with the pharmacy. The catalogue action explores products listed by five or more sources.
            {widelyClinical.length === 0 && <> <b>Nothing clinical reaches five sources in this snapshot.</b></>}
          </>}
          flush
        >
          <table className="tbl">
            <thead>
              <tr>
                <th>Product</th>
                <th>Active ingredient</th>
                <th style={{ width: 160 }}>By source</th>
                <th className="r" style={{ width: 78 }}>In stock</th>
                <th className="r" style={{ width: 96 }}>Median</th>
              </tr>
            </thead>
            <tbody>
              {(widelyClinical.length ? widelyClinical : widelyAvailable).slice(0, 12).map((i) => (
                <tr key={P.key[i]}>
                  <td className="cell-name"><button className="table-action" onClick={() => jump({ q: P.name[i] })}>{P.name[i]}</button></td>
                  <td className="cell-name dim tiny">
                    {P.ingredient[i] >= 0 ? D.ingredient[P.ingredient[i]] : '—'}
                  </td>
                  <td>
                    <Strip store={store} listedMask={P.listedMask[i]} inMask={P.inMask[i]}
                      oosMask={P.oosMask[i]}
                      onHover={(e, s, cls) => tip.show(e, <><b>{s.name}</b><br />{
                        cls === 'cell-none' ? 'not listed' : cls === 'cell-out' ? 'out of stock'
                          : cls === 'cell-in' ? 'in stock' : 'no stock signal'}</>)}
                      onLeave={tip.hide} />
                  </td>
                  <td className="r num" style={{ color: 'var(--in)' }}>
                    {popcount(P.inMask[i])}<span className="faint">/{P.nEligible[i]}</span>
                  </td>
                  <td className="r num">{Number.isFinite(P.priceMed[i]) ? n0(P.priceMed[i]) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <hr className="rule" />

        {/* ------------------------------------------------- analysis --- */}
        <details className="overview-analysis-disclosure" onToggle={event=>setAnalysisOpen(event.currentTarget.open)}><summary><span><span className="eyebrow">Supporting analysis</span><span>Price, coverage &amp; match confidence</span></span><Icon name="down" size={18} /></summary>{analysisOpen && <div className="overview-analysis-grid">
          <Section className="overview-price-section" eyebrow="Distribution" title="Price" fill
            caption="Log-scaled — retail pharmacy prices span four orders of magnitude. Solid rule is the median, dashed are p10 and p90.">
            <PriceCurve prices={stats.prices} p10={stats.price.p10} p50={stats.price.p50}
              p90={stats.price.p90} tip={tip} height={150} />
          </Section>

          <Section className="overview-coverage-section" eyebrow="Breadth vs availability" title="Coverage" fill
            caption="One mark per listed/in-stock pair, sized by product count. The diagonal is full availability; distance below it is the shortfall.">
            <CoveragePlot store={store} rows={all} tip={tip} height={212}
              onPick={(listed) => jump({ listedMin: listed, listedMax: listed })} />
          </Section>

          <Section className="overview-confidence-section" eyebrow="Resolution" title="Match confidence" fill
            caption={<>Confidence falls with short keys, missing pack size and wide price spread, and recovers when independent sources agree on price.</>}>
            <ConfidenceArc counts={stats.byMatch} labels={D.matchBand} tip={tip} size={150} />
          </Section>
        </div>}</details>
      </div>
    </div>
  );
}
