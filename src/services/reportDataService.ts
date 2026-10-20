import * as XLSX from "xlsx";

import { defaultReportData, reportMeta } from "../data/reportData";
import type { KpiItem, Locality } from "../types";

export interface ReportDataSet {
  meta: typeof reportMeta;
  kpis: KpiItem[];
  localities: Locality[];
  sourceName?: string;
}

const KPI_SHEET_NAMES = ["kpi's", "kpis", "kpi"];
const REGION_SHEET_NAMES = [
  "notificações por região",
  "notificacoes por regiao",
  "notificações por bairro",
  "notificacoes por bairro",
  "região",
  "regiao",
];

const defaultPalette = [
  "#117a70",
  "#0788c9",
  "#f5a000",
  "#8b5cf6",
  "#64748b",
  "#ef4444",
  "#10b981",
  "#16a34a",
];

const normalizeValue = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ");

const normalizeKey = (value: unknown) =>
  normalizeValue(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();

const isEmptyCell = (value: unknown) => normalizeValue(value) === "";

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const text = normalizeValue(value).replace(/\./g, "").replace(",", ".");
  const cleaned = text.replace(/[^0-9.\-]/g, "");

  if (cleaned === "" || cleaned === "-" || cleaned === "--") {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePercentValue = (value: unknown): string | null => {
  const text = normalizeValue(value);
  if (!text) return null;

  const match = text.match(/(\d+(?:[.,]\d+)?)\s*%?/i);
  if (!match) return null;

  const numeric = match[1].replace(".", ",");
  return `${numeric}%`;
};

const sheetToRows = (sheet: XLSX.WorkSheet): unknown[][] => {
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
  }) as unknown[][];

  return rows.map((row) =>
    Array.isArray(row)
      ? row.map((cell) => (cell === undefined ? "" : cell))
      : [row],
  );
};

const getSheetByName = (
  workbook: XLSX.WorkBook,
  candidates: string[],
): XLSX.WorkSheet | undefined => {
  const source = Object.entries(workbook.Sheets ?? {});

  for (const [sheetName, sheet] of source) {
    const normalizedName = normalizeKey(sheetName);
    if (candidates.some((candidate) => normalizedName.includes(candidate))) {
      return sheet;
    }
  }

  return undefined;
};

const intToPercent = (value: number, total: number) => {
  if (!total) return "0,0%";
  const percent = (value / total) * 100;
  return `${percent.toFixed(1).replace(".", ",")}%`;
};

const chooseAccent = (value?: string, label?: string): KpiItem["accent"] => {
  const normalized = normalizeKey(value ?? label ?? "");

  if (normalized.includes("orange") || normalized.includes("amarelo"))
    return "orange";
  if (
    normalized.includes("red") ||
    normalized.includes("vermelho") ||
    normalized.includes("confirm")
  )
    return "red";
  if (
    normalized.includes("green") ||
    normalized.includes("verde") ||
    normalized.includes("negativo")
  )
    return "green";
  if (
    normalized.includes("slate") ||
    normalized.includes("cinza") ||
    normalized.includes("descart")
  )
    return "slate";

  if (/(suspeit|notific)/.test(normalized)) return "orange";
  if (/(confirm|positiv|reag)/.test(normalized)) return "red";
  if (/(descart|encerr)/.test(normalized)) return "slate";
  if (/(negativ|resultado)/.test(normalized)) return "green";

  return "slate";
};

const deriveChartLabel = (name: string) => {
  const cleaned = normalizeValue(name)
    .replace(/\s*\/\s*.*$/, "")
    .trim();
  const fallback = cleaned || name;

  if (/outros|outras/i.test(fallback)) return "Outros Bairros";
  if (/zona rural/i.test(fallback)) return "Zona Rural";

  return fallback;
};

const parseKpiRow = (row: unknown[]) => {
  const cells = row.filter((cell) => !isEmptyCell(cell));
  if (cells.length < 2) return null;

  const label = normalizeValue(cells[0]);
  const valueCandidate = cells[1];
  const descriptionCandidate = cells[2] ? normalizeValue(cells[2]) : "";
  const accentCandidate = cells[3] ? normalizeValue(cells[3]) : "";
  const value = parseNumber(valueCandidate);

  if (!label || value === null) return null;

  return {
    label,
    value,
    description:
      descriptionCandidate ||
      (cells.length > 2 && !/^\d+$/.test(normalizeValue(cells[2]))
        ? normalizeValue(cells[2])
        : "Indicador do relatório"),
    accent: chooseAccent(accentCandidate, label),
  } satisfies KpiItem;
};

const KPI_CARD_DEFINITIONS = [
  {
    key: /casos suspeitos|suspeitos|suspeito/i,
    label: "Casos suspeitos",
    description: "Notificações totais",
    accent: "orange" as const,
  },
  {
    key: /casos confirmados|confirmados|confirmado/i,
    label: "Casos confirmados",
    description: "Reação reagente/positiva",
    accent: "red" as const,
  },
  {
    key: /casos descartados|descartados|descartado/i,
    label: "Casos descartados",
    description: "Investigação encerrada",
    accent: "slate" as const,
  },
  {
    key: /resultados negativos|negativos|resultado negativo/i,
    label: "Resultados negativos",
    description: "Não reagente/Soro 1 e 2",
    accent: "green" as const,
  },
];

