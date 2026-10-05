"use client";

import { Download } from "lucide-react";
import Button from "./Button";

function getColumnKey(column) {
  return typeof column === "string" ? column : column.key;
}

function getColumnHeader(column) {
  return typeof column === "string" ? column : column.header ?? column.label ?? column.key;
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function buildCsv(rows = [], columns = []) {
  const exportColumns = columns.filter((column) => getColumnKey(column) !== "actions");
  const header = exportColumns.map((column) => escapeCsvValue(getColumnHeader(column))).join(",");
  const body = rows.map((row) =>
    exportColumns.map((column) => escapeCsvValue(row[getColumnKey(column)])).join(","),
  );

  return [header, ...body].join("\n");
}

export function downloadCsv(csv, fileName) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ExportButton({
  rows = [],
  columns = [],
  fileName = "export.csv",
  onExport,
  children = "Export",
  disabled = false,
  variant = "secondary",
  className = "w-full sm:w-auto",
  beforeIcon = <Download className="h-4 w-4" />,
  ...props
}) {
  function handleExport(event) {
    if (onExport) {
      onExport(event);
      return;
    }

    if (!rows.length) {
      return;
    }

    downloadCsv(buildCsv(rows, columns), fileName);
  }

  return (
    <Button
      variant={variant}
      beforeIcon={beforeIcon}
      className={className}
      disabled={disabled || (!onExport && !rows.length)}
      onClick={handleExport}
      {...props}
    >
      {children}
    </Button>
  );
}
