import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { useSmallScreen } from "./useSmallScreen";
export const destinations = [
  {
    id: "overview",
    label: "Overview",
    icon: "overview",
    context: "The captured picture",
  },
  {
    id: "catalogue",
    label: "Catalogue",
    icon: "capsule",
    context: "Find & compare",
  },
  {
    id: "sources",
    label: "Sources",
    icon: "pharmacy",
    context: "Pharmacy coverage",
  },
  {
    id: "quality",
    label: "Data quality",
    icon: "scan",
    context: "Evidence & limitations",
  },
] as const;
type Snapshot = {
  id: string;
  date: string;
  inferred: boolean;
  contract: string;
  match: string;
  loading?: boolean;
};
const compactCount = (value: number | null) =>
  value == null
    ? "—"
    : value >= 10000
      ? `${(value / 1000).toFixed(1)}k`
      : new Intl.NumberFormat("en-KE").format(value);

export function ConsoleSidebar({
  view,
  onNavigate,
  productCount,
  sourceCount,
  snapshot,
}: {
  view: string;
  onNavigate: (view: string) => void;
  productCount: number | null;
  sourceCount: number | null;
  snapshot: Snapshot;
}) {
  const mobile = useSmallScreen();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mobile || !open) return;
    const frame = requestAnimationFrame(() =>
      menu.current
        ?.querySelector<HTMLButtonElement>('[aria-current="page"]')
        ?.focus(),
    );
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [mobile, open]);
  const navigate = (destination: string) => {
    onNavigate(destination);
    setOpen(false);
    if (mobile) trigger.current?.focus();
  };
  return (
    <nav
      ref={root}
      className="rail console-sidebar"
      aria-label="Main navigation"
      data-open={open}
      onBlurCapture={(event) => {
        if (
          mobile &&
          open &&
          event.relatedTarget instanceof Node &&
          !root.current?.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <div className="console-brand">
        <span className="rail-mark" aria-hidden="true">
          KP
        </span>
        <span className="console-brand-name">
          Kenya Pharmacy<small>Availability workspace</small>
        </span>
      </div>
      <div className="console-nav-heading">
        <span>Explore</span>
        <span className="console-country">KE</span>
      </div>
      <div
        className="console-navigation"
        id="workspace-destinations"
        ref={menu}
        hidden={mobile && !open}
        onKeyDown={(event) => {
          if (
            !mobile ||
            !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
          )
            return;
          const buttons = [
            ...(menu.current?.querySelectorAll<HTMLButtonElement>("button") ||
              []),
          ];
          const index = buttons.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? buttons.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          event.preventDefault();
          buttons[next]?.focus();
        }}
      >
        {destinations.map((item) => (
          <button
            key={item.id}
            className="rail-item"
            aria-label={item.label}
            aria-current={view === item.id ? "page" : undefined}
            onClick={() => navigate(item.id)}
          >
            <span className="console-nav-symbol">
              <Icon name={item.icon} size={18} className="console-nav-icon" />
            </span>
            <span>{item.label}</span>
            {item.id === "catalogue" && (
              <span className="tail">{compactCount(productCount)}</span>
            )}
            {item.id === "sources" && (
              <span className="tail">{sourceCount}</span>
            )}
          </button>
        ))}
      </div>
      <button
        ref={trigger}
        className="mobile-nav-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="workspace-destinations"
        aria-label={open ? "Close workspace menu" : "Open workspace menu"}
        onClick={() => setOpen(!open)}
      >
        <Icon name={open ? "x" : "grid"} size={23} />
      </button>
      <div className="console-sidebar-foot">
        <div className="console-snapshot-line">
          <span className="eyebrow">Snapshot</span>
          <span className="mono">{snapshot.id}</span>
        </div>
        <p>
          Collected listings.
          <br />
          Current stock needs confirmation.
        </p>
        <details>
          <summary>
            Snapshot details <Icon name="down" size={12} className="" />
          </summary>
          <dl>
            <dt>Collection date</dt>
            <dd>
              {snapshot.date}
              {snapshot.inferred && " · inferred"}
            </dd>
            <dt>Contract</dt>
            <dd>{snapshot.contract}</dd>
            <dt>Matching</dt>
            <dd>{snapshot.match}</dd>
          </dl>
        </details>
        <button
          className="console-method-link"
          onClick={() => onNavigate("quality")}
        >
          How to read the evidence <Icon name="right" size={13} className="" />
        </button>
      </div>
    </nav>
  );
}

export function ConsoleTopbar({
  view,
  query,
  onSearch,
  onExport,
  exportReady = true,
  snapshot,
}: {
  view: string;
  query: string;
  onSearch: (query: string) => void;
  onExport: () => void;
  exportReady?: boolean;
  snapshot: Snapshot;
}) {
  const active = destinations.find((item) => item.id === view);
  return (
    <header className="topbar console-topbar">
      <div className="console-context">
        <span>Workspace</span>
        <Icon name="right" size={12} className="" />
        <b>{active?.context || "Design system"}</b>
      </div>
      <div className="field global-search" data-search>
        <Icon name="search" size={16} className="" />
        <input
          value={query}
          onChange={(event) => onSearch(event.target.value)}
          aria-label="Search products and ingredients"
          placeholder="Search products or ingredients"
        />
        {query ? (
          <button
            className="search-clear"
            aria-label="Clear search"
            onClick={() => onSearch("")}
          >
            <Icon name="x" size={14} className="" />
          </button>
        ) : (
          <kbd>/</kbd>
        )}
      </div>
      <div className="header-actions">
        <span
          className="snapshot-label"
          title={
            snapshot.inferred
              ? "Date inferred from source file timestamps; collection date unverified"
              : "Source collection date"
          }
        >
          <span>{snapshot.date}</span>
          <small>
            {snapshot.loading
              ? "Preparing data files"
              : snapshot.inferred
                ? "Collection date inferred"
                : "Source collection date"}
          </small>
        </span>
        <button
          className="btn console-export"
          onClick={onExport}
          disabled={!exportReady}
        >
          <Icon name="download" size={15} className="" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
