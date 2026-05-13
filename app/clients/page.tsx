"use client";

import { PageHeader } from "@/components/page-header";
import { computeActivityState, getAssigneeIds, useStore } from "@/lib/store";
import type {
  ClientKind,
  ClientPipeline,
  Region,
} from "@/lib/types";
import { Field, inputClass, Modal } from "@/components/ui/modal";
import { StateBadge } from "@/components/ui/state-badge";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronRight,
  Crown,
  GraduationCap,
  MapPin,
  Pin,
  Plus,
  Users2,
} from "lucide-react";
import { useMemo, useState } from "react";

const PIPELINE: Record<ClientPipeline, { label: string; tint: string }> = {
  signed: {
    label: "Signé",
    tint: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  },
  verbal: {
    label: "Accord de principe",
    tint: "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]",
  },
  intent: {
    label: "Ressenti",
    tint: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  },
  suspect: {
    label: "Suspect",
    tint: "bg-[var(--color-line-2)] text-[var(--color-ink-3)]",
  },
};

const REGIONS: Region[] = [
  "IDF",
  "Bretagne",
  "PACA",
  "Nouvelle-Aquitaine",
  "Auvergne-Rhône-Alpes",
  "Hauts-de-France",
  "Grand Est",
  "Occitanie",
  "Normandie",
  "Centre-Val de Loire",
  "Pays de la Loire",
  "Bourgogne-Franche-Comté",
  "Corse",
];

export default function Page() {
  const clients = useStore((s) => s.clients);
  const createClient = useStore((s) => s.createClient);
  const [selected, setSelected] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (selected) {
    return (
      <ClientDetail
        clientId={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={["Clients"]}
        title="Clients"
        subtitle="Tous les comptes — clique sur une carte pour ouvrir la vue détaillée."
        showFilters={false}
        actionLabel="Nouveau client"
        actionIcon={<Plus size={13} strokeWidth={1.8} />}
        onAction={() => setCreateOpen(true)}
      />
      <div className="px-8 py-6">
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c.id)}
                className="group block w-full rounded-xl border border-[var(--color-line)] bg-white p-5 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-px hover:border-[var(--color-ink)]/15 hover:shadow-[var(--shadow-card-hover)]"
              >
                <ClientCardContent clientId={c.id} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {createOpen && (
        <CreateClientModal
          onClose={() => setCreateOpen(false)}
          onCreate={(c) => {
            createClient(c);
            setCreateOpen(false);
          }}
        />
      )}
    </>
  );
}

