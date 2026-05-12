"use client";

import { computeActivityState, getAssigneeIds, useStore } from "@/lib/store";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { StateBadge } from "@/components/ui/state-badge";
import { AlertTriangle, Check, MapPin, X } from "lucide-react";

export function AnnulationsList() {
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const users = useStore((s) => s.users);
  const approve = useStore((s) => s.approveCancel);
  const refuse = useStore((s) => s.refuseCancel);
  const openDrawer = useStore((s) => s.openDrawer);

  const pending = activities.filter((a) => a.cancelRequested);

  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-white px-6 py-12 text-center">
        <p className="text-[13.5px] font-semibold">Aucune demande</p>
        <p className="mt-1 text-[12.5px] text-[var(--color-ink-3)]">
          Aucune mission en attente d'annulation pour le moment.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {pending.map((a) => {
        const client = clients.find((c) => c.id === a.clientId);
        const centre = centres.find((c) => c.id === a.centreId);
        const assigned = getAssigneeIds(a)
          .map((id) => users.find((u) => u.id === id))
          .filter(Boolean) as typeof users;
        return (
          <li
            key={a.id}
            className="overflow-hidden rounded-xl border border-[var(--color-status-alert)]/30 bg-white"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] bg-[var(--color-tint-pink)]/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={14}
                  strokeWidth={1.9}
                  className="text-[var(--color-status-alert)]"
                />
                <span className="text-[13.5px] font-semibold text-[var(--color-tint-pink-ink)]">
                  Demande d'annulation
                </span>
              </div>
              <StateBadge state={computeActivityState(a)} size="sm" />
            </div>
            <div className="grid gap-3 px-4 py-3 md:grid-cols-2">
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  Mission
                </div>
                <div className="text-[13.5px] font-semibold">
                  {client?.name} · {centre?.name}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
                  <MapPin size={11} strokeWidth={1.6} />
                  {centre?.address}
                </div>
                <div className="mt-1 text-[11.5px] text-[var(--color-ink-3)]">
                  {new Date(a.dateStart).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  →{" "}
                  {new Date(a.dateEnd).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  · {a.type} {a.subCategory ?? ""}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  Équipe assignée
                </div>
                {assigned.length > 0 ? (
                  <div className="mt-1 flex items-center gap-2">
                    <AvatarStack users={assigned} max={5} />
                    <span className="text-[11.5px] text-[var(--color-ink-3)]">
                      {assigned.length} personne
                      {assigned.length > 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-[12px] text-[var(--color-ink-3)]">
                    Aucun
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-4 py-2.5">
              <button
                type="button"
                onClick={() => openDrawer({ kind: "activity", id: a.id })}
                className="rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
              >
                Détails
              </button>
              <button
                type="button"
                onClick={() => refuse(a.id)}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
              >
                <X size={11} strokeWidth={2} />
                Refuser
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      "Approuver l'annulation et supprimer la mission ?",
                    )
                  )
                    approve(a.id);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--color-status-alert)] px-2.5 py-1 text-[11.5px] font-medium text-white hover:opacity-90"
              >
                <Check size={11} strokeWidth={2.2} />
                Approuver l'annulation
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
