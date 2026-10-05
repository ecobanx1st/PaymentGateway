"use client";

import { useMemo, useState } from "react";
import {
  API_DOCUMENTATION_BACKEND,
  API_DOCUMENTATION_DATA,
  API_DOCUMENTATION_GROUPS,
} from "./data";
import ApiResponseCard from "./components/ApiResponseCard";
import DocumentationLayout from "./components/DocumentationLayout";
import EndpointSection from "./components/EndpointSection";

export default function ApiDocumentationPage() {
  const [activeCategory, setActiveCategory] = useState(
    API_DOCUMENTATION_GROUPS[0].title,
  );
  const [activeSlug, setActiveSlug] = useState("introduction");
  const [search, setSearch] = useState("");

  const currentDocuments = useMemo(
    () =>
      API_DOCUMENTATION_DATA.filter(
        (document) => document.category === activeCategory,
      ),
    [activeCategory],
  );
  const document =
    API_DOCUMENTATION_DATA.find((item) => item.slug === activeSlug) ||
    currentDocuments[0];
  const endpoint = API_DOCUMENTATION_BACKEND[document.slug];

  const selectDocument = (slug) => {
    const nextDocument = API_DOCUMENTATION_DATA.find(
      (item) => item.slug === slug,
    );
    if (!nextDocument) return;
    setActiveCategory(nextDocument.category);
    setActiveSlug(slug);
    setSearch("");
  };
  const selectCategory = (category) => {
    const firstDocument = API_DOCUMENTATION_DATA.find(
      (item) => item.category === category,
    );
    setActiveCategory(category);
    setActiveSlug(firstDocument?.slug || "introduction");
  };

  return (
    <DocumentationLayout
      groups={API_DOCUMENTATION_GROUPS}
      category={activeCategory}
      documents={{ current: currentDocuments, all: API_DOCUMENTATION_DATA }}
      activeSlug={document.slug}
      backend={API_DOCUMENTATION_BACKEND}
      search={search}
      onSearch={setSearch}
      onCategory={selectCategory}
      onDocument={selectDocument}
    >
      <main data-lenis-prevent="true" className="min-w-0 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-1">
        <EndpointSection document={document} endpoint={endpoint} />
      </main>
      <aside className="min-w-0 xl:h-full xl:min-h-0">
        <ApiResponseCard document={document} endpoint={endpoint} />
      </aside>
    </DocumentationLayout>
  );
}