function ClientCardContent({ clientId }: { clientId: string }) {
  const client = useStore((s) => s.clients.find((c) => c.id === clientId))!;
  const allCentres = useStore((s) => s.centres);
  const allActivities = useStore((s) => s.activities);
  const cdp = useStore((s) =>
    s.users.find((u) => u.cdpFor?.includes(clientId)),
  );
  const centres = useMemo(
    () => allCentres.filter((c) => c.clientId === clientId),
    [allCentres, clientId],
  );
  const activities = useMemo(
    () => allActivities.filter((a) => a.clientId === clientId),
    [allActivities, clientId],
  );
  const pl = PIPELINE[client.pipeline];
  const formateurs = centres.filter((c) => c.isFormateur).length;

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
            {client.kind}
          </div>
          <h3 className="mt-0.5 text-[18px] font-semibold tracking-tight text-[var(--color-ink)]">
            {client.name}
          </h3>
        </div>
        <span
          className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${pl.tint}`}
        >
          {pl.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Metric
          label="Salariés"
          value={`${(client.nbSalaries / 1000).toFixed(0)}k`}
        />
        <Metric label="Centres" value={`${centres.length}`} hint={`${formateurs} F`} />
        <Metric
          label="Bascule"
          value={
            client.dateBascule
              ? new Date(client.dateBascule).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-line-2)] pt-3 text-[11.5px] text-[var(--color-ink-3)]">
        <span className="truncate">
          {cdp ? (
            <span className="inline-flex items-center gap-1">
              <Crown
                size={10}
                strokeWidth={2}
                className="text-[var(--color-accent)]"
              />
              CDP {cdp.name}
            </span>
          ) : (
            "Pas de CDP"
          )}
          {" · "}
          {activities.length} activité{activities.length > 1 ? "s" : ""}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-[var(--color-ink-2)] group-hover:text-[var(--color-accent)]">
          Ouvrir
          <ChevronRight size={11} strokeWidth={2} />
        </span>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[15px] font-semibold tabular-nums text-[var(--color-ink)]">
          {value}
        </span>
        {hint && (
          <span className="text-[10.5px] text-[var(--color-ink-3)]">{hint}</span>
        )}
      </div>
    </div>
  );
}

/* ============== Detail view ============== */

function ClientDetail({
  clientId,
  onBack,
}: {
  clientId: string;
  onBack: () => void;
}) {
  const client = useStore((s) => s.clients.find((c) => c.id === clientId));
  const allCentres = useStore((s) => s.centres);
  const allActivities = useStore((s) => s.activities);
  const users = useStore((s) => s.users);
  const cdp = useStore((s) =>
    s.users.find((u) => u.cdpFor?.includes(clientId)),
  );
  const centres = useMemo(
    () => allCentres.filter((c) => c.clientId === clientId),
    [allCentres, clientId],
  );
  const activities = useMemo(
    () => allActivities.filter((a) => a.clientId === clientId),
    [allActivities, clientId],
  );
  // ⚠ Ne PAS faire `useStore((s) => s.pool.filter(...))` :
  // ça retourne un nouvel array à chaque appel → Zustand v5 voit un changement
  // référentiel à chaque render → boucle infinie → React #185.
  // On récupère la référence stable et on filtre en dehors du selector.
  const allPool = useStore((s) => s.pool);
  const pool = useMemo(
    () => allPool.filter((p) => p.clientId === clientId),
    [allPool, clientId],
  );
  const activeQuarter = useStore((s) => s.activeQuarter);
  const toggleF = useStore((s) => s.toggleCentreFormateur);
  const toggleE = useStore((s) => s.toggleCentreExterne);
  const createCentre = useStore((s) => s.createCentre);
  const openDrawer = useStore((s) => s.openDrawer);

  const [centreModalOpen, setCentreModalOpen] = useState(false);

  if (!client) return null;
  const pl = PIPELINE[client.pipeline];
  const formationsCount = activities.filter(
    (a) => a.type === "Formation",
  ).length;
  const accompCount = activities.filter(
    (a) => a.type === "Accompagnement",
  ).length;
  const poolForQuarter = pool.filter((p) => p.quarter === activeQuarter);
  const poolQualified = poolForQuarter.filter(
    (p) => p.qualification === "available" || p.qualification === "backup",
  );

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur-sm">
        <div className="px-8 pt-5 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={12} strokeWidth={2} />
            Clients
          </button>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                {client.kind}
              </div>
              <h1 className="mt-1 flex items-baseline gap-3 text-[28px] font-semibold tracking-tight">
                {client.name}
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${pl.tint}`}
                >
                  {pl.label}
                </span>
              </h1>
              <div className="mt-1.5 text-[12.5px] text-[var(--color-ink-3)]">
                {cdp ? (
                  <span className="inline-flex items-center gap-1">
                    <Crown
                      size={11}
                      strokeWidth={1.9}
                      className="text-[var(--color-accent)]"
                    />
                    CDP : {cdp.name}
                  </span>
                ) : (
                  "Pas de CDP désigné"
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-8 py-6">
        {/* Header stats — bandeau focal */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <BigStat
            label="Salariés suivis"
            value={`${(client.nbSalaries / 1000).toFixed(0)}k`}
          />
          <BigStat
            label="Bascule J0"
            value={
              client.dateBascule
                ? new Date(client.dateBascule).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })
                : "—"
            }
          />
          <BigStat
            label="Déploiement"
            value={`${client.nbSemainesDeploiement ?? "—"} sem`}
          />
          <BigStat label="Centres" value={`${centres.length}`} />
          <BigStat label="Formations" value={`${formationsCount}`} />
          <BigStat label="Accompagnements" value={`${accompCount}`} />
        </section>

        {/* Centres */}
        <section className="rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--color-line-2)] px-5 py-3">
            <h2 className="text-[14px] font-semibold">
              Centres ·{" "}
              <span className="text-[var(--color-ink-3)] font-normal tabular-nums">
                {centres.length}
              </span>
            </h2>
            <button
              type="button"
              onClick={() => setCentreModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
            >
              <Plus size={11} strokeWidth={2} />
              Ajouter un centre
            </button>
          </div>
          {centres.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucun centre. Ajoute le premier ↗
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line-2)]">
              {centres.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 px-5 py-3"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-line-2)] text-[var(--color-ink-2)]">
                    <Building2 size={14} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold">{c.name}</div>
                    <div className="flex flex-wrap items-center gap-x-3 text-[11.5px] text-[var(--color-ink-3)]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} strokeWidth={1.6} />
                        {c.address}
                      </span>
                      <span>{c.region}</span>
                      {c.nbSalaries != null && (
                        <span>{(c.nbSalaries / 1000).toFixed(0)}k salariés</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ToggleChip
                      pressed={c.isFormateur}
                      onClick={() => toggleF(c.id)}
                      icon={<GraduationCap size={11} strokeWidth={1.9} />}
                      label="Formateur"
                      tint="accent"
                    />
                    <ToggleChip
                      pressed={!!c.isExterne}
                      onClick={() => toggleE(c.id)}
                      icon={<Pin size={11} strokeWidth={1.9} />}
                      label="Externe"
                      tint="neutral"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Activités */}
        <section className="rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-line-2)] px-5 py-3">
            <h2 className="text-[14px] font-semibold">
              Activités ·{" "}
              <span className="text-[var(--color-ink-3)] font-normal tabular-nums">
                {activities.length}
              </span>
            </h2>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
              Formations et accompagnements de ce client · clic pour staffer
            </p>
          </div>
          {activities.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucune activité programmée.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-line-2)]">
              {activities
                .sort(
                  (a, b) =>
                    +new Date(a.dateStart) - +new Date(b.dateStart),
                )
                .map((a) => {
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
                        className="flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[var(--color-line-2)]/40"
                      >
                        <div className="w-[90px] shrink-0">
                          <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
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
                              {a.type} {a.subCategory ?? ""}
                            </span>
                            <span className="text-[11.5px] text-[var(--color-ink-3)]">
                              · {centre?.name}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
                            {a.assignments.length} assigné
                            {a.assignments.length > 1 ? "s" : ""}
                          </div>
                        </div>
                        <AvatarStack users={assigned} max={3} />
                        <StateBadge state={computeActivityState(a)} size="sm" />
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </section>

        {/* Pool du client */}
        <section className="rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--color-line-2)] px-5 py-3">
            <h2 className="text-[14px] font-semibold">
              Pool ·{" "}
              <span className="text-[var(--color-ink-3)] font-normal tabular-nums">
                {poolQualified.length}
              </span>
              <span className="ml-1 text-[11.5px] font-normal text-[var(--color-ink-3)]">
                qualifié sur {activeQuarter}
              </span>
            </h2>
          </div>
          {poolForQuarter.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucune entrée pour ce trimestre.
            </div>
          ) : (
            <ul className="grid gap-2 px-5 py-3 sm:grid-cols-2 lg:grid-cols-3">
              {poolForQuarter.map((p) => {
                const u = users.find((x) => x.id === p.userId);
                if (!u) return null;
                const tint =
                  p.qualification === "available"
                    ? "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]"
                    : p.qualification === "backup"
                      ? "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]"
                      : "bg-[var(--color-line-2)] text-[var(--color-ink-3)]";
                const qlabel =
                  p.qualification === "available"
                    ? "Dispo"
                    : p.qualification === "backup"
                      ? "Backup"
                      : "À qualifier";
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-md border border-[var(--color-line)] px-2.5 py-1.5"
                  >
                    <Avatar user={u} size={22} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium">
                        {u.name}
                      </div>
                      <div className="text-[10.5px] text-[var(--color-ink-3)]">
                        {u.level}
                      </div>
                    </div>
                    <span
                      className={`rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium ${tint}`}
                    >
                      {qlabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {centreModalOpen && (
        <CreateCentreModal
          clientId={clientId}
          onClose={() => setCentreModalOpen(false)}
          onCreate={(c) => {
            createCentre(c);
            setCentreModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 shadow-[var(--shadow-card)]">
      <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
    </div>
  );
}

function ToggleChip({
  pressed,
  onClick,
  icon,
  label,
  tint,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tint: "accent" | "neutral";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors ${
        pressed
          ? tint === "accent"
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]"
            : "bg-[var(--color-ink)] text-white"
          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============== Modals ============== */

const KINDS: ClientKind[] = ["SPSTI", "Autonome", "Service de santé", "Autre"];

function CreateClientModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: {
    name: string;
    kind: ClientKind;
    pipeline: ClientPipeline;
    dateDebut: string;
    dateFin: string;
    nbSalaries: number;
    dateBascule?: string;
    nbSemainesDeploiement?: number;
    estFormateurs?: number;
    estAccompagnateurs?: number;
    estJoursFormation?: number;
    estJoursAccomp?: number;
    confidence?: number;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ClientKind>("SPSTI");
  const [pipeline, setPipeline] = useState<ClientPipeline>("intent");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [dateBascule, setDateBascule] = useState("");
  const [nbSalaries, setNbSalaries] = useState(50000);
  const [estFormateurs, setEstFormateurs] = useState(4);
  const [estAccompagnateurs, setEstAccompagnateurs] = useState(8);
  const [nbSemainesDeploiement, setNbSemaines] = useState(18);

  const canSubmit = name && dateDebut && dateFin;

  return (
    <Modal
      title="Nouveau client"
      icon={<Building2 size={14} strokeWidth={1.8} className="text-[var(--color-accent)]" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                name,
                kind,
                pipeline,
                dateDebut,
                dateFin,
                nbSalaries,
                dateBascule: dateBascule || undefined,
                nbSemainesDeploiement,
                estFormateurs,
                estAccompagnateurs,
                estJoursFormation: Math.round(nbSalaries / 1000),
                estJoursAccomp: Math.round(nbSalaries / 1000),
                confidence:
                  pipeline === "signed"
                    ? 100
                    : pipeline === "verbal"
                      ? 75
                      : pipeline === "intent"
                        ? 50
                        : 25,
              })
            }
            className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer le client
          </button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nom">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : McDonald's France"
            className={inputClass}
          />
        </Field>
        <Field label="Type">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ClientKind)}
            className={inputClass}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pipeline">
          <select
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value as ClientPipeline)}
            className={inputClass}
          >
            <option value="suspect">Suspect</option>
            <option value="intent">Ressenti</option>
            <option value="verbal">Accord de principe</option>
            <option value="signed">Signé</option>
          </select>
        </Field>
        <Field label="Nb salariés suivis">
          <input
            type="number"
            value={nbSalaries}
            onChange={(e) => setNbSalaries(parseInt(e.target.value || "0", 10))}
            className={inputClass}
          />
        </Field>
        <Field label="Début déploiement">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Fin déploiement">
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Bascule J0" hint="Mardi recommandé">
          <input
            type="date"
            value={dateBascule}
            onChange={(e) => setDateBascule(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Durée (semaines)">
          <input
            type="number"
            value={nbSemainesDeploiement}
            onChange={(e) => setNbSemaines(parseInt(e.target.value || "0", 10))}
            className={inputClass}
          />
        </Field>
        <Field label="Formateurs estimés">
          <input
            type="number"
            value={estFormateurs}
            onChange={(e) => setEstFormateurs(parseInt(e.target.value || "0", 10))}
            className={inputClass}
          />
        </Field>
        <Field label="Accompagnateurs estimés">
          <input
            type="number"
            value={estAccompagnateurs}
            onChange={(e) =>
              setEstAccompagnateurs(parseInt(e.target.value || "0", 10))
            }
            className={inputClass}
          />
        </Field>
      </div>
    </Modal>
  );
}

function CreateCentreModal({
  clientId,
  onClose,
  onCreate,
}: {
  clientId: string;
  onClose: () => void;
  onCreate: (c: {
    clientId: string;
    name: string;
    address: string;
    region: Region;
    isFormateur: boolean;
    isExterne: boolean;
    nbSalaries?: number;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<Region>("IDF");
  const [nbSalaries, setNbSalaries] = useState(20000);
  const [isFormateur, setIsFormateur] = useState(false);
  const [isExterne, setIsExterne] = useState(false);

  const canSubmit = name && address;

  return (
    <Modal
      title="Nouveau centre"
      icon={<Building2 size={14} strokeWidth={1.8} className="text-[var(--color-accent)]" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                clientId,
                name,
                address,
                region,
                isFormateur,
                isExterne,
                nbSalaries: nbSalaries || undefined,
              })
            }
            className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer
          </button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nom">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : Site Rennes"
            className={inputClass}
          />
        </Field>
        <Field label="Région">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className={inputClass}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Adresse">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="12 av. de la Bouvardière, 35000 Rennes"
            className={inputClass}
          />
        </Field>
        <Field label="Nb salariés sur ce centre">
          <input
            type="number"
            value={nbSalaries}
            onChange={(e) => setNbSalaries(parseInt(e.target.value || "0", 10))}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="flex gap-2 pt-2">
        <label className="flex items-center gap-2 text-[12.5px]">
          <input
            type="checkbox"
            checked={isFormateur}
            onChange={(e) => {
              setIsFormateur(e.target.checked);
              if (e.target.checked) setIsExterne(false);
            }}
          />
          Centre formateur
        </label>
        <label className="flex items-center gap-2 text-[12.5px]">
          <input
            type="checkbox"
            checked={isExterne}
            onChange={(e) => {
              setIsExterne(e.target.checked);
              if (e.target.checked) setIsFormateur(false);
            }}
          />
          Centre externe
        </label>
      </div>
    </Modal>
  );
}
