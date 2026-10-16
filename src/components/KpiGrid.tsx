import type { KpiItem } from "../types";
import KpiCard from "./KpiCard";

interface KpiGridProps {
  items: KpiItem[];
}

export default function KpiGrid({ items }: KpiGridProps) {
  return (
    <section className="kpi-grid" aria-label="Indicadores principais">
      {items.map((item) => (
        <KpiCard key={item.label} item={item} />
      ))}
    </section>
  );
}
