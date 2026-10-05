"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CircleHelp,
  CreditCard,
  KeyRound,
  Minus,
  Plus,
  Search,
  Shield,
  Wallet,
  Webhook,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Skeleton from "@/components/ui/skeleton";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "getting-started", label: "Getting Started" },
  { id: "payments", label: "Payments" },
  { id: "payouts", label: "Payouts" },
  { id: "api-webhooks", label: "API & Webhooks" },
  { id: "security", label: "Security" },
];

const FAQS = [
  {
    id: "live-account-approval",
    category: "getting-started",
    title: "How long does it take to get approved for a live account?",
    description:
      "Most Starter and Growth accounts are reviewed and approved within 1-2 business days after documents are submitted.",
    answer:
      "Most Starter and Growth accounts are reviewed and approved within 1-2 business days after your identity, business, and bank details are submitted. If anything is missing, the review may pause until the requested document is uploaded.",
    featured: false,
    popular: false,
    icon: BookOpen,
  },
  {
    id: "refunds-work",
    category: "payments",
    title: "How do refunds work?",
    description:
      "Full and partial refund timing, fees, and customer notifications.",
    answer:
      "Refunds can be issued as full or partial reversals from the transaction detail view. The refunded amount is sent back to the original payment method, and the customer receives a notification once the refund is accepted by the network.",
    featured: true,
    popular: true,
    icon: CreditCard,
  },
  {
    id: "verify-webhook-signatures",
    category: "api-webhooks",
    title: "Verifying webhook signatures",
    description: "Step-by-step guide to validating Eco Banx webhook payloads.",
    answer:
      "Use the signing secret from the webhook settings page and compute the HMAC for each payload. Compare the result against the signature header before processing the event. Reject the request if the signature does not match.",
    featured: true,
    popular: true,
    icon: Webhook,
  },
  {
    id: "payout-delayed",
    category: "payouts",
    title: "Why was my payout delayed?",
    description:
      "Common reasons for settlement delays and how to resolve them.",
    answer:
      "Payouts can be delayed because of bank holidays, account verification checks, risk reviews, or receiving requests after the daily settlement cutoff. If the payout remains pending longer than expected, review the payout timeline or contact support.",
    featured: true,
    popular: true,
    icon: Wallet,
  },
  {
    id: "rotate-api-keys",
    category: "security",
    title: "How do I rotate my API keys safely?",
    description:
      "Create a new key, test it, then retire the old one without downtime.",
    answer:
      "Generate a new API key, update your live integration to use it, verify that requests succeed, and then revoke the old key. This prevents service interruption while keeping the rotation process secure.",
    featured: false,
    popular: false,
    icon: KeyRound,
  },
  {
    id: "exceed-processing-limit",
    category: "payments",
    title: "What happens if I exceed my processing limit?",
    description:
      "Request increases, retry behavior, and temporary hold details.",
    answer:
      "If your account reaches its processing limit, new payment attempts may be paused or declined until the limit is increased. You can request a higher limit from the dashboard by completing the required risk and volume review steps.",
    featured: false,
    popular: false,
    icon: CreditCard,
  },
  {
    id: "multiple-bank-accounts",
    category: "payouts",
    title: "Can I have multiple settlement bank accounts?",
    description: "Add, verify, and assign bank accounts by business or region.",
    answer:
      "Yes. You can add multiple settlement bank accounts and assign them per merchant profile or region. Each account must complete verification before it is used for payout settlement.",
    featured: false,
    popular: false,
    icon: Wallet,
  },
  {
    id: "enable-2fa",
    category: "security",
    title: "How do I enable 2FA for my account?",
    description:
      "Turn on two-factor authentication and store backup codes securely.",
    answer:
      "Open Security settings, enable two-factor authentication, scan the QR code in your authenticator app, and confirm the one-time code. After activation, download or copy the backup codes and store them safely.",
    featured: true,
    popular: true,
    icon: Shield,
  },
  {
    id: "webhook-failure",
    category: "api-webhooks",
    title: "What happens if a webhook delivery fails?",
    description:
      "Retry rules, backoff timing, and how to inspect failed events.",
    answer:
      "Failed webhook deliveries are retried automatically using exponential backoff. You can inspect the error response, re-send an event manually, or mark the endpoint as inactive if repeated failures occur.",
    featured: false,
    popular: false,
    icon: Webhook,
  },
  {
    id: "add-team-members",
    category: "getting-started",
    title: "How do I add team members to the workspace?",
    description: "Invite teammates and control permissions from one place.",
    answer:
      "Open your account settings, choose Team members, and send an invitation email. You can assign roles and permissions before the invite is accepted, and revoke access at any time.",
    featured: false,
    popular: false,
    icon: CircleHelp,
  },
  {
    id: "settlement-banks",
    category: "payouts",
    title: "How do I change my settlement bank account?",
    description:
      "Update the payout destination without interrupting settlements.",
    answer:
      "Add the new bank account, complete verification, and set it as the primary settlement destination. Existing pending payouts will continue to follow the current schedule until the change takes effect.",
    featured: false,
    popular: false,
    icon: Wallet,
  },
];

function categoryLabel(categoryId) {
  return CATEGORIES.find((item) => item.id === categoryId)?.label ?? "All";
}

