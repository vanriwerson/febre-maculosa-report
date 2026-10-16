interface ReportHeaderProps {
  title: string;
  subtitle: string;
  department: string;
}

export default function ReportHeader({
  title,
  subtitle,
  department,
}: ReportHeaderProps) {
  return (
    <header className="report-header">
      <div className="header-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <span className="department-tag">{department}</span>
    </header>
  );
}
