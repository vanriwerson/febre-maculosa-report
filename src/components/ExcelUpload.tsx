import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { buildReportDataFromFile } from "../services/reportDataService";
import type { ReportDataSet } from "../services/reportDataService";

interface ExcelUploadProps {
  onDataLoaded: (data: ReportDataSet) => void;
  currentFileName?: string;
}

export default function ExcelUpload({
  onDataLoaded,
  currentFileName,
}: ExcelUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    try {
      setError(null);
      setIsLoading(true);

      const data = await buildReportDataFromFile(file);
      onDataLoaded(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível ler a planilha selecionada.";

      setError(message);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFile(event.target.files?.[0]);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={`excel-upload ${isDragging ? "dragging" : ""}`}
      aria-live="polite"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="upload-copy">
        <strong>Planilha de dados</strong>
        <span>{currentFileName || "Nenhuma planilha carregada"}</span>
      </div>

      <label className="upload-button" htmlFor="excel-upload-input">
        {isLoading ? "Carregando..." : "Selecionar arquivo"}
      </label>

      <input
        ref={inputRef}
        id="excel-upload-input"
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />

      {error ? <small className="upload-error">{error}</small> : null}
    </div>
  );
}
