/**
 * Application shell.
 *
 * Filter state lives here and is mirrored into the URL, so any view of the
 * data is a link. That is not a nicety for an analyst tool -- it is how a
 * finding gets sent to someone else.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { buildCsv } from './lib/export.js';
import { loadStore } from './lib/store-loader.js';
import { encodeFilters, decodeFilters } from './lib/filters.js';
import { Icon, fmtDate } from './components/ui.jsx';
import Overview from './views/Overview.jsx';
import Catalogue from './views/Catalogue.jsx';
import Sources from './views/Sources.jsx';
import Quality from './views/Quality.jsx';
import './workspace.css';
import './console.css';
import './sections.css';
import { ConsoleSidebar, ConsoleTopbar, destinations as NAV } from './components/ConsoleShell.tsx';
import OfflineNotice from './components/OfflineNotice.tsx';
import WorkspaceIntro from './components/WorkspaceIntro';
const DesignSystem = import.meta.env.DEV ? lazy(() => import('./views/DesignSystem.tsx')) : null;
const DevAudit = import.meta.env.DEV ? lazy(() => import('./components/DevAudit.tsx')) : null;

function readUrl() {
  const p = new URLSearchParams(window.location.search);
  return { view: [...NAV.map(n => n.id), ...(import.meta.env.DEV ? ['design'] : [])].includes(p.get('v')) ? p.get('v') : 'overview', filters: decodeFilters(p), audit: import.meta.env.DEV && p.has('audit') };
}

export default function App() {
  const [store, setStore] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ stage: 'meta', progress: 0 });

  const initial = useMemo(readUrl, []);
  const [view, setView] = useState(initial.view);
  const [filters, setFilters] = useState(initial.filters);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    loadStore((s) => { if(alive){setProgress(s);if(s.meta)setLoadingMeta(s.meta);} },controller.signal)
      .then((s) => {
        if (!alive) return;
        setStore(s);

      })
      .catch((e) => alive && setError(e));
    return () => { alive = false; controller.abort(); };
  }, []);

  // Mirror view and filters into the URL without stacking history entries.
  useEffect(() => {
    const p = encodeFilters(filters);
    if (view !== 'overview') p.set('v', view);
    if (import.meta.env.DEV && initial.audit) p.set('audit', '1');
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [filters, view]);

  useEffect(() => {
    const onPop = () => { const u = readUrl(); setView(u.view); setFilters(u.filters); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // "/" focuses search from anywhere, as in every serious data tool.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.isComposing && !/input|textarea|select/i.test(e.target.tagName) && !e.target.isContentEditable && !document.querySelector('dialog[open]')) {
        e.preventDefault();
        setView('catalogue');
        requestAnimationFrame(() => document.querySelector('[data-search] input')?.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { document.title = `${NAV.find(n => n.id === view)?.label || 'Design system'} · Kenya Pharmacy Availability`; }, [view]);

  const navigate = useCallback((v) => setView(v), []);

  if (error) {
    const inconsistent = /Read-model (size|identity) mismatch/.test(error.message);
    return (
      <div className="empty" style={{ height: '100vh' }}>
        <Icon name="alert" size={22} />
        <div className="h2">{inconsistent ? 'This snapshot could not be verified' : 'The catalogue could not load'}</div>
        <p className="sub">{inconsistent ? 'Reload to get a consistent set of catalogue data.' : 'Check your connection, then try again.'}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry loading</button>
      </div>
    );
  }

  const meta = store?.meta ?? loadingMeta;
  const snapshotDate = meta ? fmtDate(meta.headline.snapshot_at, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Loading snapshot…';
  const snapshot = { id: meta?.run.snapshot_id ?? 'Loading…', date: snapshotDate, inferred: meta?.run.snapshot_at_inferred ?? false, contract: meta?.contract_version ?? '—', match: meta?.run.match_algo_version ?? '—', loading:!meta };

  return (
    <div className="app" data-ready={!!store}>
      <a className="skip-link" href="#workspace">Skip to workspace</a>
      <ConsoleSidebar view={view} onNavigate={navigate} productCount={meta?.headline.products ?? null} sourceCount={meta?.headline.pharmacies ?? null} snapshot={snapshot} />

      <main className="main" id="workspace" tabIndex={-1}>
        <OfflineNotice />
        <ConsoleTopbar view={view} query={filters.q} onSearch={(query) => { setFilters({ ...filters, q: query }); setView('catalogue'); }} onExport={() => store && exportCsv(store, filters)} exportReady={!!store} snapshot={snapshot} />

        {view === 'catalogue' ? (
          <div className="catalogue-workspace"><WorkspaceIntro view={view} />{store ? <Catalogue store={store} filters={filters} setFilters={setFilters} /> : <Loading progress={progress} />}</div>
        ) : (
          <div className="scroll">
            <WorkspaceIntro view={view} />
            {!store && <Loading progress={progress} />}
            {store && view === 'overview' && <Overview store={store} onNavigate={navigate} setFilters={setFilters} />}
            {store && view === 'sources' && <Sources store={store} onNavigate={navigate} setFilters={setFilters} />}
            {store && view === 'quality' && <Quality store={store} onNavigate={navigate} setFilters={setFilters} />}
            {view === 'design' && DesignSystem && <Suspense fallback={<p>Loading component catalogue…</p>}><DesignSystem /></Suspense>}
            {store && <footer className="workspace-foot">Stock and prices reflect collected pharmacy listings. Confirm current availability and price with the pharmacy. <a href="/about.html" className="table-action">Data notes</a></footer>}
          </div>
        )}
      </main>
      {DevAudit && new URLSearchParams(location.search).has('audit') && <Suspense fallback={null}><DevAudit /></Suspense>}
    </div>
  );
}

/* ------------------------------------------------------------- loading -- */

function Loading({ progress }) {
  const pct = Math.round(progress.progress * 100);
  return (
    <div className="empty app-loading" role="status" aria-live="polite">
      <p>Preparing catalogue data…</p>
      <div role="progressbar" aria-label="Loading catalogue" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ width: 200, height: 2, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${Math.max(6, pct)}%`, background: 'var(--accent)',
          transition: 'width .2s ease',
        }} />
      </div>
      <div className="micro faint mono">
        {progress.stage === 'meta' ? 'reading snapshot…' : `products ${pct}%`}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- export -- */

/** Exports exactly what is on screen, filters included, as CSV. */
function exportCsv(store, filters) {
    const result = buildCsv(store, filters);
    const blob = new Blob([result.text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kenya-pharmacy-${store.meta.run.snapshot_id}-${result.count}-products.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
}
