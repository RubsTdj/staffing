"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { Download, Info } from "lucide-react";
import { useMemo, useState } from "react";

type Row = {
  weekKey: string; // YYYY-Www
  weekLabel: string;
  userId: string;
  userName: string;
  clientName: string;
  centreName: string;
  type: string;
  days: number;
  isVeille: boolean;
  region: string;
  excluded: boolean; // IDF
  trip: number; // 0 ou 1
};

const QUARTERS: { id: string; label: string; start: string; end: string }[] = [
  { id: "2026-Q1", label: "Q1 2026", start: "2026-01-01", end: "2026-03-31" },
  { id: "2026-Q2", label: "Q2 2026", start: "2026-04-01", end: "2026-06-30" },
  { id: "2026-Q3", label: "Q3 2026", start: "2026-07-01", end: "2026-09-30" },
  { id: "2026-Q4", label: "Q4 2026", start: "2026-10-01", end: "2026-12-31" },
];

function getISOWeek(d: Date): { key: string; label: string } {
  const target = new Date(d);
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.getTime() - firstThursday.getTime();
  const wk = 1 + Math.round(diff / 604800000);
  const label = `S${wk} · ${target.toLocaleDateString("fr-FR", { month: "short" })}`;
  return { key: `${target.getFullYear()}-W${wk.toString().padStart(2, "0")}`, label };
}

