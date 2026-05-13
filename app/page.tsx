"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useStore, computeActivityState, getAssigneeIds } from "@/lib/store";
import { TODAY } from "@/lib/mock-data";
import {
  ArrowRight,
  Building2,
  Inbox,
  Layers,
  MapPin,
  Sparkles,
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

  const isCollab = roleView === "collaborateur";
  const isLogistique = currentUser?.role === "Logistique";
  const isManager = roleView === "manager";
  const isAdmin = roleView === "admin" || roleView === "super-admin";
  // Backward-compat alias for branches that previously had per-flavor managers
  const isManagerDep = isManager && currentUser?.team === "Déploiement";
  const isManagerFormation = isManager && currentUser?.team === "Formation";
  const isOps = isCollab;

  const myActivities = activities
    .filter((a) => getAssigneeIds(a).includes(currentUserId))
    .filter((a) => withinNextDays(a.dateStart, 14))
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  const toStaff = activities
    .filter(
      (a) =>
        a.type !== "Off" &&
        (computeActivityState(a) === "draft" ||
          computeActivityState(a) === "to-staff") &&
        withinNextDays(a.dateStart, 30),
    )
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  const toBook = activities.filter(
    (a) => a.validation === "validated" && a.type !== "Off",
  );

  const newObsCount = observerRequests.filter((r) => r.status === "submitted")
    .length;
  const poolToQualify = pool.filter((e) => e.qualification === null).length;
  const cancelCount = activities.filter((a) => a.cancelRequested).length;

  let title = "Aujourd'hui";
  let subtitle = "Ce qui demande ton attention cette semaine.";
  if (isOps) {
    title = `Bonjour ${currentUser?.name.split(" ")[0] ?? ""}`;
    subtitle = "Tes prochains déplacements et missions.";
  } else if (isLogistique) {
    title = "Logistique";
    subtitle = "Missions au statut Staffing validé · à organiser.";
  } else if (isManagerFormation) {
    subtitle = "Définition du besoin et pilotage du prévisionnel.";
  }

  return (
    <>
      <PageHeader
        breadcrumb={["Aujourd'hui"]}
        title={title}
        subtitle={subtitle}
        showFilters={false}
      />

      <div className="space-y-8 px-8 py-6">
        {/* Banner alertes ressources */}
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
                      {c?.name} · {a.type} · manque {a.shortfall} pour{" "}
                      {a.quarter}
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

        {/* OPS — Mon planning */}
        {isOps && <OpsToday activities={myActivities} />}

        {/* Logistique — files à booker */}
        {isLogistique && <LogistiqueToday activities={toBook} />}

        {/* Managers / Admin — HERO À staffer + outils */}
        {(isManagerDep || isManagerFormation || isAdmin) && (
          <>
            {/* HERO — l'action principale */}
            <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line-2)] bg-gradient-to-br from-white to-[var(--color-surface-2)] px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-accent)] text-white">
                    <Sparkles size={16} strokeWidth={1.7} />
                  </span>
                  <div>
                    <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--color-accent-2)]">
                      Action prioritaire
                    </div>
                    <h2 className="mt-0.5 text-[19px] font-semibold tracking-tight">
                      {toStaff.length === 0
                        ? "Tout est staffé."
                        : `${toStaff.length} mission${toStaff.length > 1 ? "s" : ""} à staffer`}
                    </h2>
                    <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-3)]">
                      30 prochains jours · clic pour ouvrir le drawer et piocher dans le pool qualifié.
                    </p>
                  </div>
                </div>
                <Link
                  href="/accompagnement/liste"
                  className="hidden md:inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                >
                  Voir tous les accompagnements
                  <ArrowRight size={11} strokeWidth={2} />
                </Link>
              </div>
              {toStaff.length === 0 ? (
                <div className="px-6 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
                  Aucun staffing en attente. Bravo.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--color-line-2)]">
                  {toStaff.slice(0, 6).map((a) => {
                    const client = clients.find((c) => c.id === a.clientId);
                    const centre = centres.find((c) => c.id === a.centreId);
                    const assigned = getAssigneeIds(a)
                      .map((id) => users.find((u) => u.id === id))
                      .filter(Boolean) as typeof users;
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() =>
                            openDrawer({ kind: "activity", id: a.id })
                          }
                          className="group flex w-full items-center gap-4 px-6 py-3 text-left hover:bg-[var(--color-line-2)]/40"
                        >
                          <div className="w-[80px] shrink-0">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                              {new Date(a.dateStart).toLocaleDateString(
                                "fr-FR",
                                { weekday: "short" },
                              )}
                            </div>
                            <div className="text-[16px] font-semibold tabular-nums leading-tight">
                              {new Date(a.dateStart).toLocaleDateString(
                                "fr-FR",
                                { day: "2-digit", month: "short" },
                              )}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold">
                                {client?.name}
                              </span>
                              <span className="text-[11.5px] text-[var(--color-ink-3)]">
                                · {centre?.name}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
                              {a.type} {a.subCategory ?? ""} ·{" "}
                              {a.assignments.length} assigné
                              {a.assignments.length > 1 ? "s" : ""}
                            </div>
                          </div>
                          {assigned.length > 0 && (
                            <AvatarStack users={assigned} max={3} />
                          )}
                          <StateBadge
                            state={computeActivityState(a)}
                            size="sm"
                          />
                          <ArrowRight
                            size={13}
                            strokeWidth={2}
                            className="text-[var(--color-ink-3)] opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Secondary cards */}
            <section className="grid gap-3 md:grid-cols-3">
              <Tool
                href="/accompagnement/pools"
                title="Pool à qualifier"
                count={poolToQualify}
                hint="entrées en attente"
                Icon={Layers}
              />
              <Tool
                href="/demandes/observation"
                title="Demandes d'observation"
                count={newObsCount}
                hint="à traiter"
                Icon={Inbox}
              />
              <Tool
                href="/logistique/liste"
                title="Prêts logistique"
                count={toBook.length}
                hint="missions validées"
                Icon={TrainFront}
              />
            </section>

            {/* Aperçu clients en cours */}
            <section>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-[13px] font-semibold">Clients en cours</h2>
                <Link
                  href="/clients"
                  className="text-[11.5px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                >
                  Tous →
                </Link>
              </div>
              <ul className="grid gap-3 md:grid-cols-3">
                {clients
                  .filter((c) => c.pipeline === "signed")
                  .slice(0, 3)
                  .map((c) => {
                    const acts = activities.filter((a) => a.clientId === c.id);
                    return (
                      <li key={c.id}>
                        <Link
                          href="/clients"
                          className="block rounded-xl border border-[var(--color-line)] bg-white p-3 shadow-[var(--shadow-card)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)]"
                        >
                          <div className="flex items-center gap-2">
                            <Building2
                              size={13}
                              strokeWidth={1.7}
                              className="text-[var(--color-ink-3)]"
                            />
                            <span className="text-[13.5px] font-semibold">
                              {c.name}
                            </span>
                          </div>
                          <div className="mt-1 text-[11.5px] text-[var(--color-ink-3)]">
                            {(c.nbSalaries / 1000).toFixed(0)}k salariés ·{" "}
                            {acts.length} activités
                          </div>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </section>
          </>
        )}

        {cancelCount > 0 && (isManager || isAdmin) && (
          <section className="rounded-xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[13px] font-semibold">
                  {cancelCount} demande{cancelCount > 1 ? "s" : ""} d'annulation
                </div>
                <div className="text-[11.5px] text-[var(--color-ink-3)]">
                  À approuver ou refuser
                </div>
              </div>
              <Link
                href="/demandes/annulations"
                className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[var(--color-ink-2)]"
              >
                Traiter
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function Tool({
  href,
  title,
  count,
  hint,
  Icon,
}: {
  href: string;
  title: string;
  count: number;
  hint: string;
  Icon: typeof Inbox;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)]"
    >
      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-line-2)] text-[var(--color-ink-2)] group-hover:bg-[var(--color-accent-soft)] group-hover:text-[var(--color-accent-2)] transition-colors">
        <Icon size={14} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[13px] font-semibold">{title}</h3>
          <span className="font-mono text-[12px] font-semibold tabular-nums text-[var(--color-ink)]">
            {count}
          </span>
        </div>
        <p className="text-[11.5px] text-[var(--color-ink-3)]">{hint}</p>
      </div>
    </Link>
  );
}

function OpsToday({
  activities,
}: {
  activities: ReturnType<typeof useStore.getState>["activities"];
}) {
  const openDrawer = useStore((s) => s.openDrawer);
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const currentUserId = useStore((s) => s.currentUserId);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-line-2)] px-6 py-4">
        <h2 className="text-[15px] font-semibold">Ma quinzaine</h2>
        <p className="text-[12px] text-[var(--color-ink-3)]">
          Mes missions et indisponibilités à venir.
        </p>
      </div>
      {activities.length === 0 ? (
        <div className="px-6 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
          Aucune mission à venir.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-line-2)]">
          {activities.map((a) => {
            const client = clients.find((c) => c.id === a.clientId);
            const centre = centres.find((c) => c.id === a.centreId);
            const teammates = getAssigneeIds(a)
              .filter((id) => id !== currentUserId)
              .map((id) => users.find((u) => u.id === id))
              .filter(Boolean) as typeof users;
            const isOff = a.type === "Off";
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => openDrawer({ kind: "activity", id: a.id })}
                  className="flex w-full items-center gap-4 px-6 py-3 text-left hover:bg-[var(--color-line-2)]/40"
                >
                  <div className="w-[80px] shrink-0">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                      {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-[16px] font-semibold tabular-nums">
                      {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">
                      {isOff
                        ? "Indisponibilité (Off)"
                        : `${client?.name} · ${centre?.name}`}
                    </div>
                    {!isOff && (
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
                        <MapPin size={11} strokeWidth={1.6} />
                        {centre?.address}
                      </div>
                    )}
                  </div>
                  {teammates.length > 0 && (
                    <AvatarStack users={teammates} max={3} />
                  )}
                  <StateBadge state={computeActivityState(a)} size="sm" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function LogistiqueToday({
  activities,
}: {
  activities: ReturnType<typeof useStore.getState>["activities"];
}) {
  const openDrawer = useStore((s) => s.openDrawer);
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
      <div className="border-b border-[var(--color-line-2)] px-6 py-4">
        <h2 className="text-[15px] font-semibold">
          {activities.length} mission{activities.length > 1 ? "s" : ""} à organiser
        </h2>
        <p className="text-[12px] text-[var(--color-ink-3)]">
          Toutes les missions au statut Staffing Validé.
        </p>
      </div>
      <ul className="divide-y divide-[var(--color-line-2)]">
        {activities.map((a) => {
          const client = clients.find((c) => c.id === a.clientId);
          const centre = centres.find((c) => c.id === a.centreId);
          const assigned = getAssigneeIds(a)
            .map((id) => users.find((u) => u.id === id))
            .filter(Boolean) as typeof users;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => openDrawer({ kind: "activity", id: a.id })}
                className="flex w-full items-center gap-4 px-6 py-3 text-left hover:bg-[var(--color-line-2)]/40"
              >
                <div className="w-[80px] shrink-0">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                    {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="text-[16px] font-semibold tabular-nums">
                    {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold">
                    {client?.name} · {centre?.name}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
                    {centre?.region} · {assigned.length} participant
                    {assigned.length > 1 ? "s" : ""}
                  </div>
                </div>
                <AvatarStack users={assigned} max={3} />
                <StateBadge state={computeActivityState(a)} size="sm" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
