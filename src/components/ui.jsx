/** Shared primitives. Every one of these is a token consumer, never a colour. */

import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons.tsx';
export { Icon };

export const nf = new Intl.NumberFormat('en-KE');
export const n0 = (v) => (v == null || Number.isNaN(v) ? '—' : nf.format(Math.round(v)));
export const n1 = (v) => (v == null || Number.isNaN(v) ? '—' : v.toFixed(1));
export const kes = (v) => (v == null || Number.isNaN(v) ? '—' : `KES ${nf.format(Math.round(v))}`);

/**
 * Never render the string "Invalid Date".
 *
 * The payload's timestamp comes from a DuckDB TIMESTAMP that has to survive a
 * JSON round trip; a stale or half-built export can leave it unparseable, and
 * a dash is an honest way to say "unknown" where a broken date string is not.
 */
export const fmtDate = (v, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', opts);
};

/** 43.6K rather than 43,606 where the exact figure is not the point. */
export const compact = (v) => {
  if (v == null || Number.isNaN(v)) return '—';
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (Math.abs(v) >= 1e4) return `${(v / 1e3).toFixed(1)}K`;
  return nf.format(Math.round(v));
};

/**
 * A titled region: label and heading sit ABOVE the card, the caption below it.
 *
 * Keeping the heading out of the container gives the page a readable rhythm —
 * label, object, annotation — rather than a stack of boxes each carrying its
 * own internal header rule. It also lets adjacent cards align on their content
 * rather than on whatever height their titles happened to take.
 */
export function Section({ title, eyebrow, actions, children, caption, flush, fill, style, className = '' }) {
  return (
    <section className={`section${fill ? ' section-grow' : ''} ${className}`} style={style}>
      {(title || actions) && (
        <header className="section-head">
          <div className="titles">
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            {title && <h2 className="section-title">{title}</h2>}
          </div>
          {actions && <div className="section-actions">{actions}</div>}
        </header>
      )}
      <div className={`card${flush ? ' card-flush' : ''}${fill ? ' card-fill' : ''}`}>{children}</div>
      {caption && <div className="caption">{caption}</div>}
    </section>
  );
}

/**
 * A figure with its denominator, caveat and provenance attached.
 * A KPI without those is decoration, so the note is not optional here.
 */
export function Kpi({ label, value, unit, note, tone }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: tone }}>
        {value}{unit && <sup>{unit}</sup>}
      </div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}

