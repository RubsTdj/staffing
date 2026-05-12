"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { Qualification } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Circle,
  CircleDashed,
  Filter,
} from "lucide-react";
import { useMemo, useState } from "react";

const QUARTERS = ["2026-Q1", "2026-Q2", "2026-Q3", "2026-Q4"] as const;

const QUAL_BTN_LABEL: Record<"available" | "backup" | "unavailable", string> = {
  available: "Dispo",
  backup: "Backup",
  unavailable: "Indispo",
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

  // mode: Manager Déploiement qualifie, sinon TL/Manager OPS remplit
  const isCoordinator = roleView === "manager-deployment";

  const grouped = useMemo(() => {
    return clients
      .filter((c) => c.pipeline === "signed" || c.pipeline === "verbal")
      .map((client) => {
        const entries = pool.filter(
          (e) => e.clientId === client.id && e.quarter === activeQuarter,
        );
        const qualified = entries.filter((e) => e.qualification !== null);
        const toQualify = entries.filter((e) => e.qualification === null);
        return { client, entries, qualified, toQualify };
      });
  }, [clients, pool, activeQuarter]);

  return (
    <>
      <PageHeader
        breadcrumb={["Pools"]}
        title="Constitution des pools"
        subtitle={
          isCoordinator
            ? "Mode qualification — le Manager Déploiement valide ou downgrade les entrées des TL."
            : "Mode TL/Manager OPS — renseigne ton équipe pour le trimestre."
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

      <div className="space-y-6 px-8 py-6">
        {grouped.map(({ client, entries, qualified, toQualify }) => {
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
              className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
                <div className="flex min-w-0 items-baseline gap-3">
                  <h2 className="text-[15px] font-semibold tracking-tight">
                    {client.name}
                  </h2>
                  <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                    {client.kind}
                  </span>
                  <span className="text-[11.5px] text-[var(--color-ink-3)] tabular-nums">
                    {client.nbSalaries >= 1000
                      ? `${(client.nbSalaries / 1000).toFixed(0)}k`
                      : client.nbSalaries}{" "}
                    salariés
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11.5px] text-[var(--color-ink-3)]">
                  <span>
                    <span className="font-mono tabular-nums">
                      {dispoCount}/{required}
                    </span>{" "}
                    accomp. dispo
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-32 overflow-hidden rounded-full bg-[var(--color-line-2)]">
                      <div
                        className="h-full bg-[var(--color-status-done)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                </div>
              </div>

              {isShort && (
                <div className="flex items-center gap-2 bg-[var(--color-tint-pink)] px-5 py-2 text-[11.5px] text-[var(--color-tint-pink-ink)]">
                  <AlertTriangle size={12} strokeWidth={1.8} />
                  <span>
                    Pool sous-dimensionné — il manque{" "}
                    <strong>{required - dispoCount}</strong> accompagnant
                    {required - dispoCount > 1 ? "s" : ""} pour couvrir le besoin
                    estimé. Manager Déploiement notifié.
                  </span>
                </div>
              )}

              <ul className="divide-y divide-[var(--color-line-2)]">
                {entries.length === 0 && (
                  <li className="px-5 py-6 text-center text-[12.5px] text-[var(--color-ink-3)]">
                    Aucun collaborateur renseigné pour {activeQuarter} sur ce
                    client.
                  </li>
                )}
                {entries.map((e) => {
                  const user = users.find((u) => u.id === e.userId);
                  if (!user) return null;
                  const filledBy = users.find((u) => u.id === e.filledById);
                  return (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center gap-3 px-5 py-3"
                    >
                      <Avatar user={user} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-[var(--color-ink-3)]">
                          {user.level} · {user.team}
                          {filledBy && ` · renseigné par ${filledBy.name}`}
                        </div>
                      </div>
                      {/* Raw availability */}
                      <Badge value={e.rawAvailability} />
                      {/* Qualification controls */}
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
                            En attente de qualif. Manager Dépl.
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

              {!isCoordinator && (
                <AddToPoolRow
                  clientId={client.id}
                  filledById={currentUserId}
                  quarter={activeQuarter}
                  onAdd={(userId, raw) =>
                    upsertPoolEntry({
                      userId,
                      clientId: client.id,
                      quarter: activeQuarter,
                      filledById: currentUserId,
                      selfDeclared: false,
                      rawAvailability: raw,
                      qualification: null,
                    })
                  }
                />
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function Badge({
  value,
}: {
  value: "available" | "backup" | "unavailable";
}) {
  const cfg = {
    available: {
      label: "Dispo",
      dot: "bg-[var(--color-status-done)]",
    },
    backup: {
      label: "Backup",
      dot: "bg-[var(--color-status-partial)]",
    },
    unavailable: {
      label: "Indispo",
      dot: "bg-[var(--color-status-alert)]",
    },
  }[value];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--color-ink-2)]">
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AddToPoolRow({
  clientId,
  quarter,
  filledById,
  onAdd,
}: {
  clientId: string;
  quarter: string;
  filledById: string;
  onAdd: (userId: string, raw: "available" | "backup" | "unavailable") => void;
}) {
  const users = useStore((s) => s.users);
  const pool = useStore((s) => s.pool);
  const candidates = users.filter(
    (u) =>
      u.role === "OPS" &&
      !pool.some(
        (e) =>
          e.userId === u.id &&
          e.clientId === clientId &&
          e.quarter === quarter,
      ),
  );

  if (candidates.length === 0) return null;

  return (
    <div className="flex items-center gap-2 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-5 py-2.5">
      <span className="text-[11.5px] font-medium text-[var(--color-ink-3)]">
        Ajouter au pool :
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {candidates.slice(0, 6).map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => onAdd(u.id, "available")}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11.5px] text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
          >
            <Avatar user={u} size={18} />
            {u.name}
          </button>
        ))}
      </div>
    </div>
  );
}
