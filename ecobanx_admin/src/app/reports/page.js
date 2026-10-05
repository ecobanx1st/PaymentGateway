"use client";

import { Button, Dropdown, ExportButton, Table, Tabs } from "@/components/ReusableUi";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";

const tabs = [
  { label: "Revenue", value: "revenue" },
  { label: "Settlement", value: "settlement" },
  { label: "Merchant", value: "merchant" },
  { label: "Refund", value: "refund" },
  { label: "Transaction", value: "transaction" },
];

const rangeOptions = [
  { label: "Last 30 days", value: "last-30" },
  { label: "Last 7 days", value: "last-7" },
  { label: "This month", value: "this-month" },
  { label: "Last quarter", value: "last-quarter" },
];

const revenueWeeks = [4, 5, 3, 4, 2, 3, 4, 2, 3, 4, 2, 4, 3, 4];

const merchantReports = [
  { category: "Retail & Apparel", amount: "$684,200" },
  { category: "Food & Grocery", amount: "$512,940" },
  { category: "Travel & Hospitality", amount: "$398,110" },
  { category: "Electronics", amount: "$276,430" },
  { category: "Education", amount: "$142,600" },
];

const scheduledReports = [
  {
    id: "report-monthly-revenue",
    report: "Monthly Revenue Summary",
    type: "Revenue",
    range: "Jun 1 - Jun 30",
    generated: "Jul 1, 09:12 AM",
    format: "PDF",
  },
  {
    id: "report-settlement-recon",
    report: "Settlement Reconciliation",
    type: "Settlement",
    range: "Jun 1 - Jun 30",
    generated: "Jul 1, 08:40 AM",
    format: "XLSX",
  },
  {
    id: "report-merchant-recon",
    report: "Settlement Reconciliation",
    type: "Merchant",
    range: "Jun 1 - Jun 30",
    generated: "Jul 1, 08:40 AM",
    format: "XLSX",
  },
];

const reportColumns = [
  { key: "report", header: "Report", cellClassName: "min-w-64" },
  { key: "type", header: "Type", cellClassName: "min-w-32" },
  { key: "range", header: "Range", cellClassName: "min-w-40" },
  { key: "generated", header: "Generated", cellClassName: "min-w-44" },
  {
    key: "format",
    header: "Format",
    cellClassName: "min-w-28",
    render: (value) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-input-bg px-2 py-1 text-small font-medium text-text-secondary">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {value}
      </span>
    ),
  },
  { key: "actions", header: "Actions", type: "actions" },
];

function escapeTableValue(value) {
  return String(value ?? "").replaceAll("\t", " ").replaceAll("\n", " ");
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildWorkbook(rows) {
  return rows.map((row) => row.map(escapeTableValue).join("\t")).join("\n");
}

function escapePdfText(value) {
  return String(value ?? "").replace(/[\\()]/g, "\\$&");
}

function buildSimplePdf(title, lines) {
  const contentLines = [
    "BT",
    "/F1 18 Tf",
    "50 770 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 11 Tf",
    "0 -30 Td",
    ...lines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "0 -18 Td"]),
    "ET",
  ];
  const stream = contentLines.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

function FormatRevenueChart() {
  return (
    <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5 sm:p-6">
      <div>
        <h2 className="text-large font-semibold text-theme-text">Revenue report</h2>
        <p className="mt-1 text-small text-text-secondary">Gross revenue by week</p>
      </div>
      <div className="mt-7 flex min-h-32 items-end gap-3 overflow-x-auto pb-1 sm:gap-5">
        {revenueWeeks.map((height, weekIndex) => (
          <div key={weekIndex} className="flex min-w-8 flex-col-reverse items-center gap-2">
            {Array.from({ length: height }).map((_, dotIndex) => (
              <span key={dotIndex} className="h-6 w-6 rounded-full bg-text-primary" />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function MerchantReportCard() {
  return (
    <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5 sm:p-6">
      <div>
        <h2 className="text-large font-semibold text-theme-text">Merchant report</h2>
        <p className="mt-1 text-small text-text-secondary">Top categories by volume</p>
      </div>
      <div className="mt-6 space-y-4">
        {merchantReports.map((item) => (
          <div key={item.category} className="flex items-center justify-between gap-4 text-mid">
            <span className="text-text-secondary">{item.category}</span>
            <span className="font-semibold text-theme-text">{item.amount}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [dateRange, setDateRange] = useState("last-30");

  const filteredReports = useMemo(() => {
    if (activeTab === "revenue") {
      return scheduledReports;
    }

    return scheduledReports.filter((report) => report.type.toLowerCase() === activeTab);
  }, [activeTab]);

  const selectedRange = rangeOptions.find((range) => range.value === dateRange)?.label ?? "Last 30 days";
  const exportRows = [
    ["Report", "Type", "Range", "Generated", "Format"],
    ...filteredReports.map((report) => [
      report.report,
      report.type,
      report.range,
      report.generated,
      report.format,
    ]),
  ];

  function handleExportExcel() {
    downloadBlob(
      buildWorkbook(exportRows),
      `eco-banx-${activeTab}-reports.xls`,
      "application/vnd.ms-excel;charset=utf-8",
    );
  }

  function handleExportPdf() {
    const lines = [
      `Report type: ${activeTab}`,
      `Date range: ${selectedRange}`,
      "",
      ...filteredReports.map(
        (report) => `${report.report} | ${report.type} | ${report.range} | ${report.format}`,
      ),
    ];

    downloadBlob(
      buildSimplePdf("Eco Banx Reports", lines),
      `eco-banx-${activeTab}-reports.pdf`,
      "application/pdf",
    );
  }

  function handleDownloadReport(row) {
    const rows = [
      ["Report", "Type", "Range", "Generated", "Format"],
      [row.report, row.type, row.range, row.generated, row.format],
    ];
    const extension = row.format.toLowerCase() === "pdf" ? "pdf" : "xls";
    const fileName = `${row.report.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.${extension}`;

    if (extension === "pdf") {
      downloadBlob(
        buildSimplePdf(row.report, [`Type: ${row.type}`, `Range: ${row.range}`, `Generated: ${row.generated}`]),
        fileName,
        "application/pdf",
      );
      return;
    }

    downloadBlob(buildWorkbook(rows), fileName, "application/vnd.ms-excel;charset=utf-8");
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">Reports</h1>
          <p className="text-small text-text-secondary">
            Generate And Export Platform-Wide Reporting
          </p>
        </div>
        {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <ExportButton onExport={handleExportPdf}>
            Export PDF
          </ExportButton>
          <ExportButton onExport={handleExportExcel}>
            Export Excel
          </ExportButton>
        </div> */}
      </section>

      <section className="flex flex-col gap-4 rounded-rounded border border-input-border/40 bg-card-bg p-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="gap-2" />
        <Dropdown
          options={rangeOptions}
          value={dateRange}
          onChange={setDateRange}
          className="w-full sm:w-48"
          triggerClassName="!h-10"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <FormatRevenueChart />
        <MerchantReportCard />
      </section>

      <Table
        title="Scheduled & recent reports"
        columns={reportColumns}
        data={filteredReports}
        rowKey="id"
        showSearch={false}
        showViewAll={false}
        actions={[
          {
            key: "download",
            label: "Download report",
            iconNode: <Download className="h-3 w-3" />,
            onClick: handleDownloadReport,
          },
        ]}
        pagination={null}
        className="mt-0"
        tableClassName="min-w-[980px]"
      />
    </div>
  );
}
