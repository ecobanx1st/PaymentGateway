import Image from "next/image";
import {
  BellRing,
  CreditCard,
  FileText,
  QrCode,
  Route,
  Send,
} from "lucide-react";
import MerchantLink from "./MerchantLink";
import { useState } from "react";

const cardDetails = {
  "Payment Buttons": {
    eyebrow: "Checkout launchers",
    motto:
      "Turn product pages, donations, and hosted checkout flows into quick payment entry points.",
    accent: "#8b5cf6",
    softAccent: "rgba(139, 92, 246, 0.16)",
    Icon: CreditCard,
    chips: ["Buttons", "HTML", "Examples"],
  },
  APIs: {
    eyebrow: "Developer connection",
    motto:
      "Keep merchant systems synced with payment events, notifications, and integration docs.",
    accent: "#22d3ee",
    softAccent: "rgba(34, 211, 238, 0.14)",
    Icon: BellRing,
    chips: ["IPN", "Events", "Docs"],
  },
  "Invoice Builder": {
    eyebrow: "Request builder",
    motto:
      "Create shareable payment requests that are easy to send, track, and reconcile.",
    accent: "#f59e0b",
    softAccent: "rgba(245, 158, 11, 0.14)",
    Icon: FileText,
    chips: ["Invoices", "Requests", "Tracking"],
  },
  "Point of Sale Tools": {
    eyebrow: "Counter checkout",
    motto:
      "Generate POS-ready links, QR utilities, and in-person payment examples for terminals.",
    accent: "#34d399",
    softAccent: "rgba(52, 211, 153, 0.14)",
    Icon: QrCode,
    chips: ["QR", "Card", "Terminal"],
  },
};

function getCardDetail(title) {
  return cardDetails[title] || cardDetails["Payment Buttons"];
}

