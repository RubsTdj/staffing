"use client";

import { AlertTriangle, ArrowRight, CalendarDays } from "lucide-react";
import type { Activity } from "@/lib/types";
import { computeRequired, useStore } from "@/lib/store";
import { StaffingDot, STAFFING_LABELS } from "@/components/ui/staffing-status";
import { CategoryPill } from "@/components/ui/category-pill";
import { ValidationStatus } from "@/components/ui/validation-status";
import { AvatarStack } from "@/components/ui/avatar";

export function MissionRow({ activity }: { activity: Activity }) {
  const openDrawer = useStore((s) => s.openDrawer);
  const users = useStore((s) => s.users);
  const centres = useStore((s) => s.centres);

  const assigned = activity.assignees
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as typeof users;
  const centre = centres.find((c) => c.id === activity.centreId);
  const required = computeRequired(activity, centre);
  const missing = Math.max(0, required - assigned.length);

  const date = new Date(activity.dateStart);
  const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
  const dayNum = date.toLocaleDateString("fr-FR", { day: "2-digit" });
  const month = date.toLocaleDateString("fr-FR", { month: "short" });

  const time = `${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })} → ${new Date(activity.dateEnd).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <li>
      <button
        type="button"
        onClick={() => openDrawer({ kind: "activity", id: activity.id })}
        className="group relative flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--color-line-2)]/40"
      >
        {/* Status dot */}
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <StaffingDot status={activity.status} size={10} />
          {activity.cancelRequested && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-status-alert)]/30" />
          )}
        </span>

        {/* Date column */}
        <div className="flex w-[88px] shrink-0 items-baseline gap-1.5">
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
            {day}
          </span>
          <span className="text-[18px] font-medium tracking-tight text-[var(--color-ink)] tabular-nums">
            {dayNum}
          </span>
          <span className="text-[11px] text-[var(--color-ink-3)]">{month}</span>
        </div>

        {/* Time + status label */}
        <div className="hidden w-[140px] shrink-0 md:block">
          <div className="font-mono text-[11px] tabular-nums text-[var(--color-ink-2)]">
            {time}
          </div>
          <div className="mt-0.5 text-[11px] text-[var(--color-ink-3)]">
            {STAFFING_LABELS[activity.status]}
          </div>
        </div>

        {/* Category */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryPill
              type={activity.type}
              subCategory={activity.subCategory}
              modality={activity.modality}
            />
            <ValidationStatus kind={activity.validation} compact />
            {activity.cancelRequested && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-tint-pink)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--color-tint-pink-ink)]">
                <AlertTriangle size={10} strokeWidth={2} />
                Annulation demandée
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[var(--color-ink-3)]">
            <CalendarDays size={11} strokeWidth={1.6} />
            <span>
              {missing > 0 ? (
                <>
                  <span className="font-medium text-[var(--color-ink-2)]">
                    {missing} requis
                  </span>{" "}
                  · besoin {required} pour {centre?.nbSalaries ?? "?"} salariés
                </>
              ) : (
                <>
                  Ratio atteint — {assigned.length}/{required}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Assignees */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {assigned.length > 0 ? (
            <AvatarStack users={assigned} />
          ) : (
            <span className="text-[11px] italic text-[var(--color-ink-3)]">
              à staffer
            </span>
          )}
        </div>

        {/* CTA arrow on hover */}
        <span className="shrink-0 text-[var(--color-ink-3)] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
          <ArrowRight size={14} strokeWidth={1.8} />
        </span>
      </button>
    </li>
  );
}
