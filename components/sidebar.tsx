"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronRight,
  Command,
  Search,
  Sparkles,
} from "lucide-react";

type Item = { label: string; href: string };
type Section = {
  id: string;
  label: string;
  href?: string;
  items?: Item[];
};

const NAV: Section[] = [
  {
    id: "planning",
    label: "Planning prévisionnel",
    items: [{ label: "Timeline", href: "/planning/timeline" }],
  },
  {
    id: "clients",
    label: "Clients",
    items: [
      { label: "Clients", href: "/clients" },
      { label: "Centres", href: "/clients/centres" },
    ],
  },
  {
    id: "formation",
    label: "Formation",
    items: [
      { label: "Tableau de bord", href: "/formation/dashboard" },
      { label: "Liste", href: "/formation/liste" },
      { label: "Timeline", href: "/formation/timeline" },
      { label: "Planning formateurs", href: "/formation/planning" },
      { label: "Fichier à extraire", href: "/formation/extraire" },
      { label: "Activités", href: "/formation/activites" },
    ],
  },
  {
    id: "accompagnement",
    label: "Accompagnement",
    items: [
      { label: "Liste", href: "/accompagnement/liste" },
      { label: "Timeline", href: "/accompagnement/timeline" },
      { label: "Demandes d'annulation", href: "/accompagnement/annulations" },
      { label: "Pools", href: "/accompagnement/pools" },
    ],
  },
  {
    id: "logistique",
    label: "Logistique",
    items: [
      { label: "Liste", href: "/logistique/liste" },
      { label: "Planning OPS", href: "/logistique/planning" },
    ],
  },
  {
    id: "equipe",
    label: "Équipe",
    items: [{ label: "Collaborateurs", href: "/equipe/collaborateurs" }],
  },
  { id: "espace", label: "Mon espace", href: "/mon-espace" },
  {
    id: "demandes",
    label: "Demandes",
    items: [
      { label: "Demandes d'annulation", href: "/demandes/annulations" },
      { label: "Une idée ? Un problème ?", href: "/demandes/feedback" },
    ],
  },
  {
    id: "stats",
    label: "Statistiques",
    items: [{ label: "Tableau de bord", href: "/stats/dashboard" }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const initialOpen = new Set(
    NAV.filter(
      (s) =>
        s.items?.some((i) => pathname?.startsWith(i.href)) ||
        s.id === "accompagnement" ||
        s.id === "demandes",
    ).map((s) => s.id),
  );
  const [open, setOpen] = useState<Set<string>>(initialOpen);

  const toggle = (id: string) =>
    setOpen((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <aside className="hidden md:flex h-dvh w-[252px] shrink-0 flex-col bg-[var(--color-rail)] text-[var(--color-rail-text)]">
      {/* Brand */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/" className="group flex items-center gap-2.5">
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
          className="group flex w-full items-center gap-2 rounded-md bg-[var(--color-rail-2)] px-2.5 py-1.5 text-left text-[12.5px] text-[var(--color-rail-text)] ring-1 ring-[var(--color-rail-line)] hover:text-[var(--color-rail-text-hi)] transition-colors"
        >
          <Search size={13} strokeWidth={1.8} />
          <span className="flex-1 truncate">Rechercher…</span>
          <span className="flex items-center gap-0.5 text-[10px] text-[var(--color-rail-text)]/70">
            <Command size={10} strokeWidth={2} />K
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((section) => {
            const hasChildren = !!section.items?.length;
            const isOpen = open.has(section.id);
            const isActiveSection = section.items?.some((i) =>
              pathname?.startsWith(i.href),
            );

            if (!hasChildren && section.href) {
              const active = pathname === section.href;
              return (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "bg-[var(--color-rail-active)] text-[var(--color-rail-text-hi)]"
                        : "text-[var(--color-rail-text)] hover:text-[var(--color-rail-text-hi)]"
                    }`}
                  >
                    <span>{section.label}</span>
                    {active && (
                      <span className="h-1 w-1 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </Link>
                </li>
              );
            }

            return (
              <li key={section.id} className="mt-1">
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] uppercase tracking-[0.14em] transition-colors ${
                    isActiveSection
                      ? "text-[var(--color-rail-text-hi)]"
                      : "text-[var(--color-rail-text)]/65 hover:text-[var(--color-rail-text-hi)]"
                  }`}
                >
                  <ChevronRight
                    size={11}
                    strokeWidth={2}
                    className={`transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                  <span>{section.label}</span>
                </button>
                {isOpen && section.items && (
                  <ul className="ml-3 mt-0.5 flex flex-col border-l border-[var(--color-rail-line)] pl-2">
                    {section.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`group relative flex items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] transition-colors ${
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

      {/* Footer — current user */}
      <div className="border-t border-[var(--color-rail-line)] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e8d9c8] to-[#c8a587] text-[11px] font-semibold text-[var(--color-ink)]">
            CR
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] text-[var(--color-rail-text-hi)]">
              Camille Roussel
            </div>
            <div className="truncate text-[10.5px] text-[var(--color-rail-text)]/70">
              Manager · Déploiement
            </div>
          </div>
          <Sparkles
            size={13}
            strokeWidth={1.6}
            className="text-[var(--color-rail-text)]/60"
          />
        </div>
      </div>
    </aside>
  );
}
