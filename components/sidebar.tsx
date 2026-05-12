"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Search,
} from "lucide-react";
import { canAccess, useStore } from "@/lib/store";
import type { RoleView } from "@/lib/types";

type Item = { label: string; href: string; nodeId: string; badge?: number };
type Section = {
  id: string;
  label: string;
  href?: string;
  nodeId?: string;
  items?: Item[];
};

const NAV: Section[] = [
  { id: "today", label: "Aujourd'hui", href: "/", nodeId: "today" },
  {
    id: "previsionnel",
    label: "Prévisionnel",
    nodeId: "previsionnel",
    items: [
      {
        label: "Pipeline",
        href: "/previsionnel/pipeline",
        nodeId: "previsionnel",
      },
      {
        label: "Timeline déploiement",
        href: "/previsionnel/timeline",
        nodeId: "previsionnel",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients & Centres",
    nodeId: "clients",
    items: [
      { label: "Clients", href: "/clients", nodeId: "clients" },
      { label: "Centres", href: "/clients/centres", nodeId: "centres" },
    ],
  },
  {
    id: "formations",
    label: "Formations",
    nodeId: "formations",
    items: [
      { label: "Liste", href: "/formation/liste", nodeId: "formations" },
      {
        label: "Timeline formateurs",
        href: "/formation/timeline-formateurs",
        nodeId: "formateurs",
      },
    ],
  },
  {
    id: "accompagnements",
    label: "Accompagnements",
    nodeId: "accompagnements",
    items: [
      { label: "Liste", href: "/accompagnement/liste", nodeId: "accompagnements" },
      { label: "Pools", href: "/accompagnement/pools", nodeId: "pools" },
    ],
  },
  { id: "logistique", label: "Logistique", href: "/logistique/liste", nodeId: "logistique" },
  {
    id: "equipe",
    label: "Équipe",
    nodeId: "equipe",
    items: [
      { label: "Collaborateurs", href: "/equipe/collaborateurs", nodeId: "equipe" },
      { label: "Équité", href: "/equipe/equite", nodeId: "equipe" },
    ],
  },
  {
    id: "inbox",
    label: "Inbox",
    nodeId: "inbox",
    items: [
      { label: "Observations", href: "/demandes/observation", nodeId: "inbox" },
      { label: "Annulations", href: "/demandes/annulations", nodeId: "inbox" },
      { label: "Idées · Bugs", href: "/demandes/feedback", nodeId: "inbox" },
    ],
  },
  { id: "rapports", label: "Rapports", href: "/rapports", nodeId: "rapports" },
  { id: "mon-espace", label: "Mon espace", href: "/mon-espace", nodeId: "mon-espace" },
  { id: "stories", label: "User Stories", href: "/product/stories", nodeId: "stories" },
];

const ROLE_LABEL: Record<RoleView, string> = {
  admin: "Admin",
  "manager-formation": "Manager Formation",
  "manager-deployment": "Manager Déploiement",
  ops: "OPS terrain",
  logistique: "Logistique",
};

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useStore((s) =>
    s.users.find((u) => u.id === s.currentUserId),
  );
  const roleView = useStore((s) => s.roleView);
  const setRoleView = useStore((s) => s.setRoleView);
  const observerRequests = useStore((s) => s.observerRequests);
  const newObsCount = observerRequests.filter(
    (r) => r.status === "submitted",
  ).length;

  const accessibleNav = NAV.filter((s) =>
    s.nodeId ? canAccess(roleView, s.nodeId) : true,
  );

  const initialOpen = new Set(
    accessibleNav
      .filter((s) => s.items?.some((i) => pathname?.startsWith(i.href)))
      .map((s) => s.id),
  );
  const [open, setOpen] = useState<Set<string>>(initialOpen);
  const [roleOpen, setRoleOpen] = useState(false);

  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <aside className="hidden md:flex h-dvh w-[248px] shrink-0 flex-col bg-[var(--color-rail)] text-[var(--color-rail-text)]">
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

      <div className="px-3 pb-3">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md bg-[var(--color-rail-2)] px-2.5 py-1.5 text-left text-[12.5px] text-[var(--color-rail-text)] ring-1 ring-[var(--color-rail-line)] hover:text-[var(--color-rail-text-hi)] transition-colors"
        >
          <Search size={13} strokeWidth={1.8} />
          <span className="flex-1 truncate">Rechercher…</span>
          <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-rail-text)]/70">
            <Command size={10} strokeWidth={2} />K
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {accessibleNav.map((section) => {
            const hasChildren = !!section.items?.length;
            const accessibleItems = section.items?.filter((i) =>
              canAccess(roleView, i.nodeId),
            );
            const isOpen = open.has(section.id);
            const isActiveSection = accessibleItems?.some((i) =>
              pathname?.startsWith(i.href),
            );

            if (!hasChildren && section.href) {
              const active = pathname === section.href;
              const badge =
                section.id === "inbox" ? newObsCount : undefined;
              return (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
                      active
                        ? "bg-[var(--color-rail-active)] text-[var(--color-rail-text-hi)]"
                        : "text-[var(--color-rail-text)] hover:text-[var(--color-rail-text-hi)]"
                    }`}
                  >
                    <span>{section.label}</span>
                    {badge ? (
                      <span className="rounded-sm bg-[var(--color-accent)] px-1 py-px text-[9.5px] font-semibold text-white">
                        {badge}
                      </span>
                    ) : active ? (
                      <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
                    ) : null}
                  </Link>
                </li>
              );
            }

            if (!accessibleItems || accessibleItems.length === 0) return null;

            return (
              <li key={section.id} className="mt-0.5">
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] font-medium transition-colors ${
                    isActiveSection
                      ? "text-[var(--color-rail-text-hi)]"
                      : "text-[var(--color-rail-text)] hover:text-[var(--color-rail-text-hi)]"
                  }`}
                >
                  <span>{section.label}</span>
                  <ChevronRight
                    size={11}
                    strokeWidth={2}
                    className={`transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <ul className="ml-3 mt-0.5 flex flex-col border-l border-[var(--color-rail-line)] pl-2">
                    {accessibleItems.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`group relative flex items-center justify-between rounded-md px-2 py-1.5 text-[12px] transition-colors ${
                              active
                                ? "bg-[var(--color-rail-active)] text-[var(--color-rail-text-hi)]"
                                : "text-[var(--color-rail-text)] hover:text-[var(--color-rail-text-hi)]"
                            }`}
                          >
                            {active && (
                              <span className="absolute -left-[10px] top-1/2 h-3 w-px -translate-y-1/2 bg-[var(--color-accent)]" />
                            )}
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--color-rail-line)] px-3 py-2.5">
        <button
          type="button"
          onClick={() => setRoleOpen(!roleOpen)}
          className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-[var(--color-rail-active)]"
        >
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
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={`text-[var(--color-rail-text)]/60 transition-transform ${
              roleOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {roleOpen && (
          <ul className="mt-1.5 flex flex-col gap-0.5 rounded-md bg-[var(--color-rail-2)] p-1">
            {(Object.entries(ROLE_LABEL) as [RoleView, string][]).map(
              ([role, label]) => (
                <li key={role}>
                  <button
                    type="button"
                    onClick={() => {
                      setRoleView(role);
                      setRoleOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded px-2 py-1 text-[11.5px] transition-colors ${
                      role === roleView
                        ? "text-[var(--color-rail-text-hi)]"
                        : "text-[var(--color-rail-text)] hover:text-[var(--color-rail-text-hi)]"
                    }`}
                  >
                    <span>{label}</span>
                    {role === roleView && (
                      <Check size={11} strokeWidth={2.2} />
                    )}
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}
