"use client";

import { motion } from "framer-motion";
import {
  Braces,
  Check,
  Clock3,
  Copy,
  FileJson,
  KeyRound,
  Play,
  Send,
  Server,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

function JsonLines({ value, dark = false }) {
  const lines = JSON.stringify(value, null, 2).split("\n");
  return (
    <pre className={`max-h-[34rem] overflow-auto p-4 font-mono text-[12px] leading-6 ${dark ? "text-slate-100" : ""}`}>
      {lines.map((line, index) => (
        <span className="block" key={`${line}-${index}`}>
          <span className={`mr-5 inline-block w-5 select-none text-right ${dark ? "text-slate-500" : ""}`}>
            {index + 1}
          </span>
          <span className={dark ? "text-slate-200" : line.includes('"') ? "text-secondary-text" : ""}>
            {line}
          </span>
        </span>
      ))}
    </pre>
  );
}

function CopyCodeButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 text-[11px] font-semibold text-slate-300 transition hover:border-[#ff6c37]/60 hover:text-white"
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function resolvePanelValue(item, endpoint) {
  if (item?.backendKey && endpoint?.[item.backendKey]) return endpoint[item.backendKey];
  return item?.value || "";
}

function makeEnvironmentMap(environment = []) {
  return Object.fromEntries(environment.map((item) => [item.key, item.value]));
}

function resolveTemplate(value, variables) {
  return String(value || "").replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => variables[key] || `{{${key}}}`);
}

function parseJsonBlock(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toPrettyJson(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function CodeBlock({ title, icon: Icon, value, mutedText, tone = "default" }) {
  const text = toPrettyJson(value);
  const hasValue = Boolean(text);

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#080d14]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#111b27] px-4 py-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-300">
          <Icon size={15} className={tone === "orange" ? "text-[#ff6c37]" : "text-slate-400"} />
          {title}
        </p>
        {hasValue ? <CopyCodeButton value={text} /> : null}
      </div>
      {hasValue ? (
        <pre className="max-h-[24rem] overflow-auto p-4 font-mono text-[12px] leading-6 text-slate-100">
          <code>{text}</code>
        </pre>
      ) : (
        <p className="p-4 text-xs leading-5 text-slate-400">{mutedText}</p>
      )}
    </section>
  );
}

function KeyValueBlock({ title, icon: Icon, rows = [] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#080d14]">
      <div className="border-b border-white/10 bg-[#111b27] px-4 py-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-300">
          <Icon size={15} className="text-[#ff6c37]" />
          {title}
        </p>
      </div>
      <div className="divide-y divide-white/10">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.key} className="grid gap-2 px-4 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] xl:grid-cols-1 2xl:grid-cols-[8rem_minmax(0,1fr)]">
              <code className="text-[11px] font-semibold text-orange-200">{row.key}</code>
              <code className="break-all text-[11px] font-semibold text-slate-200">{row.value}</code>
            </div>
          ))
        ) : (
          <p className="px-4 py-3 text-xs text-slate-400">No values required.</p>
        )}
      </div>
    </section>
  );
}

