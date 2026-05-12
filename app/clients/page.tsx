"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { Building2, ChevronRight, MapPin, Users2 } from "lucide-react";
import Link from "next/link";

const PIPELINE_LABEL = {
  signed: { label: "Signé", tint: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]" },
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

export default function Page() {
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const activities = useStore((s) => s.activities);
  const users = useStore((s) => s.users);

  return (
    <>
      <PageHeader
        breadcrumb={["Clients"]}
        title="Clients"
        subtitle="Liste des clients · drill-in vers leurs centres et leurs activités."
        showFilters={false}
        actionLabel="Ajouter un client"
      />
      <div className="px-8 py-6">
        <ul className="grid gap-3 md:grid-cols-2">
          {clients.map((c) => {
            const clientCentres = centres.filter((x) => x.clientId === c.id);
            const formateurs = clientCentres.filter((x) => x.isFormateur).length;
            const externes = clientCentres.filter((x) => x.isExterne).length;
            const acts = activities.filter((a) => a.clientId === c.id);
            const cdp = users.find((u) => u.cdpFor?.includes(c.id));
            const pl = PIPELINE_LABEL[c.pipeline];
            return (
              <li
                key={c.id}
                className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white"
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[15px] font-semibold tracking-tight">
                      {c.name}
                    </span>
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                      {c.kind}
                    </span>
                  </div>
                  <span
                    className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${pl.tint}`}
                  >
                    {pl.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 py-3 text-[12px]">
                  <Stat label="Salariés suivis" value={`${(c.nbSalaries / 1000).toFixed(0)}k`} />
                  <Stat label="Centres" value={`${clientCentres.length}`} hint={`${formateurs} F · ${externes} ext`} />
                  <Stat
                    label="Bascule"
                    value={
                      c.dateBascule
                        ? new Date(c.dateBascule).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })
                        : "—"
                    }
                  />
                  <Stat label="Déploiement" value={`${c.nbSemainesDeploiement ?? "—"} sem.`} />
                  <Stat
                    label="Formation"
                    value={`${c.estFormateurs ?? "—"} pers.`}
                    hint={`${c.estJoursFormation ?? "—"} j-h`}
                  />
                  <Stat
                    label="Accompagnement"
                    value={`${c.estAccompagnateurs ?? "—"} pers.`}
                    hint={`${c.estJoursAccomp ?? "—"} j-h`}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-4 py-2">
                  <span className="text-[11.5px] text-[var(--color-ink-3)]">
                    {cdp ? (
                      <>
                        CDP : <span className="font-medium text-[var(--color-ink-2)]">{cdp.name}</span>
                      </>
                    ) : (
                      "Pas de CDP assigné"
                    )}{" "}
                    · {acts.length} activités
                  </span>
                  <Link
                    href={`/clients/centres?client=${c.id}`}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                  >
                    Centres
                    <ChevronRight size={12} strokeWidth={2} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function Stat({
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
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[14px] font-semibold tabular-nums text-[var(--color-ink)]">
          {value}
        </span>
        {hint && (
          <span className="text-[11px] text-[var(--color-ink-3)]">{hint}</span>
        )}
      </div>
    </div>
  );
}
