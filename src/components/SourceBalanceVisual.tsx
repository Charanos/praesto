import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { n0 } from "./ui.jsx";
export type SourceBalanceDatum = { name: string; inStock: number; out: number };
function BalanceTip({
  active,
  payload,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as SourceBalanceDatum;
  return (
    <div className="brief-chart-tip">
      <b>{row.name}</b>
      <span>{n0(row.inStock)} in-stock product reports</span>
      <span>{n0(-row.out)} out-of-stock product reports</span>
    </div>
  );
}
export default function SourceBalanceVisual({
  data,
}: {
  data: SourceBalanceDatum[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        stackOffset="sign"
        accessibilityLayer
        margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--line)"
          strokeDasharray="3 5"
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            fill: "var(--ink-3)",
          }}
          tickFormatter={(value) =>
            Math.abs(value) >= 1000
              ? `${Math.abs(value) / 1000}k`
              : String(Math.abs(value))
          }
        />
        <YAxis
          dataKey="name"
          type="category"
          width={118}
          interval={0}
          tickLine={false}
          axisLine={false}
          tick={{
            fontFamily: "var(--sans)",
            fontSize: 13,
            fill: "var(--ink-2)",
          }}
        />
        <Tooltip content={<BalanceTip />} cursor={false} />
        <Bar
          dataKey="out"
          name="Out-of-stock reports"
          stackId="reports"
          fill="var(--coral)"
          maxBarSize={15}
          radius={[4, 0, 0, 4]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="inStock"
          name="In-stock reports"
          stackId="reports"
          fill="var(--teal)"
          maxBarSize={15}
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