export default function Page() {
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const activities = useStore((s) => s.activities);
  const [quarter, setQuarter] = useState(QUARTERS[1].id);

  const q = QUARTERS.find((x) => x.id === quarter)!;
  const qStart = new Date(q.start);
  const qEnd = new Date(q.end);

  const rows: Row[] = useMemo(() => {
    const r: Row[] = [];
    // Pour mutualiser : 1 trip par (user, semaine, type)
    const seenTrip = new Set<string>();
    for (const a of activities) {
      if (a.type === "Off") continue;
      const start = new Date(a.dateStart);
      if (start < qStart || start > qEnd) continue;
      const centre = centres.find((c) => c.id === a.centreId);
      const client = clients.find((c) => c.id === a.clientId);
      const wk = getISOWeek(start);
      const excluded = centre?.region === "IDF";
      for (const asg of a.assignments) {
        const u = users.find((x) => x.id === asg.userId);
        if (!u) continue;
        const tripKey = `${u.id}-${wk.key}-${a.type}`;
        const isFirstOfWeek = !seenTrip.has(tripKey);
        if (isFirstOfWeek) seenTrip.add(tripKey);
        // Veille = 0.5 jour (mock : ici on prend isVeille du flag)
        const days = a.isVeille ? 0.5 : asg.days;
        r.push({
          weekKey: wk.key,
          weekLabel: wk.label,
          userId: u.id,
          userName: u.name,
          clientName: client?.name ?? "—",
          centreName: centre?.name ?? "—",
          type: a.type,
          days,
          isVeille: !!a.isVeille,
          region: centre?.region ?? "—",
          excluded,
          trip: excluded ? 0 : isFirstOfWeek ? 1 : 0,
        });
      }
    }
    return r.sort((a, b) =>
      a.weekKey === b.weekKey
        ? a.userName.localeCompare(b.userName)
        : a.weekKey.localeCompare(b.weekKey),
    );
  }, [activities, centres, clients, users, qStart, qEnd]);

  // Recap par collab
  const recapByUser = useMemo(() => {
    const m = new Map<
      string,
      {
        userName: string;
        totalTrips: number;
        totalDays: number;
        tripsFormation: number;
        tripsAccomp: number;
      }
    >();
    for (const r of rows) {
      const e = m.get(r.userId) ?? {
        userName: r.userName,
        totalTrips: 0,
        totalDays: 0,
        tripsFormation: 0,
        tripsAccomp: 0,
      };
      e.totalTrips += r.trip;
      e.totalDays += r.excluded ? 0 : r.days;
      if (r.trip === 1 && r.type === "Formation") e.tripsFormation += 1;
      if (r.trip === 1 && r.type === "Accompagnement") e.tripsAccomp += 1;
      m.set(r.userId, e);
    }
    return Array.from(m.values()).sort((a, b) => b.totalDays - a.totalDays);
  }, [rows]);

  const exportDetail = () => {
    const header =
      "Semaine,Collaborateur,Client,Centre,Type,Jours,Veille,Region,Exclus_IDF,Trip\n";
    const body = rows
      .map(
        (r) =>
          `${r.weekKey},${r.userName},${r.clientName},${r.centreName},${r.type},${r.days},${r.isVeille ? "0.5" : "1"},${r.region},${r.excluded ? "true" : "false"},${r.trip}`,
      )
      .join("\n");
    download(`prime-deplacement-detail-${quarter}.csv`, header + body);
  };

  const exportRecap = () => {
    const header =
      "Collaborateur,Total_trips,Total_jours_terrain,Trips_formation,Trips_accomp\n";
    const body = recapByUser
      .map(
        (r) =>
          `${r.userName},${r.totalTrips},${r.totalDays},${r.tripsFormation},${r.tripsAccomp}`,
      )
      .join("\n");
    download(`prime-deplacement-recap-${quarter}.csv`, header + body);
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Rapports"]}
        title="Prime de déplacement"
        subtitle="Export trimestriel des trips mutualisés par semaine, jours terrain, par collaborateur."
        showFilters={false}
        actionLabel="Exporter détail (CSV)"
        actionIcon={<Download size={13} strokeWidth={1.8} />}
        onAction={exportDetail}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
              {QUARTERS.map((qq) => (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setQuarter(qq.id)}
                  className={`rounded-[5px] px-2 py-1 text-[12px] font-medium transition-colors ${
                    qq.id === quarter
                      ? "bg-[var(--color-ink)] text-white"
                      : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                  }`}
                >
                  {qq.label}
                </button>
              ))}
            </div>
          </div>
        }
      />
      <div className="space-y-6 px-8 py-6">
        <div className="flex items-start gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[11.5px] text-[var(--color-ink-2)]">
          <Info
            size={13}
            strokeWidth={1.7}
            className="mt-0.5 text-[var(--color-ink-3)]"
          />
          <div>
            <strong className="font-semibold">Règles appliquées :</strong>{" "}
            (a) 1 jour terrain = 1 jour effectif d'assignment, sauf veille (0,5 j) — (b) plusieurs missions
            d'un même type pour une même personne sur une même semaine = 1 seul trip — (c) missions en IDF
            exclues du décompte trips et jours terrain — (d) trips Formation et Accompagnement comptés séparément.
          </div>
        </div>

        <section>
          <h2 className="mb-2 flex items-baseline justify-between text-[13px] font-semibold">
            Récap par collaborateur
            <button
              type="button"
              onClick={exportRecap}
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
            >
              <Download size={11} strokeWidth={1.8} />
              Exporter récap
            </button>
          </h2>
          <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-line-2)]/30 text-left text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  <th className="px-4 py-2 font-medium">Collaborateur</th>
                  <th className="px-3 py-2 text-right font-medium">
                    Total trips
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Total jours
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Trips formation
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Trips accomp.
                  </th>
                </tr>
              </thead>
              <tbody>
                {recapByUser.map((r) => (
                  <tr
                    key={r.userName}
                    className="border-b border-[var(--color-line-2)] last:border-0"
                  >
                    <td className="px-4 py-2 text-[13px] font-medium">
                      {r.userName}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.totalTrips}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] font-semibold tabular-nums">
                      {r.totalDays}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.tripsFormation}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.tripsAccomp}
                    </td>
                  </tr>
                ))}
                {recapByUser.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]"
                    >
                      Aucune mission sur ce trimestre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[13px] font-semibold">
            Détail par semaine
          </h2>
          <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-line)] bg-[var(--color-line-2)]/30 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                  <th className="px-4 py-2 font-medium">Semaine</th>
                  <th className="px-3 py-2 font-medium">Collab.</th>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Centre</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 text-right font-medium">Jours</th>
                  <th className="px-3 py-2 text-right font-medium">Trip</th>
                  <th className="px-3 py-2 text-right font-medium">Région</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[var(--color-line-2)] last:border-0 ${
                      r.excluded
                        ? "bg-[var(--color-line-2)]/30 text-[var(--color-ink-3)]"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-mono text-[11px] tabular-nums">
                      {r.weekKey}
                    </td>
                    <td className="px-3 py-2 text-[12px]">{r.userName}</td>
                    <td className="px-3 py-2 text-[12px]">{r.clientName}</td>
                    <td className="px-3 py-2 text-[12px]">{r.centreName}</td>
                    <td className="px-3 py-2 text-[12px]">{r.type}</td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.days}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {r.trip}
                      {r.excluded && (
                        <span className="ml-1 text-[10px] text-[var(--color-ink-3)]">
                          IDF
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-[11px] text-[var(--color-ink-3)]">
                      {r.region}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]"
                    >
                      Aucune mission sur ce trimestre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