export function Tag({ tone = 'plain', children }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

export function Chip({ active, onClick, onClear, children }) {
  return (
    <span className={`chip${active ? ' chip-active' : ''}`}>
      <span className="chip-label">{onClick ? <button onClick={onClick}>{children}</button> : children}</span>
      {onClear && (
        <button onClick={onClear} aria-label={`Remove ${children} filter`}>
          <Icon name="x" size={11} />
        </button>
      )}
    </span>
  );
}

/** Stock state is the one place colour is allowed to mean something. */
export function StateTag({ state }) {
  if (state === 'in_stock') return <Tag tone="in">in stock</Tag>;
  if (state === 'out_of_stock') return <Tag tone="out">out of stock</Tag>;
  return <Tag tone="nosig">stock not reported</Tag>;
}

/** Per-source availability barcode, straight from the bitmasks. */
export function Strip({ store, listedMask, inMask, oosMask, onHover, onLeave }) {
  return (
    <span className="strip">
      {store.shops.map((s) => {
        const bit = 1 << s.bit;
        const cls = !(listedMask & bit) ? 'cell-none'
          : (oosMask & bit) ? 'cell-out'
            : (inMask & bit) ? 'cell-in' : 'cell-nosig';
        return (
          <i key={s.pharmacy_id} className={cls}
            onMouseMove={onHover ? (e) => onHover(e, s, cls) : undefined}
            onMouseLeave={onLeave}
          />
        );
      })}
    </span>
  );
}

export function Empty({ title, note, action }) {
  return (
    <div className="empty">
      <Icon name="search" size={20} />
      <div className="h3">{title}</div>
      {note && <div className="tiny dim" style={{ maxWidth: 320 }}>{note}</div>}
      {action}
    </div>
  );
}

/** Collapsible facet with its own count. */
export function Facet({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="facet">
      <button className="facet-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name={open ? 'down' : 'right'} size={11} />
        {title}
        {count != null && <span className="count">{count}</span>}
      </button>
      {open && <div className="facet-body">{children}</div>}
    </div>
  );
}

export function Check({ on, onChange, label, ariaLabel, n }) {
  return (
    <label className="facet-opt" data-on={on}>
      <input type="checkbox" checked={on} onChange={onChange} aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        style={{
          width: 16, height: 16, flexShrink: 0,
          border: `1px solid ${on ? 'var(--accent)' : 'var(--line-strong)'}`,
          background: on ? 'var(--accent)' : 'var(--surface)',
          borderRadius: 2, position: 'relative', cursor: 'pointer',
        }}
      />
      <span className="trunc">{label}</span>
      {n != null && <span className="n">{compact(n)}</span>}
    </label>
  );
}

/** Numeric min/max pair. Empty means unbounded, not zero. */
export function RangePair({ min, max, onMin, onMax, placeholderMin = 'min', placeholderMax = 'max', label = 'value' }) {
  return (
    <div className="range">
      <div className="field" style={{ height: 26 }}>
        <input type="number" value={min ?? ''} aria-label={`Minimum ${label}`} placeholder={placeholderMin}
          onChange={(e) => onMin(e.target.value === '' ? null : Number(e.target.value))} />
      </div>
      <span className="faint tiny">–</span>
      <div className="field" style={{ height: 26 }}>
        <input type="number" value={max ?? ''} aria-label={`Maximum ${label}`} placeholder={placeholderMax}
          onChange={(e) => onMax(e.target.value === '' ? null : Number(e.target.value))} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ helpers --- */

/** Closes on outside click and on Escape. */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

/**
 * Windowed list. 43,606 rows cannot all be in the DOM, and pagination hides
 * the shape of the data -- scrolling a continuous list is how you feel that a
 * filter matched 12 things or 12,000.
 */
export function useVirtual({ count, rowHeight, viewportRef, offsetRef, overscan = 12 }) {
  const [range, setRange] = useState({ start: 0, end: 40 });
  // Tracking the node in state, not just in a ref, is what makes this survive
  // a view switch. A ref does not re-run the effect when the element it points
  // at is replaced, so after Grid -> Matrix -> Grid the scroll listener stayed
  // bound to the unmounted node and the window never advanced: the grid
  // scrolled 1.4 million pixels while rendering the same 24 rows.
  const [node, setNode] = useState(null);
  useEffect(() => {
    setNode(viewportRef.current);
  });

  useEffect(() => {
    const el = node;
    if (!el) return undefined;
    let frame = 0;
    const recalc = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const offset = offsetRef?.current?.offsetHeight ?? 0;
        const start = Math.max(0, Math.floor(Math.max(0, el.scrollTop - offset) / rowHeight) - overscan);
        const visible = Math.ceil(el.clientHeight / rowHeight) + overscan * 2;
        setRange({ start, end: Math.min(count, start + visible) });
      });
    };
    recalc();
    el.addEventListener('scroll', recalc, { passive: true });
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    if (offsetRef?.current) ro.observe(offsetRef.current);
    return () => { el.removeEventListener('scroll', recalc); ro.disconnect(); cancelAnimationFrame(frame); };
  }, [count, rowHeight, overscan, node, offsetRef]);

  // Never hand back a window past the end of the current result set: a filter
  // that shrinks the rows under a scrolled viewport would otherwise slice past
  // the array and render nothing.
  return {
    start: Math.min(range.start, Math.max(0, count - 1)),
    end: Math.max(Math.min(range.start, Math.max(0, count - 1)) + 1, Math.min(range.end, count)),
  };
}
