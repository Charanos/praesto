import "./evidence-controls.css";
import type { ReactNode } from "react";

/** Non-interactive evidence label; status meaning always includes text. */
export function EvidenceBadge({
  tone = "neutral",
  children,
}: {
  tone?: string;
  children: ReactNode;
}) {
  return (
    <span className="evidence-badge" data-tone={tone}>
      {children}
    </span>
  );
}

/** A single-choice pill group; counts remain part of each accessible label. */
export function PillToggle({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; count?: ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="pill-toggle" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
          {option.count != null && (
            <span className="pill-toggle-count num">{option.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
