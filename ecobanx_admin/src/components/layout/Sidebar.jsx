"use client";

import { withBasePath } from "@/config/basePath";
import { PAGE_ROUTES, SIDEBAR_SECTIONS } from "@/config/routes";
import { clearAuthStorage } from "@/lib/axiosInterceptor";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRightIcon,
  ArrowUpFromLine,
  Bell,
  ChartColumnIncreasing,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Percent,
  Radar,
  ReceiptText,
  RotateCcw,
  Settings,
  ShieldCheck,
  Store,
  Tags,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  WalletCards,
  WrenchIcon,
} from "lucide-react";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

const iconMap = {
  api: WrenchIcon,
  bell: Bell,
  customers: Users,
  dashboard: LayoutDashboard,
  merchants: Store,
  payment: CreditCard,
  refund: RotateCcw,
  reports: ChartColumnIncreasing,
  roles: UserCog,
  settings: Settings,
  settlements: WalletCards,
  shield: ShieldCheck,
  support: MessageSquare,
  supportCategory: Tags,
  transactions: ArrowLeftRightIcon,
  network: Radar,
  assets: Wallet,
  withdrawfee: Percent,
  payin: ArrowDownToLine,
  payout: ArrowUpFromLine,
  deposit: WalletCards,
  withdraw: Wallet,
  invoice: ReceiptText,
  ipnhistory: History,
  kyb: UserCheck,
  logout: LogOut,
  fraud: AlertTriangle,
};

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function shouldShowBadge(badge) {
  return badge !== undefined && badge !== null && String(badge) !== "" && String(badge) !== "0";
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  notificationCount = 0,
  onCloseMobile,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showLabels = !collapsed || mobileOpen;
  const compact = collapsed && !mobileOpen;

  function handleItemClick(event, item) {
    if (item.label !== "Logout") {
      onCloseMobile?.();
      return;
    }

    event.preventDefault();
    clearAuthStorage();
    onCloseMobile?.();
    router.replace("/auth/login");
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-[90] bg-black/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={joinClasses(
          "fixed inset-y-0 left-0 z-[100] flex bg-bg-primary transition-all duration-300 lg:static lg:z-auto",
          collapsed ? "lg:w-20" : "lg:w-70",
          mobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex min-h-full w-full flex-col border-r border-input-border/40 px-3 py-4">
          <div className="mb-5 flex h-10 items-center justify-between gap-3 px-1">
            <Link
              href="/"
              className={joinClasses(
                "flex w-40 items-center gap-2",
                compact && "w-9 justify-center",
              )}
            >
              <Image
                src={compact ? withBasePath("/logo.png") : withBasePath("/Loginlogo.png")}
                alt="Eco Banx logo"
                width={compact ? 43 : 496}
                height={compact ? 30 : 105}
                className={joinClasses(
                  "shrink-0 object-contain",
                  compact ? "h-9 w-9" : "h-auto w-40",
                )}
                priority
              />
            </Link>
            {showLabels && (
              <span className="rounded-[8px] bg-text-primary/15 px-2 py-1 text-[10px] font-semibold uppercase text-text-primary">
                Admin
              </span>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-2">
                {showLabels && (
                  <p className="px-3 text-mid font-normal uppercase text-text-secondary/50">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const ItemIcon = iconMap[item.icon] ?? LayoutDashboard;
                    const badge = item.href === PAGE_ROUTES.notifications.href
                      ? notificationCount
                      : item.badge;
                    const showBadge = shouldShowBadge(badge);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={compact ? item.label : undefined}
                        onClick={(event) => handleItemClick(event, item)}
                        className={joinClasses(
                          "group relative flex h-9 items-center gap-3 rounded-[8px] px-3 text-large font-semibold transition duration-200",
                          active
                            ? "[background:var(--nav-selected)] text-text-primary"
                            : "text-text-secondary hover:bg-input-bg hover:text-theme-text",
                          compact && "justify-center px-0",
                          item.label === "Logout" &&
                            "!text-red-400 hover:!bg-red-500/10 hover:!text-red-300",
                        )}
                      >
                        <ItemIcon className="h-4 w-4 shrink-0" />
                        {showLabels && (
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                        )}
                        {showLabels && showBadge && (
                          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                            {badge}
                          </span>
                        )}
                        {compact && showBadge && (
                          <span className="absolute right-2 top-1 grid h-3 min-w-3 place-items-center rounded-full bg-red-500 px-0.5 text-[8px] font-semibold leading-none text-white">
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
