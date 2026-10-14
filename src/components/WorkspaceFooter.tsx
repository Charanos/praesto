import "./workspace-footer.css";
import { Icon } from "./ui.jsx";
export default function WorkspaceFooter() {
  return (
    <footer className="workspace-footer">
      <div className="workspace-footer-evidence">
        <p>
          Stock and prices reflect collected pharmacy listings. Confirm current
          availability and price with the pharmacy.
        </p>
        <a href="/about.html">Data notes</a>
      </div>
      <div className="workspace-footer-credit">
        <p>
          © {new Date().getFullYear()} Praesto.{" "}
          <span>All rights reserved.</span>
        </p>
        <a
          href="https://www.andishi.dev/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="By Andishi, opens in a new tab"
        >
          <span>By</span>
          <strong>Andishi</strong>
          <Icon name="external" size={13} />
        </a>
      </div>
    </footer>
  );
}
