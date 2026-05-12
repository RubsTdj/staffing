"use client";

import { PageHeader } from "@/components/page-header";
import { getAssigneeIds, useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { Download } from "lucide-react";
import { useMemo } from "react";

export default function Page() {
  const users = useStore((s) => s.users);
  const activities = useStore((s) => s.activities);
  const centres = useStore((s) => s.centres);

  const stats = useMemo(() => {
    const rows = users
      .filter((u) => u.role === "OPS" || u.role === "Manager")
      .map((u) => {
        let trips = 0;
        let days = 0;
        let formationDays = 0;
        let accompDays = 0;
        let idfExcluded = 0;
        const weeks = new Set<string>();
        for (const a of activities) {
          if (a.type === "Off") continue;
          const asg = a.assignments.find((x) => x.userId === u.id);
          if (!asg) continue;
          const centre = centres.find((c) => c.id === a.centreId);
          const isIDF = centre?.region === "IDF";
          if (isIDF) {
            idfExcluded += asg.days;
            continue;
          }
          trips += 1;
          days += asg.days;
          if (a.type === "Formation") formationDays += asg.days;
          else accompDays += asg.days;
          const wk = getISOWeek(new Date(a.dateStart));
          weeks.add(`${u.id}-${wk}`);
        }
        return {
          user: u,
          trips,
          days,
          formationDays,
          accompDays,
          idfExcluded,
          weeklyTrips: weeks.size,
        };
      });
    return rows.sort((a, b) => b.days - a.days);
  }, [users, activities, centres]);

  const totalDays = stats.reduce((s, r) => s + r.days, 0);
  const totalTrips = stats.reduce((s, r) => s + r.trips, 0);
  const avg = stats.length ? totalDays / stats.length : 0;

  const managersAvg = avg
    ? stats
        .filter((r) => r.user.role === "Manager")
        .reduce((s, r) => s + r.days, 0) /
      Math.max(1, stats.filter((r) => r.user.role === "Manager").length)
    : 0;
  const formateursAvg = avg
    ? stats
        .filter((r) => r.user.team === "Formation")
        .reduce((s, r) => s + r.days, 0) /
      Math.max(1, stats.filter((r) => r.user.team === "Formation").length)
    : 0;

  const maxDays = Math.max(1, ...stats.map((r) => r.days));

  const exportCsv = () => {
    const header =
      "Personne,Equipe,Niveau,Trips,Jours,Jours formation,Jours accompagnement,IDF exclus,Semaines mobilisees\n";
    const body = stats
      .map(
        (r) =>
          `${r.user.name},${r.user.team},${r.user.level},${r.trips},${r.days},${r.formationDays},${r.accompDays},${r.idfExcluded},${r.weeklyTrips}`,
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equite-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Équipe", "Équité"]}
        title="Équité des déplacements"
        subtitle="Répartition cumulée par personne · IDF exclu de la prime de déplacement · trips mutualisés par semaine."
        showFilters={false}
        actionLabel="Exporter CSV"
        actionIcon={<Download size={13} strokeWidth={1.8} />}
        onAction={exportCsv}
      />
      <div className="space-y-6 px-8 py-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KPI label="Trips totaux" value={totalTrips} hint="hors IDF" />
          <KPI label="Jours terrain totaux" value={totalDays} hint="cumulés" />
          <KPI
            label="Moyenne Manager"
            value={managersAvg.toFixed(1)}
            hint="jours / personne"
          />
          <KPI
            label="Moyenne Formateur"
            value={formateursAvg.toFixed(1)}
            hint="jours / personne"
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-line-2)]/30 text-left text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                <th className="px-4 py-2 font-medium">Personne</th>
                <th className="px-3 py-2 font-medium">Équipe</th>
                <th className="px-3 py-2 font-medium">Charge</th>
                <th className="px-3 py-2 text-right font-medium">Trips</th>
                <th className="px-3 py-2 text-right font-medium">Jours</th>
                <th className="px-3 py-2 text-right font-medium">Formation</th>
                <th className="px-3 py-2 text-right font-medium">Accomp.</th>
                <th className="px-3 py-2 text-right font-medium">IDF excl.</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((r) => {
                const pct = (r.days / maxDays) * 100;
                return (
                  <tr
                    key={r.user.id}
                    className="border-b border-[var(--color-line-2)] last:border-0"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar user={r.user} size={24} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium">
                            {r.user.name}
                          </div>
                          <div className="text-[10.5px] text-[var(--color-ink-3)]">
                            {r.user.role} · {r.user.level}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[var(--color-ink-2)]">
                      {r.user.team}
                    </td>
                    <td className="px-3 py-2">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-line-2)]">
                        <div
                          className={`h-full ${
                            pct > 80
                              ? "bg-[var(--color-status-alert)]"
                              : pct > 50
                                ? "bg-[var(--color-status-partial)]"
                                : "bg-[var(--color-status-done)]"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.trips}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] font-semibold tabular-nums">
                      {r.days}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.formationDays}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.accompDays}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[11px] tabular-nums text-[var(--color-ink-3)]">
                      {r.idfExcluded}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

function KPI({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-white px-4 py-3">
      <div className="text-[12px] font-medium text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-[24px] font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {hint && (
          <span className="text-[11.5px] text-[var(--color-ink-3)]">{hint}</span>
        )}
      </div>
    </div>
  );
}

function getISOWeek(d: Date): string {
  const target = new Date(d);
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  const wk = 1 + Math.round(diff / 604800000);
  return `${target.getFullYear()}-W${wk.toString().padStart(2, "0")}`;
}
