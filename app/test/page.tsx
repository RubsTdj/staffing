"use client";

import { PageHeader } from "@/components/page-header";
import { resetStoreToMocks, useStore } from "@/lib/store";
import type { RoleView } from "@/lib/types";
import Link from "next/link";
import {
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  UserCog,
  UserRound,
  Wrench,
} from "lucide-react";

interface Scenario {
  title: string;
  steps: string[];
  href: string;
  cta?: string;
}

interface Persona {
  id: RoleView;
  name: string;
  userId: string;
  icon: typeof ShieldCheck;
  tagline: string;
  scenarios: Scenario[];
  accent: string;
}

const PERSONAS: Persona[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    userId: "u10",
    icon: Wrench,
    tagline:
      "Toi. Switcher de persona via le bandeau, accès aux paramètres et à la gestion des users.",
    accent: "from-violet-600 to-violet-700",
    scenarios: [
      {
        title: "Vue d'ensemble — Aujourd'hui",
        steps: ["Voir alertes ressources", "Compter missions à staffer / à booker"],
        href: "/",
      },
      {
        title: "Rapports — export CSV",
        steps: ["Choisir une période", "Cliquer Exporter"],
        href: "/rapports",
        cta: "Ouvrir",
      },
      {
        title: "Gestion des collaborateurs",
        steps: [
          "Lister tous les users",
          "Impersonner un user depuis la ligne",
        ],
        href: "/equipe/collaborateurs",
      },
    ],
  },
  {
    id: "admin",
    name: "Admin",
    userId: "u10",
    icon: ShieldCheck,
    tagline: "Voit tout, peut tout faire sauf gérer les users et impersonner.",
    accent: "from-blue-600 to-blue-700",
    scenarios: [
      {
        title: "Valider le staffing d'une activité",
        steps: [
          "Ouvrir une mission à staffer",
          "Picker des formateurs",
          "Valider",
        ],
        href: "/accompagnement/liste",
      },
      {
        title: "Pipeline prévisionnel — décaler une bascule",
        steps: ["Voir les clients en pipeline", "Décaler la date de bascule"],
        href: "/previsionnel/timeline",
      },
      {
        title: "Équité — qui est surchargé ?",
        steps: ["Voir la jauge par collaborateur", "Repérer les surcharges"],
        href: "/equipe/equite",
      },
    ],
  },
  {
    id: "manager",
    name: "Manager Formation",
    userId: "u1",
    icon: UserCog,
    tagline:
      "Manager rattaché à une équipe (ici Formation). Le bandeau te permet de switcher de manager.",
    accent: "from-emerald-600 to-emerald-700",
    scenarios: [
      {
        title: "Timeline formateurs — drag & drop",
        steps: [
          "Glisser un bloc horizontalement → change les dates",
          "Glisser sur une autre ligne → réassigne",
          "Glisser sur une cellule vide → créer une formation",
        ],
        href: "/formation/timeline-formateurs",
      },
      {
        title: "Pool — ajouter des collaborateurs",
        steps: [
          "Ouvrir un client",
          "Cliquer « Ajouter au pool »",
          "Filtrer par équipe, sélectionner plusieurs, valider",
        ],
        href: "/accompagnement/pools",
      },
      {
        title: "Demande d'observation",
        steps: ["Soumettre une demande pour un membre de l'équipe"],
        href: "/demandes/observation",
      },
    ],
  },
  {
    id: "collaborateur",
    name: "Collaborateur",
    userId: "u3",
    icon: UserRound,
    tagline: "Vue terrain : son planning, ses missions, ses dispos.",
    accent: "from-amber-600 to-amber-700",
    scenarios: [
      {
        title: "Mon espace — mes missions",
        steps: ["Voir mes activités à venir", "Déclarer une indisponibilité"],
        href: "/mon-espace",
      },
      {
        title: "Aujourd'hui",
        steps: ["Voir mes prochains déplacements"],
        href: "/",
      },
    ],
  },
];

export default function TestPage() {
  const setRoleView = useStore((s) => s.setRoleView);
  const setCurrentUserId = useStore((s) => s.setCurrentUserId);
  const roleView = useStore((s) => s.roleView);
  const currentUserId = useStore((s) => s.currentUserId);

  const switchTo = (p: Persona) => {
    setRoleView(p.id);
    setCurrentUserId(p.userId);
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Scénarios test"]}
        title="Tester chaque parcours"
        subtitle="Choisis un persona, suis le scénario. Tes actions sont persistées localement — clique « Reset » pour repartir des mocks."
        showFilters={false}
        right={
          <button
            type="button"
            onClick={() => {
              resetStoreToMocks();
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="btn btn-secondary"
          >
            <RotateCcw size={13} strokeWidth={2} />
            Reset données mock
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5 px-8 py-6 md:grid-cols-2">
        {PERSONAS.map((p) => {
          const active = p.id === roleView && p.userId === currentUserId;
          const Icon = p.icon;
          return (
            <section
              key={p.id + p.userId}
              className={`card-elevated ${
                active ? "ring-2 ring-[var(--color-accent)]" : ""
              }`}
            >
              <div className="card-header">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${p.accent} text-white shadow-[0_2px_8px_-2px_rgba(11,18,32,0.25)]`}
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[15.5px] font-bold tracking-tight">
                      {p.name}
                    </h2>
                    {active && <span className="badge badge-info">Actif</span>}
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-[var(--color-ink-3)]">
                    {p.tagline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => switchTo(p)}
                  disabled={active}
                  className="btn btn-secondary btn-sm"
                >
                  {active ? "Connecté" : "Devenir"}
                </button>
              </div>
              <ul className="divide-y divide-[var(--color-line-2)]">
                {p.scenarios.map((s, i) => (
                  <li key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-semibold">
                          {s.title}
                        </div>
                        <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-[12px] leading-snug text-[var(--color-ink-3)]">
                          {s.steps.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <Link
                        href={s.href}
                        onClick={() => {
                          if (!active) switchTo(p);
                        }}
                        className="btn btn-dark btn-sm shrink-0"
                      >
                        {s.cta ?? "Lancer"}
                        <ArrowRight size={11} strokeWidth={2.4} />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
