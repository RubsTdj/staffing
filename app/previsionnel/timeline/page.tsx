"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { ClientPipeline } from "@/lib/types";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useMemo, useState } from "react";

const WEEK_MS = 7 * 86400000;
const WEEKS_VISIBLE = 36; // ~ 9 mois

const PIPELINE_TINT: Record<ClientPipeline, string> = {
  signed:
    "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)] ring-[var(--color-tint-sage-ink)]/20",
  verbal:
    "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)] ring-[var(--color-tint-sand-ink)]/20",
  intent:
    "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)] ring-[var(--color-tint-mist-ink)]/20",
  suspect: "bg-[var(--color-line-2)] text-[var(--color-ink-3)] ring-[var(--color-line)]",
};

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Page() {
  const clients = useStore((s) => s.clients);
  const shift = useStore((s) => s.shiftClientBlock);
  const today = new Date("2026-05-12");
  const [offsetWeeks, setOffsetWeeks] = useState(0);

  const start = useMemo(() => {
    const s = startOfWeek(today);
    s.setDate(s.getDate() - 4 * 7 + offsetWeeks * 7);
    return s;
  }, [today, offsetWeeks]);

  const end = new Date(start.getTime() + WEEKS_VISIBLE * WEEK_MS);

  return (
    <>
      <PageHeader
        breadcrumb={["Prévisionnel", "Timeline déploiement"]}
        title="Timeline déploiement"
        subtitle="Lignes = clients · colonnes = semaines · blocs déploiement → formation → bascule → accompagnement. Boutons ← → pour décaler tout un bloc client."
        showFilters={false}
        right={
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setOffsetWeeks(offsetWeeks - 8)}
              className="rounded-[5px] px-1.5 py-1 text-[12px] hover:bg-[var(--color-line-2)]"
            >
              <ChevronLeft size={12} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setOffsetWeeks(0)}
              className={`rounded-[5px] px-2 py-1 text-[12px] font-medium ${
                offsetWeeks === 0
                  ? "bg-[var(--color-ink)] text-white"
                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
              }`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setOffsetWeeks(offsetWeeks + 8)}
              className="rounded-[5px] px-1.5 py-1 text-[12px] hover:bg-[var(--color-line-2)]"
            >
              <ChevronRight size={12} strokeWidth={2} />
            </button>
          </div>
        }
      />

      <div className="px-8 py-6">
        <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          {/* Header semaines */}
          <div
            className="grid border-b border-[var(--color-line)] bg-[var(--color-line-2)]/30"
            style={{
              gridTemplateColumns: `260px repeat(${WEEKS_VISIBLE}, minmax(0, 1fr))`,
            }}
          >
            <div className="px-3 py-2 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
              Client
            </div>
            {Array.from({ length: WEEKS_VISIBLE }).map((_, i) => {
              const wkStart = new Date(start.getTime() + i * WEEK_MS);
              const month = wkStart.toLocaleDateString("fr-FR", {
                month: "short",
              });
              const isMonthStart = wkStart.getDate() <= 7;
              const isPast = wkStart < today;
              const isCurrent =
                wkStart <= today && today < new Date(wkStart.getTime() + WEEK_MS);
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-end gap-0 border-l border-[var(--color-line-2)]/60 py-1 text-[9px] ${
                    isCurrent
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]"
                      : isPast
                        ? "text-[var(--color-ink-3)]/70"
                        : "text-[var(--color-ink-2)]"
                  }`}
                >
                  {isMonthStart && (
                    <span className="text-[9px] uppercase tracking-wider">
                      {month}
                    </span>
                  )}
                  <span className="font-mono tabular-nums">
                    {wkStart.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Lignes clients */}
          {clients.map((c) => {
            const bascule = c.dateBascule ? new Date(c.dateBascule) : null;
            const dDebut = new Date(c.dateDebut);
            const dFin = new Date(c.dateFin);

            // Indexes
            const idxStart = Math.max(
              0,
              Math.floor(
                (dDebut.getTime() - start.getTime()) / WEEK_MS,
              ),
            );
            const idxFin = Math.min(
              WEEKS_VISIBLE - 1,
              Math.floor((dFin.getTime() - start.getTime()) / WEEK_MS),
            );
            const idxBascule = bascule
              ? Math.floor((bascule.getTime() - start.getTime()) / WEEK_MS)
              : null;

            const formationWeeks = c.estSemainesFormation ?? 4;
            const idxFormStart = idxBascule
              ? Math.max(0, idxBascule - formationWeeks)
              : null;
            const idxFormEnd = idxBascule ? idxBascule - 1 : null;

            const isInView = idxFin >= 0 && idxStart < WEEKS_VISIBLE;

            return (
              <div
                key={c.id}
                className="relative grid border-b border-[var(--color-line)] last:border-b-0"
                style={{
                  gridTemplateColumns: `260px repeat(${WEEKS_VISIBLE}, minmax(0, 1fr))`,
                  minHeight: 64,
                }}
              >
                <div className="flex items-center gap-2 border-r border-[var(--color-line)] px-3 py-2">
                  <button
                    type="button"
                    onClick={() => shift(c.id, -1)}
                    className="rounded p-0.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
                    title="Décaler 1 semaine en arrière"
                  >
                    <ChevronLeft size={12} strokeWidth={2} />
                  </button>
                  <GripVertical
                    size={12}
                    strokeWidth={1.6}
                    className="text-[var(--color-ink-3)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold">
                      {c.name}
                      <span
                        className={`rounded-sm px-1 py-px text-[9px] font-medium uppercase tracking-[0.08em] ring-1 ring-inset ${PIPELINE_TINT[c.pipeline]}`}
                      >
                        {c.pipeline === "signed"
                          ? "S"
                          : c.pipeline === "verbal"
                            ? "A"
                            : c.pipeline === "intent"
                              ? "R"
                              : "?"}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-[var(--color-ink-3)]">
                      {(c.nbSalaries / 1000).toFixed(0)}k · {c.nbSemainesDeploiement ?? "—"} sem.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => shift(c.id, 1)}
                    className="rounded p-0.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
                    title="Décaler 1 semaine en avant"
                  >
                    <ChevronRight size={12} strokeWidth={2} />
                  </button>
                </div>
                {/* grille semaine */}
                {Array.from({ length: WEEKS_VISIBLE }).map((_, i) => (
                  <div
                    key={i}
                    className="border-l border-[var(--color-line-2)]/40"
                  />
                ))}
                {/* Bloc déploiement (overall) */}
                {isInView && (
                  <div
                    className={`absolute z-10 rounded-md ring-1 ring-inset ${PIPELINE_TINT[c.pipeline]} opacity-60`}
                    style={{
                      left: `calc(260px + ${Math.max(0, idxStart)} * ((100% - 260px) / ${WEEKS_VISIBLE}))`,
                      width: `calc(${Math.min(WEEKS_VISIBLE, idxFin + 1) - Math.max(0, idxStart)} * ((100% - 260px) / ${WEEKS_VISIBLE}) - 2px)`,
                      top: 36,
                      height: 10,
                    }}
                    title={`Déploiement ${c.name}`}
                  />
                )}
                {/* Bloc formation (avant bascule) */}
                {idxFormStart !== null && idxFormEnd !== null && idxFormEnd >= 0 && (
                  <div
                    className="absolute z-20 rounded-md bg-[var(--color-accent-soft)] px-1 py-0.5 text-[9.5px] font-medium text-[var(--color-accent-2)] ring-1 ring-[var(--color-accent)]/25"
                    style={{
                      left: `calc(260px + ${Math.max(0, idxFormStart)} * ((100% - 260px) / ${WEEKS_VISIBLE}))`,
                      width: `calc(${Math.min(WEEKS_VISIBLE, idxFormEnd + 1) - Math.max(0, idxFormStart)} * ((100% - 260px) / ${WEEKS_VISIBLE}) - 2px)`,
                      top: 14,
                      height: 18,
                    }}
                    title={`Formation · ${formationWeeks} semaines · ${c.estFormateurs ?? "?"} formateurs`}
                  >
                    F · {c.estFormateurs ?? "—"}p
                  </div>
                )}
                {/* Marqueur bascule */}
                {idxBascule !== null && idxBascule >= 0 && idxBascule < WEEKS_VISIBLE && (
                  <div
                    className="absolute z-30 flex flex-col items-center"
                    style={{
                      left: `calc(260px + ${idxBascule}.5 * ((100% - 260px) / ${WEEKS_VISIBLE}))`,
                      top: 6,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="rounded-sm bg-[var(--color-accent)] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white">
                      J0
                    </span>
                    <span className="mt-0.5 h-12 w-px bg-[var(--color-accent)]" />
                  </div>
                )}
                {/* Bloc accompagnement (3 sem post bascule) */}
                {idxBascule !== null && idxBascule + 3 < WEEKS_VISIBLE && (
                  <div
                    className="absolute z-20 rounded-md bg-[var(--color-tint-mist)] px-1 py-0.5 text-[9.5px] font-medium text-[var(--color-tint-mist-ink)] ring-1 ring-[var(--color-tint-mist-ink)]/15"
                    style={{
                      left: `calc(260px + ${idxBascule} * ((100% - 260px) / ${WEEKS_VISIBLE}))`,
                      width: `calc(3 * ((100% - 260px) / ${WEEKS_VISIBLE}) - 2px)`,
                      top: 38,
                      height: 18,
                    }}
                    title={`Accompagnement · ${c.estAccompagnateurs ?? "?"} accomp.`}
                  >
                    A · {c.estAccompagnateurs ?? "—"}p
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
          <Legend color="bg-[var(--color-accent-soft)]" label="Formation" />
          <Legend color="bg-[var(--color-tint-mist)]" label="Accompagnement (3 sem)" />
          <Legend color="bg-[var(--color-accent)]" label="J0 — bascule (mardi)" />
          <Legend color="bg-[var(--color-tint-sage)]" label="Signé" />
          <Legend color="bg-[var(--color-tint-sand)]" label="Accord de principe" />
          <Legend color="bg-[var(--color-tint-mist)]" label="Ressenti" />
        </div>

        <p className="mt-3 text-[12px] text-[var(--color-ink-3)]">
          Astuce : utilise les boutons{" "}
          <ChevronLeft className="inline" size={11} /> /{" "}
          <ChevronRight className="inline" size={11} /> sur la gauche d'une ligne
          client pour décaler tout son bloc d'une semaine — formation,
          accompagnement et bascule se recalculent en même temps.
        </p>
      </div>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-4 rounded-sm ${color}`} />
      {label}
    </span>
  );
}
