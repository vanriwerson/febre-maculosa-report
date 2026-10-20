import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { parseWorkbookData } from "./reportDataService";

describe("reportDataService", () => {
  it("builds KPI and region data from workbook sheets", () => {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        [
          "Casos Suspeitos",
          "Casos Confirmados",
          "Óbitos Confirmados",
          "Casos Descartados",
          "Resultados Negativos",
        ],
        [131, 4, 4, 104, 35],
      ]),
      "KPI's",
    );

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        [
          "Bairro / Região",
          "Suspeitos",
          "Confirmados",
          "Descartados",
          "Total Notificações",
          "Porcentagem",
        ],
        ["Zona Rural / Assentamentos", 60, 2, 58, 60, "45,5%"],
        ["Centro", 24, 1, 23, 24, "18,2%"],
      ]),
      "Notificações por Região",
    );

    const data = parseWorkbookData(wb);

    expect(data.kpis).toHaveLength(4);
    expect(data.kpis).toEqual([
      expect.objectContaining({
        label: "Casos suspeitos",
        value: 131,
        description: "Notificações totais",
        accent: "orange",
      }),
      expect.objectContaining({
        label: "Casos confirmados",
        value: 4,
        description: "Reação reagente/positiva",
        accent: "red",
      }),
      expect.objectContaining({
        label: "Casos descartados",
        value: 104,
        description: "Investigação encerrada",
        accent: "slate",
      }),
      expect.objectContaining({
        label: "Resultados negativos",
        value: 35,
        description: "Não reagente/Soro 1 e 2",
        accent: "green",
      }),
    ]);

    expect(data.localities).toHaveLength(2);
    expect(data.localities[0]).toMatchObject({
      name: "Zona Rural / Assentamentos",
      suspected: 60,
      confirmed: 2,
      discarded: 58,
      total: 60,
      percentage: "45,5%",
    });
  });
});
