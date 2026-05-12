"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { TODAY } from "@/lib/mock-data";
import type { Activity } from "@/lib/types";
import { ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const DAY_MS = 86400000;
const WEEKS = 8;
const ROW_HEIGHT = 56;

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dayIndex(start: Date, d: Date): number {
  return Math.floor((d.getTime() - start.getTime()) / DAY_MS);
}

function getWeekNum(d: Date): number {
  const target = new Date(d);
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / 604800000);
}

type DragState =
  | { kind: "move"; activityId: string; offsetDays: number }
  | { kind: "resize"; activityId: string; edge: "left" | "right" }
  | { kind: "create"; userId: string; startIdx: number; endIdx: number }
  | null;

export default function Page() {
  const users = useStore((s) => s.users);
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const openDrawer = useStore((s) => s.openDrawer);
  const setActivityDates = useStore((s) => s.setActivityDates);
  const unassign = useStore((s) => s.unassignUser);
  const assign = useStore((s) => s.assignUser);
  const createActivity = useStore((s) => s.createActivity);

  const [offsetWeeks, setOffsetWeeks] = useState(0);
  const today = new Date(TODAY);
  const start = useMemo(() => {
    const s = startOfWeek(today);
    s.setDate(s.getDate() + offsetWeeks * 7);
    return s;
  }, [offsetWeeks, today]);
  const totalDays = WEEKS * 7;
  const end = new Date(start.getTime() + totalDays * DAY_MS);

  // Formateurs = team Formation
  const formateurs = users.filter((u) => u.team === "Formation");

  const [drag, setDrag] = useState<DragState>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const cellWidth = () => {
    const el = gridRef.current;
    if (!el) return 0;
    return (el.clientWidth - 200) / totalDays;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drag || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 200;
    const idx = Math.max(0, Math.min(totalDays - 1, Math.floor(x / cellWidth())));

    if (drag.kind === "create") {
      setDrag({ ...drag, endIdx: idx });
    }
  };

  const handleMouseUp = (e: React.MouseEvent, userId?: string) => {
    if (!drag) return;

    if (drag.kind === "create") {
      const minIdx = Math.min(drag.startIdx, drag.endIdx);
      const maxIdx = Math.max(drag.startIdx, drag.endIdx);
      const dateStart = addDays(start, minIdx);
      const dateEnd = addDays(start, maxIdx);
      dateStart.setHours(9, 0, 0, 0);
      dateEnd.setHours(17, 0, 0, 0);
      const newId = createActivity({
        type: "Formation",
        dateStart: dateStart.toISOString(),
        dateEnd: dateEnd.toISOString(),
        modality: "Présentiel",
        assignments: [{ userId: drag.userId, days: maxIdx - minIdx + 1 }],
      });
      setDrag(null);
      openDrawer({ kind: "activity", id: newId });
    } else {
      setDrag(null);
    }
  };

  const handleDragStart = (
    e: React.DragEvent,
    activityId: string,
    kind: "move" | "resize-left" | "resize-right",
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ activityId, kind }));
    const ghost = document.createElement("div");
    ghost.style.width = "0";
    ghost.style.height = "0";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDrop = (e: React.DragEvent, userId: string, dayIdx: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain")) as {
        activityId: string;
        kind: "move" | "resize-left" | "resize-right";
      };
      const a = activities.find((x) => x.id === data.activityId);
      if (!a) return;
      const aStart = new Date(a.dateStart);
      const aEnd = new Date(a.dateEnd);
      const duration = Math.max(
        1,
        Math.round((aEnd.getTime() - aStart.getTime()) / DAY_MS) + 1,
      );

      if (data.kind === "move") {
        // Bouger : place le bloc à partir du dayIdx, garde la durée
        const newStart = addDays(start, dayIdx);
        const newEnd = addDays(newStart, duration - 1);
        newStart.setHours(aStart.getHours(), aStart.getMinutes(), 0, 0);
        newEnd.setHours(aEnd.getHours(), aEnd.getMinutes(), 0, 0);
        setActivityDates(
          data.activityId,
          newStart.toISOString(),
          newEnd.toISOString(),
        );
        // Réassigne si formateur différent
        const currentAssignee = a.assignments[0]?.userId;
        if (currentAssignee && currentAssignee !== userId) {
          unassign(data.activityId, currentAssignee);
          assign(data.activityId, userId, duration);
        }
      } else if (data.kind === "resize-right") {
        const newEnd = addDays(start, dayIdx);
        newEnd.setHours(aEnd.getHours(), aEnd.getMinutes(), 0, 0);
        if (newEnd > aStart) {
          setActivityDates(
            data.activityId,
            a.dateStart,
            newEnd.toISOString(),
          );
        }
      } else if (data.kind === "resize-left") {
        const newStart = addDays(start, dayIdx);
        newStart.setHours(aStart.getHours(), aStart.getMinutes(), 0, 0);
        if (newStart < aEnd) {
          setActivityDates(
            data.activityId,
            newStart.toISOString(),
            a.dateEnd,
          );
        }
      }
    } catch {}
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Formations", "Timeline formateurs"]}
        title="Timeline formateurs"
        subtitle="Glisser-déposer un bloc pour le déplacer · poignées ◄ ► pour redimensionner · clic-glisser sur une zone vide pour créer une formation."
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
        <div
          ref={gridRef}
          className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]"
          onMouseMove={handleMouseMove}
          onMouseUp={(e) => handleMouseUp(e)}
          onMouseLeave={() => drag?.kind === "create" && setDrag(null)}
        >
          {/* Header semaines */}
          <div
            className="grid border-b border-[var(--color-line)] bg-[var(--color-line-2)]/40"
            style={{
              gridTemplateColumns: `200px repeat(${totalDays}, minmax(0, 1fr))`,
            }}
          >
            <div className="px-3 py-2 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
              Formateur
            </div>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = addDays(start, i);
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
                      ? "bg-[var(--color-line-2)]/70 text-[var(--color-ink-3)]"
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
              <FormateurRow
                key={u.id}
                user={u}
                activities={userActs}
                allClients={clients}
                allCentres={centres}
                totalDays={totalDays}
                start={start}
                drag={drag}
                setDrag={setDrag}
                onDragStartBlock={handleDragStart}
                onDropOnDay={(idx, e) => handleDrop(e, u.id, idx)}
                onOpenDrawer={(id) => openDrawer({ kind: "activity", id })}
              />
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
          <Legend color="bg-[var(--color-accent-soft)]" label="Formation" />
          <Legend
            color="bg-[var(--color-tint-mist)]"
            label="Accompagnement"
          />
          <Legend
            color="bg-[var(--color-line-2)]/70"
            label="Weekend"
          />
          <Legend
            color="bg-[var(--color-accent-soft)]"
            label="Aujourd'hui (header)"
          />
        </div>
      </div>
    </>
  );
}

