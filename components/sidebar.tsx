"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Compass,
  FlaskConical,
  GraduationCap,
  Home,
  Inbox,
  Layers,
  Search,
  TrainFront,
  UserCircle,
  Users,
  Users2,
} from "lucide-react";
import { canAccess, useStore } from "@/lib/store";
import type { RoleView } from "@/lib/types";

interface NavItem {
  id: string;
  label: string;
  href: string;
  Icon: typeof Home;
}

const NAV: NavItem[] = [
  { id: "today", label: "Aujourd'hui", href: "/", Icon: Home },
  {
    id: "previsionnel",
    label: "Timeline déploiement",
    href: "/previsionnel/timeline",
    Icon: Compass,
  },
  { id: "clients", label: "Clients", href: "/clients", Icon: Building2 },
  {
    id: "formations",
    label: "Formations",
    href: "/formation/liste",
    Icon: GraduationCap,
  },
  {
    id: "accompagnements",
    label: "Accompagnements",
    href: "/accompagnement/liste",
    Icon: Users2,
  },
  {
    id: "pools",
    label: "Pools",
    href: "/accompagnement/pools",
    Icon: Layers,
  },
  {
    id: "logistique",
    label: "Logistique",
    href: "/logistique/liste",
    Icon: TrainFront,
  },
  { id: "equipe", label: "Équipe", href: "/equipe/collaborateurs", Icon: Users },
  { id: "rapports", label: "Rapports", href: "/rapports", Icon: BarChart3 },
  { id: "inbox", label: "Inbox", href: "/demandes/observation", Icon: Inbox },
  {
    id: "mon-espace",
    label: "Mon espace",
    href: "/mon-espace",
    Icon: UserCircle,
  },
  {
    id: "test",
    label: "Scénarios test",
    href: "/test",
    Icon: FlaskConical,
  },
];

const ROLE_LABEL: Record<RoleView, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  manager: "Manager",
  collaborateur: "Collaborateur",
};

export function Sidebar() {
  const pathname = usePathname() ?? "";
  const currentUser = useStore((s) =>
    s.users.find((u) => u.id === s.currentUserId),
  );
  const roleView = useStore((s) => s.roleView);
  const setRoleView = useStore((s) => s.setRoleView);
  const observerRequests = useStore((s) => s.observerRequests);
  const activities = useStore((s) => s.activities);
  const newObsCount = observerRequests.filter(
    (r) => r.status === "submitted",
  ).length;
  const cancelCount = activities.filter((a) => a.cancelRequested).length;
  const inboxBadge = newObsCount + cancelCount;

  const accessibleNav = NAV.filter((s) => canAccess(roleView, s.id));
  // role switcher moved to ImpersonationBanner; keep setter unused here
  void setRoleView;

  return (
    <aside className="hidden md:flex h-dvh w-[224px] shrink-0 flex-col bg-[var(--color-rail)] text-[var(--color-rail-text)]">
      {/* Brand */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-accent)] text-[13px] font-semibold text-white">
            P
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-white/90" />
          </span>
          <span className="text-[14.5px] font-semibold tracking-tight text-[var(--color-rail-text-hi)]">
            Popsgo
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md bg-[var(--color-rail-2)] px-2.5 py-1.5 text-left text-[12.5px] text-[var(--color-rail-text)] ring-1 ring-[var(--color-rail-line)] hover:text-[var(--color-rail-text-hi)] transition-colors"
        >
          <Search size={13} strokeWidth={1.8} />
          <span className="flex-1 truncate">Rechercher…</span>
          <span className="text-[10px] text-[var(--color-rail-text)]/60">⌘K</span>
        </button>
      </div>

      {/* Nav — flat */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {accessibleNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("?")[0]);
            const badge =
              item.id === "inbox" && inboxBadge > 0 ? inboxBadge : undefined;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-accent)]/15 text-[var(--color-rail-text-hi)]"
                      : "text-[var(--color-rail-text)] hover:bg-white/5 hover:text-[var(--color-rail-text-hi)]"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-x-1 -translate-y-1/2 rounded-r bg-[var(--color-accent)]" />
                  )}
                  <item.Icon
                    size={14}
                    strokeWidth={1.7}
                    className={
                      active
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-rail-text)]/70"
                    }
                  />
                  <span className="flex-1">{item.label}</span>
                  {badge && (
                    <span className="rounded-sm bg-[var(--color-accent)] px-1 py-px text-[9.5px] font-semibold text-white tabular-nums">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer — user + role (lecture seule, switch via le bandeau Persona test) */}
      <div className="border-t border-[var(--color-rail-line)] px-3 py-2.5">
        <div className="flex w-full items-center gap-2 px-1 py-1">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e8d9c8] to-[#c8a587] text-[11px] font-semibold text-[var(--color-ink)]">
            {currentUser?.initials ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] text-[var(--color-rail-text-hi)]">
              {currentUser?.name}
            </div>
            <div className="truncate text-[10.5px] text-[var(--color-rail-text)]/70">
              {ROLE_LABEL[roleView]}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
