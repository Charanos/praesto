import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { StockPattern } from "../lib/stock-patterns";
export type PatternPoint = {
  inStock: number;
  out: number;
  count: number;
  kind: StockPattern;
  names: string[];
};
const tones = {
  in: "var(--teal)",
  mixed: "var(--amber)",
  out: "var(--coral)",
  unknown: "var(--ink-3)",
};
const surfaces = {
  in: "var(--teal-soft)",
  mixed: "var(--amber-soft)",
  out: "var(--coral-soft)",
  unknown: "var(--surface-sunk)",
};
function PatternTip({
  active,
  payload,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as PatternPoint;
  return (
    <div className="stock-pattern-tip">
      <b>
        {row.count} {row.count === 1 ? "product" : "products"}
      </b>
      <span>
        {row.inStock} in-stock sources · {row.out} out-of-stock sources
      </span>
      {row.names.slice(0, 2).map((name) => (
        <span key={name}>{name}</span>
      ))}
    </div>
  );
}
function PatternMark({
  cx = 0,
  cy = 0,
  payload: row,
  selected,
  onSelect,
}: {
  cx?: number;
  cy?: number;
  payload?: PatternPoint;
  selected: string | null;
  onSelect: (inStock: number, out: number) => void;
}) {
  if (!row) return null;
  const diameter = Math.min(42, 22 + Math.sqrt(row.count) * 6);
  return (
    <foreignObject x={cx - 24} y={cy - 24} width={48} height={48}>
      <button
        type="button"
        aria-pressed={selected === `${row.inStock}:${row.out}`}
        aria-label={`${row.count} ${row.count === 1 ? "product" : "products"}: ${row.inStock} in-stock sources, ${row.out} out-of-stock sources`}
        onClick={() => onSelect(row.inStock, row.out)}
        className="stock-pattern-dot"
        style={{ color: tones[row.kind] }}
      >
        <span
          style={{
            width: diameter,
            height: diameter,
            background: surfaces[row.kind],
          }}
        >
          {row.count}
        </span>
      </button>
    </foreignObject>
  );
}
export default function CatalogueEvidenceMap({
  data,
  onSelect,
  selected,
}: {
  data: PatternPoint[];
  onSelect: (inStock: number, out: number) => void;
  selected: string | null;
}) {
  const maximum =
    Math.max(2, ...data.map((row) => Math.max(row.inStock, row.out))) + 1;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 20, right: 24, bottom: 6, left: 0 }}
        accessibilityLayer={false}
      >
        <CartesianGrid stroke="var(--line)" strokeDasharray="3 6" />
        <XAxis
          type="number"
          dataKey="inStock"
          name="In-stock sources"
          domain={[0, maximum]}
          padding={{ left: 30, right: 24 }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            fill: "var(--ink-3)",
          }}
        />
        <YAxis
          type="number"
          dataKey="out"
          name="Out-of-stock sources"
          domain={[0, maximum]}
          padding={{ top: 24, bottom: 28 }}
          allowDecimals={false}
          width={30}
          axisLine={false}
          tickLine={false}
          tick={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            fill: "var(--ink-3)",
          }}
        />
        <Tooltip content={<PatternTip />} cursor={false} />
        <Scatter
          data={data}
          isAnimationActive={false}
          shape={<PatternMark selected={selected} onSelect={onSelect} />}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
