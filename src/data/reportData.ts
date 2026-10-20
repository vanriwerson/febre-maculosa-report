import type { KpiItem, Locality } from "../types";

export const reportMeta = {
  title: "Febre Maculosa - Visão Geral",
  subtitle: "Relatório Epidemiológico Consolidado | Araras-SP (2026)",
  department: "Vigilância Epidemiológica",
  footer: "Vigilância em Saúde - Prefeitura Municipal de Araras-SP",
  page: "Página 1 de 1",
};

export const kpis: KpiItem[] = [
  {
    label: "Casos suspeitos",
    value: 132,
    description: "Notificações totais",
    accent: "orange",
  },
  {
    label: "Casos confirmados",
    value: 3,
    description: "Reação reagente/positiva",
    accent: "red",
  },
  {
    label: "Casos descartados",
    value: 129,
    description: "Investigação encerrada",
    accent: "slate",
  },
  {
    label: "Resultados negativos",
    value: 129,
    description: "Não reagente/Soro 1 e 2",
    accent: "green",
  },
];

export const localities: Locality[] = [
  {
    name: "Zona Rural / Assentamentos",
    suspected: 60,
    confirmed: 2,
    discarded: 58,
    total: 60,
    chartLabel: "Zona Rural",
    color: "#117a70",
    percentage: "45,5%",
  },
  {
    name: "Centro",
    suspected: 24,
    confirmed: 1,
    discarded: 23,
    total: 24,
    chartLabel: "Centro",
    color: "#0788c9",
    percentage: "18,2%",
  },
  {
    name: "Jardim Belvedere",
    suspected: 18,
    confirmed: 0,
    discarded: 18,
    total: 18,
    chartLabel: "Jd. Belvedere",
    color: "#f5a000",
    percentage: "13,6%",
  },
  {
    name: "Jardim Cândida",
    suspected: 15,
    confirmed: 0,
    discarded: 15,
    total: 15,
    chartLabel: "Jd. Cândida",
    color: "#8b5cf6",
    percentage: "11,4%",
  },
  {
    name: "Parque das Árvores / Outros",
    suspected: 15,
    confirmed: 0,
    discarded: 15,
    total: 15,
    chartLabel: "Outros Bairros",
    color: "#64748b",
    percentage: "11,3%",
  },
];

export const defaultReportData = {
  meta: reportMeta,
  kpis,
  localities,
};
