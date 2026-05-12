"use client";

import { PageHeader } from "@/components/page-header";
import { useStore, computeActivityState } from "@/lib/store";
import { StateBadge } from "@/components/ui/state-badge";
import { AvatarStack } from "@/components/ui/avatar";

export default function Page() {
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const users = useStore((s) => s.users);
  const openDrawer = useStore((s) => s.openDrawer);

  const formations = activities
    .filter((a) => a.type === "Formation")
    .sort((a, b) => +new Date(a.dateStart) - +new Date(b.dateStart));

  return (
    <>
      <PageHeader
        breadcrumb={["Missions", "Formation"]}
        title="Sessions de formation"
        subtitle="2 formateurs requis par défaut · sessions au centre formateur en amont de la bascule."
        showFilters={false}
        actionLabel="Ajouter une formation"
      />
      <div className="px-8 py-6">
        <ul className="divide-y divide-[var(--color-line-2)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          {formations.length === 0 && (
            <li className="px-5 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucune formation pour le moment.
            </li>
          )}
          {formations.map((a) => {
            const client = clients.find((c) => c.id === a.clientId);
            const centre = centres.find((c) => c.id === a.centreId);
            const assigned = a.assignees
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
                      {a.assignees.length}/2 formateurs requis
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
    </>
  );
}
