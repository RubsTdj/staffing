"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { Qualification, Quarter, Team } from "@/lib/types";
import { ALL_TEAMS } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Field, Modal } from "@/components/ui/modal";
import { AlertTriangle, Plus, Search, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";

const QUARTERS = ["2026-Q1", "2026-Q2", "2026-Q3", "2026-Q4"] as const;

const QUAL_BTN_LABEL: Record<"available" | "backup" | "unavailable", string> = {
  available: "Dispo",
  backup: "Backup",
  unavailable: "Indispo",
};

const TEAM_TINT: Record<Team, string> = {
  Formation: "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]",
  Déploiement: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  RM: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  EFEX: "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]",
  Produits: "bg-[var(--color-tint-pink)] text-[var(--color-tint-pink-ink)]",
  Intégration: "bg-[var(--color-line-2)] text-[var(--color-ink-2)]",
};

export default function Page() {
  const roleView = useStore((s) => s.roleView);
  const currentUserId = useStore((s) => s.currentUserId);
  const activeQuarter = useStore((s) => s.activeQuarter);
  const setActiveQuarter = useStore((s) => s.setActiveQuarter);
  const clients = useStore((s) => s.clients);
  const users = useStore((s) => s.users);
  const pool = useStore((s) => s.pool);
  const qualifyPoolEntry = useStore((s) => s.qualifyPoolEntry);
  const upsertPoolEntry = useStore((s) => s.upsertPoolEntry);

  const isCoordinator =
    roleView === "manager" ||
    roleView === "admin" ||
    roleView === "super-admin";

  const [addingFor, setAddingFor] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return clients
      .filter((c) => c.pipeline === "signed" || c.pipeline === "verbal")
      .map((client) => {
        const entries = pool.filter(
          (e) => e.clientId === client.id && e.quarter === activeQuarter,
        );
        const qualified = entries.filter((e) => e.qualification !== null);
        return { client, entries, qualified };
      });
  }, [clients, pool, activeQuarter]);

  return (
    <>
      <PageHeader
        breadcrumb={["Pools"]}
        title="Pools par client"
        subtitle={
          isCoordinator
            ? "Qualifie les entrées (Dispo/Backup/Indispo). Ajoute les membres au pool quand il manque."
            : "Renseigne ton équipe pour le trimestre. Le Manager Déploiement qualifiera ensuite."
        }
        showFilters={false}
        right={
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
            {QUARTERS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setActiveQuarter(q)}
                className={`rounded-[5px] px-2 py-1 text-[12px] font-medium transition-colors ${
                  q === activeQuarter
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-4 px-8 py-6">
        {grouped.map(({ client, entries, qualified }) => {
          const progress = Math.round(
            (qualified.length / Math.max(1, entries.length)) * 100,
          );
          const required = client.estAccompagnateurs ?? 10;
          const dispoCount = entries.filter(
            (e) => e.qualification === "available",
          ).length;
          const isShort = dispoCount < required;

          return (
            <section
              key={client.id}
              className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line-2)] px-5 py-3">
                <div className="flex min-w-0 items-baseline gap-3">
                  <h2 className="text-[15px] font-semibold tracking-tight">
                    {client.name}
                  </h2>
                  <span className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                    {client.kind}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
                  <span>
                    <span className="font-mono tabular-nums font-semibold text-[var(--color-ink)]">
                      {dispoCount}/{required}
                    </span>{" "}
                    accomp. dispo
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--color-line-2)]">
                      <div
                        className="h-full bg-[var(--color-status-done)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddingFor(client.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ink)] px-2.5 py-1 text-[11.5px] font-medium text-white hover:bg-[var(--color-ink-2)]"
                  >
                    <UserPlus size={11} strokeWidth={2} />
                    Ajouter au pool
                  </button>
                </div>
              </div>

              {isShort && (
                <div className="flex items-center gap-2 bg-[var(--color-tint-pink)] px-5 py-2 text-[11.5px] text-[var(--color-tint-pink-ink)]">
                  <AlertTriangle size={12} strokeWidth={1.8} />
                  <span>
                    Pool sous-dimensionné — il manque{" "}
                    <strong>{required - dispoCount}</strong> accompagnant
                    {required - dispoCount > 1 ? "s" : ""}.
                  </span>
                </div>
              )}

              <ul className="divide-y divide-[var(--color-line-2)]">
                {entries.length === 0 && (
                  <li className="px-5 py-8 text-center text-[12.5px] text-[var(--color-ink-3)]">
                    Aucun collaborateur dans le pool {activeQuarter}. Clique
                    sur <strong>Ajouter au pool</strong> pour commencer.
                  </li>
                )}
                {entries.map((e) => {
                  const user = users.find((u) => u.id === e.userId);
                  if (!user) return null;
                  return (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3"
                    >
                      <Avatar user={user} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">
                            {user.name}
                          </span>
                          <span
                            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${TEAM_TINT[user.team]}`}
                          >
                            {user.team}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-[var(--color-ink-3)]">
                          {user.level}
                        </div>
                      </div>
                      <Badge value={e.rawAvailability} />
                      <div className="flex items-center gap-1">
                        {isCoordinator ? (
                          (["available", "backup", "unavailable"] as const).map(
                            (q) => (
                              <button
                                key={q}
                                type="button"
                                onClick={() =>
                                  qualifyPoolEntry(
                                    e.id,
                                    q === "unavailable"
                                      ? null
                                      : (q as Qualification),
                                    currentUserId,
                                  )
                                }
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                                  (e.qualification ?? "unavailable") === q
                                    ? "bg-[var(--color-ink)] text-white"
                                    : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                                }`}
                              >
                                {QUAL_BTN_LABEL[q]}
                              </button>
                            ),
                          )
                        ) : e.qualification ? (
                          <span className="rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--color-ink-2)]">
                            Qualifié : {QUAL_BTN_LABEL[e.qualification]}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--color-ink-3)]">
                            En attente
                          </span>
                        )}
                      </div>
                      {e.note && (
                        <div className="basis-full pl-[40px] text-[11.5px] italic text-[var(--color-ink-3)]">
                          {e.note}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {addingFor && (
        <AddToPoolModal
          clientId={addingFor}
          quarter={activeQuarter}
          filledById={currentUserId}
          onClose={() => setAddingFor(null)}
          onAdd={(payload) => {
            upsertPoolEntry(payload);
          }}
        />
      )}
    </>
  );
}

function Badge({
  value,
}: {
  value: "available" | "backup" | "unavailable";
}) {
  const cfg = {
    available: { label: "Dispo", dot: "bg-[var(--color-status-done)]" },
    backup: { label: "Backup", dot: "bg-[var(--color-status-partial)]" },
    unavailable: { label: "Indispo", dot: "bg-[var(--color-status-alert)]" },
  }[value];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--color-ink-2)]">
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AddToPoolModal({
  clientId,
  quarter,
  filledById,
  onClose,
  onAdd,
}: {
  clientId: string;
  quarter: Quarter;
  filledById: string;
  onClose: () => void;
  onAdd: (payload: {
    userId: string;
    clientId: string;
    quarter: Quarter;
    filledById: string;
    selfDeclared: boolean;
    rawAvailability: "available" | "backup" | "unavailable";
    qualification: null;
  }) => void;
}) {
  const users = useStore((s) => s.users);
  const pool = useStore((s) => s.pool);
  const client = useStore((s) =>
    s.clients.find((c) => c.id === clientId),
  );
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<"all" | Team>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [raw, setRaw] = useState<"available" | "backup" | "unavailable">(
    "available",
  );

  const candidates = useMemo(() => {
    return users
      .filter(
        (u) =>
          u.role !== "Admin" &&
          u.role !== "Logistique" &&
          !pool.some(
            (e) =>
              e.userId === u.id &&
              e.clientId === clientId &&
              e.quarter === quarter,
          ),
      )
      .filter((u) => (teamFilter === "all" ? true : u.team === teamFilter))
      .filter((u) =>
        query.trim()
          ? u.name.toLowerCase().includes(query.toLowerCase())
          : true,
      );
  }, [users, pool, clientId, quarter, teamFilter, query]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <Modal
      title={`Ajouter au pool · ${client?.name ?? ""}`}
      icon={
        <UserPlus
          size={14}
          strokeWidth={1.8}
          className="text-[var(--color-accent)]"
        />
      }
      onClose={onClose}
      size="lg"
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
            disabled={selected.size === 0}
            onClick={() => {
              for (const userId of selected) {
                onAdd({
                  userId,
                  clientId,
                  quarter,
                  filledById,
                  selfDeclared: false,
                  rawAvailability: raw,
                  qualification: null,
                });
              }
              onClose();
            }}
            className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ajouter {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </>
      }
    >
      <Field
        label="Disponibilité déclarée"
        hint="État brut renseigné · le Manager Déploiement qualifiera ensuite."
      >
        <div className="flex gap-1">
          {(["available", "backup", "unavailable"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRaw(r)}
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors ${
                r === raw
                  ? "bg-[var(--color-ink)] text-white"
                  : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
              }`}
            >
              {r === "available"
                ? "Disponible"
                : r === "backup"
                  ? "Backup"
                  : "Indisponible"}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-2 py-1">
        <Search
          size={13}
          strokeWidth={1.8}
          className="text-[var(--color-ink-3)]"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un collaborateur…"
          className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-[var(--color-ink-3)]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <Chip
          active={teamFilter === "all"}
          onClick={() => setTeamFilter("all")}
        >
          Toutes équipes
        </Chip>
        {ALL_TEAMS.map((t) => (
          <Chip
            key={t}
            active={teamFilter === t}
            onClick={() => setTeamFilter(t)}
          >
            {t}
          </Chip>
        ))}
      </div>

      <ul className="max-h-72 space-y-1 overflow-y-auto rounded-md border border-[var(--color-line)] bg-white p-1">
        {candidates.length === 0 && (
          <li className="px-3 py-6 text-center text-[12px] text-[var(--color-ink-3)]">
            Aucun collaborateur disponible — soit déjà dans le pool, soit
            filtre trop restrictif.
          </li>
        )}
        {candidates.map((u) => {
          const isSelected = selected.has(u.id);
          return (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => toggle(u.id)}
                className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[12.5px] transition-colors ${
                  isSelected
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]"
                    : "hover:bg-[var(--color-line-2)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="accent-[var(--color-accent)]"
                />
                <Avatar user={u} size={22} />
                <span className="flex-1 truncate font-medium">{u.name}</span>
                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${TEAM_TINT[u.team]}`}
                >
                  {u.team}
                </span>
                <span className="text-[10.5px] text-[var(--color-ink-3)]">
                  {u.level}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-ink)] text-white"
          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
      }`}
    >
      {children}
    </button>
  );
}
