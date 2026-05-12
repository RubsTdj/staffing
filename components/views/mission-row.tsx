"use client";

import { ArrowRight, CalendarDays, Crown, MoonStar } from "lucide-react";
import type { Activity } from "@/lib/types";
import { computeActivityState, computeRequired, getAssigneeIds, useStore } from "@/lib/store";
import { StateBadge } from "@/components/ui/state-badge";
import { CategoryPill } from "@/components/ui/category-pill";
import { AvatarStack } from "@/components/ui/avatar";

export function MissionRow({ activity }: { activity: Activity }) {
  const openDrawer = useStore((s) => s.openDrawer);
  const users = useStore((s) => s.users);
  const centres = useStore((s) => s.centres);
  const duplicate = useStore((s) => s.duplicateActivity);

  const assigned = getAssigneeIds(activity)
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as typeof users;
  const centre = centres.find((c) => c.id === activity.centreId);
  const required = computeRequired(activity, centre);
  const missing = Math.max(0, required - assigned.length);
  const state = computeActivityState(activity);

  const date = new Date(activity.dateStart);
  const day = date.toLocaleDateString("fr-FR", { weekday: "short" });
  const dayNum = date.toLocaleDateString("fr-FR", { day: "2-digit" });
  const month = date.toLocaleDateString("fr-FR", { month: "short" });

  // Days span
  const endDate = new Date(activity.dateEnd);
  const sameDay = date.toDateString() === endDate.toDateString();
  const span = sameDay
    ? `${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} → ${endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    : `${Math.round((endDate.getTime() - date.getTime()) / 86400000) + 1} jours`;

  const isOff = activity.type === "Off";

  return (
    <li>
      <button
        type="button"
        onClick={() => openDrawer({ kind: "activity", id: activity.id })}
        onDoubleClick={() => duplicate(activity.id)}
        className="group relative flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--color-line-2)]/40"
      >
        {/* Date column */}
        <div className="flex w-[88px] shrink-0 items-baseline gap-1.5">
          <span className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
            {day}
          </span>
          <span className="text-[18px] font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
            {dayNum}
          </span>
          <span className="text-[11px] text-[var(--color-ink-3)]">{month}</span>
        </div>

        {/* Time + span */}
        <div className="hidden w-[120px] shrink-0 md:block">
          <div className="font-mono text-[11px] tabular-nums text-[var(--color-ink-2)]">
            {span}
          </div>
        </div>

        {/* Category + state */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {isOff ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-rail-active)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-rail-text-hi)]">
                <MoonStar size={11} strokeWidth={1.8} />
                Off
              </span>
            ) : (
              <CategoryPill
                type={activity.type}
                subCategory={activity.subCategory ?? "PDS"}
                modality={activity.modality}
              />
            )}
            <StateBadge state={state} size="sm" />
            {activity.cdpAssigned && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--color-accent-2)]"
                title="CDP assigné"
              >
                <Crown size={10} strokeWidth={1.9} />
                CDP
              </span>
            )}
          </div>
          {!isOff && (
            <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[var(--color-ink-3)]">
              <CalendarDays size={11} strokeWidth={1.6} />
              <span>
                {missing > 0 ? (
                  <>
                    <span className="font-medium text-[var(--color-ink-2)]">
                      {missing} requis
                    </span>{" "}
                    · besoin {required}
                    {centre?.nbSalaries
                      ? ` · ${Math.round(centre.nbSalaries / 1000)}k salariés`
                      : ""}
                  </>
                ) : (
                  <>Ratio couvert · {assigned.length}/{required}</>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {assigned.length > 0 ? (
            <AvatarStack users={assigned} />
          ) : (
            <span className="text-[11px] text-[var(--color-ink-3)]">
              À staffer
            </span>
          )}
        </div>

        <span className="shrink-0 text-[var(--color-ink-3)] opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowRight size={14} strokeWidth={1.8} />
        </span>
      </button>
    </li>
  );
}
