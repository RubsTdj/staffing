"use client";

import { PageHeader } from "@/components/page-header";
import { useStore, computeActivityState, getAssigneeIds } from "@/lib/store";
import { StateBadge } from "@/components/ui/state-badge";
import { AvatarStack } from "@/components/ui/avatar";
import { GraduationCap, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function Page() {
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const users = useStore((s) => s.users);
  const openDrawer = useStore((s) => s.openDrawer);
  const createActivity = useStore((s) => s.createActivity);

  const [modalOpen, setModalOpen] = useState(false);

  const formations = activities
    .filter((a) => a.type === "Formation")
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  return (
    <>
      <PageHeader
        breadcrumb={["Formations"]}
        title="Sessions de formation"
        subtitle="2 formateurs requis par défaut · session au centre formateur en amont de la bascule."
        showFilters={false}
        actionLabel="Créer une formation"
        actionIcon={<Plus size={13} strokeWidth={1.8} />}
        onAction={() => setModalOpen(true)}
      />
      <div className="px-8 py-6">
        <ul className="divide-y divide-[var(--color-line-2)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          {formations.length === 0 && (
            <li className="px-5 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucune formation. Crée la première.
            </li>
          )}
          {formations.map((a) => {
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
                  className="flex w-full items-center gap-4 px-5 py-3 text-left hover:bg-[var(--color-line-2)]/40"
                >
                  <div className="w-[100px] shrink-0">
                    <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
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
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold">
                        {client?.name} · {centre?.name}
                      </span>
                      {centre?.isFormateur && (
                        <span className="rounded-sm bg-[var(--color-accent-soft)] px-1 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-accent-2)]">
                          Centre formateur
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-3)]">
                      {a.assignments.length}/2 formateurs requis
                    </div>
                  </div>
                  <AvatarStack users={assigned} max={3} />
                  <StateBadge state={computeActivityState(a)} size="sm" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {modalOpen && (
        <CreateFormationModal
          onClose={() => setModalOpen(false)}
          onCreate={(payload) => {
            createActivity({
              type: "Formation",
              clientId: payload.clientId,
              centreId: payload.centreId,
              dateStart: payload.dateStart,
              dateEnd: payload.dateEnd,
              modality: "Présentiel",
              assignments: [],
            });
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function CreateFormationModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: {
    clientId: string;
    centreId: string;
    dateStart: string;
    dateEnd: string;
  }) => void;
}) {
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const [clientId, setClientId] = useState("");
  const [centreId, setCentreId] = useState("");
  const [date, setDate] = useState("");

  // FILTRE DUR : centres marqués isFormateur appartenant au client choisi
  const availableCentres = useMemo(() => {
    if (!clientId) return [];
    return centres.filter((c) => c.clientId === clientId && c.isFormateur);
  }, [centres, clientId]);

  const canSubmit = clientId && centreId && date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/15 p-4 animate-overlay-in">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_-24px_rgba(20,17,15,0.30)]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
          <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
            <GraduationCap size={14} strokeWidth={1.8} className="text-[var(--color-accent)]" />
            Nouvelle formation
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <Field
            label="Client"
            hint="Obligatoire — détermine les centres disponibles."
          >
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setCentreId("");
              }}
              className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none"
            >
              <option value="">— Sélectionner —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.kind})
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Centre formateur"
            hint={
              clientId
                ? availableCentres.length === 0
                  ? "Aucun centre formateur — coche le flag dans la page Centres."
                  : `${availableCentres.length} centre(s) formateur(s) disponible(s)`
                : "Choisis d'abord un client."
            }
          >
            <select
              value={centreId}
              onChange={(e) => setCentreId(e.target.value)}
              disabled={!clientId || availableCentres.length === 0}
              className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none disabled:opacity-50"
            >
              <option value="">— Sélectionner —</option>
              {availableCentres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.region}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date de la session">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none"
            />
          </Field>
          <div className="rounded-md bg-[var(--color-line-2)]/40 p-3 text-[11.5px] text-[var(--color-ink-3)]">
            <strong className="font-semibold text-[var(--color-ink-2)]">Règle par défaut :</strong>{" "}
            2 formateurs à staffer · à compléter après création depuis le drawer.
          </div>
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
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                clientId,
                centreId,
                dateStart: `${date}T09:00:00`,
                dateEnd: `${date}T17:00:00`,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer la formation
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-3)]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] text-[var(--color-ink-3)]">{hint}</span>
      )}
    </label>
  );
}
