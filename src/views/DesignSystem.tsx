import { useState } from "react";
import Modal from "../components/Modal";
import { Icon, glyphs } from "../components/icons";
export default function DesignSystem() {
  const [open, setOpen] = useState(false);
  return (
    <div className="page">
      <div className="eyebrow">Development catalogue</div>
      <h1 className="h1">A system for reading evidence</h1>
      <p className="sub">
        One light palette. Clear states. Product identity before decoration.
      </p>
      <section className="section">
        <h2 className="section-title">Actions and fields</h2>
        <div className="design-samples">
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            Open dialog
          </button>
          <button className="btn">Secondary action</button>
          <button className="btn btn-ghost">Quiet action</button>
          <button className="btn" disabled>
            Unavailable
          </button>
        </div>
        <label className="field">
          Search example
          <input placeholder="Product or ingredient" />
        </label>
        <div className="design-samples">
          <label className="facet-opt">
            <input type="checkbox" defaultChecked />
            Selected facet
          </label>
          <label className="facet-opt">
            <input type="checkbox" />
            Unselected facet
          </label>
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Evidence and uncertainty</h2>
        <div className="design-samples">
          <span className="tag tag-in">in stock</span>
          <span className="tag tag-out">out of stock</span>
          <span className="tag tag-nosig">no signal</span>
          <span className="tag tag-warn">needs review</span>
        </div>
        <p className="notice">
          Inferred collection date · clinical revision date unknown.
        </p>
        <div className="feedback">
          <p>Example recovery state: source listings could not load.</p>
          <button className="btn">Retry source listings</button>
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Shared glyphs</h2>
        <p className="sub">
          Original geometry on a 24-unit grid. Icons clarify navigation and
          actions; labels carry meaning.
        </p>
        <div className="glyph-specimens">
          {Object.keys(glyphs).map((name) => (
            <div key={name}>
              <span className="glyph-specimen-icon">
                <Icon name={name} size={24} />
              </span>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">Reading hierarchy</h2>
        <p className="reader-text">
          Product names, source-level stock evidence and KES prices lead the
          page. Reference text uses a comfortable reading measure and preserves
          missing fields as unknown.
        </p>
      </section>
      {open && (
        <Modal
          className="drawer"
          labelledBy="sample-dialog-title"
          onClose={() => setOpen(false)}
        >
          <header className="drawer-head">
            <h2 id="sample-dialog-title">Product detail example</h2>
            <button className="btn" onClick={() => setOpen(false)}>
              Close dialog
            </button>
          </header>
          <div className="drawer-body">
            <p className="reader-text">
              Keyboard focus stays inside this dialog. Escape closes it and
              returns focus to its trigger.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