function EnvironmentPreviewBlock({ rows = [] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#080d14]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#111b27] px-4 py-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-300">
          <Settings2 size={15} className="text-[#ff6c37]" />
          Environment
        </p>
        <CopyCodeButton value={toPrettyJson(Object.fromEntries(rows.map((row) => [row.key, row.value])))} label="Copy env" />
      </div>
      <div className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.6fr)] border-b border-white/10 bg-[#202020] px-4 py-2 text-xs font-semibold text-slate-300">
        <span>Variable</span>
        <span>Value</span>
      </div>
      <div className="divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[minmax(8rem,0.8fr)_minmax(0,1.6fr)] px-4 py-3">
            <code className="text-[11px] font-semibold text-white">{row.key}</code>
            <code className="break-all text-[11px] font-semibold text-slate-100">{row.value}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

function PostmanSetupPanel({ document }) {
  const postman = document.visualGuide?.postman || {};
  const environmentRows = document.visualGuide?.environment || [];

  return (
    <motion.aside
      key={`${document.slug}-postman-setup`}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
      className="flex h-full min-h-[34rem] flex-col overflow-hidden rounded-xl border border-[#263241] bg-[#0f1720] text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.28)] xl:min-h-0"
    >
      <div className="shrink-0 border-b border-white/10 bg-[#111b27] px-4 py-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Settings2 size={16} className="text-[#ff6c37]" />
          Postman setup
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Create these variables first, then paste the script into Pre-request Script.
        </p>
      </div>

      <div data-lenis-prevent="true" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <EnvironmentPreviewBlock rows={environmentRows} />
        <CodeBlock
          title="Pre-request script"
          icon={Braces}
          value={postman.script}
          mutedText="No pre-request script is configured."
          tone="orange"
        />
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
          This Introduction panel is only for Postman setup. Body and response examples start from Get authorized token.
        </div>
      </div>
    </motion.aside>
  );
}
function CodeReferencePanel({ document, endpoint }) {
  const [hasSent, setHasSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const postman = document.visualGuide?.postman || {};
  const environment = makeEnvironmentMap(document.visualGuide?.environment || []);
  const method = resolvePanelValue(postman.method, endpoint) || endpoint?.method || "POST";
  const url = resolvePanelValue(postman.endpoint, endpoint) || endpoint?.url || "";
  const resolvedUrl = resolveTemplate(url, environment);
  const headers = postman.headers || (document.headers || []).map((header) => ({
    key: header.field,
    value: header.description || header.type || "",
    description: header.description,
  }));
  const auth = postman.auth || (headers.some((header) => header.key === "Authorization") ? {
    type: "Bearer Token",
    value: "Bearer {{accessToken}}",
    description: "Use the access token returned from Generate Token For Merchants.",
  } : null);
  const bodyText = resolveTemplate(postman.body || document.requestExample || "", environment);
  const bodyObject = parseJsonBlock(bodyText);
  const response = postman.response || endpoint?.response || document.responseExample || null;
  const responseText = toPrettyJson(response);
  const statusText = hasSent ? "200 OK" : "Ready";

  const sendRequest = () => {
    setIsSending(true);
    setHasSent(false);
    window.setTimeout(() => {
      setIsSending(false);
      setHasSent(true);
    }, 520);
  };

  return (
    <motion.aside
      key={`${document.slug}-code-reference`}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
      className="flex h-full min-h-[34rem] flex-col overflow-hidden rounded-xl border border-[#263241] bg-[#0f1720] text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.28)] xl:min-h-0"
    >
      <div className="shrink-0 border-b border-white/10 bg-[#111b27] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Braces size={16} className="text-[#ff6c37]" />
              Request and response
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Static examples from the documentation data.
            </p>
          </div>
          <span className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
            {statusText}
          </span>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="flex h-9 w-16 shrink-0 items-center justify-center rounded-md bg-[#ff6c37] text-xs font-bold text-white">
            {method}
          </span>
          <button
            type="button"
            onClick={sendRequest}
            disabled={isSending}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-500 px-3 text-xs font-bold text-white transition hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-70"
          >
            <Play size={14} />
            {isSending ? "Sending" : "Show response"}
          </button>
        </div>
      </div>

      <div data-lenis-prevent="true" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <KeyValueBlock
          title="Endpoint"
          icon={Server}
          rows={[
            { key: "Template", value: url || "Not configured" },
            { key: "Resolved", value: resolvedUrl || "Not configured" },
          ]}
        />
        <KeyValueBlock
          title="Auth"
          icon={KeyRound}
          rows={auth ? [{ key: auth.type || "Auth", value: auth.value || auth.description || "No token required" }] : []}
        />
        <KeyValueBlock title="Headers" icon={ShieldCheck} rows={headers} />
        <CodeBlock
          title="Body object"
          icon={FileJson}
          value={bodyObject}
          mutedText="No body sample is configured for this API yet."
          tone="orange"
        />
        <CodeBlock
          title="Response object"
          icon={Send}
          value={hasSent ? responseText : ""}
          mutedText="Click Show response to display the static response object."
          tone="orange"
        />
        <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
          This panel does not call the backend. It shows the exact request objects and the sample response stored for this API.
        </div>
      </div>
    </motion.aside>
  );
}

function EmptyState({ title }) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full min-h-[28rem] overflow-hidden rounded-xl border border-input-border/80 bg-card-bg text-center shadow-[var(--shadow-soft)] xl:min-h-0"
    >
      <div className="flex items-center gap-2 border-b border-input-border/70 px-5 py-4 text-sm font-semibold text-theme-text">
        <Braces size={15} className="text-primary" />
        API response
      </div>
      <div className="p-6">
        <h2 className="mt-2 text-xl font-semibold text-theme-text">
          No API response for {title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-secondary-text">
          This section is informational. Select an API endpoint to explore a response payload.
        </p>
      </div>
    </motion.aside>
  );
}

export default function ApiResponseCard({ document, endpoint }) {
  const response = endpoint?.response;
  const formatted = response ? JSON.stringify(response, null, 2) : "";
  const isError = response?.success === false;

  if (document.visualGuide?.postman?.mode === "setup") {
    return <PostmanSetupPanel key={document.slug} document={document} />;
  }

  if (document.visualGuide?.postman) {
    return <CodeReferencePanel key={document.slug} document={document} endpoint={endpoint} />;
  }

  if (endpoint || document.requestExample || response) {
    return <CodeReferencePanel key={document.slug} document={document} endpoint={endpoint} />;
  }

  if (!response) return <EmptyState title={document.title} />;

  return (
    <motion.aside
      key={document.slug}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.24 }}
      className="relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-xl border border-[#263241] bg-[#0f1720] text-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.28)] xl:min-h-0"
    >
      <div className="shrink-0 border-b border-white/10 bg-[#111b27] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Braces size={15} className="text-[#ff6c37]" />
              Response object
            </p>
            <span className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${isError ? "bg-rose-500/12 text-rose-300" : "bg-emerald-500/12 text-emerald-300"}`}>
              {isError ? "Error" : "200 OK"}
            </span>
          </div>
          <CopyCodeButton value={formatted} label="Copy" />
        </div>
      </div>
      <div data-lenis-prevent="true" className="min-h-0 flex-1 overflow-y-auto p-4">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#080d14]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#111b27] px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-300">
              <Clock3 size={15} className="text-[#ff6c37]" />
              JSON
            </span>
          </div>
          <JsonLines value={response} dark />
        </section>
      </div>
    </motion.aside>
  );
}
