import type { ReactNode } from "react";
import Modal from "./Modal";
import { Icon } from "./icons";
import { n0 } from "./ui.jsx";

export default function CatalogueFilterWorkspace({
  children,
  count,
  activeCount,
  onClose,
  onReset,
}: {
  children: ReactNode;
  count: number;
  activeCount: number;
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <Modal
      className="filter-dialog catalogue-filter-workspace"
      labelledBy="filter-title"
      onClose={onClose}
    >
      <header className="catalogue-filter-header">
        <div>
          <span>Catalogue filters</span>
          <h2 id="filter-title">Refine your search.</h2>
          <p>Choose product attributes, stock reports and price bounds.</p>
        </div>
        <button
          className="catalogue-modal-close"
          aria-label="Close filters"
          onClick={onClose}
        >
          <Icon name="x" size={20} />
        </button>
      </header>
      <div className="catalogue-filter-content">{children}</div>
      <footer className="filter-footer">
        <span>
          {activeCount} applied {activeCount === 1 ? "filter" : "filters"}
        </span>
        <button
          className="btn btn-ghost"
          onClick={onReset}
          disabled={!activeCount}
        >
          Reset
        </button>
        <button className="btn btn-primary" onClick={onClose}>
          Show {n0(count)} results
          <Icon name="right" size={16} />
        </button>
      </footer>
    </Modal>
  );
}
