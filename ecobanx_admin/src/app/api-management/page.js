"use client";

import { Button, ExportButton, Table } from "@/components/ReusableUi";
import { Activity, KeyRound, Plus, ShieldCheck, Trash2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Processed today", value: "2.84M", icon: Activity },
  { label: "Error rate", value: "0.21%", icon: ShieldCheck },
  { label: "Rate limit", value: "1,000 / min", icon: Zap },
];

const apiKeys = [
  {
    id: "api-001",
    key: "Pk_live_9Yt2...4xd1",
    environment: "Live",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "2min ago",
    status: "Active",
  },
  {
    id: "api-002",
    key: "Pk_test_9Yt2...4xd1",
    environment: "Sandbox",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "24min ago",
    status: "Active",
  },
  {
    id: "api-003",
    key: "Pk_live_912a...4xd1",
    environment: "Live",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "28min ago",
    status: "Revoked",
  },
  {
    id: "api-004",
    key: "Pk_live_912a...c8g4",
    environment: "Live",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "2min ago",
    status: "Active",
  },
  {
    id: "api-005",
    key: "Pk_live_7f2s...9fa1",
    environment: "Live",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "29min ago",
    status: "Active",
  },
  {
    id: "api-006",
    key: "Pk_live_9Yt2...4xd1",
    environment: "Live",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "24min ago",
    status: "Active",
  },
  {
    id: "api-007",
    key: "Pk_live_9Yt2...4xd1",
    environment: "Live",
    merchant: "Kaveri Textiles",
    created: "Jan 12, 2026",
    lastUsed: "2min ago",
    status: "Active",
  },
];

const columns = [
  { key: "key", header: "Key", cellClassName: "min-w-44" },
  { key: "environment", header: "Environment", type: "status" },
  { key: "merchant", header: "Merchant", cellClassName: "min-w-40" },
  { key: "created", header: "Created", cellClassName: "min-w-36" },
  { key: "lastUsed", header: "Last used", cellClassName: "min-w-32" },
  { key: "status", header: "Status", type: "status" },
  { key: "actions", header: "Actions", type: "actions" },
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

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <article className="rounded-rounded border border-input-border/40 [background:var(--card-bg)] p-5">
      <span className="mb-8 grid h-9 w-9 place-items-center rounded-[8px] border border-input-border [background:var(--card-bg)] text-text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-2xl font-black text-theme-text">{stat.value}</p>
      <p className="mt-1 text-small text-text-secondary">{stat.label}</p>
    </article>
  );
}

function WebhookConfiguration() {
  const rows = [
    ["Endpoint URL", "/webhook/eco-banx"],
    ["Events subscribed", "payment.success, refund.updated"],
    ["Signing secret", "whsec_**********33a"],
    ["Delivery success rate", "99.4%"],
  ];

  return (
    <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5">
      <h2 className="text-large font-semibold text-theme-text">Webhook configuration</h2>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 text-mid sm:grid-cols-[150px_1fr]">
            <span className="text-text-secondary">{label}</span>
            <span className={label === "Delivery success rate" ? "font-semibold text-text-primary" : "text-theme-text"}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentApiLogs() {
  const logs = [
    "POST /v1/payments 201 34ms for /v1/merchants/kxt-21",
    "200 54ms POST /v1/refunds 201",
    "Created 100% POST /v1/webhooks/test",
    "500 Error 12ms PUT /v1/settlements/batch-opening",
    "201 48 ms",
  ];

  return (
    <section className="rounded-rounded border border-input-border/40 bg-card-bg p-5">
      <h2 className="text-large font-semibold text-theme-text">Recent API logs</h2>
      <pre className="mt-5 overflow-x-auto rounded-[8px] border border-input-border/30 bg-bg-secondary/70 p-4 text-small leading-6 text-text-primary">
        {logs.join("\n")}
      </pre>
    </section>
  );
}

export default function ApiManagementPage() {
  const router = useRouter();

  function handleExportPdf() {
    const lines = [
      "API Management Summary",
      ...stats.map((stat) => `${stat.label}: ${stat.value}`),
      "",
      ...apiKeys.map((apiKey) => `${apiKey.key} | ${apiKey.environment} | ${apiKey.status}`),
    ];

    downloadBlob(buildSimplePdf("Eco Banx API Management", lines), "eco-banx-api-management.pdf", "application/pdf");
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">API Management</h1>
          <p className="text-small text-text-secondary">Keys, Webhooks, And Platform API Usage</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* <ExportButton onExport={handleExportPdf}>
            Export PDF
          </ExportButton> */}
          <Button
            variant="primary"
            beforeIcon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
            onClick={() => router.push("/api-management/generate-api-key")}
          >
            Generate API key
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <Table
        title="API keys"
        columns={columns}
        data={apiKeys}
        rowKey="id"
        searchPlaceholder="Search transaction ID"
        viewAllLabel="View All"
        actions={[
          { key: "view", label: "View API key", iconNode: <KeyRound className="h-3 w-3" /> },
          { key: "delete", label: "Delete API key", iconNode: <Trash2 className="h-3 w-3" /> },
        ]}
        pagination={null}
        className="mt-0"
        tableClassName="min-w-[1040px]"
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <WebhookConfiguration />
        <RecentApiLogs />
      </section>
    </div>
  );
}
