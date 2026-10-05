"use client";

import { Button } from "@/components/ReusableUi";
import { withBasePath } from "@/config/basePath";
import { PAGE_LABELS } from "@/config/routes";
import { Bell, ChevronLeft, ChevronRight, Menu, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Topbar({
  collapsed,
  notificationCount = 0,
  onOpenMobile,
  onToggleCollapse,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const CollapseIcon = collapsed ? ChevronRight : ChevronLeft;
  const pageLabel = PAGE_LABELS[pathname] ?? "Settings";
  const hasNotifications = notificationCount > 0;


  return (
    <header className="sticky top-0 z-30 border-b border-input-border/40 bg-bg-primary px-4 py-3 lg:px-6">
      <div className="relative flex justify-between   items-center gap-3">
        <div  className="flex items-center gap-3">
          <Button
            variant="secondary"
            aria-label="Open sidebar"
            onClick={onOpenMobile}
            className="!grid !h-9 !w-9 !p-0 lg:!hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Link
            // href="/dashboard"
            href="/merchants"
            aria-label="Go to dashboard"
            className="absolute left-1/2 top-1/2 flex w-32 -translate-x-1/2 -translate-y-1/2 justify-center lg:hidden"
          >
            <Image
              src={withBasePath("/Loginlogo.png")}
              alt="Eco Banx logo"
              width={496}
              height={105}
              priority
              className="h-auto w-28 object-contain"
            />
          </Link>

          <Button
            variant="secondary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapse}
            className="!hidden !h-9 !w-9 !p-0 lg:!grid"
          >
            <CollapseIcon className="h-4 w-4" />
          </Button>

          <div className="hidden min-w-0 items-center gap-2 text-small text-text-secondary lg:flex">
            <Link
              // href="/dashboard"
              href="/merchants"
              className="transition hover:text-theme-text"
            >
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-text-primary">{pageLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            aria-label={`${notificationCount} notifications`}
            className="relative !hidden !h-9 !w-9 shrink-0 !p-0 lg:!grid"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="h-4 w-4" />
            {hasNotifications && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-bg-primary">
                {notificationCount}
              </span>
            )}
          </Button>

          <Button
            variant="secondary"
            aria-label="Go to account"
            onClick={() => router.push("/account")}
            className="ml-auto !h-9 shrink-0 !py-1 !pl-1 !pr-3 text-small lg:ml-0"
            beforeIcon={
              <span className="grid h-7 w-7 place-items-center rounded-full [background:var(--button-primary)] text-white">
                <UserRound className="h-4 w-4" />
              </span>
            }
          >
            <span className="hidden font-medium sm:inline">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
