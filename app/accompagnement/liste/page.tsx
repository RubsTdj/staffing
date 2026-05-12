"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { ClientGroup } from "@/components/views/client-group";
import { useStore } from "@/lib/store";
import { Plus, Search } from "lucide-react";

export default function Page() {
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const accomp = activities.filter((a) => a.type === "Accompagnement");
    const filtered = query.trim()
      ? accomp.filter((a) => {
          const client = clients.find((c) => c.id === a.clientId);
          const centre = centres.find((c) => c.id === a.centreId);
          const q = query.toLowerCase();
          return (
            client?.name.toLowerCase().includes(q) ||
            centre?.name.toLowerCase().includes(q) ||
            a.subCategory?.toLowerCase().includes(q)
          );
        })
      : accomp;

    return clients
      .map((client) => {
        const clientActs = filtered.filter((a) => a.clientId === client.id);
        if (clientActs.length === 0) return null;
        const clientCentres = centres.filter((c) => c.clientId === client.id);
        const centresWithActs = clientCentres
          .map((centre) => ({
            centre,
            activities: clientActs.filter((a) => a.centreId === centre.id),
          }))
          .filter((g) => g.activities.length > 0);
        return { client, centres: centresWithActs, count: clientActs.length };
      })
      .filter(Boolean);
  }, [activities, clients, centres, query]);

  const totalCount = grouped.reduce((sum, g) => sum + (g?.count ?? 0), 0);

  return (
    <>
      <PageHeader
        breadcrumb={["Accompagnement", "Liste"]}
        title="Missions d'accompagnement"
        subtitle={`${totalCount} missions à staffer · groupées par client puis par centre.`}
        actionLabel="Ajouter une mission"
        right={
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1">
              <Search size={12} strokeWidth={1.8} className="text-[var(--color-ink-3)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-44 bg-transparent text-[12px] outline-none placeholder:text-[var(--color-ink-3)]"
              />
            </div>
          </div>
        }
      />

      <div className="space-y-8 px-8 py-6">
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-line)] bg-white px-6 py-12 text-center">
            <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
              Aucune mission
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--color-ink-3)]">
              Aucune mission ne correspond à votre recherche.
            </p>
          </div>
        ) : (
          grouped.map(
            (g) =>
              g && (
                <ClientGroup
                  key={g.client.id}
                  client={g.client}
                  groups={g.centres}
                />
              ),
          )
        )}

        <button
          type="button"
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-line)] py-4 text-[12.5px] text-[var(--color-ink-3)] hover:border-[var(--color-ink)]/20 hover:bg-white/40 hover:text-[var(--color-ink-2)] transition-colors"
        >
          <Plus size={13} strokeWidth={1.8} />
          Nouveau client / nouveau centre
        </button>
      </div>
    </>
  );
}
