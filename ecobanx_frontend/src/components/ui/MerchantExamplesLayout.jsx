"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "@/components/ui/button";
import MerchantToolPageHeader from "@/components/ui/MerchantToolPageHeader";

function RequiredBadge({ required }) {
  return (
    <span className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${required ? "bg-primary/10 text-primary" : "bg-secondary-bg text-secondary-text"}`}>
      {required ? "Yes" : "No"}
    </span>
  );
}

function fieldRowsFromField(field) {
  if (field.type === "buttonPreview") {
    return [{
      name: field.label,
      key: field.generatedFieldName,
      description: field.description,
      required: false,
      format: field.format,
      example: field.example,
    }];
  }

  if (field.type === "currencyAmount") {
    const currencyLabel = field.currencyId === "cryptoCurrency" ? "Crypto Currency" : "Fiat Currency";
    return [
      {
        name: field.label,
        key: field.generatedFieldName,
        description: field.description,
        required: Boolean(field.required),
        format: field.format,
        example: field.example,
      },
      {
        name: currencyLabel,
        key: field.currencyGeneratedFieldName,
        description: `Currency paired with ${field.label.toLowerCase()}.`,
        required: Boolean(field.required),
        format: "Supported currency code",
        example: field.currencyOptions?.[0]?.value || "USD",
      },
    ];
  }

  return [{
    name: field.label,
    key: field.generatedFieldName,
    description: field.description,
    required: Boolean(field.required),
    format: field.format,
    example: field.example,
  }];
}

function FieldDescriptionTable({ fields }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[16px] border border-input-border bg-primary-bg lg:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-input-bg text-xs uppercase tracking-[0.08em] text-secondary-text">
            <tr>
              <th className="w-[18%] px-4 py-3">Field</th>
              <th className="w-[30%] px-4 py-3">Description</th>
              <th className="w-[12%] px-4 py-3">Required?</th>
              <th className="w-[20%] px-4 py-3">Expected Format</th>
              <th className="w-[20%] px-4 py-3">Example Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input-border/70">
            {fields.map((field) => (
              <tr key={`${field.key}-${field.name}`} className="align-top transition hover:bg-input-bg/50">
                <td className="px-4 py-4 font-semibold text-theme-text">
                  <span>{field.name}</span>
                  <code className="mt-1 block break-words text-xs font-medium text-primary-text">{field.key}</code>
                </td>
                <td className="px-4 py-4 leading-6 text-secondary-text">{field.description}</td>
                <td className="px-4 py-4"><RequiredBadge required={field.required} /></td>
                <td className="px-4 py-4 leading-6 text-secondary-text">{field.format}</td>
                <td className="px-4 py-4"><code className="break-words rounded-[8px] bg-input-bg px-2 py-1 text-xs text-theme-text">{field.example}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid min-w-0 gap-3 lg:hidden">
        {fields.map((field) => (
          <article key={`${field.key}-${field.name}`} className="min-w-0 rounded-[16px] bg-primary-bg p-3 sm:p-4">
            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-theme-text">{field.name}</h3>
                <code className="mt-1 block max-w-full break-all text-xs text-primary-text">{field.key}</code>
              </div>
              <RequiredBadge required={field.required} />
            </div>
            <p className="mt-3 break-words text-sm leading-6 text-secondary-text">{field.description}</p>
            <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">Format</p>
                <p className="mt-1 break-words text-sm text-theme-text">{field.format}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary-text">Example</p>
                <code className="mt-1 block max-w-full break-all rounded-[8px] bg-input-bg px-2 py-1 text-xs text-theme-text">{field.example}</code>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function FieldDescriptionSection({ section, query }) {
  const rows = section.fields.flatMap(fieldRowsFromField).filter((field) => {
    const haystack = `${field.name} ${field.key} ${field.description} ${field.format} ${field.example}`.toLowerCase();
    return haystack.includes(query);
  });

  if (!rows.length) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-theme-text">{section.title}</h2>
        {section.description ? <p className="mt-1 text-sm leading-6 text-secondary-text">{section.description}</p> : null}
      </div>
      <FieldDescriptionTable fields={rows} />
    </section>
  );
}

export default function MerchantExamplesLayout({ config }) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const resultCount = useMemo(() => {
    return config.sections.reduce((count, section) => {
      return count + section.fields.flatMap(fieldRowsFromField).filter((field) => {
        const haystack = `${field.name} ${field.key} ${field.description} ${field.format} ${field.example}`.toLowerCase();
        return haystack.includes(query);
      }).length;
    }, 0);
  }, [config.sections, query]);

  return (
    <div className="min-w-0 space-y-6 pb-8">
      <MerchantToolPageHeader
        title={config.examplesTitle}
        description={config.examplesDescription}
        icon={BookOpen}
        backHref={config.makerHref}
        backLabel={`Back to ${config.title}`}
        actions={(
          <Link href={config.makerHref} className="w-full sm:w-auto">
            <Button value={`Open ${config.title}`} variant="primary" rightIcon={<ArrowRight size={16} />} className="w-full border-0 text-white sm:w-auto" />
          </Link>
        )}
      />

      <section className="min-w-0 rounded-[16px] bg-primary-bg p-4 sm:p-5">
        <p className="text-sm leading-6 text-secondary-text">{config.intro}</p>
      </section>

      <div className="relative max-w-xl min-w-0">
        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search fields, formats, or examples"
          className="h-11 w-full rounded-full border-0 bg-input-bg pl-11 pr-4 text-sm text-theme-text outline-none transition placeholder:text-secondary-text focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-7">
        {config.sections.map((section) => (
          <FieldDescriptionSection key={section.title} section={section} query={query} />
        ))}
      </div>

      {resultCount === 0 ? (
        <div className="rounded-[16px] bg-primary-bg p-6 text-sm text-secondary-text">
          No matching fields found.
        </div>
      ) : null}

      <div className="flex justify-center pt-2">
        <Link href={config.makerHref} className="w-full max-w-3xl">
          <Button value={`Open ${config.title}`} variant="primary" rightIcon={<ArrowRight size={16} />} className="w-full border-0 text-white" />
        </Link>
      </div>
    </div>
  );
}
