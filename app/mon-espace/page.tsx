"use client";

import { PageHeader } from "@/components/page-header";
import { useStore, computeActivityState, getAssigneeIds } from "@/lib/store";
import { TODAY } from "@/lib/mock-data";
import {
  Building2,
  Download,
  MapPin,
  MoonStar,
  Phone,
  TrainFront,
} from "lucide-react";
import { StateBadge } from "@/components/ui/state-badge";
import { AvatarStack } from "@/components/ui/avatar";

export default function Page() {
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const activities = useStore((s) => s.activities);
  const openDrawer = useStore((s) => s.openDrawer);
  const addOff = useStore((s) => s.addOffActivity);

  const me = users.find((u) => u.id === currentUserId);

  const today = new Date(TODAY);
  const myActivities = activities
    .filter((a) => getAssigneeIds(a).includes(currentUserId))
    .filter((a) => {
      const diff = (+new Date(a.dateStart) - +today) / 86400000;
      return diff >= -7 && diff <= 60;
    })
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearActivities = activities.filter(
    (a) =>
      getAssigneeIds(a).includes(currentUserId) &&
      a.type !== "Off" &&
      new Date(a.dateStart) >= yearStart,
  );
  const totalDays = yearActivities.reduce(
    (sum, a) =>
      sum +
      Math.max(
        1,
        Math.round((+new Date(a.dateEnd) - +new Date(a.dateStart)) / 86400000) +
          1,
      ),
    0,
  );
  const totalTrips = yearActivities.filter((a) => {
    const centre = centres.find((c) => c.id === a.centreId);
    return centre?.region !== "IDF";
  }).length;

  const handleAddOff = () => {
    const start = prompt(
      "Date début indisponibilité (YYYY-MM-DD)",
      new Date().toISOString().slice(0, 10),
    );
    if (!start) return;
    const end = prompt("Date fin (YYYY-MM-DD)", start);
    if (!end) return;
    addOff(currentUserId, `${start}T00:00:00`, `${end}T23:59:00`);
  };

  const nextTrip = myActivities.find((a) => a.type !== "Off");

  return (
    <>
      <PageHeader
        breadcrumb={["Mon espace"]}
        title={me?.name ?? ""}
        subtitle={`${me?.role} · ${me?.team} · ${me?.level}`}
        showFilters={false}
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddOff}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
            >
              <MoonStar size={12} strokeWidth={1.8} />
              Déclarer une indispo
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 py-1.5 text-[12px] font-medium text-white"
            >
              <Download size={12} strokeWidth={1.8} />
              Mon planning (.ics)
            </button>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Missions cumulées"
            value={yearActivities.length}
            hint="depuis le 1er janvier"
          />
          <Stat label="Jours terrain" value={totalDays} hint="hors indispos" />
          <Stat
            label="Déplacements"
            value={totalTrips}
            hint="hors IDF · prime de dépl."
          />
          <Stat
            label="Capacité mensuelle"
            value={`${me?.monthlyTripCapacity ?? "—"}`}
            hint="déplacements"
          />
        </section>

        {nextTrip && (
          <section className="rounded-xl border border-[var(--color-line)] bg-white p-4">
            <h3 className="mb-3 text-[13px] font-semibold">
              Mon prochain déplacement
            </h3>
            <NextTripCard activityId={nextTrip.id} />
          </section>
        )}

        <section>
          <h2 className="mb-2 text-[13px] font-semibold">Prochaines étapes</h2>
          <ol className="relative space-y-3 border-l border-[var(--color-line)] pl-6">
            {myActivities.length === 0 && (
              <li className="text-[12.5px] text-[var(--color-ink-3)]">
                Aucune mission programmée à venir.
              </li>
            )}
            {myActivities.map((a) => {
              const client = clients.find((c) => c.id === a.clientId);
              const centre = centres.find((c) => c.id === a.centreId);
              const state = computeActivityState(a);
              const isOff = a.type === "Off";
              const teammates = getAssigneeIds(a)
                .filter((id) => id !== currentUserId)
                .map((id) => users.find((u) => u.id === id))
                .filter(Boolean) as typeof users;
              return (
                <li key={a.id} className="relative">
                  <span
                    className="absolute -left-[27px] mt-2 h-3 w-3 rounded-full ring-4 ring-[var(--color-paper)]"
                    style={{
                      background:
                        state === "ready" || state === "validated"
                          ? "var(--color-status-done)"
                          : state === "cancel-requested"
                            ? "var(--color-status-alert)"
                            : isOff
                              ? "var(--color-rail)"
                              : "var(--color-status-partial)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => openDrawer({ kind: "activity", id: a.id })}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-white p-4 text-left hover:border-[var(--color-ink)]/15"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[14px] font-semibold">
                          {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                          })}
                        </span>
                        <span className="text-[11.5px] text-[var(--color-ink-3)]">
                          →{" "}
                          {new Date(a.dateEnd).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                          })}
                        </span>
                      </div>
                      <StateBadge state={state} size="sm" />
                    </div>
                    <div className="mt-1.5 text-[13.5px] font-medium">
                      {isOff
                        ? "Indisponibilité (Off)"
                        : `${client?.name} · ${centre?.name}`}
                    </div>
                    {!isOff && centre && (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[var(--color-ink-3)]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} strokeWidth={1.6} />
                          {centre.address}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={11} strokeWidth={1.6} />
                          {a.type} {a.subCategory ?? ""}
                        </span>
                        {a.validation === "ready" && (
                          <span className="inline-flex items-center gap-1 text-[var(--color-tint-sand-ink)]">
                            <TrainFront size={11} strokeWidth={1.7} />
                            Train réservé
                          </span>
                        )}
                      </div>
                    )}
                    {teammates.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-[var(--color-ink-3)]">
                          Avec
                        </span>
                        <AvatarStack users={teammates} max={4} />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
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
  value: string | number;
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

function NextTripCard({ activityId }: { activityId: string }) {
  const activity = useStore((s) =>
    s.activities.find((a) => a.id === activityId),
  );
  const client = useStore((s) =>
    s.clients.find((c) => c.id === activity?.clientId),
  );
  const centre = useStore((s) =>
    s.centres.find((c) => c.id === activity?.centreId),
  );
  if (!activity || !client || !centre) return null;
  const start = new Date(activity.dateStart);
  const departDate = new Date(start);
  // bascule mardi → départ lundi (jamais dimanche)
  departDate.setDate(start.getDate() - 1);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-md bg-[var(--color-line-2)]/40 p-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
          Aller
        </div>
        <div className="mt-1 text-[13px] font-semibold">
          {departDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </div>
        <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
          7h12 · Paris-Montparnasse → {centre.region} · #8615
        </div>
      </div>
      <div className="rounded-md bg-[var(--color-line-2)]/40 p-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
          Sur place
        </div>
        <div className="mt-1 text-[13px] font-semibold">{centre.name}</div>
        <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
          {centre.address}
        </div>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
        >
          <Phone size={11} strokeWidth={1.7} />
          Contact centre
        </button>
      </div>
      <div className="rounded-md bg-[var(--color-line-2)]/40 p-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
          Documents
        </div>
        <ul className="mt-1 space-y-1 text-[11.5px] text-[var(--color-ink-2)]">
          <li>KIT formation PDS — v3.4</li>
          <li>Plan d'accès centre</li>
          <li>Procédure bascule</li>
        </ul>
      </div>
    </div>
  );
}
