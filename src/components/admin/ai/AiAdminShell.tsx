"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import { ChevronDown, ChevronsLeft, LogOut, PanelLeft, Settings, Sparkles } from "lucide-react";
import {
  ADMIN_COMMAND_ITEMS,
  ADMIN_NAV_ITEMS,
} from "@/lib/admin/command-center";
import { getSectionItems, getInitials, matchesPath } from "@/components/layout/util/UtilFunction";
import type { RoleKey } from "@/lib/auth/permissions";

type AiAdminShellProps = {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
    viewRole: string;
  };
};

export function AiAdminShell({ children, user }: AiAdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    products: true,
    accounts: true,
    products_sheet: false,
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const role = user.viewRole as RoleKey;

  const visibleNavItems = useMemo(
    () => ADMIN_NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role)),
    [role]
  );
  const visibleCommandItems = useMemo(
    () => ADMIN_COMMAND_ITEMS.filter((item) => !item.roles || item.roles.includes(role)),
    [role]
  );

  const flatQuickLinks = useMemo(
    () =>
      visibleCommandItems.filter(
        (item) => item.group !== "Navigate" && item.id !== "ai-admin"
      ),
    [visibleCommandItems]
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        className={clsx(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-all duration-300",
          railCollapsed ? "w-[88px]" : "w-[312px]"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
          <Link href="/admin/ai" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
              <Sparkles size={18} />
            </div>
            {!railCollapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-black uppercase tracking-[0.24em] text-foreground/52">
                  Callaway
                </p>
                <p className="truncate text-base font-semibold text-foreground">AI Workspace</p>
              </div>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setRailCollapsed((current) => !current)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-muted text-foreground transition hover:bg-control-bg-hover"
          >
            {railCollapsed ? <PanelLeft size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {!railCollapsed ? (
          <div className="px-4 py-4">
            <div className="rounded-[24px] border border-border bg-surface-muted px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                AI Home
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/72">
                Chat-first admin surface for products, orders, imports, accounts, and business questions.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
          <div className="space-y-2">
            {!railCollapsed ? (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Navigation
              </p>
            ) : null}
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const submenuItems = getSectionItems(item.id, role);
              const isActive = matchesPath(pathname, item.href);

              if (submenuItems.length) {
                const isOpen = openGroups[item.id] ?? false;
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.id)}
                      className={clsx(
                        "flex w-full items-center rounded-2xl px-3 py-3 text-left transition",
                        isActive ? "bg-foreground text-background" : "text-foreground hover:bg-surface-muted"
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!railCollapsed ? (
                        <>
                          <span className="ml-3 min-w-0 flex-1 truncate text-sm font-semibold">{item.label}</span>
                          <ChevronDown
                            size={16}
                            className={clsx("transition-transform", isOpen && "rotate-180")}
                          />
                        </>
                      ) : null}
                    </button>
                    {!railCollapsed && isOpen ? (
                      <div className="ml-4 space-y-1 border-l border-border pl-4">
                        {submenuItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              className={clsx(
                                "flex items-center rounded-2xl px-3 py-2.5 text-sm transition",
                                matchesPath(pathname, subItem.href)
                                  ? "bg-surface-strong text-foreground"
                                  : "text-foreground/72 hover:bg-surface-muted hover:text-foreground"
                              )}
                            >
                              <SubIcon size={16} className="shrink-0" />
                              <span className="ml-3 truncate">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={clsx(
                    "flex items-center rounded-2xl px-3 py-3 transition",
                    isActive ? "bg-foreground text-background" : "text-foreground hover:bg-surface-muted"
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {!railCollapsed ? (
                    <span className="ml-3 truncate text-sm font-semibold">{item.label}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          {!railCollapsed ? (
            <div className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Quick Actions
              </p>
              {flatQuickLinks.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-start rounded-2xl px-3 py-3 text-foreground transition hover:bg-surface-muted"
                  >
                    <Icon size={18} className="mt-0.5 shrink-0" />
                    <div className="ml-3 min-w-0">
                      <p className="truncate text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-foreground/62">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="border-t border-border px-3 py-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className={clsx(
                "flex w-full items-center rounded-2xl border border-border bg-surface-muted transition hover:bg-control-bg-hover",
                railCollapsed ? "justify-center px-3 py-3" : "px-3 py-3"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground text-sm font-black text-background">
                {getInitials(user.name)}
              </div>
              {!railCollapsed ? (
                <>
                  <div className="ml-3 min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-foreground/62">{user.email}</p>
                  </div>
                  <ChevronDown size={16} className={clsx("transition-transform", profileOpen && "rotate-180")} />
                </>
              ) : null}
            </button>

            {profileOpen && !railCollapsed ? (
              <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 overflow-hidden rounded-[24px] border border-border bg-surface shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/admin/setting");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-background">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
