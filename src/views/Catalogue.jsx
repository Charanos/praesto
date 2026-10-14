/**
 * Catalogue — faceted exploration of 43,606 resolved products.
 *
 * Layout is a three-column instrument: facets, grid, detail. The facet rail
 * carries live cross-filtered counts, the grid is windowed so the full result
 * set scrolls continuously, and selecting a row opens the per-source detail
 * without losing your place.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../components/Modal.tsx';
import ClinicalReader from '../components/ClinicalReader.tsx';
import { useSmallScreen } from '../components/useSmallScreen.ts';
import {
  runFilter, facetCounts, shopCounts, summarise, sourceBreakdown,
  activeChips, EMPTY,
} from '../lib/filters.js';
import { loadListings, listingsFor, popcount } from '../lib/store.js';
import {
  Section, Icon, Tag, Chip, StateTag, Strip, Empty, Facet, Check, RangePair,
  n0, n1, kes, compact, useVirtual,
} from '../components/ui.jsx';
import { useTip, useMeasure, SourceBars, TypeMix, PriceCurve, BandSteps, Matrix } from '../components/charts.jsx';

const ROW_H = 56;

/**
 * `minmax(0, …)` on the flexible column is what stops the grid pushing past
 * its container: a bare `3fr` track refuses to shrink below its content, so
 * long product names silently shove the right-hand columns out of view.
 * Fixed tracks are sized to their widest real value, not to their header.
 */
/**
 * Columns in order of what you give up first.
 *
 * The grid is the third column of a three-column shell, so at 1180px it gets
 * about 684px once the nav and facet rails are paid for — and 544px of fixed
 * tracks left the product name 45px wide, which is useless. Rather than pick
 * breakpoints against the viewport (which knows nothing about whether the
 * facet rail is open), each column declares the grid width it needs and the
 * set is chosen from the measured container.
 *
 * Product and Availability never drop: the name is the row's identity and the
 * strip is the reason the row is interesting.
 */
const COLUMNS = [
  { key: 'name', label: 'Product', sort: 'name', w: 'minmax(0, 3fr)', needs: 0 },
  { key: 'type', label: 'Class', sort: null, w: 'minmax(0, 96px)', needs: 820 },
  { key: 'strip', label: 'Availability', sort: null, w: '142px', needs: 0 },
  { key: 'listed', label: 'Listed', sort: 'listed', w: '52px', r: true, needs: 470 },
  { key: 'oos', label: 'Out', sort: 'oos', w: '48px', r: true, needs: 0 },
  { key: 'band', label: 'Band', sort: null, w: '72px', needs: 745 },
  { key: 'price', label: 'Median', sort: 'price', w: '78px', r: true, needs: 560 },
  { key: 'conf', label: 'Match', sort: 'conf', w: '56px', r: true, needs: 660 },
];

