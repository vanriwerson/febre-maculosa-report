import {
  KpiGrid,
  LocalityTable,
  NeighborhoodChart,
  ReportFooter,
  ReportHeader,
  SectionHeading,
} from "./components";

import { reportMeta, kpis, localities } from "./data/reportData";

export default function App() {
  return (
    <main className="report-page">
      <ReportHeader
        title={reportMeta.title}
        subtitle={reportMeta.subtitle}
        department={reportMeta.department}
      />

      <KpiGrid items={kpis} />

      <section className="report-section">
        <SectionHeading>Notificações por Bairro</SectionHeading>

        <NeighborhoodChart items={localities} />
      </section>

      <section className="report-section locality-section">
        <SectionHeading>Consolidado por Localidade</SectionHeading>

        <LocalityTable items={localities} />
      </section>

      <ReportFooter text={reportMeta.footer} page={reportMeta.page} />
    </main>
  );
}
