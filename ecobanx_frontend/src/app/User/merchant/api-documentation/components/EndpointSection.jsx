"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { MethodBadge } from "./Common";

function getEndpointText(endpoint, document) {
  const visualEndpoint = document.visualGuide?.postman?.endpoint?.value;
  return visualEndpoint || endpoint?.url || "";
}

function getResponseValue(document, endpoint) {
  return document.visualGuide?.postman?.response || endpoint?.response || document.responseExample || null;
}

function getBodyRows(document) {
  return document.visualGuide?.fields || document.parameters || [];
}

function CompactFlow({ steps = [] }) {
  if (!steps.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-theme-text">Overview</h3>
      <div className="rounded-xl border border-input-border bg-card-bg">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="border-b border-input-border px-4 py-3 last:border-b-0"
          >
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-theme-text">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-secondary-text">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BodyParams({ rows = [] }) {
  if (!rows.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-theme-text">Body Params</h3>
      <div className="overflow-hidden rounded-xl border border-input-border bg-card-bg">
        {rows.map((row) => (
          <div
            key={row.field}
            className="grid gap-3 border-b border-input-border px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_9rem]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <code className="text-sm font-semibold text-theme-text">{row.field}</code>
                <span className="text-xs text-secondary-text">{row.type || "string"}</span>
                <span className={`text-xs ${row.required ? "text-rose-500" : "text-secondary-text"}`}>
                  {row.required ? "required" : "optional"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary-text">
                {row.description}
              </p>
            </div>
            <input
              readOnly
              aria-label={`${row.field} example input`}
              value={row.example || ""}
              className="h-9 rounded-md border border-input-border bg-input-bg px-3 text-sm text-secondary-text outline-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function ResponseExplained({ items = [], response }) {
  if (!items.length && !response) return null;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-theme-text">
          Response explained
        </h3>
        <p className="mt-2 text-sm leading-6 text-secondary-text">
          The following fields are returned when the request is processed.
        </p>
      </div>

      {items.length ? (
        <div className="overflow-hidden rounded-xl border border-input-border bg-card-bg">
          <div className="grid grid-cols-[8rem_minmax(0,1fr)] bg-input-bg px-4 py-3 text-xs font-semibold uppercase text-secondary-text">
            <span>Field</span>
            <span>Description</span>
          </div>
          {items.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[8rem_minmax(0,1fr)] border-t border-input-border px-4 py-3"
            >
              <code className="w-fit rounded bg-secondary-bg px-1.5 py-0.5 text-xs font-semibold text-theme-text">
                {item.label}
              </code>
              <p className="text-sm leading-6 text-secondary-text">{item.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      {response ? (
        <div className="overflow-hidden rounded-xl border border-[#2a3038] bg-[#14191f] text-slate-100">
          <div className="border-b border-slate-700 bg-[#10141a] px-4 py-3">
            <span className="border-b-2 border-blue-400 px-2 pb-3 text-xs font-semibold text-blue-300">
              JSON
            </span>
          </div>
          <pre className="max-h-[28rem] overflow-auto p-5 font-mono text-xs leading-6 text-slate-100">
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        </div>
      ) : null}
    </section>
  );
}

function SetupContent({ document }) {
  const guide = document.visualGuide;

  return (
    <div className="space-y-9">
      <CompactFlow steps={guide?.flow} />
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-theme-text">Before you call APIs</h3>
        <div className="rounded-xl border border-input-border bg-card-bg p-4">
          <p className="text-sm leading-6 text-secondary-text">
            Create the Postman environment values shown in the right panel. Protected APIs use the access token, timestamp, nonce, and signature values from that setup.
          </p>
          <div className="mt-4 flex gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm leading-6 text-amber-700 dark:text-amber-100">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            Keep the secret key on your server and do not expose it in browser code.
          </div>
        </div>
      </section>
    </div>
  );
}

function ApiContent({ document, endpoint }) {
  const guide = document.visualGuide;
  const response = getResponseValue(document, endpoint);
  const rows = getBodyRows(document);

  return (
    <div className="space-y-10">
      <BodyParams rows={rows} />
      <ResponseExplained items={guide?.responseMeaning || []} response={response} />
      {guide?.nextStep ? (
        <section className="rounded-xl border border-input-border bg-card-bg p-4">
          <div className="flex gap-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-theme-text">Next step</p>
              <p className="mt-1 text-sm leading-6 text-secondary-text">{guide.nextStep}</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SuppliedContent({ sections, endpoint }) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        if (section.backendKey) return null;

        return (
          <section
            key={`${section.heading || section.text}-${index}`}
            className="space-y-3"
          >
            {section.heading && (
              <h3 className="text-lg font-semibold text-theme-text">
                {section.heading}
              </h3>
            )}
            {section.text && (
              <p className="text-sm leading-6 text-secondary-text">
                {section.text}
              </p>
            )}
            {section.note && (
              <p className="text-sm font-semibold leading-6 text-theme-text">
                {section.note}
              </p>
            )}
            {section.rows && <BodyParams rows={section.rows} />}
            {section.bullets && (
              <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-secondary-text">
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
            {section.extraRows && <BodyParams rows={section.extraRows} />}
          </section>
        );
      })}
      <ResponseExplained response={endpoint?.response} />
    </div>
  );
}

export default function EndpointSection({ document, endpoint }) {
  const suppliedContent = document.contentSections;
  const endpointText = getEndpointText(endpoint, document);
  const methodText = document.visualGuide?.postman?.method?.value || endpoint?.method;
  const isSetup = document.visualGuide?.postman?.mode === "setup";

  return (
    <motion.article
      key={document.slug}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-xl border border-input-border/80 bg-card-bg px-4 py-5 shadow-[var(--shadow-soft)] sm:px-5"
    >
      <div className="border-b border-input-border pb-7">
        <h2 className="text-3xl font-semibold tracking-tight text-theme-text">
          {document.title}
        </h2>
        {endpointText ? (
          <div className="mt-4 flex min-w-0 items-center gap-4">
            {methodText && <MethodBadge method={methodText} />}
            <code className="min-w-0 break-all text-sm font-medium text-secondary-text">
              {endpointText}
            </code>
          </div>
        ) : null}
        {document.description && (
          <p className="mt-5 text-sm leading-6 text-secondary-text">
            {document.description}
          </p>
        )}
      </div>
      <div className="pt-8">
        {isSetup ? (
          <SetupContent document={document} />
        ) : (
          <ApiContent document={document} endpoint={endpoint} />
        )}
      </div>
    </motion.article>
  );
}
