"use client";

import { Button, Dropdown, ExportButton, Input, Toast } from "@/components/ReusableUi";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const merchantOptions = [
  { label: "All Eligible Merchants", value: "all" },
  { label: "Kaveri Textiles", value: "kaveri-textiles" },
  { label: "Nilgiri Foods", value: "nilgiri-foods" },
  { label: "Meera Organics", value: "meera-organics" },
];

const burstLimitOptions = [
  { label: "2,000", value: "2000" },
  { label: "5,000", value: "5000" },
  { label: "10,000", value: "10000" },
];

const environments = [
  { label: "Live", value: "live" },
  { label: "Sandbox", value: "sandbox" },
];

function escapePdfText(value) {
  return String(value ?? "").replace(/[\\()]/g, "\\$&");
}

function buildSimplePdf(title, lines) {
  const stream = [
    "BT",
    "/F1 18 Tf",
    "50 770 Td",
    `(${escapePdfText(title)}) Tj`,
    "/F1 11 Tf",
    "0 -30 Td",
    ...lines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, "0 -18 Td"]),
    "ET",
  ].join("\n");
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
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
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

function EnvironmentOption({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(item.value)}
      className="flex items-center gap-3 rounded-full py-1 pr-5 text-mid text-text-secondary transition hover:text-theme-text"
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border transition ${
          selected ? "border-text-primary bg-text-primary/15" : "border-input-border bg-input-bg"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-text-primary" />}
      </span>
      {item.label}
    </button>
  );
}

export default function GenerateApiKeyPage() {
  const router = useRouter();
  const [merchant, setMerchant] = useState("all");
  const [burstLimit, setBurstLimit] = useState("2000");
  const [environment, setEnvironment] = useState("live");
  const [toast, setToast] = useState(null);

  function handleExportPdf() {
    const lines = [
      "Generate API Key Draft",
      `Merchant: ${merchant}`,
      `Environment: ${environment}`,
      `Burst limit: ${burstLimit}`,
    ];

    downloadBlob(buildSimplePdf("Eco Banx API Key Draft", lines), "eco-banx-api-key-draft.pdf", "application/pdf");
  }

  function handleConfirm(event) {
    event.preventDefault();
    setToast({ id: Date.now(), content: "API key generated successfully" });
    window.setTimeout(() => router.push("/api-management"), 700);
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast key={toast.id} content={toast.content} color="success" duration={2500} />
        </div>
      )}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">Generate New API Key</h1>
          <p className="text-small text-text-secondary">
            Create A New API Key To Access The Payment Gateway APIs
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* <ExportButton onExport={handleExportPdf}>
            Export PDF
          </ExportButton> */}
          <Button
            variant="primary"
            beforeIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
            onClick={() => router.push("/api-management")}
          >
            Generate API key
          </Button>
        </div>
      </section>

      <form onSubmit={handleConfirm} className="space-y-6">
        <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5 sm:p-7 lg:p-8">
          <h2 className="text-large font-semibold text-theme-text">Basic information</h2>

          <div className="mt-7 grid gap-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-7">
            <Input label="Key Name" placeholder="Enter a name for this API key" />
            <Dropdown
              label="Select Merchants"
              options={merchantOptions}
              value={merchant}
              onChange={setMerchant}
            />
            <Input label="IP Whitelist (Optional)" placeholder="Add IP addresses separated by commas" />
            <Input label="Webhook URL (Optional)" placeholder="https://yourdomain.com/webhook" />
            <div>
              <p className="mb-3 text-mid font-medium text-text-secondary">Environment</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {environments.map((item) => (
                  <EnvironmentOption
                    key={item.value}
                    item={item}
                    selected={environment === item.value}
                    onSelect={setEnvironment}
                  />
                ))}
              </div>
            </div>
          </div>

          <h2 className="mt-9 text-large font-semibold text-theme-text">Rate Limits</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-x-8">
            <Input label="Requests per minute" placeholder="1,000" />
            <Dropdown
              label="Burst limit"
              options={burstLimitOptions}
              value={burstLimit}
              onChange={setBurstLimit}
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.9fr]">
          <div className="min-h-44 rounded-rounded border border-input-border/40 bg-card-bg p-6">
            <h2 className="text-large font-semibold text-theme-text">API Key Preview</h2>
          </div>
          <div className="rounded-rounded border border-input-border/40 bg-card-bg p-6">
            <h2 className="text-large font-semibold text-theme-text">Important Notes</h2>
            <ul className="mt-7 space-y-4 text-mid text-text-secondary">
              <li>Keep your API keys secure and never share them publicly.</li>
              <li>API keys have different permissions based on your selection.</li>
              <li>You can rotate or revoke keys at any time.</li>
            </ul>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-44"
            onClick={() => router.push("/api-management")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="w-full sm:w-44">
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
}
