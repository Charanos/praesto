import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  BarChart,
  Bar,
  Tooltip,
  Treemap,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { TreemapNode, TooltipContentProps } from "recharts";
import type {
  OverviewChartDatum,
  OverviewChartProps,
} from "../lib/overview-types";
import { n0 } from "./ui.jsx";
const axis = { fontFamily: "var(--sans)", fontSize: 13, fill: "var(--ink-3)" };
function CategoryTile({
  depth,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  data,
}: Partial<TreemapNode> & { data: OverviewChartDatum[] }) {
  if (depth !== 1) return null;
  const item = data[index];
  if (!item) return null;
  const labelFits =
    width > Math.max(105, item.label.length * 7 + 28) && height > 65;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={7} fill={item.fill} />
      {labelFits && (
        <>
          <text
            x={x + 14}
            y={y + 27}
            fill="var(--text-on-inverse)"
            fontFamily="var(--sans)"
            fontSize={14}
          >
            {item.label}
          </text>
          <text
            x={x + 14}
            y={y + 51}
            fill="var(--text-on-inverse)"
            fontFamily="var(--mono)"
            fontSize={16}
          >
            {n0(item.count)}
          </text>
        </>
      )}
    </g>
  );
}
function ChartTip({
  active,
  payload,
}: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const row: unknown = payload[0].payload;
  if (
    !row ||
    typeof row !== "object" ||
    !("label" in row) ||
    !("count" in row) ||
    typeof row.label !== "string" ||
    typeof row.count !== "number"
  )
    return null;
  return (
    <div className="brief-chart-tip">
      <b>{row.label}</b>
      <span>{n0(row.count)} products</span>
    </div>
  );
}
/** Charts supplement exact visible values; no fact depends on hover. */
export default function OverviewVisuals({
  kind,
  data,
}: Pick<OverviewChartProps, "kind" | "data">) {
  if (kind === "composition")
    return (
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="count"
          nameKey="label"
          nodeGap={4}
          nodeInset={0}
          isAnimationActive={false}
          isUpdateAnimationActive={false}
          content={<CategoryTile data={data} />}
        />
      </ResponsiveContainer>
    );
  if (kind === "coverage-ring" || kind === "availability-ring")
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={kind === "availability-ring" ? "80%" : "67%"}
            outerRadius="94%"
            startAngle={90}
            endAngle={-270}
            stroke={
              kind === "availability-ring" ? "var(--surface-inverse)" : "none"
            }
            strokeWidth={kind === "availability-ring" ? 3 : 0}
            cornerRadius={kind === "availability-ring" ? 2 : 0}
            isAnimationActive={false}
          >
            {data.map((item) => (
              <Cell key={item.label} fill={item.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ top: 8, left: 0, right: 58, bottom: 0 }}
      >
        <CartesianGrid
          horizontal={false}
          stroke="var(--line)"
          strokeDasharray="3 5"
        />
        <XAxis
          type="number"
          tick={axis}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={80}
          tick={axis}
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<ChartTip />} cursor={false} />
        <Bar
          dataKey="count"
          fill="var(--berry)"
          radius={[0, 4, 4, 0]}
          maxBarSize={18}
          isAnimationActive={false}
          background={{ fill: "var(--surface)", radius: 4 }}
        >
          <LabelList
            dataKey="count"
            position="right"
            formatter={n0}
            fill="var(--ink-2)"
            fontSize={13}
            fontFamily="var(--mono)"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