const parseKpisFromSheet = (sheet: XLSX.WorkSheet): KpiItem[] => {
  const rows = sheetToRows(sheet);
  const items: KpiItem[] = [];

  const headerRow = rows.find((row) =>
    row.some((cell) =>
      /casos|confirm|descart|resultado|suspeit|obito/i.test(
        normalizeValue(cell),
      ),
    ),
  );

  if (headerRow && rows.length > 1) {
    const valuesRow = rows[rows.indexOf(headerRow) + 1] ?? [];
    const matchedHeaderIndexes = headerRow
      .map((cell, index) => {
        const normalized = normalizeKey(cell);
        if (/obito/.test(normalized) && !/casos/.test(normalized)) {
          return null;
        }

        const definition = KPI_CARD_DEFINITIONS.find(({ key }) =>
          key.test(normalized),
        );
        return definition ? { index, definition } : null;
      })
      .filter(Boolean) as {
      index: number;
      definition: (typeof KPI_CARD_DEFINITIONS)[number];
    }[];

    if (matchedHeaderIndexes.length > 0) {
      const seenLabels = new Set<string>();

      for (const { index, definition } of matchedHeaderIndexes) {
        if (seenLabels.has(definition.label)) continue;

        const rawValue = valuesRow[index];
        const value = parseNumber(rawValue);
        if (value === null) continue;

        seenLabels.add(definition.label);

        items.push({
          label: definition.label,
          value,
          description: definition.description,
          accent: definition.accent,
        });
      }

      if (items.length > 0) {
        return items;
      }
    }
  }

  for (const row of rows) {
    const normalizedRow = row.map((cell) => normalizeKey(cell));

    if (normalizedRow.every((cell) => !cell)) continue;
    if (normalizedRow.some((cell) => /indicador|kpi|titulo|header/.test(cell)))
      continue;

    const parsedRow = parseKpiRow(row);
    if (parsedRow) {
      items.push(parsedRow);
    }
  }

  return items;
};

const parseLocalityRecord = (
  row: unknown[],
  index: number,
  totalSum: number,
): Locality | null => {
  const cells = row.map((cell) => normalizeValue(cell));
  if (cells.every((cell) => !cell)) return null;

  const name = cells[0] || `Localidade ${index + 1}`;
  const suspected = parseNumber(cells[1]) ?? 0;
  const confirmed = parseNumber(cells[2]) ?? 0;
  const discarded = parseNumber(cells[3]) ?? 0;
  const total =
    parseNumber(cells[4]) ??
    Math.max(suspected, suspected + confirmed + discarded);
  const percentageValue =
    parsePercentValue(cells[5]) ?? intToPercent(total, totalSum || total);

  return {
    name,
    suspected,
    confirmed,
    discarded,
    total,
    chartLabel: deriveChartLabel(name),
    color: defaultPalette[index % defaultPalette.length],
    percentage: percentageValue,
  };
};

const parseLocalitiesFromSheet = (sheet: XLSX.WorkSheet): Locality[] => {
  const rows = sheetToRows(sheet);
  const headerIndex = rows.findIndex((row) =>
    row.some((cell) => {
      const normalized = normalizeKey(cell);
      return /bairro|regiao|localidade|zona/.test(normalized);
    }),
  );

  const allRows = headerIndex >= 0 ? rows.slice(headerIndex + 1) : rows;
  const parsedRows: Locality[] = [];

  for (let index = 0; index < allRows.length; index += 1) {
    const row = allRows[index];
    if (!row.some((cell) => !isEmptyCell(cell))) continue;

    const normalizedFirstCell = normalizeKey(row[0]);
    if (
      normalizedFirstCell &&
      /bairro|regiao|localidade|suspeito|confirmado|descartado|total/.test(
        normalizedFirstCell,
      )
    ) {
      continue;
    }

    const parsedRow = parseLocalityRecord(row, index, 0);
    if (parsedRow) {
      parsedRows.push(parsedRow);
    }
  }

  const totalSum = parsedRows.reduce((sum, item) => sum + item.total, 0);

  return parsedRows.map((item, index) => ({
    ...item,
    percentage:
      item.percentage || intToPercent(item.total, totalSum || item.total),
    color: item.color || defaultPalette[index % defaultPalette.length],
  }));
};

export const parseWorkbookData = (workbook: XLSX.WorkBook): ReportDataSet => {
  const kpiSheet = getSheetByName(workbook, KPI_SHEET_NAMES);
  const regionSheet = getSheetByName(workbook, REGION_SHEET_NAMES);

  const fallback = { ...defaultReportData, sourceName: "Dados padrão" };

  const kpis = kpiSheet ? parseKpisFromSheet(kpiSheet) : fallback.kpis;
  const localities = regionSheet
    ? parseLocalitiesFromSheet(regionSheet)
    : fallback.localities;

  return {
    meta: reportMeta,
    kpis: kpis.length ? kpis : fallback.kpis,
    localities: localities.length ? localities : fallback.localities,
    sourceName: "planilha carregada",
  };
};

export const buildReportDataFromFile = async (
  file: File,
): Promise<ReportDataSet> => {
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
    raw: false,
  });

  const parsed = parseWorkbookData(workbook);
  return {
    ...parsed,
    sourceName: file.name,
  };
};

export const defaultReportDataSet: ReportDataSet = {
  ...defaultReportData,
  sourceName: "Dados padrão",
};
