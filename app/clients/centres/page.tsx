"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { Building2, GraduationCap, MapPin, Pin } from "lucide-react";
import { useMemo, useState } from "react";

export default function Page() {
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const toggleF = useStore((s) => s.toggleCentreFormateur);
  const toggleE = useStore((s) => s.toggleCentreExterne);

  const [filter, setFilter] = useState<"all" | "formateur" | "externe">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return centres
      .filter((c) => (clientFilter === "all" ? true : c.clientId === clientFilter))
      .filter((c) =>
        filter === "all"
          ? true
          : filter === "formateur"
            ? c.isFormateur
            : c.isExterne,
      );
  }, [centres, filter, clientFilter]);

  return (
    <>
      <PageHeader
        breadcrumb={["Clients", "Centres"]}
        title="Centres"
        subtitle="Liste complète · marquer un centre comme formateur (où les sessions de formation ont lieu) ou externe (loué hors locaux client)."
        showFilters={false}
        actionLabel="Ajouter un centre"
        right={
          <div className="flex items-center gap-2">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="rounded-md border border-[var(--color-line)] bg-white px-2 py-1 text-[12px]"
            >
              <option value="all">Tous les clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
              {(["all", "formateur", "externe"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-[5px] px-2 py-1 text-[12px] font-medium transition-colors ${
                    f === filter
                      ? "bg-[var(--color-ink)] text-white"
                      : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                  }`}
                >
                  {f === "all" ? "Tous" : f === "formateur" ? "Formateurs" : "Externes"}
                </button>
              ))}
            </div>
          </div>
        }
      />
      <div className="px-8 py-6">
        <ul className="divide-y divide-[var(--color-line-2)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          {filtered.map((centre) => {
            const client = clients.find((c) => c.id === centre.clientId);
            return (
              <li
                key={centre.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-line-2)] text-[var(--color-ink-2)]">
                  <Building2 size={14} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold">{centre.name}</span>
                    <span className="text-[11.5px] text-[var(--color-ink-3)]">
                      · {client?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-[11.5px] text-[var(--color-ink-3)]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={11} strokeWidth={1.6} />
                      {centre.address}
                    </span>
                    <span>{centre.region}</span>
                    {centre.nbSalaries != null && (
                      <span>
                        {(centre.nbSalaries / 1000).toFixed(0)}k salariés
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Toggle
                    pressed={centre.isFormateur}
                    onClick={() => toggleF(centre.id)}
                    icon={<GraduationCap size={11} strokeWidth={1.9} />}
                    label="Formateur"
                    tint="accent"
                  />
                  <Toggle
                    pressed={!!centre.isExterne}
                    onClick={() => toggleE(centre.id)}
                    icon={<Pin size={11} strokeWidth={1.9} />}
                    label="Externe"
                    tint="neutral"
                  />
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-5 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]">
              Aucun centre ne correspond aux filtres.
            </li>
          )}
        </ul>
      </div>
    </>
  );
}

function Toggle({
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
