/** Original 24-unit glyphs: shared optical margins, rounded joins and a 1.65 stroke. */
export const glyphs: Readonly<Record<string, readonly string[]>> = {
  overview: [
    "M6 3.5h12A2.5 2.5 0 0 1 20.5 6v12a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z",
    "M3.5 10h17M10 10v10.5M14 14h3M14 17h3",
  ],
  grid: [
    "M5.5 3.5h3A2 2 0 0 1 10.5 5.5v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM15.5 3.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM5.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2ZM15.5 13.5h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z",
  ],
  capsule: [
    "M9.4 4.6a5.7 5.7 0 0 1 8.1 8.1l-4.8 4.8a5.7 5.7 0 0 1-8.1-8.1Z",
    "m7.1 7.1 8.1 8.1",
  ],
  pharmacy: [
    "M4.5 20.5V8h15v12.5h-15ZM3 8l2-4.5h14L21 8",
    "M9.5 20.5v-6h5v6M12 9.6v3.4M10.3 11.3h3.4",
  ],
  scan: [
    "M8 3.5H6A2.5 2.5 0 0 0 3.5 6v2M16 3.5h2A2.5 2.5 0 0 1 20.5 6v2M20.5 16v2a2.5 2.5 0 0 1-2.5 2.5h-2M8 20.5H6A2.5 2.5 0 0 1 3.5 18v-2",
    "m7.5 12 3 3 6-6",
  ],
  pulse: ["M3 12h4l2.5-6 5 12L17 12h4"],
  shield: [
    "M12 3.5 20 7v5c0 4.4-3.2 7.1-8 8.5C7.2 19.1 4 16.4 4 12V7Z",
    "m8 12 2.7 2.7 5.3-5.4",
  ],
  layers: ["m12 3.5 9 5-9 5-9-5 9-5ZM4 13l8 4.5 8-4.5M4 17l8 4.5 8-4.5"],
  search: [
    "M17.7 10.5a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0ZM15.7 15.7l4.8 4.8",
  ],
  x: ["m6.5 6.5 11 11M17.5 6.5l-11 11"],
  down: ["m7 9.5 5 5 5-5"],
  up: ["m7 14.5 5-5 5 5"],
  right: ["m9.5 6.5 5.5 5.5-5.5 5.5"],
  left: ["m14.5 6.5-5.5 5.5 5.5 5.5"],
  filter: [
    "M4 6h7M16 6h4M4 12h2M11 12h9M4 18h9M18 18h2",
    "M16 6a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM11 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM18 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z",
  ],
  download: [
    "M12 3.5v11m-4-4 4 4 4-4",
    "M4.5 15v3a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3",
  ],
  alert: [
    "M10.3 4.8a2 2 0 0 1 3.4 0l7 12.2a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3Z",
    "M12 9v4.5M12 16.5v.2",
  ],
  info: [
    "M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
    "M12 11v5M12 7.8V8",
  ],
  link: [
    "m9 14 6-6M9.5 6l1.8-1.8a4.6 4.6 0 0 1 6.5 6.5L16 12.5M8 11.5l-1.8 1.8a4.6 4.6 0 0 0 6.5 6.5l1.8-1.8",
  ],
  external: [
    "M13.5 4.5h6v6m0-6-10 10M10 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-3",
  ],
  check: ["m5.5 12 4.5 4.5L18.5 8"],
  sort: ["M8 4.5v15m-3-3 3 3 3-3M16 19.5v-15m-3 3 3-3 3 3"],
  book: [
    "M12 6c-2-1.7-4.7-2-8-1v14c3.3-1 6-.7 8 1 2-1.7 4.7-2 8-1V5c-3.3-1-6-.7-8 1ZM12 6v14",
  ],
  flask: [
    "M9 3.5h6M10 3.5V10l-5 7.4A2 2 0 0 0 6.7 20.5h10.6a2 2 0 0 0 1.7-3.1L14 10V3.5M7.3 14h9.4",
  ],
  clock: ["M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0ZM12 7v5l3.5 2"],
  chart: ["M4 4v14a2 2 0 0 0 2 2h14M8 15V9M12 15V5M16 15v-3"],
  matrix: [
    "M5.5 3.5h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2ZM3.5 9h17M3.5 14.5h17M9 3.5v17M14.5 3.5v17",
  ],
  list: ["M8 6h12M8 12h12M8 18h12M4 6h.2M4 12h.2M4 18h.2"],
};
export function Icon({
  name,
  size = 16,
  className = "",
  label,
}: {
  name: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const paths = glyphs[name];
  if (!paths) return null;
  return (
    <svg
      className={`ico ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    >
      {paths.map((path, index) => (
        <path d={path} key={index} />
      ))}
    </svg>
  );
}