function FormateurRow({
  user,
  activities,
  allClients,
  allCentres,
  totalDays,
  start,
  drag,
  setDrag,
  onDragStartBlock,
  onDropOnDay,
  onOpenDrawer,
}: {
  user: { id: string; name: string; initials: string; level: string; team: string };
  activities: Activity[];
  allClients: { id: string; name: string }[];
  allCentres: { id: string; name: string }[];
  totalDays: number;
  start: Date;
  drag: DragState;
  setDrag: (s: DragState) => void;
  onDragStartBlock: (
    e: React.DragEvent,
    activityId: string,
    kind: "move" | "resize-left" | "resize-right",
  ) => void;
  onDropOnDay: (idx: number, e: React.DragEvent) => void;
  onOpenDrawer: (id: string) => void;
}) {
  return (
    <div
      className="relative grid border-b border-[var(--color-line)] last:border-b-0"
      style={{
        gridTemplateColumns: `200px repeat(${totalDays}, minmax(0, 1fr))`,
        minHeight: ROW_HEIGHT,
      }}
    >
      <div className="flex items-center gap-2 border-r border-[var(--color-line)] px-3 py-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-line-2)] text-[10px] font-semibold text-[var(--color-ink-2)]">
          {user.initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-medium">{user.name}</div>
          <div className="text-[10.5px] text-[var(--color-ink-3)]">
            {user.level} · {user.team}
          </div>
        </div>
      </div>

      {/* cellules droppables + create-by-drag */}
      {Array.from({ length: totalDays }).map((_, i) => {
        const d = new Date(start.getTime() + i * DAY_MS);
        const isMonday = d.getDay() === 1;
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;
        const inCreate =
          drag?.kind === "create" &&
          drag.userId === user.id &&
          i >= Math.min(drag.startIdx, drag.endIdx) &&
          i <= Math.max(drag.startIdx, drag.endIdx);
        return (
          <div
            key={i}
            className={`border-l ${
              isMonday
                ? "border-[var(--color-line)]"
                : "border-[var(--color-line-2)]/40"
            } ${isWeekend ? "bg-[var(--color-line-2)]/40" : ""} ${
              inCreate
                ? "bg-[var(--color-accent-soft)]/70 ring-1 ring-inset ring-[var(--color-accent)]/30"
                : ""
            }`}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              // Démarre la création par drag
              setDrag({
                kind: "create",
                userId: user.id,
                startIdx: i,
                endIdx: i,
              });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => onDropOnDay(i, e)}
          />
        );
      })}

      {/* blocs missions */}
      {activities.map((a) => {
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
        const client = allClients.find((c) => c.id === a.clientId);
        const centre = allCentres.find((c) => c.id === a.centreId);
        const isFormation = a.type === "Formation";
        return (
          <div
            key={a.id}
            draggable
            onDragStart={(e) => onDragStartBlock(e, a.id, "move")}
            onClick={() => onOpenDrawer(a.id)}
            className={`absolute z-10 flex cursor-grab items-center gap-1 truncate rounded-md px-1.5 text-[10.5px] font-medium transition-all hover:brightness-95 active:cursor-grabbing ${
              isFormation
                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] ring-1 ring-[var(--color-accent)]/30"
                : "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)] ring-1 ring-[var(--color-tint-mist-ink)]/20"
            }`}
            style={{
              left: `calc(200px + ${startDayIdx} * ((100% - 200px) / ${totalDays}))`,
              width: `calc(${span} * ((100% - 200px) / ${totalDays}) - 4px)`,
              top: 8,
              bottom: 8,
            }}
            title={`${client?.name ?? ""} · ${centre?.name ?? ""} · drag pour déplacer`}
          >
            {/* Resize handle left */}
            <span
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                onDragStartBlock(e, a.id, "resize-left");
              }}
              className="flex h-full w-1.5 cursor-ew-resize items-center justify-center opacity-0 hover:opacity-100"
            >
              <span className="h-3 w-0.5 bg-current opacity-50" />
            </span>

            <span className="flex flex-1 items-center gap-1 overflow-hidden">
              <GripHorizontal
                size={10}
                strokeWidth={1.8}
                className="shrink-0 opacity-70"
              />
              <span className="truncate">
                {isFormation ? "F" : "A"} · {client?.name ?? "—"}
              </span>
            </span>

            {/* Resize handle right */}
            <span
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                onDragStartBlock(e, a.id, "resize-right");
              }}
              className="flex h-full w-1.5 cursor-ew-resize items-center justify-center opacity-0 hover:opacity-100"
            >
              <span className="h-3 w-0.5 bg-current opacity-50" />
            </span>
          </div>
        );
      })}
    </div>
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
