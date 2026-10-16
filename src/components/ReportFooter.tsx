interface ReportFooterProps {
  text: string;
  page: string;
}

export default function ReportFooter({ text, page }: ReportFooterProps) {
  return (
    <footer className="report-footer">
      <span>{text}</span>
      <span>{page}</span>
    </footer>
  );
}