export default function Catalogue({ store, filters, setFilters, tipHost }) {
  const { P, D, shops } = store;
  const [sort, setSort] = useState({ key: 'relevance', dir: 'desc' });
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('grid');
  const mobile = useSmallScreen();
  const [showFacets, setShowFacets] = useState(false);
  const [analysisColumns, setAnalysisColumns] = useState(false);
  const viewportRef = useRef(null);
  const tip = useTip();

  const patch = (p) => setFilters({ ...filters, ...p });

  const { rows } = useMemo(() => runFilter(store, filters, sort), [store, filters, sort]);
  const stats = useMemo(() => summarise(store, rows), [store, rows]);
  const sources = useMemo(() => sourceBreakdown(store, rows), [store, rows]);

  const typeN = useMemo(
    () => facetCounts(store, filters, 'types', D.type.length, (i) => P.type[i]),
    [store, filters],
  );
  const bandN = useMemo(
    () => facetCounts(store, filters, 'bands', D.band.length, (i) => P.band[i]),
    [store, filters],
  );
  const formN = useMemo(
    () => facetCounts(store, filters, 'forms', D.form.length, (i) => P.form[i]),
    [store, filters],
  );
  const matchN = useMemo(
    () => facetCounts(store, filters, 'matchBands', D.matchBand.length, (i) => P.matchBand[i]),
    [store, filters],
  );
  const gapN = useMemo(
    () => facetCounts(store, filters, 'gaps', D.gap.length, (i) => P.gap[i]),
    [store, filters],
  );
  const catN = useMemo(
    () => facetCounts(store, filters, 'categories', D.category.length, (i) => P.categories[i]),
    [store, filters],
  );
  const therN = useMemo(
    () => facetCounts(store, filters, 'therapeutic', D.therapeutic.length, (i) => P.therapeutic[i]),
    [store, filters],
  );
  const shopN = useMemo(() => shopCounts(store, filters, 'shopsAny'), [store, filters]);

  const chips = activeChips(filters, store);
  const range = useVirtual({ count: rows.length, rowHeight: ROW_H, viewportRef });

  const toggle = (key, value) => {
    const cur = filters[key];
    patch({ [key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] });
  };

  const topCategories = useMemo(() => (
    D.category
      .map((label, i) => ({ label, i, n: catN[i] }))
      .filter((c) => c.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 22)
  ), [D.category, catN]);

  const [gridRef, gridWidth] = useMeasure();
  // Until the container reports a width, assume it is wide: showing every
  // column then dropping some is far less jarring than the reverse.
  const columns = useMemo(
    () => mobile ? [COLUMNS[0], { ...COLUMNS[2], label: 'Stock / price', w: '118px' }] : analysisColumns ? COLUMNS.filter((c) => !c.needs || gridWidth === 0 || gridWidth >= c.needs) : [COLUMNS[0], { ...COLUMNS[2], label: 'Stock reports', w: '160px' }, ...(gridWidth > 620 ? [{ ...COLUMNS[3], label: 'Sources', w: '72px' }] : []), { ...COLUMNS[6], label: 'Listed median', w: '110px' }],
    [gridWidth, mobile, analysisColumns],
  );
  const gridTemplate = columns.map((c) => c.w).join(' ');

  const reportingBits = shops.filter(shop => shop.publishes_oos).map(shop => shop.bit);
  const sameBits = (bits) => bits.length === reportingBits.length && reportingBits.every(bit => bits.includes(bit));
  const stockChoice = !filters.stockIn.length && !filters.stockOut.length ? 'all'
    : sameBits(filters.stockIn) && !filters.stockOut.length ? 'in'
    : sameBits(filters.stockOut) && !filters.stockIn.length ? 'out' : 'custom';

  const facetPanel = (
    <aside className="catalogue-facets" aria-label="Catalogue filters">
          <div className="catalogue-facet-top">
            <div className="row">
              <h2 className="h3" id="filter-title">Refine results</h2>
              <button className="btn btn-icon filter-close" aria-label="Close filters" onClick={() => setShowFacets(false)}><Icon name="x" size={16} /></button>
              <button className="btn btn-ghost btn-sm spacer"
                onClick={() => setFilters({ ...EMPTY })}
                disabled={!chips.length}>Reset</button>
            </div>
          </div>

          <div className="facets">
            <div className="facet-body"><Check label="Show analysis columns" on={analysisColumns} onChange={() => setAnalysisColumns(!analysisColumns)} /></div>
            <Facet title="Product type" count={filters.types.length || null} defaultOpen>
              <label className="facet-opt" data-on={filters.clinicalOnly}
                style={{ marginBottom: 6, paddingBottom: 6, borderBottom: '1px solid var(--line-faint)' }}>
                <input type="checkbox" checked={filters.clinicalOnly}
                  onChange={(e) => patch({ clinicalOnly: e.target.checked })} />
                <span style={{ fontWeight: 500 }}>Medicines &amp; devices only</span>
                <span className="n">{compact(stats.clinical)}</span>
              </label>
              {D.type.map((label, i) => (
                <Check key={label} label={label.replace(/_/g, ' ')} n={typeN[i]}
                  on={filters.types.includes(i)} onChange={() => toggle('types', i)} />
              ))}
            </Facet>

            <Facet title="Therapeutic class" count={filters.therapeutic.length || null}>
              <div className="micro dim" style={{ marginBottom: 6 }}>
                From the drug register. Null where no ingredient matched — filtering here
                drops every unclassed product.
              </div>
              {D.therapeutic
                .map((label, i) => ({ label, i, n: therN[i] }))
                .filter((t) => t.n > 0)
                .sort((a, b) => b.n - a.n)
                .map((t) => (
                  <Check key={t.label} label={t.label} n={t.n}
                    on={filters.therapeutic.includes(t.i)} onChange={() => toggle('therapeutic', t.i)} />
                ))}
            </Facet>

            <Facet title="Stockout extent" count={filters.bands.length || null}>
              {['isolated', 'local', 'cluster', 'systemic', 'national', 'total', 'none']
                .map((name) => D.band.indexOf(name))
                .filter((i) => i >= 0)
                .map((i) => (
                  <Check key={D.band[i]} label={D.band[i]} n={bandN[i]}
                    on={filters.bands.includes(i)} onChange={() => toggle('bands', i)} />
                ))}
            </Facet>

            <Facet title="Pharmacies" count={
              (filters.shopsAny.length + filters.shopsAll.length + filters.stockIn.length + filters.stockOut.length) || null
            }>
              <div className="micro dim" style={{ marginBottom: 5 }}>Listed in any of</div>
              {shops.map((s) => (
                <Check key={s.pharmacy_id} label={s.name} n={shopN.listed[s.bit]}
                  on={filters.shopsAny.includes(s.bit)} onChange={() => toggle('shopsAny', s.bit)} />
              ))}
              <details className="source-filter-group"><summary>Listed in every selected pharmacy</summary>
                {shops.map(shop => <Check key={shop.pharmacy_id} label={`All of · ${shop.name}`} on={filters.shopsAll.includes(shop.bit)} onChange={() => toggle('shopsAll', shop.bit)} />)}
              </details>
              <details className="source-filter-group"><summary>In stock at any selected pharmacy</summary>
                {shops.filter(shop => shop.publishes_oos).map(shop => <Check key={shop.pharmacy_id} label={`In stock · ${shop.name}`} on={filters.stockIn.includes(shop.bit)} onChange={() => toggle('stockIn', shop.bit)} />)}
              </details>
              <div className="micro dim" style={{ margin: '10px 0 5px' }}>Out of stock at</div>
              {shops.filter((s) => s.publishes_oos).map((s) => (
                <Check key={s.pharmacy_id} label={s.name} n={shopN.oos[s.bit]}
                  on={filters.stockOut.includes(s.bit)} onChange={() => toggle('stockOut', s.bit)} />
              ))}
            </Facet>

            <Facet title="Advanced · source counts" count={(filters.listedMin || filters.oosMin) ? 1 : null}>
              <div className="micro dim" style={{ marginBottom: 4 }}>Pharmacies listing</div>
              <RangePair label="pharmacies listing" min={filters.listedMin || null} max={filters.listedMax || null}
                onMin={(v) => patch({ listedMin: v ?? 0 })} onMax={(v) => patch({ listedMax: v ?? 0 })} />
              <div className="micro dim" style={{ margin: '10px 0 4px' }}>Pharmacies out of stock</div>
              <RangePair label="pharmacies out of stock" min={filters.oosMin || null} max={filters.oosMax || null}
                onMin={(v) => patch({ oosMin: v ?? 0 })} onMax={(v) => patch({ oosMax: v ?? 0 })} />
            </Facet>

            <Facet title="Listed price · KES" count={(filters.priceMin != null || filters.priceMax != null) ? 1 : null}>
              <RangePair label="listed median price in KES" min={filters.priceMin} max={filters.priceMax}
                onMin={(v) => patch({ priceMin: v })} onMax={(v) => patch({ priceMax: v })}
                placeholderMin="KES min" placeholderMax="KES max" />
              <div className="micro dim" style={{ marginTop: 8 }}>
                p10 {kes(stats.price.p10)} · median {kes(stats.price.p50)} · p90 {kes(stats.price.p90)}
              </div>
            </Facet>

            <Facet title="Form · tablet, cream and more" count={filters.forms.length || null}>
              {D.form.map((label, i) => (formN[i] ? (
                <Check key={label} label={label} n={formN[i]}
                  on={filters.forms.includes(i)} onChange={() => toggle('forms', i)} />
              ) : null))}
            </Facet>

            <Facet title="Pack format" count={filters.packKinds.length || null}>
              {D.packKind.map((label, index) => <Check key={label} label={label.replaceAll('_', ' ')} on={filters.packKinds.includes(index)} onChange={() => toggle('packKinds', index)} />)}
            </Facet>

            <Facet title="Advanced · source categories" count={filters.categories.length || null}>
              {topCategories.map((c) => (
                <Check key={c.label} label={c.label} n={c.n}
                  on={filters.categories.includes(c.i)} onChange={() => toggle('categories', c.i)} />
              ))}
            </Facet>

            <Facet title="Advanced · match confidence" count={filters.matchBands.length || null}>
              {D.matchBand.map((label, i) => (
                <Check key={label} label={label} n={matchN[i]}
                  on={filters.matchBands.includes(i)} onChange={() => toggle('matchBands', i)} />
              ))}
              <div className="micro dim" style={{ margin: '9px 0 3px' }}>
                Minimum confidence · {filters.confMin.toFixed(2)}
              </div>
              <input type="range" min="0" max="1" step="0.05" value={filters.confMin} aria-label="Minimum match confidence"
                onChange={(e) => patch({ confMin: Number(e.target.value) })} />
            </Facet>

            <Facet title="Advanced · reference coverage" count={
              (filters.gaps.length + (filters.monograph !== 'all' ? 1 : 0)) || null
            }>
              <div className="micro dim" style={{ marginBottom: 4 }}>DrugIndex reference link</div>
              <div className="seg" style={{ width: '100%', marginBottom: 9 }}>
                {[['all', 'Any'], ['with', 'Has'], ['without', 'None']].map(([v, l]) => (
                  <button key={v} style={{ flex: 1 }} aria-pressed={filters.monograph === v}
                    onClick={() => patch({ monograph: v })}>{l}</button>
                ))}
              </div>
              <div className="micro dim" style={{ marginBottom: 4 }}>Classification gap</div>
              {D.gap.map((label, i) => (gapN[i] ? (
                <Check key={label} label={label} n={gapN[i]}
                  on={filters.gaps.includes(i)} onChange={() => toggle('gaps', i)} />
              ) : null))}
            </Facet>

            <Facet title="Advanced · review status" count={filters.review !== 'all' ? 1 : null}>
              <div className="seg" style={{ width: '100%' }}>
                {[['all', 'All'], ['auto', 'Automatic'], ['needs_review', 'In review']].map(([v, l]) => (
                  <button key={v} style={{ flex: 1 }} aria-pressed={filters.review === v}
                    onClick={() => patch({ review: v })}>{l}</button>
                ))}
              </div>
              <label className="facet-opt" style={{ marginTop: 8 }} data-on={filters.contested}>
                <input type="checkbox" checked={filters.contested}
                  onChange={(e) => patch({ contested: e.target.checked })} />
                <span>Contested classification</span>
              </label>
            </Facet>
          </div>
        </aside>
  );

  return (
    <div className={`catalogue-shell${showFacets ? ' facets-open' : ''}`}>
      {tip.node}

      {/* ---------------------------------------------------------- facets */}
      {showFacets && (mobile ? <Modal className="filter-dialog" labelledBy="filter-title" onClose={() => setShowFacets(false)}>
        {facetPanel}
        <div className="filter-footer"><button className="btn btn-primary" onClick={() => setShowFacets(false)}>Show {n0(rows.length)} results</button></div>
      </Modal> : facetPanel)}

      {/* ------------------------------------------------------------ main */}
      <div className="catalogue-main" ref={gridRef}>
        <header className="catalogue-heading"><h1 className="h1">Find &amp; compare</h1><span className="catalogue-result-count" role="status" aria-live="polite">{n0(rows.length)} results</span></header>
        {/* toolbar */}
        <div className="catalogue-toolbar">
          <div className="catalogue-command-row">
            <button className="btn" onClick={() => setShowFacets(!showFacets)}
              aria-label={showFacets ? 'Hide more filters' : 'More filters'} aria-expanded={showFacets}>
              <Icon name="filter" size={14} /><span>More filters</span>
            </button>
            <button className={`btn ${filters.clinicalOnly ? 'quick-selected' : ''}`} aria-pressed={filters.clinicalOnly}
              onClick={() => patch({ clinicalOnly: !filters.clinicalOnly, types: [] })}>Medicines &amp; devices</button>
            <div className="seg catalogue-view-switch">
              {[['grid', 'List'], ['matrix', 'Matrix'], ['charts', 'Charts']].map(([v, l]) => (
                <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{l}</button>
              ))}
            </div>
            <span className="num tiny dim nowrap catalogue-result-total">
              {n0(rows.length)} of {compact(P.n)}
            </span>
          </div>

          <div className="quick-filters">
            <label>Stock evidence<select value={stockChoice} onChange={(event) => patch({ stockIn: event.target.value === 'in' ? reportingBits : [], stockOut: event.target.value === 'out' ? reportingBits : [] })}>
              <option value="all">Any reported state</option><option value="in">In stock somewhere</option><option value="out">Out of stock somewhere</option>{stockChoice === 'custom' && <option value="custom">Custom stock selection</option>}
            </select></label>
            <label>Pharmacy<select value={filters.shopsAny.length === 1 ? filters.shopsAny[0] : filters.shopsAny.length ? 'custom' : 'all'} onChange={(event) => patch({ shopsAny: event.target.value === 'all' ? [] : [Number(event.target.value)] })}>
              <option value="all">All pharmacies</option>{shops.map(shop => <option key={shop.bit} value={shop.bit}>{shop.name}</option>)}{filters.shopsAny.length > 1 && <option value="custom">Multiple pharmacies</option>}
            </select></label>
            <label className="catalogue-sort">Sort results<select value={`${sort.key}:${sort.dir}`} onChange={(event) => { const [key, dir] = event.target.value.split(':'); setSort({ key, dir }); }}>
              <option value="relevance:desc">Most stockout reports</option><option value="name:desc">Product name A–Z</option><option value="name:asc">Product name Z–A</option>
              <option value="price:asc">Listed median price · low first</option><option value="price:desc">Listed median price · high first</option><option value="listed:desc">Most pharmacies listing</option>
              <option value="oos:desc">Out-of-stock source count</option><option value="instock:desc">In-stock source count</option><option value="oosShare:desc">Out-of-stock share</option><option value="conf:desc">Highest match confidence</option><option value="listings:desc">Most listings</option>
              {!['relevance:desc','name:desc','name:asc','price:asc','price:desc','listed:desc','oos:desc','instock:desc','oosShare:desc','conf:desc','listings:desc'].includes(`${sort.key}:${sort.dir}`) && <option value={`${sort.key}:${sort.dir}`}>Current column sort</option>}
            </select></label>
          </div>
          {chips.length > 0 && (
            <div className="catalogue-chip-row">
              {chips.map((c) => (
                <Chip key={c.key} active onClear={() => patch(c.clear)}>{c.label}</Chip>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ ...EMPTY })}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* result summary strip */}
        <details className="catalogue-selection-summary"><summary>Selection statistics</summary><div className="provenance catalogue-telemetry">
          <span><b className="num" style={{ color: 'var(--ink)' }}>{n0(stats.clinical)}</b> clinical</span>
          <span className="sep">·</span>
          <span><b className="num" style={{ color: 'var(--ink)' }}>{n0(stats.oosAny)}</b> with a stockout</span>
          <span className="sep">·</span>
          <span>avg <b className="num" style={{ color: 'var(--ink)' }}>{n1(stats.avgListed)}</b> pharmacies listing</span>
          <span className="sep">·</span>
          <span>median <b className="num" style={{ color: 'var(--ink)' }}>{kes(stats.price.p50)}</b></span>
          <span className="sep">·</span>
          <span><b className="num" style={{ color: 'var(--ink)' }}>{n0(stats.withMono)}</b> reference-linked</span>
        </div></details>

        <p className="catalogue-mobile-note">Open a product to compare pharmacy listings and prices.</p>
        {/* body */}
        {rows.length === 0 ? (
          <Empty
            title="Nothing matches those filters"
            note="Try a shorter product name, another ingredient, or clear a pharmacy or price filter."
            action={<button className="btn" onClick={() => setFilters({ ...EMPTY })}>Reset filters</button>}
          />
        ) : view === 'charts' ? (
          <div className="scroll">
            <div className="page catalogue-chart-grid">
              <Section eyebrow="Selection" title="Availability by source">
                <SourceBars rows={sources} tip={tip} selected={filters.shopsAny}
                  onPick={(bit) => toggle('shopsAny', bit)} />
              </Section>
              <Section eyebrow="Selection" title="Price distribution"
                caption="Log-scaled. Dashed rules mark p10 and p90; solid rule is the median.">
                <PriceCurve prices={stats.prices} p10={stats.price.p10}
                  p50={stats.price.p50} p90={stats.price.p90} tip={tip} />
              </Section>
              <Section eyebrow="Selection" title="Classification mix">
                <TypeMix counts={stats.byType} labels={store.D.type} tip={tip}
                  selected={filters.types} onPick={(i) => toggle('types', i)} />
              </Section>
              <Section eyebrow="Selection" title="Shortage bands">
                <BandSteps counts={stats.byBand} labels={store.D.band} tip={tip}
                  selected={filters.bands} onPick={(i) => toggle('bands', i)} />
              </Section>
            </div>
          </div>
        ) : view === 'matrix' ? (
          <div className="scroll">
            <div className="page catalogue-matrix-page">
              <Section
                eyebrow={`${n0(rows.length)} products · showing first 40`}
                title="Availability matrix"
                caption="* marks a source that publishes no out-of-stock signal; its cells show listing presence only."
              >
                <div className="legend" style={{ marginBottom: 14 }}>
                  <span><i className="cell-in" /> In stock</span>
                  <span><i className="cell-out" /> Out of stock</span>
                  <span><i className="cell-nosig" /> No stock signal</span>
                  <span><i className="cell-none" /> Not listed</span>
                </div>
                <Matrix store={store} rows={rows} limit={40} tip={tip} onPick={setSelected} />
              </Section>
            </div>
          </div>
        ) : (
          <>
            <div className="catalogue-grid-head" style={{ gridTemplateColumns: gridTemplate }}>
              {columns.map((c) => (
                <button key={c.key}
                  className="eyebrow trunc"
                  style={{
                    textAlign: c.r ? 'right' : 'left',
                    cursor: c.sort ? 'pointer' : 'default',
                    color: sort.key === c.sort ? 'var(--ink)' : undefined,
                  }}
                  onClick={() => c.sort && setSort({
                    key: c.sort,
                    dir: sort.key === c.sort && sort.dir === 'desc' ? 'asc' : 'desc',
                  })}
                >
                  {c.label}
                  {sort.key === c.sort && (
                    <span style={{ color: 'var(--accent)', marginLeft: 3 }}>
                      {sort.dir === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div ref={viewportRef} className="scroll catalogue-grid-scroll" role="region" aria-label="Product results" tabIndex={0}>
              <div style={{ height: rows.length * ROW_H, position: 'relative' }}>
                <div style={{ transform: `translateY(${range.start * ROW_H}px)` }}>
                  {rows.slice(range.start, range.end).map((i) => (
                    <Row key={P.key[i]} store={store} i={i} tip={tip}
                      template={gridTemplate} columns={columns}
                      active={selected === i}
                      onSelect={() => setSelected(i)}
                      onMove={(direction) => { const index = Math.max(0, Math.min(rows.length - 1, rows.indexOf(i) + direction)); viewportRef.current.scrollTop = Math.max(0, index * ROW_H - ROW_H); requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(`[data-product-index="${rows[index]}"]`)?.focus())); }} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {selected != null && (
        <Detail store={store} i={selected} onClose={() => setSelected(null)}
          onPick={setSelected} tip={tip} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ row - */

/**
 * Cells are keyed by column so the row renders exactly the set the header
 * chose. Positional children would silently shift into the wrong tracks the
 * moment a column drops out at a narrow width.
 */
const CELL = {
  name: ({ P, D, i }) => (
    <span className="product-cell">
      <span className="product-name">{P.name[i]}</span>
      {P.ingredient[i] >= 0 && <span className="product-ingredient">{D.ingredient[P.ingredient[i]]}</span>}
    </span>
  ),
  type: ({ P, D, i }) => (
    <div className="trunc tiny" style={{ color: P.clinical[i] ? 'var(--ink)' : 'var(--ink-3)' }}>
      {D.type[P.type[i]].replace(/_/g, ' ')}
    </div>
  ),
  strip: ({ store, P, i, tip }) => (
    <span><span className="compact-evidence"><b>{popcount(P.inMask[i])} in · {popcount(P.oosMask[i])} out</b><span className="num">{kes(P.priceMed[i])}</span><span>{P.nListed[i]} sources listing</span></span><span className="desktop-evidence">{popcount(P.inMask[i])} in stock · {popcount(P.oosMask[i])} out</span><Strip store={store} listedMask={P.listedMask[i]} inMask={P.inMask[i]} oosMask={P.oosMask[i]}
      onHover={(e, s, cls) => tip.show(e, (
        <><b>{s.name}</b><br />{
          cls === 'cell-none' ? 'not listed'
            : cls === 'cell-out' ? 'out of stock'
              : cls === 'cell-in' ? 'in stock' : 'no stock signal'
        }</>
      ))}
      onLeave={tip.hide}
    /></span>
  ),
  listed: ({ P, i }) => <div className="num tiny" style={{ textAlign: 'right' }}>{P.nListed[i]}</div>,
  oos: ({ P, i }) => (
    <div className="num tiny" style={{ textAlign: 'right', color: P.nOos[i] ? 'var(--out)' : 'var(--ink-4)' }}>
      {P.nOos[i] || '—'}
    </div>
  ),
  band: ({ P, D, i }) => {
    const band = D.band[P.band[i]];
    return (
      <div className="tiny trunc">
        {band !== 'none' && <Tag tone={P.nOos[i] >= 3 ? 'out' : 'plain'}>{band}</Tag>}
      </div>
    );
  },
  price: ({ P, i }) => (
    <div className="num tiny" style={{ textAlign: 'right' }}>
      {kes(P.priceMed[i])}
    </div>
  ),
  conf: ({ P, i }) => {
    const c = P.matchConf[i];
    return (
      <div className="num tiny" style={{
        textAlign: 'right',
        color: c >= 0.8 ? 'var(--ink-2)' : c >= 0.55 ? 'var(--warn)' : 'var(--out)',
      }}>{c.toFixed(2)}</div>
    );
  },
};

function Row({ store, i, template, columns, active, onSelect, onMove, tip }) {
  const { P, D } = store;
  return (
    <button
      type="button"
      aria-label={`${P.name[i]}; ${popcount(P.inMask[i])} sources report in stock; ${popcount(P.oosMask[i])} out of ${P.nEligible[i]} reporting sources out of stock; median ${kes(P.priceMed[i])}`}
      data-product-index={i}
      onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); onMove(event.key === 'ArrowDown' ? 1 : -1); } }}
      onClick={onSelect}
      className="catalogue-row"
      data-active={active}
      style={{ gridTemplateColumns: template }}
    >
      {columns.map((c) => {
        const Cell = CELL[c.key];
        return Cell ? <Cell key={c.key} store={store} P={P} D={D} i={i} tip={tip} /> : null;
      })}
    </button>
  );
}

/* --------------------------------------------------------------- detail - */

function Detail({ store, i, onClose, onPick, tip }) {
  const { P, D } = store;

  // Same molecule, ranked by how many sources actually have it. Capped: a long
  // list of near-identical SKUs is noise, and the top few answer the question.
  const substitutes = useMemo(() => {
    const a = P.ingredient[i];
    if (a < 0) return [];
    return (store.byIngredient?.get(a) ?? [])
      .filter((j) => j !== i)
      .sort((x, y) => P.nIn[y] - P.nIn[x] || P.nListed[y] - P.nListed[x])
      .slice(0, 6);
  }, [store, P, i]);
  const [listings, setListings] = useState(() => (store.listings ? listingsFor(store, i) : null));
  const [loading, setLoading] = useState(!store.listings);
  const [listingError, setListingError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Listing detail is fetched lazily, so the drawer resolves it on open and
  // falls back to fetching if the background load has not landed yet.
  useEffect(() => {
    let alive = true;
    if (store.listings) {
      setListings(listingsFor(store, i));
      setLoading(false);
      return () => { alive = false; };
    }
    setLoading(true);
    setListingError(false);
    loadListings(store)
      .then(() => { if (alive) { setListings(listingsFor(store, i)); setLoading(false); } })
      .catch(() => { if (alive) { setLoading(false); setListingError(true); } });
    return () => { alive = false; };
  }, [store, i, attempt]);

  const band = D.band[P.band[i]];

  return (
    <Modal className="drawer" labelledBy="product-title" onClose={onClose}>
        <header className="drawer-head">
          <div className="row">
            <span className="eyebrow">Resolved product</span>
            <button className="btn btn-icon btn-sm btn-ghost spacer" onClick={onClose} aria-label="Close">
              <Icon name="x" size={14} />
            </button>
          </div>
          <h2 className="h2 drawer-title" id="product-title">{P.name[i]}</h2>
          <div className="row wrap drawer-tags">
            <Tag tone={P.clinical[i] ? 'accent' : 'plain'}>{D.type[P.type[i]].replace(/_/g, ' ')}</Tag>
            {band !== 'none' && <Tag tone={P.nOos[i] >= 3 ? 'out' : 'plain'}>{band}</Tag>}
            {D.review[P.review[i]] === 'needs_review' && <Tag tone="warn">needs review</Tag>}
            {P.contested[i] === 1 && <Tag tone="warn">contested class</Tag>}
          </div>
        </header>

        <div className="drawer-body">
          <p className="detail-caveat">Snapshot evidence · collection date inferred. Confirm current stock and price before visiting.</p>
          <div className="kpis">
            <div className="kpi">
              <div className="kpi-label">Pharmacies listing</div>
              <div className="kpi-value" style={{ fontSize: 'var(--text-lg)' }}>{P.nListed[i]}</div>
              <div className="kpi-note">of {store.shops.length} sources</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Report out of stock</div>
              <div className="kpi-value" style={{ fontSize: 'var(--text-lg)', color: P.nOos[i] ? 'var(--out)' : undefined }}>
                {popcount(P.oosMask[i])}
              </div>
              <div className="kpi-note">of {P.nEligible[i]} reporting</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Listed median price</div>
              <div className="kpi-value" style={{ fontSize: 'var(--text-lg)' }}>
                {kes(P.priceMed[i])}
              </div>
              <div className="kpi-note">
                {Number.isFinite(P.priceMin[i]) ? `${n0(P.priceMin[i])}–${n0(P.priceMax[i])}` : 'no price'}
              </div>
            </div>
          </div>

          <div className="drawer-section"><h3>Pharmacy listings &amp; prices</h3>
          <p className="reader-intro">Each row is a collected listing. “Stock not reported” means the source does not provide a usable stock signal.</p>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[0, 1, 2].map((k) => <div key={k} className="sk" style={{ height: 34 }} />)}
            </div>
          ) : listingError ? <div className="feedback" role="alert"><p>Source listings could not load. Check your connection and try again.</p><button className="btn" onClick={() => setAttempt(a => a + 1)}>Retry source listings</button></div> : (
            <ul className="source-observations" aria-label="Pharmacy listings and prices">
              {listings?.map((listing, key) => <li className="source-observation" key={key}>
                <div className="observation-identity"><h4>{listing.shop.name}</h4><span className="observation-name">{listing.rawName}</span></div>
                <div className="observation-evidence"><StateTag state={listing.state} /><span className="observation-price num">{kes(listing.price)}</span></div>
                {listing.url && /^https?:\/\//i.test(listing.url) && <a className="btn observation-link" href={listing.url} target="_blank" rel="noopener noreferrer" aria-label={`View listing at ${listing.shop.name}`}>View listing <Icon name="external" size={14} /></a>}
              </li>)}
            </ul>
          )}

          </div>

          <details className="drawer-section secondary-detail">
            <summary>Product identity &amp; matching details</summary>
            <dl className="kv">
            <dt>Match key</dt>
            <dd className="mono micro" style={{ wordBreak: 'break-all' }}>{P.key[i]}</dd>
            <dt>Match confidence</dt>
            <dd className="num">{P.matchConf[i].toFixed(3)} · {D.matchBand[P.matchBand[i]]}</dd>
            {P.matchFlags[i] >= 0 && (<><dt>Match notes</dt><dd className="tiny dim">{D.matchFlags[P.matchFlags[i]]}</dd></>)}
            {Number.isFinite(P.priceCv[i]) && (<><dt>Price spread</dt><dd className="num">cv {P.priceCv[i].toFixed(2)}</dd></>)}
            <dt>Dose form</dt>
            <dd>{P.form[i] >= 0 ? D.form[P.form[i]] : <span className="faint">not detected</span>}</dd>
            <dt>Pack</dt>
            <dd className="mono micro">{P.packSig[i] || <span className="faint">—</span>}</dd>
            <dt>Class confidence</dt>
            <dd className="num">{P.classConf[i].toFixed(2)}</dd>
              {P.gap[i] >= 0 && (<><dt>Classification gap</dt><dd><Tag tone="warn">{D.gap[P.gap[i]]}</Tag></dd></>)}
            </dl>
          </details>

          {substitutes.length > 0 && (
            <details className="drawer-section secondary-detail">
              <summary>Other products with this ingredient</summary>
              <table className="tbl">
                <tbody>
                  {substitutes.map((s) => (
                    <tr key={P.key[s]}>
                      <td style={{ paddingLeft: 0 }}>
                        <button className="table-action" onClick={() => onPick?.(s)}>{P.name[s]}</button>
                        <div className="trunc drawer-source-raw">
                          {popcount(P.inMask[s])} of {P.nListed[s]} sources report in stock
                        </div>
                      </td>
                      <td className="r" style={{ width: 86 }}>
                        {popcount(P.inMask[s]) > 0
                          ? <Tag tone="in">{popcount(P.inMask[s])} in stock</Tag>
                          : <Tag tone="out">no in-stock reports</Tag>}
                      </td>
                      <td className="num r" style={{ width: 62, fontSize: 'var(--text-xs)' }}>
                        {Number.isFinite(P.priceMed[s]) ? n0(P.priceMed[s]) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="tiny dim" style={{ marginTop: 10, lineHeight: 1.5 }}>
                These products share an active ingredient; their strength, form and pack may differ.
                Same molecule is not the same product — check strength and form before
                treating one as a substitute for another.
              </div>
            </details>
          )}

          {P.ingredient[i] >= 0 && (
            <div className="drawer-section">
              <h3>Drug register extract</h3>
              <dl className="kv">
                <dt>Active ingredient</dt>
                <dd>{D.ingredient[P.ingredient[i]]}</dd>
                {P.indications[i] >= 0 && (
                  <><dt>Indications</dt><dd>{D.indications[P.indications[i]]}</dd></>
                )}
                <dt>Therapeutic class</dt>
                <dd>{P.therapeutic[i] >= 0
                  ? D.therapeutic[P.therapeutic[i]]
                  : <span className="faint">not filed under a class upstream</span>}</dd>
              </dl>
            </div>
          )}
          {P.ingredient[i] >= 0 && <ClinicalReader key={D.ingredient[P.ingredient[i]]} ingredient={D.ingredient[P.ingredient[i]]} />}
          <p className="reader-intro">Stock and prices reflect collected listings. Confirm current availability and price with the pharmacy.</p>
        </div>
    </Modal>
  );
}
