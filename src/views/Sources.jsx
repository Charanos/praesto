/** Sources: an actionable directory, with stock evidence separate from capture size. */
import { useMemo } from 'react';
import { runFilter, sourceBreakdown, EMPTY } from '../lib/filters.js';
import { Section, Icon, n0, n1 } from '../components/ui.jsx';
import { useTip, SourceBars } from '../components/charts.jsx';
import SourceDirectory from '../components/SourceDirectory';

export default function Sources({ store, onNavigate, setFilters }) {
  const { meta } = store;
  const tip = useTip();
  const all = useMemo(() => store.allRows ?? runFilter(store, EMPTY, { key: 'oos', dir: 'desc' }).rows, [store]);
  const breakdown = useMemo(() => store.allSources ?? sourceBreakdown(store, all), [store, all]);
  const present = store.shops;
  const absent = store.absent;
  const reporting = present.filter(source => source.publishes_oos);
  const sorted = [...present].sort((a,b)=>b.listings-a.listings);
  const top3 = 100 * sorted.slice(0,3).reduce((sum,source)=>sum+source.listings,0) / Math.max(1,meta.headline.listings);
  const browse = source => { setFilters({...EMPTY,shopsAny:[source.bit]});onNavigate('catalogue'); };
  return <div className="page sources-page section-pass">
    {tip.node}
    <section className="sources-status-strip" aria-label="Source reporting summary">
      <div><span>Captured</span><b className="num">{present.length}</b><small>pharmacy catalogues</small></div>
      <div><span>Reporting stock</span><b className="num">{reporting.length}</b><small>used in the stock rate</small></div>
      <div><span>Listings only</span><b className="num">{present.length-reporting.length}</b><small>stock stays unknown</small></div>
      <div><span>Absent</span><b className="num">{absent.length}</b><small>not captured this time</small></div>
    </section>
    <SourceDirectory sources={present} onBrowse={browse} />
    <div className="source-analysis-layout">
      <Section className="sources-availability" eyebrow="Resolved product comparison" title="Availability by source" caption="Bars count resolved products: solid for in-stock reports, full length for products listed. A product can have several captured listings. Hatched sources have no usable stock signal."><SourceBars rows={breakdown} tip={tip} onPick={bit=>browse(present.find(source=>source.bit===bit))} /></Section>
      <aside className="source-reading-notes" aria-label="How to compare sources"><span className="section-glyph" data-tone="cobalt"><Icon name="layers" size={21} /></span><h2>Coverage shapes the picture.</h2><p>The three largest catalogues account for <b className="mono">{n1(top3)}%</b> of all captured listings. Larger catalogues carry more weight in the combined availability rate.</p><dl><dt>Total captured listings</dt><dd className="mono">{n0(meta.headline.listings)}</dd><dt>Listings with no stock signal</dt><dd className="mono">{n0(meta.headline.not_published)}</dd></dl><p>These listings remain searchable. They are excluded from stock calculations rather than treated as available.</p><button className="table-action" onClick={()=>onNavigate('quality')}>Understand the data limits <Icon name="right" size={14} /></button></aside>
    </div>
    {absent.length>0 && <Section className="sources-absent" eyebrow="Coverage gaps" title="Absent from this snapshot" caption="These pharmacies remain visible in the panel so missing captures do not silently change its scope."><div className="sources-absent-list">{absent.map(source=><div key={source.pharmacy_id} className="sources-absent-row"><Icon name="alert" size={16} className="dim" /><span>{source.name}</span><span className="dim">{source.absent_reason}</span></div>)}</div></Section>}
  </div>;
}
