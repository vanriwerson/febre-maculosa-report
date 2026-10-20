import { useState } from "react";

import {
  ExcelUpload,
  KpiGrid,
  LocalityTable,
  NeighborhoodChart,
  ReportFooter,
  ReportHeader,
  SectionHeading,
} from "./components";

import { defaultReportData } from "./data/reportData";
import type { ReportDataSet } from "./services/reportDataService";

export default function App() {
  const [reportData, setReportData] =
    useState<ReportDataSet>(defaultReportData);

  return (
    <main className="report-page">
      <ExcelUpload
        currentFileName={reportData.sourceName}
        onDataLoaded={setReportData}
      />

      <ReportHeader
        title={reportData.meta.title}
        subtitle={reportData.meta.subtitle}
        department={reportData.meta.department}
      />

      <KpiGrid items={reportData.kpis} />

      <section className="report-section">
        <SectionHeading>Notificações por Bairro</SectionHeading>

        <NeighborhoodChart items={reportData.localities} />
      </section>

      <section className="report-section locality-section">
        <SectionHeading>Consolidado por Localidade</SectionHeading>

        <LocalityTable items={reportData.localities} />
      </section>

      <ReportFooter text={reportData.meta.footer} page={reportData.meta.page} />
    </main>
  );
}
