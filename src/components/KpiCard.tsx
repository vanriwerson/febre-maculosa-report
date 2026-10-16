import type { KpiItem } from "../types";

interface KpiCardProps {
  item: KpiItem;
}

export default function KpiCard({ item }: KpiCardProps) {
  return (
    <article className={`kpi-card accent-${item.accent}`}>
      <h2>{item.label}</h2>
      <strong>{item.value}</strong>
      <p>{item.description}</p>
    </article>
  );
}
