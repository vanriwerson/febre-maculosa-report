import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { Locality } from "../types";

interface NeighborhoodChartProps {
  items: Locality[];
}

export default function NeighborhoodChart({ items }: NeighborhoodChartProps) {
  const chartData = items.map((item) => ({
    name: item.chartLabel,
    value: item.total,
    color: item.color,
    percentage: item.percentage,
  }));

  return (
    <div
      className="chart-panel"
      aria-label="Distribuição de notificações por bairro"
    >
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="82%"
              paddingAngle={0}
              stroke="none"
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [`${value} notificações`, "Total"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="chart-legend">
        {items.map((item) => (
          <li key={item.chartLabel}>
            <span
              className="legend-swatch"
              style={{ backgroundColor: item.color }}
            />

            <span>
              <strong>{item.chartLabel}:</strong> {item.total} notificações (
              {item.percentage})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
