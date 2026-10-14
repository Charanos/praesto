import type { CSSProperties } from "react";
import "./pharmacy-glyph.css";

/** Praesto source identifiers, not pharmacy logos or stock indicators. */
export const pharmacyGlyphs: Record<string, { motif: string; tone: string }> = {
  garnet: { motif: "gem", tone: "berry" },
  pharmily: { motif: "link", tone: "cobalt" },
  healthyu: { motif: "leaf", tone: "botanical" },
  medmarket: { motif: "market", tone: "teal" },
  goodlife: { motif: "spark", tone: "amber" },
  portal: { motif: "portal", tone: "cobalt" },
  tims: { motif: "seed", tone: "botanical" },
  kalonji: { motif: "bloom", tone: "berry" },
  rangechem: { motif: "flask", tone: "teal" },
  healthcart: { motif: "basket", tone: "coral" },
  hinata: { motif: "sun", tone: "amber" },
  transwide: { motif: "arrows", tone: "cobalt" },
  malibu: { motif: "wave", tone: "teal" },
  nilapharm: { motif: "drop", tone: "berry" },
  onestop: { motif: "target", tone: "coral" },
  pharmaplus: { motif: "plus", tone: "teal" },
  faiz: { motif: "arch", tone: "amber" },
  mydawa: { motif: "capsule", tone: "cobalt" },
};
const paths: Record<string, string> = {
  gem: "M7 5h10l4 6-9 10-9-10 4-6Z M3 11h18 M7 5l5 16 5-16",
  link: "M10 15l4-6 M9 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0 M15 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0",
  leaf: "M19 4C7 3 3 9 6 15c4 7 14 3 13-11Z M5 20l10-11 M9 16l-1-5 M12 13h5",
  market:
    "M4 10v10h16V10 M3 10l2-6h14l2 6 M3 10c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0 M9 20v-5h6v5",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  portal: "M5 20V9a7 7 0 0 1 14 0v11 M9 20V9a3 3 0 0 1 6 0v11 M3 20h18",
  seed: "M12 21V10 M12 15C5 15 3 9 4 5c6 0 9 4 8 10Z M12 11c0-5 4-8 8-8 1 5-2 10-8 8Z",
  bloom:
    "M12 9c-8-10-11 1-3 3-10 8 1 11 3 3 8 10 11-1 3-3 10-8-1-11-3-3Z M12 10v4 M10 12h4",
  flask:
    "M9 3h6 M10 3v7L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3 M7 15h10 M10 18h4",
  basket: "M3 10h18l-2 10H5L3 10Z M7 10l5-7 5 7 M9 14v3 M15 14v3",
  sun: "M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  arrows: "M3 7h17l-4-4 M21 17H4l4 4 M20 7l-4 4 M4 17l4-4",
  wave: "M3 9c3-5 6 5 9 0s6 5 9 0 M3 15c3-5 6 5 9 0s6 5 9 0",
  drop: "M12 3c-2 4-7 7-7 12a7 7 0 0 0 14 0c0-5-5-8-7-12Z M9 15c0 2 1 3 3 3",
  target:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z M12 10v4 M10 12h4",
  plus: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z",
  arch: "M4 20V10l8-7 8 7v10 M8 20v-7a4 4 0 0 1 8 0v7 M3 20h18",
  capsule: "m7 17 10-10 M5 9a6 6 0 0 0 10 10l4-4A6 6 0 0 0 9 5L5 9Z",
};
export default function PharmacyGlyph({
  id,
  size = 32,
}: {
  id: string;
  size?: number;
}) {
  const { motif, tone } = pharmacyGlyphs[id] || {
    motif: "plus",
    tone: "ink-3",
  };
  return (
    <span
      className="pharmacy-glyph"
      data-pharmacy={id}
      aria-hidden="true"
      style={
        {
          "--glyph-tone": `var(--${tone})`,
          "--glyph-size": `${size}px`,
        } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={paths[motif]} />
      </svg>
    </span>
  );
}
export function PharmacyStack({
  shops,
  limit = 3,
}: {
  shops: { pharmacy_id: string; name: string }[];
  limit?: number;
}) {
  const names = shops.map((s) => s.name).join(", ");
  return (
    <span
      className="pharmacy-stack"
      role="img"
      aria-label={`Listed at ${shops.length} sources: ${names}`}
      title={names}
    >
      {shops.slice(0, limit).map((s) => (
        <PharmacyGlyph key={s.pharmacy_id} id={s.pharmacy_id} size={28} />
      ))}
      {shops.length > limit && (
        <span className="pharmacy-stack-more" aria-hidden="true">
          +{shops.length - limit}
        </span>
      )}
      {shops.length <= limit && (
        <span className="pharmacy-stack-count num" aria-hidden="true">
          {shops.length}
        </span>
      )}
    </span>
  );
}
