"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Box, CircleHelp, FileText, HandCoins, Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { MethodBadge, SearchBar } from "./Common";

const categoryIcons = [Box, CircleHelp, HandCoins, Repeat2];

export default function DocumentationLayout({
  groups,
  category,
  documents,
  activeSlug,
  backend,
  search,
  onSearch,
  onCategory,
  onDocument,
  children,
}) {
  const searchResults = search.trim()
    ? documents.all.filter((document) =>
        document.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : [];
  const router = useRouter();

  return (
    <div className="space-y-3 pb-10 xl:flex xl:h-full xl:flex-col xl:overflow-hidden xl:pb-0">
      <header className="relative z-20 shrink-0 rounded-xl border border-input-border/80 bg-card-bg px-3 py-2.5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-input-border bg-primary-bg text-theme-text transition hover:border-primary hover:text-primary"
              aria-label="Go back"
            >
              <ArrowLeft size={19} strokeWidth={2.2} />
            </button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
              <FileText size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-primary">
                Developer resources
              </p>
              <h1 className="truncate text-xl font-semibold text-theme-text">
                API documentation
              </h1>
            </div>
          </div>
          <div className="relative w-full lg:w-[22rem]">
            <SearchBar value={search} onChange={onSearch} />
            {search && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-xl border border-input-border bg-card-bg p-1 shadow-[var(--shadow)]">
                {searchResults.length ? (
                  searchResults.map((document) => (
                    <button
                      type="button"
                      key={document.slug}
                      onClick={() => onDocument(document.slug)}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-secondary-text transition hover:bg-primary/10 hover:text-theme-text"
                    >
                      {document.title}
                      <span className="ml-2 text-xs text-primary">
                        {document.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-sm text-secondary-text">
                    No documentation found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="shrink-0 rounded-xl border border-input-border/80 bg-card-bg p-2 shadow-[var(--shadow-soft)] xl:hidden">
        <div className="overflow-x-auto pb-1">
          <nav aria-label="API sections" className="flex min-w-max gap-2">
            {documents.current.map((document) => {
              const active = document.slug === activeSlug;
              const endpoint = backend[document.slug];
              return (
                <button
                  type="button"
                  key={document.slug}
                  onClick={() => onDocument(document.slug)}
                  className={`flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${active ? "border-primary bg-primary/12 text-theme-text" : "border-input-border bg-input-bg text-secondary-text hover:border-primary/55 hover:text-theme-text"}`}
                >
                  {document.title}
                  {(document.visualGuide?.postman?.method?.value || endpoint?.method) && <MethodBadge method={document.visualGuide?.postman?.method?.value || endpoint?.method} />}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      <div className="grid gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-[15rem_minmax(0,1fr)_27rem] xl:items-stretch xl:overflow-hidden">
        <aside className="hidden h-full min-h-0 flex-col overflow-hidden rounded-xl border border-input-border/80 bg-card-bg shadow-[var(--shadow-soft)] xl:flex">
          <div className="shrink-0 border-b border-input-border/70 px-3 py-2.5">
            <p className="text-xs font-semibold uppercase text-secondary-text">
              Reference
            </p>
            <p className="mt-1 text-sm font-semibold text-theme-text">
              API endpoints
            </p>
          </div>
          <nav data-lenis-prevent="true" className="min-h-0 flex-1 overflow-y-auto p-2">
            <div className="space-y-3">
              {groups.map((group, index) => {
                const Icon = categoryIcons[index] || Box;
                const groupDocuments = group.items
                  .map((slug) => documents.all.find((document) => document.slug === slug))
                  .filter(Boolean);
                const isGroupActive = category === group.title;

                return (
                  <section key={group.title} className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => onCategory(group.title)}
                      className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[12px] font-bold uppercase transition ${isGroupActive ? "bg-primary/10 text-primary" : "text-secondary-text hover:bg-input-bg hover:text-theme-text"}`}
                    >
                      <Icon size={15} />
                      {group.title}
                    </button>
                    <div className="space-y-1 pl-2">
                      {groupDocuments.map((document) => {
                        const active = document.slug === activeSlug;
                        const endpoint = backend[document.slug];
                        return (
                          <motion.button
                            layout
                            type="button"
                            key={document.slug}
                            onClick={() => onDocument(document.slug)}
                            className={`group flex w-full items-start gap-1.5 rounded-md border px-2 py-1.5 text-left text-[14px] leading-4 transition ${active ? "border-primary bg-primary/10 text-theme-text" : "border-transparent text-secondary-text hover:border-input-border hover:bg-input-bg hover:text-theme-text"}`}
                          >
                            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-primary" : "bg-secondary-text/40 group-hover:bg-primary/70"}`} />
                            <span className="flex min-w-0 flex-1 items-start justify-between gap-1.5">
                              <span className="block min-w-0 flex-1 whitespace-normal break-words leading-4">{document.title}</span>
                              {endpoint?.method && (
                                <span className="mt-0.5 shrink-0">
                                  <MethodBadge method={endpoint.method} />
                                </span>
                              )}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </nav>
        </aside>
        {children}
      </div>
    </div>
  );
}
