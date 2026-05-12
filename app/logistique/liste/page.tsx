"use client";

import { PageHeader } from "@/components/page-header";
import { useStore, computeActivityState, getAssigneeIds } from "@/lib/store";
import {
  CalendarDays,
  Hotel,
  MapPin,
  Send,
  TrainFront,
} from "lucide-react";
import { StateBadge } from "@/components/ui/state-badge";
import { AvatarStack } from "@/components/ui/avatar";

export default function Page() {
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const users = useStore((s) => s.users);
  const setValidation = useStore((s) => s.setActivityValidation);
  const openDrawer = useStore((s) => s.openDrawer);

  const toBook = activities.filter(
    (a) =>
      a.type !== "Off" && a.validation === "validated" && !a.cancelRequested,
  );
  const ready = activities.filter(
    (a) => a.type !== "Off" && a.validation === "ready",
  );

  return (
    <>
      <PageHeader
        breadcrumb={["Logistique", "Liste"]}
        title="Missions à organiser"
        subtitle="Toutes les missions au statut Staffing Validé — trains, hébergements, agendas."
        showFilters={false}
        actionLabel="Exporter CSV May"
        actionIcon={<TrainFront size={13} strokeWidth={1.8} />}
      />

      <div className="space-y-8 px-8 py-6">
        <section>
          <h2 className="mb-3 text-[13px] font-semibold">
            À organiser · {toBook.length}
          </h2>
          {toBook.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-white px-5 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucune mission Staffing Validé. Les managers valident d'abord en
              amont.
            </div>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {toBook.map((a) => {
                const client = clients.find((c) => c.id === a.clientId);
                const centre = centres.find((c) => c.id === a.centreId);
                const assigned = getAssigneeIds(a)
                  .map((id) => users.find((u) => u.id === id))
                  .filter(Boolean) as typeof users;
                const start = new Date(a.dateStart);
                const depart = new Date(start);
                depart.setDate(start.getDate() - 1);
                if (depart.getDay() === 0) {
                  depart.setDate(depart.getDate() - 1);
                }
                return (
                  <li
                    key={a.id}
                    className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white"
                  >
                    <div className="border-b border-[var(--color-line)] px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="text-[13.5px] font-semibold">
                          {client?.name} · {centre?.name}
                        </div>
                        <StateBadge state={computeActivityState(a)} size="sm" />
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
                        <MapPin size={11} strokeWidth={1.6} />
                        {centre?.region} · {centre?.address}
                      </div>
                    </div>

                    <div className="grid gap-2 px-4 py-3 text-[12px]">
                      <Row
                        icon={<CalendarDays size={12} strokeWidth={1.7} />}
                        label="Période"
                        value={`${start.toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                        })} → ${new Date(a.dateEnd).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "short",
                            day: "2-digit",
                            month: "short",
                          },
                        )}`}
                      />
                      <Row
                        icon={<TrainFront size={12} strokeWidth={1.7} />}
                        label="Train aller suggéré"
                        value={depart.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        })}
                        sub="départ veille, jamais dimanche"
                      />
                      <Row
                        icon={<Hotel size={12} strokeWidth={1.7} />}
                        label="Hébergement"
                        value={`${Math.max(
                          1,
                          Math.round(
                            (+new Date(a.dateEnd) - +start) / 86400000,
                          ),
                        )} nuit(s) · proche du centre`}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-4 py-2.5">
                      <div className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-3)]">
                        <AvatarStack users={assigned} max={5} />
                        <span>
                          {assigned.length} participant
                          {assigned.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openDrawer({ kind: "activity", id: a.id })
                          }
                          className="rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                        >
                          Détails
                        </button>
                        <button
                          type="button"
                          onClick={() => setValidation(a.id, "ready")}
                          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ink)] px-2 py-1 text-[11.5px] font-medium text-white hover:bg-[var(--color-ink-2)]"
                        >
                          <Send size={11} strokeWidth={2} />
                          Marquer prêt
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {ready.length > 0 && (
          <section>
            <h2 className="mb-3 text-[13px] font-semibold">
              Prêt au départ · {ready.length}
            </h2>
            <ul className="space-y-2">
              {ready.map((a) => {
                const client = clients.find((c) => c.id === a.clientId);
                const centre = centres.find((c) => c.id === a.centreId);
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-white px-4 py-3"
                  >
                    <div>
                      <div className="text-[13px] font-medium">
                        {client?.name} · {centre?.name}
                      </div>
                      <div className="text-[11.5px] text-[var(--color-ink-3)]">
                        {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "2-digit",
                          month: "long",
                        })}
                      </div>
                    </div>
                    <StateBadge state={computeActivityState(a)} size="sm" />
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function Row({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="mt-0.5 text-[var(--color-ink-3)]">{icon}</span>
      <span className="w-[140px] shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {label}
      </span>
      <span className="flex-1 text-[12.5px] text-[var(--color-ink-2)]">
        {value}
        {sub && (
          <span className="ml-1 text-[11px] text-[var(--color-ink-3)]">
            · {sub}
          </span>
        )}
      </span>
    </div>
  );
}