function FaqCard({ faq, onOpen }) {
  const Icon = faq.icon ?? CircleHelp;

  return (
    <button
      type="button"
      onClick={() => onOpen(faq.id)}
      style={{ background: "var(--cardbg)" }}
      className="group flex h-full w-full flex-col rounded-[18px] border border-input-border/80  p-4 text-left shadow-[0_18px_42px_rgba(8,19,12,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_20px_50px_rgba(8,19,12,0.12)] focus:outline-none"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-text/10 px-2.5 py-1 text-[11px] font-semibold text-primary-text">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-text" />
        Popular
      </span>

      <div className="mt-4 flex items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-tight text-theme-text transition group-hover:text-primary-text">
            {faq.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-secondary-text">
            {faq.description}
          </p>
        </div>
      </div>
    </button>
  );
}

function FaqAccordionItem({ faq, open, onToggle }) {
  const buttonId = `faq-button-${faq.id}`;
  const panelId = `faq-panel-${faq.id}`;

  return (
    <div className="border-b border-input-border last:border-b-0">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(faq.id)}
        className="group flex w-full items-center cursor-pointer justify-between gap-4 px-0 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <span className="min-w-0 text-sm font-semibold text-text sm:text-[0.98rem]">
          {faq.title}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-input-bg text-primary-text transition hover:bg-secondary-bg">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-6 text-secondary-text">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);


  const [activeCategory, setActiveCategory] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);
  const accordionRef = useRef(null);
  const tabRefs = useRef([]);

  const normalizedSearch = searchValue.trim().toLowerCase();

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        [faq.title, faq.description, faq.answer]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, normalizedSearch]);

  const featuredFaqs = useMemo(() => {
    const featured = filteredFaqs.filter((faq) => faq.featured);
    return featured.length ? featured.slice(0, 3) : filteredFaqs.slice(0, 3);
  }, [filteredFaqs]);

  const visibleOpenFaqId = filteredFaqs.some((faq) => faq.id === openFaqId)
    ? openFaqId
    : filteredFaqs[0]?.id ?? null;

  const handleTabKeyDown = (event, index) => {
    let nextIndex = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % CATEGORIES.length;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = CATEGORIES.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const nextCategory = CATEGORIES[nextIndex];
    setActiveCategory(nextCategory.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleOpenFaq = (faqId) => {
    setOpenFaqId(faqId);
    requestAnimationFrame(() => {
      accordionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const clearSearch = () => setSearchValue("");

  const resetFilters = () => {
    setActiveCategory("all");
    setSearchValue("");
  };

  const noResults = !filteredFaqs.length;
  const activeCategoryLabel = categoryLabel(activeCategory);


  if (loading) {
    return <Skeleton pageName="faq" />;
  }
  return (
    <div className="space-y-6 pb-6">
      <PageTopBanner
        title="FAQ & Knowledge Base"
        description="Find answers about payments, payouts, security and integration"
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(17rem,0.78fr)_minmax(0,2.22fr)] xl:items-start">
        <aside className="space-y-4 xl:sticky xl:top-0 xl:self-start">
          <section
            className="rounded-[18px] border border-input-border/80 p-3 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-4"
            style={{ background: "var(--cardbg)" }}
          >
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search articles"
              rounded="rounded-full"
              leftElement={<Search size={16} />}
              rightElement={
                searchValue ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="mr-2 inline-flex h-7 items-center justify-center rounded-full px-2 text-xs font-semibold text-secondary-text transition hover:bg-secondary-bg"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                ) : null
              }
              inputClassName="h-11 text-sm"
            />
          </section>

          <section
            role="tablist"
            aria-label="FAQ categories"
            aria-orientation="vertical"
            className="rounded-[18px] border border-input-border/80 p-3 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-4"
            style={{ background: "var(--cardbg)" }}
          >
            <p className="mb-3 px-1 text-sm font-semibold text-theme-text">
              Filter questions
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((category, index) => {
                const active = category.id === activeCategory;

                return (
                  <button
                    key={category.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveCategory(category.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={`relative z-10 flex w-full items-center rounded-[10px] px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
                      active
                        ? "text-primary-text"
                        : "text-secondary-text hover:bg-secondary-bg hover:text-text"
                    }`}
                  >
                    {active ? (
                      <>
                        <motion.div
                          layoutId="faqFilterBg"
                          className="absolute inset-0 -z-10 rounded-[10px] bg-primary/10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                        <motion.span
                          layoutId="faqFilterIndicator"
                          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-primary-text -z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      </>
                    ) : null}
                    {category.label}
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-4">
          {noResults ? (
            <section
              className="rounded-[18px] border border-input-border/80 p-8 text-center shadow-[0_18px_42px_rgba(8,19,12,0.08)]"
              style={{ background: "var(--surface-strong)" }}
            >
              <h2 className="text-lg font-semibold text-text">
                No matching help articles
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-secondary-text">
                Try a different keyword or reset the filters to browse all
                categories.
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  onClick={resetFilters}
                  className="border-input-border bg-input-bg text-text hover:border-primary hover:text-primary"
                >
                  Reset filters
                </Button>
              </div>
            </section>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {featuredFaqs.map((faq) => (
                  <FaqCard key={faq.id} faq={faq} onOpen={handleOpenFaq} />
                ))}
              </section>

              <section
                ref={accordionRef}
                className="rounded-[18px] border border-input-border/80 bg-primary-bg p-4 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-text">
                      Frequently asked questions
                    </h2>
                    <p className="mt-1 text-sm text-secondary-text">
                      {activeCategory === "all"
                        ? "Browse the full knowledge base"
                        : `Showing ${activeCategoryLabel} articles`}
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Updated answers
                  </span>
                </div>

                <div className="divide-y divide-border-light">
                  {filteredFaqs.map((faq) => (
                    <FaqAccordionItem
                      key={faq.id}
                      faq={faq}
                      open={visibleOpenFaqId === faq.id}
                      onToggle={setOpenFaqId}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
