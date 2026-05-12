"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const DAY_MS = 86400000;
const WEEKS = 8; // 8 semaines glissantes

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = lundi
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Page() {
  const users = useStore((s) => s.users);
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const openDrawer = useStore((s) => s.openDrawer);

  const [offsetWeeks, setOffsetWeeks] = useState(0);
  const today = new Date(TODAY);
  const start = useMemo(() => {
    const s = startOfWeek(today);
    s.setDate(s.getDate() + offsetWeeks * 7);
    return s;
  }, [offsetWeeks, today]);
  const totalDays = WEEKS * 7;
  const end = new Date(start.getTime() + totalDays * DAY_MS);

  // Formateurs = users avec team Formation OU role Manager Formation
  const formateurs = users.filter(
    (u) => u.team === "Formation" || u.role === "Manager",
  );

  return (
    <>
      <PageHeader
        breadcrumb={["Formations", "Timeline formateurs"]}
        title="Timeline formateurs"
        subtitle="1 ligne par formateur · 8 semaines glissantes · formations ET accompagnements (les formateurs participent aux 2)."
        showFilters={false}
        right={
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setOffsetWeeks(offsetWeeks - 4)}
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
              onClick={() => setOffsetWeeks(offsetWeeks + 4)}
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
              gridTemplateColumns: `200px repeat(${totalDays}, minmax(0, 1fr))`,
            }}
          >
            <div className="px-3 py-2 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
              Formateur
            </div>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = new Date(start.getTime() + i * DAY_MS);
              const isMonday = d.getDay() === 1;
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-end gap-0 border-l py-1 text-[9px] ${
                    isMonday
                      ? "border-[var(--color-line)]"
                      : "border-[var(--color-line-2)]/60"
                  } ${
                    isWeekend
                      ? "bg-[var(--color-line-2)]/40 text-[var(--color-ink-3)]"
                      : "text-[var(--color-ink-2)]"
                  } ${isToday ? "bg-[var(--color-accent-soft)]" : ""}`}
                >
                  {isMonday && (
                    <span className="text-[8.5px] text-[var(--color-ink-3)]">
                      S{getWeekNum(d)}
                    </span>
                  )}
                  <span className="font-mono tabular-nums">{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Lignes formateurs */}
          {formateurs.map((u) => {
            const userActs = activities
              .filter((a) =>
                a.assignments.some((x) => x.userId === u.id),
              )
              .filter(
                (a) =>
                  +new Date(a.dateStart) < end.getTime() &&
                  +new Date(a.dateEnd) >= start.getTime() &&
                  a.type !== "Off",
              );
            return (
              <div
                key={u.id}
                className="relative grid border-b border-[var(--color-line)] last:border-b-0"
                style={{
                  gridTemplateColumns: `200px repeat(${totalDays}, minmax(0, 1fr))`,
                  minHeight: 48,
                }}
              >
                <div className="flex items-center gap-2 border-r border-[var(--color-line)] px-3 py-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-line-2)] text-[10px] font-semibold text-[var(--color-ink-2)]">
                    {u.initials}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{u.name}</div>
                    <div className="text-[10.5px] text-[var(--color-ink-3)]">
                      {u.level} · {u.team}
                    </div>
                  </div>
                </div>
                {/* grille de fond */}
                {Array.from({ length: totalDays }).map((_, i) => {
                  const d = new Date(start.getTime() + i * DAY_MS);
                  const isMonday = d.getDay() === 1;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`border-l ${
                        isMonday
                          ? "border-[var(--color-line)]"
                          : "border-[var(--color-line-2)]/40"
                      } ${
                        isWeekend
                          ? "bg-[var(--color-line-2)]/30"
                          : ""
                      }`}
                    />
                  );
                })}
                {/* blocs missions */}
                {userActs.map((a) => {
                  const aStart = new Date(a.dateStart);
                  const aEnd = new Date(a.dateEnd);
                  const startDayIdx = Math.max(
                    0,
                    Math.floor((aStart.getTime() - start.getTime()) / DAY_MS),
                  );
                  const endDayIdx = Math.min(
                    totalDays - 1,
                    Math.floor((aEnd.getTime() - start.getTime()) / DAY_MS),
                  );
                  const span = endDayIdx - startDayIdx + 1;
                  const client = clients.find((c) => c.id === a.clientId);
                  const centre = centres.find((c) => c.id === a.centreId);
                  const isFormation = a.type === "Formation";
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => openDrawer({ kind: "activity", id: a.id })}
                      className={`absolute z-10 truncate rounded-md px-1.5 py-1 text-[10px] font-medium transition-all hover:brightness-95 ${
                        isFormation
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] ring-1 ring-[var(--color-accent)]/25"
                          : "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)] ring-1 ring-[var(--color-tint-mist-ink)]/15"
                      }`}
                      style={{
                        left: `calc(200px + ${startDayIdx} * ((100% - 200px) / ${totalDays}))`,
                        width: `calc(${span} * ((100% - 200px) / ${totalDays}) - 2px)`,
                        top: 6,
                        bottom: 6,
                      }}
                      title={`${client?.name} · ${centre?.name} · ${a.type}`}
                    >
                      {isFormation ? "F" : "A"} · {client?.name}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
          <Legend color="bg-[var(--color-accent-soft)]" label="Formation" />
          <Legend color="bg-[var(--color-tint-mist)]" label="Accompagnement" />
          <Legend color="bg-[var(--color-line-2)]/60" label="Weekend" />
          <Legend color="bg-[var(--color-accent-soft)]" label="Aujourd'hui (header)" />
        </div>
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

function getWeekNum(d: Date): number {
  const target = new Date(d);
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / 604800000);
}