function MerchantIdentityMark({ title, icon, detail }) {
  const Icon = detail.Icon;

  if (title === "Point of Sale Tools") {
    return <PosIdleTerminal detail={detail} />;
  }

  return (
    <div className="flex flex-1 items-center justify-center py-5">
      <div className="relative flex aspect-[4/5] w-full max-w-[190px] items-center justify-center rounded-lg border border-white/10 bg-[#2f3030] shadow-[0_24px_50px_rgba(0,0,0,0.26)]">
        <div className="absolute inset-3 rounded-lg border border-white/5 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_52%)]" />
        <div
          className="absolute inset-x-10 top-10 h-32 blur-2xl"
          style={{
            background: `linear-gradient(180deg, ${detail.softAccent}, transparent)`,
          }}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-lg border border-white/10 bg-[#17181b] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Image
            src={icon}
            alt=""
            width={54}
            height={54}
            className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
          />
        </div>
        <Icon
          aria-hidden="true"
          size={34}
          strokeWidth={1.7}
          className="absolute bottom-8 right-8 opacity-80"
          style={{ color: detail.accent }}
        />
      </div>
    </div>
  );
}

function PosIdleTerminal({ detail }) {
  return (
    <div className="flex flex-1 items-center justify-center py-3">
      <div className="w-full max-w-[210px] rounded-[22px] bg-[#202425] p-2.5 shadow-[0_24px_50px_rgba(0,0,0,0.28)]">
        <div className="mx-auto mb-2 h-16 w-[78%] rounded-lg border border-black/30 bg-[linear-gradient(180deg,#424646_0%,#252828_100%)] p-2 shadow-inner">
          <div className="flex h-full items-center justify-center rounded-md border border-black/50 bg-[linear-gradient(180deg,#202524_0%,#0d100f_100%)]">
            <span className="text-[11px] font-black uppercase text-white">
              HASH<span style={{ color: detail.accent }}>PAY</span>
            </span>
          </div>
        </div>
        <div className="mb-2 rounded-md border border-black/50 bg-[#151819] p-1.5">
          <div className="h-1.5 rounded-full bg-[#d9d0bd]" />
        </div>
        <div className="overflow-hidden rounded-lg border border-black/60 bg-[#111016]">
          <div className="flex h-5 items-center justify-between bg-white px-2">
            <span className="h-1.5 w-4 rounded-sm border border-[#111827]/60" />
            <span className="h-2.5 w-3 rounded-sm bg-[#111827]/70" />
          </div>
          <div className="grid grid-cols-2 border-b border-[#3b1d68] text-[10px] font-black uppercase">
            <span className="flex h-8 items-center justify-center gap-1 text-primary">
              <QrCode size={11} />
              QR
            </span>
            <span className="flex h-8 items-center justify-center gap-1 bg-primary text-white">
              <CreditCard size={11} />
              Card
            </span>
          </div>
          <div className="px-3 py-4 text-right">
            <div className="flex items-center justify-between gap-2 text-left">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase text-primary">
                ORD-4829
              </span>
              <span className="text-[9px] font-semibold text-secondary-text">
                POS-01
              </span>
            </div>
            <p className="mt-3 text-2xl font-light tracking-normal text-primary">
              $50.00
            </p>
          </div>
          <div className="grid grid-cols-3 border-t border-l border-[#3b1d68] text-xs text-theme-text">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <span
                key={key}
                className="flex h-8 items-center justify-center border-r border-b border-[#3b1d68]"
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MerchantCard({
  title,
  description,
  icon,
  links = [],
  className = "",
  onLinkClick,
}) {
  const detail = getCardDetail(title);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <article
      className={`group relative overflow-hidden rounded-lg border border-input-border/70 bg-card-bg p-5 shadow-[0_18px_46px_rgba(0,0,0,0.14)] transition-colors duration-300 hover:border-primary/45 focus-within:border-primary/45 sm:p-6 ${className}`}
      style={{
        "--merchant-accent": detail.accent,
        "--merchant-accent-soft": detail.softAccent,
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--merchant-accent-soft),transparent_42%,rgba(255,255,255,0.03))]" />

      <div className="relative z-10 md:min-h-[370px]">
        <div className="flex h-full flex-col transition duration-300 md:absolute md:inset-0 md:group-hover:scale-[0.97] md:group-hover:opacity-0 md:group-focus-within:scale-[0.97] md:group-focus-within:opacity-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="text-xs font-black uppercase tracking-normal"
                style={{ color: detail.accent }}
              >
                {detail.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-normal text-theme-text">
                {title}
              </h2>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-input-border bg-input-bg">
              <Image
                src={icon}
                alt={title}
                width={28}
                height={28}
                className="object-contain"
              />
            </span>
          </div>

          <MerchantIdentityMark title={title} icon={icon} detail={detail} />

          <div>
            <p className="text-sm leading-6 text-secondary-text">
              {detail.motto || description}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {detail.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-input-border bg-input-bg px-3 py-1 text-[11px] font-bold uppercase text-secondary-text"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="mt-6 flex h-full flex-col rounded-lg border border-input-border/80 bg-primary-bg/95 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.18)] transition duration-300 md:absolute md:inset-0 md:mt-0 md:translate-y-5 md:opacity-0 md:pointer-events-none md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto sm:p-5"> */}
        <div
          className={`mt-6 flex h-full flex-col rounded-lg border border-input-border/80 bg-primary-bg/95 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.18)] transition duration-300
  ${
    isOpen
      ? "translate-y-0 opacity-100 pointer-events-auto"
      : "translate-y-5 opacity-0 pointer-events-none"
  }
  md:absolute md:inset-0 md:mt-0
  md:group-hover:translate-y-0
  md:group-hover:opacity-100
  md:group-hover:pointer-events-auto
  md:group-focus-within:translate-y-0
  md:group-focus-within:opacity-100
  md:group-focus-within:pointer-events-auto
  sm:p-5`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-input-border pb-4">
            <div className="min-w-0">
              <p
                className="text-xs font-black uppercase tracking-normal"
                style={{ color: detail.accent }}
              >
                Available menus
              </p>
              <h3 className="mt-2 text-xl font-black text-theme-text">
                {title}
              </h3>
            </div>
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ background: detail.accent }}
            >
              <Route size={18} />
            </span>
          </div>

          <div
            data-lenis-prevent="true"
            className="mt-4 grid gap-2 overflow-y-auto pr-1 sm:grid-cols-2"
          >
            {links.map((link) => (
              <MerchantLink
                key={link.label}
                href={link.href}
                label={link.label}
                onClick={(event) => onLinkClick?.(link, event)}
              />
            ))}
          </div>

          <div className="mt-auto hidden items-center gap-2 pt-4 text-xs font-semibold text-secondary-text md:flex">
            <Send size={14} style={{ color: detail.accent }} />
            <span>
              {links.length} menu{links.length === 1 ? "" : "s"} ready
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
