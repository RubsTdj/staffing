"use client";

import { PageHeader } from "@/components/page-header";
import {
  PERSONAS,
  STATUS_LABEL,
  STORIES,
  type StoryStatus,
} from "@/lib/user-stories";
import { useMemo, useState } from "react";

const STATUS_TINT: Record<StoryStatus, string> = {
  done: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  "in-progress": "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]",
  next: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  later: "bg-[var(--color-line-2)] text-[var(--color-ink-3)]",
};

const PRIORITY_TINT: Record<string, string> = {
  P0: "bg-[var(--color-ink)] text-white",
  P1: "bg-[var(--color-ink-2)] text-white",
  P2: "bg-[var(--color-line-2)] text-[var(--color-ink-3)]",
};

export default function Page() {
  const [personaFilter, setPersonaFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => (personaFilter ? STORIES.filter((s) => s.persona === personaFilter) : STORIES),
    [personaFilter],
  );
  const counts = useMemo(
    () => ({
      total: STORIES.length,
      done: STORIES.filter((s) => s.status === "done").length,
      inProgress: STORIES.filter((s) => s.status === "in-progress").length,
      next: STORIES.filter((s) => s.status === "next").length,
    }),
    [],
  );

  return (
    <>
      <PageHeader
        breadcrumb={["Produit", "User Stories"]}
        title="User Stories Popsgo"
        subtitle="Backlog consolidé à partir des CRs et workflows d'équipe. État vivant — mis à jour à chaque sprint."
        showFilters={false}
      />
      <div className="space-y-6 px-8 py-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total" value={counts.total} hint="stories" />
          <Stat label="Livrées" value={counts.done} hint="dans le proto" />
          <Stat label="En cours" value={counts.inProgress} hint="ce sprint" />
          <Stat label="Prochain sprint" value={counts.next} hint="planifiées" />
        </section>

        <div className="flex flex-wrap items-center gap-1">
          <FilterChip
            active={personaFilter === null}
            onClick={() => setPersonaFilter(null)}
          >
            Tous
          </FilterChip>
          {PERSONAS.map((p) => (
            <FilterChip
              key={p}
              active={personaFilter === p}
              onClick={() =>
                setPersonaFilter(personaFilter === p ? null : p)
              }
            >
              {p}
            </FilterChip>
          ))}
        </div>

        <section className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-line-2)]/40 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                <th className="px-4 py-2 font-medium">ID</th>
                <th className="px-4 py-2 font-medium">Persona</th>
                <th className="px-4 py-2 font-medium">Story</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 text-right font-medium">Priorité</th>
                <th className="px-4 py-2 text-right font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--color-line-2)] last:border-0 hover:bg-[var(--color-line-2)]/30"
                >
                  <td className="px-4 py-3 align-top">
                    <code className="rounded bg-[var(--color-line-2)] px-1.5 py-0.5 text-[10.5px] text-[var(--color-ink-2)]">
                      {s.id}
                    </code>
                  </td>
                  <td className="px-4 py-3 align-top text-[12px] text-[var(--color-ink-2)]">
                    {s.persona}
                  </td>
                  <td className="px-4 py-3 align-top text-[12.5px] text-[var(--color-ink)]">
                    <span className="font-medium">En tant que </span>
                    <span>{s.as}, </span>
                    <span className="font-medium">je veux </span>
                    <span>{s.want}, </span>
                    <span className="font-medium">afin de </span>
                    <span>{s.so}.</span>
                  </td>
                  <td className="px-4 py-3 align-top text-[11.5px] text-[var(--color-ink-3)]">
                    {s.source}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <span
                      className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${PRIORITY_TINT[s.priority]}`}
                    >
                      {s.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <span
                      className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${STATUS_TINT[s.status]}`}
                    >
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-white px-4 py-3">
      <div className="text-[12px] font-medium text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[24px] font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {hint && (
          <span className="text-[11.5px] text-[var(--color-ink-3)]">{hint}</span>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-ink)] text-white"
          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
      }`}
    >
      {children}
    </button>
  );
}
