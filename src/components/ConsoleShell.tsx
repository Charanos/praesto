import { Icon } from './ui.jsx';
export const destinations = [
  { id: 'overview', label: 'Overview', icon: 'pulse', context: 'The captured picture' },
  { id: 'catalogue', label: 'Catalogue', icon: 'grid', context: 'Find & compare' },
  { id: 'sources', label: 'Sources', icon: 'layers', context: 'Pharmacy coverage' },
  { id: 'quality', label: 'Data quality', icon: 'shield', context: 'Evidence & limitations' },
] as const;
type Snapshot = { id: string; date: string; inferred: boolean; contract: string; match: string };
const compactCount = (value: number) => value >= 10000 ? `${(value / 1000).toFixed(1)}k` : new Intl.NumberFormat('en-KE').format(value);

export function ConsoleSidebar({ view, onNavigate, productCount, sourceCount, snapshot }: {
  view: string; onNavigate: (view: string) => void; productCount: number; sourceCount: number; snapshot: Snapshot;
}) {
  return <nav className="rail console-sidebar" aria-label="Main navigation">
    <div className="console-brand"><span className="rail-mark" aria-hidden="true">KP</span><span className="console-brand-name">Kenya Pharmacy<small>Availability workspace</small></span></div>
    <div className="console-nav-heading"><span>Explore</span><span className="console-country">KE</span></div>
    <div className="console-navigation">
      {destinations.map(item => <button key={item.id} className="rail-item" aria-label={item.label} aria-current={view === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
        <Icon name={item.icon} size={17} className="console-nav-icon" /><span>{item.label}</span>
        {item.id === 'catalogue' && <span className="tail">{compactCount(productCount)}</span>}
        {item.id === 'sources' && <span className="tail">{sourceCount}</span>}
      </button>)}
    </div>
    <div className="console-sidebar-foot">
      <div className="console-snapshot-line"><span className="eyebrow">Snapshot</span><span className="mono">{snapshot.id}</span></div>
      <p>Collected listings.<br />Current stock needs confirmation.</p>
      <details><summary>Snapshot details <Icon name="down" size={12} className="" /></summary>
        <dl><dt>Collection date</dt><dd>{snapshot.date}{snapshot.inferred && ' · inferred'}</dd><dt>Contract</dt><dd>{snapshot.contract}</dd><dt>Matching</dt><dd>{snapshot.match}</dd></dl>
      </details>
      <button className="console-method-link" onClick={() => onNavigate('quality')}>How to read the evidence <Icon name="right" size={13} className="" /></button>
    </div>
  </nav>;
}

export function ConsoleTopbar({ view, query, onSearch, onExport, snapshot }: {
  view: string; query: string; onSearch: (query: string) => void; onExport: () => void; snapshot: Snapshot;
}) {
  const active = destinations.find(item => item.id === view);
  return <header className="topbar console-topbar">
    <div className="console-context"><span>Workspace</span><Icon name="right" size={12} className="" /><b>{active?.context || 'Design system'}</b></div>
    <div className="field global-search" data-search>
      <Icon name="search" size={16} className="" />
      <input value={query} onChange={event => onSearch(event.target.value)} aria-label="Search products and ingredients" placeholder="Search products or ingredients" />
      {query ? <button className="search-clear" aria-label="Clear search" onClick={() => onSearch('')}><Icon name="x" size={14} className="" /></button> : <kbd>/</kbd>}
    </div>
    <div className="header-actions">
      <span className="snapshot-label" title={snapshot.inferred ? 'Date inferred from source file timestamps; collection date unverified' : 'Source collection date'}><span>{snapshot.date}</span><small>{snapshot.inferred ? 'Collection date inferred' : 'Source collection date'}</small></span>
      <button className="btn console-export" onClick={onExport}><Icon name="download" size={15} className="" /><span>Export</span></button>
    </div>
  </header>;
}
