"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { ClientPipeline } from "@/lib/types";
import { ArrowRight, CalendarDays, Users2 } from "lucide-react";
import Link from "next/link";

const COLS: { id: ClientPipeline; label: string; tint: string }[] = [
  {
    id: "suspect",
    label: "Suspect",
    tint: "bg-[var(--color-line-2)] text-[var(--color-ink-3)]",
  },
  {
    id: "intent",
    label: "Ressenti commercial",
    tint: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  },
  {
    id: "verbal",
    label: "Accord de principe",
    tint: "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]",
  },
  {
    id: "signed",
    label: "Signé",
    tint: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  },
];

export default function Page() {
  const clients = useStore((s) => s.clients);
  const setPrev = useStore((s) => s.setClientPrevisionnel);

  return (
    <>
      <PageHeader
        breadcrumb={["Prévisionnel", "Pipeline"]}
        title="Pipeline commercial"
        subtitle="Vue Kanban des futurs déploiements · drag-style avancement (clic = avancer)."
        showFilters={false}
      />
      <div className="px-8 py-6">
        <div className="grid gap-3 md:grid-cols-4">
          {COLS.map((col) => {
            const inCol = clients.filter((c) => c.pipeline === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-2">
                <div
                  className={`inline-flex items-baseline justify-between rounded-md px-3 py-2 text-[12px] font-semibold ${col.tint}`}
                >
                  <span>{col.label}</span>
                  <span className="font-mono tabular-nums">
                    {inCol.length}
                  </span>
                </div>
                <ul className="space-y-2">
                  {inCol.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border border-[var(--color-line)] bg-white p-3"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[13.5px] font-semibold">
                          {c.name}
                        </span>
                        <span className="font-mono text-[10.5px] tabular-nums text-[var(--color-ink-3)]">
                          {c.confidence ?? "—"}%
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--color-ink-3)]">
                        {c.kind}
                      </div>
                      <div className="mt-2 space-y-0.5 text-[11.5px] text-[var(--color-ink-2)]">
                        <div className="flex items-center gap-1.5">
                          <Users2
                            size={11}
                            strokeWidth={1.6}
                            className="text-[var(--color-ink-3)]"
                          />
                          {(c.nbSalaries / 1000).toFixed(0)}k salariés
                        </div>
                        {c.dateBascule && (
                          <div className="flex items-center gap-1.5">
                            <CalendarDays
                              size={11}
                              strokeWidth={1.6}
                              className="text-[var(--color-ink-3)]"
                            />
                            Bascule{" "}
                            {new Date(c.dateBascule).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              },
                            )}
                          </div>
                        )}
                        <div className="text-[11px] text-[var(--color-ink-3)]">
                          F : {c.estFormateurs ?? "—"} pers · {c.estJoursFormation ?? "—"} j ·
                          A : {c.estAccompagnateurs ?? "—"} pers ·{" "}
                          {c.estJoursAccomp ?? "—"} j
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <select
                          value={c.pipeline}
                          onChange={(e) =>
                            setPrev(c.id, {
                              pipeline: e.target.value as ClientPipeline,
                            })
                          }
                          className="rounded border border-[var(--color-line)] bg-white px-1.5 py-0.5 text-[10.5px]"
                        >
                          {COLS.map((x) => (
                            <option key={x.id} value={x.id}>
                              → {x.label}
                            </option>
                          ))}
                        </select>
                        <Link
                          href={`/previsionnel/timeline?client=${c.id}`}
                          className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                        >
                          Timeline
                          <ArrowRight size={11} strokeWidth={2} />
                        </Link>
                      </div>
                    </li>
                  ))}
                  {inCol.length === 0 && (
                    <li className="rounded-md border border-dashed border-[var(--color-line)] bg-white/40 px-3 py-4 text-center text-[11px] text-[var(--color-ink-3)]">
                      Vide
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
