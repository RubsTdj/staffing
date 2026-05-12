"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { OBSERVER_TEAMS } from "@/lib/mock-data";
import type { ObserverTeam } from "@/lib/types";
import { useState } from "react";
import {
  Check,
  Inbox,
  Send,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const STATUS_LABEL: Record<string, string> = {
  submitted: "Nouvelle",
  reviewed: "Examinée",
  assigned: "Affectée",
  rejected: "Refusée",
};

const STATUS_COLOR: Record<string, string> = {
  submitted: "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]",
  reviewed: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  assigned: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  rejected: "bg-[var(--color-tint-pink)] text-[var(--color-tint-pink-ink)]",
};

export default function Page() {
  const roleView = useStore((s) => s.roleView);
  const currentUserId = useStore((s) => s.currentUserId);
  const users = useStore((s) => s.users);
  const observerRequests = useStore((s) => s.observerRequests);
  const addObserverRequest = useStore((s) => s.addObserverRequest);
  const setObserverStatus = useStore((s) => s.setObserverStatus);
  const isCoordinator = roleView === "manager-deployment" || roleView === "admin";

  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={["Demandes", "Observation"]}
        title="Demandes d'observation"
        subtitle="Seul un manager peut soumettre une demande pour un membre de son équipe."
        showFilters={false}
        actionLabel={
          roleView === "manager-deployment" ||
          roleView === "manager-formation" ||
          roleView === "admin"
            ? "Soumettre une demande"
            : undefined
        }
        actionIcon={<UserPlus size={13} strokeWidth={1.8} />}
        onAction={() => setOpen(true)}
      />

      <div className="space-y-6 px-8 py-6">
        {!isCoordinator && (
          <p className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[12px] text-[var(--color-ink-3)]">
            La centralisation des demandes est gérée par le Manager Déploiement.
            Tu vois ici l'état des demandes soumises.
          </p>
        )}

        <section>
          <h2 className="mb-3 text-[13px] font-semibold">
            Toutes les demandes · {observerRequests.length}
          </h2>
          <ul className="divide-y divide-[var(--color-line-2)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
            {observerRequests.length === 0 && (
              <li className="px-5 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
                <Inbox
                  size={24}
                  strokeWidth={1.5}
                  className="mx-auto mb-2 text-[var(--color-ink-3)]"
                />
                Aucune demande pour le moment.
              </li>
            )}
            {observerRequests.map((r) => {
              const manager = users.find((u) => u.id === r.managerId);
              return (
                <li key={r.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-line-2)] text-[11px] font-semibold text-[var(--color-ink-2)]">
                      {r.requesterName
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">
                          {r.requesterName}
                        </span>
                        <span className="rounded-sm bg-[var(--color-line-2)] px-1 py-px text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                          {r.requesterTeam}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${STATUS_COLOR[r.status]}`}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] text-[var(--color-ink-2)]">
                        {r.reason}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--color-ink-3)]">
                        <span>
                          Durée souhaitée :{" "}
                          <strong>{r.durationDays} j</strong>
                        </span>
                        {r.preferredPeriodStart && (
                          <span>
                            Période :{" "}
                            {new Date(r.preferredPeriodStart).toLocaleDateString(
                              "fr-FR",
                              { day: "2-digit", month: "short" },
                            )}
                            {r.preferredPeriodEnd
                              ? ` → ${new Date(
                                  r.preferredPeriodEnd,
                                ).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                })}`
                              : ""}
                          </span>
                        )}
                        {manager && (
                          <span className="inline-flex items-center gap-1">
                            soumis par
                            <Avatar user={manager} size={14} /> {manager.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {isCoordinator && r.status === "submitted" && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setObserverStatus(r.id, "reviewed")
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                        >
                          <Check size={11} strokeWidth={2} />
                          Examiner
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setObserverStatus(r.id, "rejected")
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-tint-pink)]/40"
                        >
                          <X size={11} strokeWidth={2} />
                          Refuser
                        </button>
                      </div>
                    )}
                    {isCoordinator && r.status === "reviewed" && (
                      <button
                        type="button"
                        onClick={() => setObserverStatus(r.id, "assigned")}
                        className="inline-flex items-center gap-1 rounded-md bg-[var(--color-ink)] px-2 py-1 text-[11.5px] font-medium text-white"
                      >
                        Affecter à un déplacement
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {open && (
        <NewRequestModal
          managerId={currentUserId}
          onClose={() => setOpen(false)}
          onSubmit={(payload) => {
            addObserverRequest(payload);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function NewRequestModal({
  managerId,
  onClose,
  onSubmit,
}: {
  managerId: string;
  onClose: () => void;
  onSubmit: (payload: {
    requesterId: string;
    requesterName: string;
    requesterTeam: ObserverTeam;
    managerId: string;
    reason: string;
    preferredPeriodStart?: string;
    preferredPeriodEnd?: string;
    durationDays: number;
  }) => void;
}) {
  const [requesterName, setName] = useState("");
  const [team, setTeam] = useState<ObserverTeam>("Produit");
  const [reason, setReason] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(1);

  const handleTeam = (t: ObserverTeam) => {
    setTeam(t);
    setDuration(t === "OPS" ? 3 : 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/15 p-4 animate-overlay-in">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_-24px_rgba(20,17,15,0.30)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
          <h3 className="text-[14.5px] font-semibold">Nouvelle demande d'observation</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <Field label="Nom de la personne qui souhaite observer">
            <input
              value={requesterName}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex : Nina Schmidt"
              className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-ink)]/30"
            />
          </Field>
          <Field label="Équipe">
            <div className="flex flex-wrap gap-1">
              {OBSERVER_TEAMS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTeam(t)}
                  className={`rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
                    t === team
                      ? "bg-[var(--color-ink)] text-white"
                      : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Raison / objectif">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ex : Découvrir un déploiement terrain pour cadrer la roadmap…"
              className="min-h-[72px] w-full resize-none rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-ink)]/30"
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Période préférée — début">
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-ink)]/30"
              />
            </Field>
            <Field label="fin">
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-ink)]/30"
              />
            </Field>
          </div>
          <Field
            label={`Durée souhaitée (${duration} jour${duration > 1 ? "s" : ""}) — règle : 3j pour OPS, 1j autres`}
          >
            <input
              type="range"
              min={1}
              max={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!requesterName.trim() || !reason.trim()}
            onClick={() =>
              onSubmit({
                requesterId: `u_ext_${Date.now()}`,
                requesterName,
                requesterTeam: team,
                managerId,
                reason,
                preferredPeriodStart: start || undefined,
                preferredPeriodEnd: end || undefined,
                durationDays: duration,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={12} strokeWidth={2} />
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-3)]">
        {label}
      </span>
      {children}
    </label>
  );
}
