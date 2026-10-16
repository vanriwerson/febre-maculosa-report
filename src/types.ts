export interface KpiItem {
  label: string;
  value: number;
  description: string;
  accent: "orange" | "red" | "slate" | "green";
}

export interface Locality {
  name: string;
  suspected: number;
  confirmed: number;
  discarded: number;
  total: number;
  chartLabel: string;
  color: string;
  percentage: string;
}
