"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useStore, computeActivityState } from "@/lib/store";
import { TODAY } from "@/lib/mock-data";
import {
  ArrowRight,
  CalendarDays,
  Inbox,
  MapPin,
  TrainFront,
  Users2,
} from "lucide-react";
import { StateBadge } from "@/components/ui/state-badge";
import { Avatar, AvatarStack } from "@/components/ui/avatar";

const today = new Date(TODAY);

function withinNextDays(d: string, n: number) {
  const date = new Date(d);
  const diff = (date.getTime() - today.getTime()) / 86400000;
  return diff >= -1 && diff <= n;
}

export default function Page() {
  const roleView = useStore((s) => s.roleView);
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const activities = useStore((s) => s.activities);
  const observerRequests = useStore((s) => s.observerRequests);
  const pool = useStore((s) => s.pool);
  const resourceAlerts = useStore((s) => s.resourceAlerts);
  const openDrawer = useStore((s) => s.openDrawer);
  const currentUser = users.find((u) => u.id === currentUserId);

  // Role-specific datasets
  const isOps = roleView === "ops";
  const isLogistique = roleView === "logistique";
  const isManagerDep = roleView === "manager-deployment";
  const isManagerFormation = roleView === "manager-formation";
  const isAdmin = roleView === "admin";

  const myActivities = activities
    .filter((a) => a.assignees.includes(currentUserId))
    .filter((a) => withinNextDays(a.dateStart, 14))
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  const toStaff = activities.filter(
    (a) =>
      a.type !== "Off" &&
      (computeActivityState(a) === "draft" ||
        computeActivityState(a) === "to-staff") &&
      withinNextDays(a.dateStart, 30),
  );

  const toBook = activities.filter(
    (a) => a.validation === "validated" && a.type !== "Off",
  );

  const newObsCount = observerRequests.filter((r) => r.status === "submitted")
    .length;

  const poolToQualify = pool.filter((e) => e.qualification === null).length;

  // Headline KPIs by role
  let title = "Aujourd'hui";
  let subtitle = "Vue d'ensemble de la semaine.";
  if (isOps) {
    title = `Bonjour ${currentUser?.name.split(" ")[0] ?? ""}`;
    subtitle = "Tes prochains déplacements et missions.";
  } else if (isLogistique) {
    title = "Logistique";
    subtitle = "Missions au statut Staffing validé · à organiser.";
  } else if (isManagerDep) {
    title = "Aujourd'hui";
    subtitle = "Pools, observations et missions à staffer.";
  } else if (isManagerFormation) {
    title = "Aujourd'hui";
    subtitle = "Définition du besoin et pilotage du prévisionnel.";
  }

  return (
    <>
      <PageHeader breadcrumb={["Aujourd'hui"]} title={title} subtitle={subtitle} showFilters={false} />

      <div className="space-y-6 px-8 py-6">
        {/* Banner: resource alerts visible for managers */}
        {(isManagerDep || isManagerFormation || isAdmin) &&
          resourceAlerts.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl border border-[var(--color-status-alert)]/30 bg-[var(--color-tint-pink)] px-4 py-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-status-alert)] text-[10px] font-semibold text-white">
                !
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[var(--color-tint-pink-ink)]">
                  Ressources insuffisantes — {resourceAlerts.length} alerte
                  {resourceAlerts.length > 1 ? "s" : ""}
                </div>
                {resourceAlerts.map((a) => {
                  const c = clients.find((cl) => cl.id === a.clientId);
                  return (
                    <div
                      key={a.id}
                      className="text-[12px] text-[var(--color-tint-pink-ink)]/90"
                    >
                      {c?.name} · {a.type} · manque {a.shortfall} pour {a.quarter}
                    </div>
                  );
                })}
              </div>
              <Link
                href="/accompagnement/pools"
                className="self-center rounded-md bg-white px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-tint-pink-ink)] ring-1 ring-[var(--color-tint-pink-ink)]/20 hover:bg-[var(--color-tint-pink-ink)]/5"
              >
                Voir les pools
              </Link>
            </div>
          )}

        {/* OPS view: personal week */}
        {isOps && (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KPI
                label="Missions à venir"
                value={myActivities.filter((a) => a.type !== "Off").length}
                hint="14 prochains jours"
              />
              <KPI
                label="Jours terrain"
                value={myActivities.reduce(
                  (sum, a) =>
                    sum +
                    Math.max(
                      1,
                      Math.round(
                        (+new Date(a.dateEnd) - +new Date(a.dateStart)) /
                          86400000,
                      ),
                    ),
                  0,
                )}
                hint="cumulés"
              />
              <KPI
                label="Capacité mensuelle"
                value={`${currentUser?.monthlyTripCapacity ?? "—"}`}
                hint="déplacements / mois"
              />
              <KPI
                label="Off déclarés"
                value={
                  myActivities.filter((a) => a.type === "Off").length
                }
                hint="indispos cette quinzaine"
              />
            </section>

            <section>
              <h2 className="mb-2 text-[13px] font-semibold">Ma quinzaine</h2>
              <ul className="divide-y divide-[var(--color-line-2)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
                {myActivities.length === 0 && (
                  <li className="px-5 py-6 text-center text-[12.5px] text-[var(--color-ink-3)]">
                    Aucune mission prévue dans les 14 prochains jours.
                  </li>
                )}
                {myActivities.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const centre = centres.find((c) => c.id === a.centreId);
                  const state = computeActivityState(a);
                  const isOff = a.type === "Off";
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() =>
                          openDrawer({ kind: "activity", id: a.id })
                        }
                        className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-[var(--color-line-2)]/40"
                      >
                        <div className="w-[100px] shrink-0">
                          <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                            {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-[15px] font-semibold tabular-nums">
                            {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium">
                              {isOff
                                ? "Indisponibilité"
                                : `${client?.name} · ${centre?.name}`}
                            </span>
                            <StateBadge state={state} size="sm" />
                          </div>
                          {!isOff && (
                            <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-[var(--color-ink-3)]">
                              <MapPin size={11} strokeWidth={1.6} />
                              {centre?.address}
                            </div>
                          )}
                        </div>
                        {a.validation === "ready" && (
                          <TrainFront
                            size={14}
                            strokeWidth={1.7}
                            className="text-[var(--color-tint-sand-ink)]"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3">
                <Link
                  href="/mon-espace"
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                >
                  Voir Mon espace complet
                  <ArrowRight size={12} strokeWidth={2} />
                </Link>
              </div>
            </section>
          </>
        )}

        {/* Logistique view */}
        {isLogistique && (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KPI
                label="À organiser"
                value={toBook.length}
                hint="Staffing validé"
              />
              <KPI
                label="Trains à booker"
                value={toBook.reduce((s, a) => s + a.assignees.length, 0)}
                hint="participants"
              />
              <KPI label="Hébergements" value={toBook.length} hint="à réserver" />
              <KPI label="Alertes" value={0} hint="conflits horaires" />
            </section>
            <h2 className="mb-2 text-[13px] font-semibold">
              Missions Staffing Validé
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {toBook.map((a) => {
                const client = clients.find((c) => c.id === a.clientId);
                const centre = centres.find((c) => c.id === a.centreId);
                const assigned = a.assignees
                  .map((id) => users.find((u) => u.id === id))
                  .filter(Boolean) as typeof users;
                return (
                  <li
                    key={a.id}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--color-line)] bg-white p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-[13.5px] font-semibold">
                        {client?.name} · {centre?.name}
                      </div>
                      <StateBadge state={computeActivityState(a)} size="sm" />
                    </div>
                    <div className="text-[11.5px] text-[var(--color-ink-3)]">
                      {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}{" "}
                      → {new Date(a.dateEnd).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      <AvatarStack users={assigned} max={5} />
                      <Link
                        href="/logistique/liste"
                        className="text-[12px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                      >
                        Organiser →
                      </Link>
                    </div>
                  </li>
                );
              })}
              {toBook.length === 0 && (
                <li className="rounded-xl border border-dashed border-[var(--color-line)] bg-white px-5 py-8 text-center text-[12.5px] text-[var(--color-ink-3)] md:col-span-2">
                  Aucune mission à organiser.
                </li>
              )}
            </ul>
          </>
        )}

        {/* Manager view (deployment / formation / admin) */}
        {(isManagerDep || isManagerFormation || isAdmin) && (
          <>
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <KPI
                label="À staffer"
                value={toStaff.length}
                hint="30 prochains jours"
              />
              <KPI
                label="Pool à qualifier"
                value={poolToQualify}
                hint="entrées en attente"
              />
              <KPI
                label="Demandes observation"
                value={newObsCount}
                hint="nouvelles"
              />
              <KPI label="Prêts au départ" value={toBook.length} hint="logistique" />
            </section>

            <section>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-[13px] font-semibold">À staffer en priorité</h2>
                <Link
                  href="/accompagnement/liste"
                  className="text-[11.5px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                >
                  Voir tout →
                </Link>
              </div>
              <ul className="divide-y divide-[var(--color-line-2)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
                {toStaff.slice(0, 5).map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const centre = centres.find((c) => c.id === a.centreId);
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() =>
                          openDrawer({ kind: "activity", id: a.id })
                        }
                        className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-[var(--color-line-2)]/40"
                      >
                        <div className="w-[100px] shrink-0">
                          <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                            {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-[15px] font-semibold tabular-nums">
                            {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium">
                            {client?.name} · {centre?.name}
                          </div>
                          <div className="text-[11.5px] text-[var(--color-ink-3)]">
                            {a.assignees.length} assigné
                            {a.assignees.length > 1 ? "s" : ""} · {a.type}{" "}
                            {a.subCategory ?? ""}
                          </div>
                        </div>
                        <StateBadge
                          state={computeActivityState(a)}
                          size="sm"
                        />
                      </button>
                    </li>
                  );
                })}
                {toStaff.length === 0 && (
                  <li className="px-5 py-6 text-center text-[12.5px] text-[var(--color-ink-3)]">
                    Tout est staffé. Bien joué.
                  </li>
                )}
              </ul>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              <ShortcutCard
                href="/accompagnement/pools"
                title="Qualifier le pool"
                desc={`${poolToQualify} entrées à passer en Dispo / Backup`}
                Icon={Users2}
              />
              <ShortcutCard
                href="/demandes/observation"
                title="Demandes d'observation"
                desc={`${newObsCount} nouvelles à traiter`}
                Icon={Inbox}
              />
              <ShortcutCard
                href="/logistique/liste"
                title="Pousser logistique"
                desc={`${toBook.length} missions Staffing Validé`}
                Icon={CalendarDays}
              />
            </section>
          </>
        )}
      </div>
    </>
  );
}

function KPI({
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

function ShortcutCard({
  href,
  title,
  desc,
  Icon,
}: {
  href: string;
  title: string;
  desc: string;
  Icon: typeof Inbox;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4 transition-all hover:border-[var(--color-ink)]/15 hover:shadow-[0_4px_18px_-12px_rgba(20,17,15,0.18)]"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-line-2)] text-[var(--color-ink-2)]">
        <Icon size={15} strokeWidth={1.7} />
      </span>
      <div>
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-ink-3)]">
          {desc}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink-2)] group-hover:text-[var(--color-accent)]">
        Ouvrir
        <ArrowRight
          size={12}
          strokeWidth={2}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
