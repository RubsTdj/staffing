"use client";

import { useState } from "react";
import { ChevronRight, MapPin, Users2 } from "lucide-react";
import type { Activity, Centre, Client } from "@/lib/types";
import { MissionRow } from "./mission-row";
import { StaffingDot } from "@/components/ui/staffing-status";

interface CentreGroup {
  centre: Centre;
  activities: Activity[];
}

export function ClientGroup({
  client,
  groups,
}: {
  client: Client;
  groups: CentreGroup[];
}) {
  const [open, setOpen] = useState(true);
  const all = groups.flatMap((g) => g.activities);
  const counts = {
    done: all.filter((a) => a.status === "done").length,
    partial: all.filter((a) => a.status === "partial").length,
    todo: all.filter((a) => a.status === "todo").length,
    alert: all.filter((a) => a.status === "alert").length,
  };
  const progress = Math.round(
    (counts.done / Math.max(1, all.length)) * 100,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
      {/* Client banner */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 border-b border-[var(--color-line)] bg-white px-5 py-3 text-left transition-colors hover:bg-[var(--color-line-2)]/40"
      >
        <ChevronRight
          size={14}
          strokeWidth={2}
          className={`shrink-0 text-[var(--color-ink-3)] transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
            {client.name}
          </h2>
          <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
            {client.type}
          </span>
          <span className="hidden text-[11.5px] text-[var(--color-ink-3)] md:inline">
            {new Date(client.dateDebut).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            })}{" "}
            →{" "}
            {new Date(client.dateFin).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
            <Users2 size={12} strokeWidth={1.6} />
            {client.nbSalaries} salariés
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
            <MapPin size={12} strokeWidth={1.6} />
            {groups.length} centre{groups.length > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <ProgressDots counts={counts} />
            <span className="font-mono text-[10.5px] text-[var(--color-ink-3)]">
              {progress}%
            </span>
          </div>
        </div>
      </button>

      {open && (
        <div>
          {groups.map(({ centre, activities }, gi) => (
            <div
              key={centre.id}
              className={gi > 0 ? "border-t border-[var(--color-line)]" : ""}
            >
              {/* Centre subheader */}
              <div className="flex items-center justify-between gap-3 bg-[var(--color-line-2)]/35 px-5 py-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
                    Centre
                  </span>
                  <span className="text-[12.5px] font-medium text-[var(--color-ink-2)]">
                    {centre.name}
                  </span>
                  {centre.isFormateur && (
                    <span className="inline-flex items-center rounded-sm bg-[var(--color-accent-soft)] px-1 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.1em] text-[var(--color-accent-2)]">
                      Formateur
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-ink-3)]">
                  <span className="truncate max-w-[280px] hidden md:inline">
                    {centre.address}
                  </span>
                  {centre.nbSalaries != null && (
                    <span>{centre.nbSalaries} salariés</span>
                  )}
                </div>
              </div>

              <ul className="divide-y divide-[var(--color-line-2)]">
                {activities.map((a) => (
                  <MissionRow key={a.id} activity={a} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProgressDots({
  counts,
}: {
  counts: { done: number; partial: number; todo: number; alert: number };
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {counts.alert > 0 && (
        <Pill status="alert" count={counts.alert} />
      )}
      {counts.todo > 0 && <Pill status="todo" count={counts.todo} />}
      {counts.partial > 0 && (
        <Pill status="partial" count={counts.partial} />
      )}
      {counts.done > 0 && <Pill status="done" count={counts.done} />}
    </span>
  );
}

function Pill({
  status,
  count,
}: {
  status: "done" | "partial" | "todo" | "alert";
  count: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 ring-1 ring-[var(--color-line)]">
      <StaffingDot status={status} size={6} />
      <span className="font-mono text-[10px] text-[var(--color-ink-2)]">
        {count}
      </span>
    </span>
  );
}
