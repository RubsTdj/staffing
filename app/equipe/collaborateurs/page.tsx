"use client";

import { PageHeader } from "@/components/page-header";
import { getAssigneeIds, useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import type { Level, Role, Team } from "@/lib/types";
import { Crown, Search } from "lucide-react";
import { useMemo, useState } from "react";

const LEVEL_TINT: Record<Level, string> = {
  Senior: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  Junior: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  Observateur:
    "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]",
};

export default function Page() {
  const users = useStore((s) => s.users);
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const setCurrentUserId = useStore((s) => s.setCurrentUserId);
  const setRoleView = useStore((s) => s.setRoleView);
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<"all" | Team>("all");
  const [role, setRole] = useState<"all" | Role>("all");

  const stats = useMemo(() => {
    const m = new Map<
      string,
      { trips: number; days: number; offDays: number }
    >();
    for (const u of users) m.set(u.id, { trips: 0, days: 0, offDays: 0 });
    for (const a of activities) {
      for (const asg of a.assignments) {
        const s = m.get(asg.userId);
        if (!s) continue;
        if (a.type === "Off") s.offDays += asg.days;
        else {
          s.trips += 1;
          s.days += asg.days;
        }
      }
    }
    return m;
  }, [users, activities]);

  const filtered = users
    .filter((u) => (team === "all" ? true : u.team === team))
    .filter((u) => (role === "all" ? true : u.role === role))
    .filter((u) =>
      query.trim()
        ? u.name.toLowerCase().includes(query.toLowerCase())
        : true,
    );

  return (
    <>
      <PageHeader
        breadcrumb={["Équipe", "Collaborateurs"]}
        title="Collaborateurs"
        subtitle="L'annuaire interne · charge cumulée, niveau, rôle CDP."
        showFilters={false}
        right={
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1">
              <Search
                size={12}
                strokeWidth={1.8}
                className="text-[var(--color-ink-3)]"
              />
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
      <div className="space-y-4 px-8 py-6">
        <div className="flex flex-wrap items-center gap-1">
          <Chip
            active={team === "all"}
            onClick={() => setTeam("all")}
          >
            Toutes équipes
          </Chip>
          <Chip
            active={team === "Déploiement"}
            onClick={() => setTeam("Déploiement")}
          >
            Déploiement
          </Chip>
          <Chip active={team === "Formation"} onClick={() => setTeam("Formation")}>
            Formation
          </Chip>
          <span className="mx-2 h-4 w-px bg-[var(--color-line)]" />
          <Chip active={role === "all"} onClick={() => setRole("all")}>
            Tous rôles
          </Chip>
          {(["Admin", "Manager", "OPS", "Logistique"] as Role[]).map((r) => (
            <Chip
              key={r}
              active={role === r}
              onClick={() => setRole(r)}
            >
              {r}
            </Chip>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-line-2)]/30 text-left text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                <th className="px-4 py-2 font-medium">Personne</th>
                <th className="px-3 py-2 font-medium">Rôle</th>
                <th className="px-3 py-2 font-medium">Équipe</th>
                <th className="px-3 py-2 font-medium">Niveau</th>
                <th className="px-3 py-2 text-right font-medium">Missions</th>
                <th className="px-3 py-2 text-right font-medium">Jours</th>
                <th className="px-3 py-2 text-right font-medium">Capacité</th>
                <th className="px-3 py-2 text-right font-medium">CDP</th>
                <th className="px-3 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const s = stats.get(u.id);
                const cdpClients = (u.cdpFor ?? [])
                  .map((id) => clients.find((c) => c.id === id)?.name)
                  .filter(Boolean) as string[];
                return (
                  <tr
                    key={u.id}
                    className="border-b border-[var(--color-line-2)] last:border-0 hover:bg-[var(--color-line-2)]/30"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar user={u} size={26} />
                        <span className="text-[13px] font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[var(--color-ink-2)]">
                      {u.role}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[var(--color-ink-2)]">
                      {u.team}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${LEVEL_TINT[u.level]}`}
                      >
                        {u.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {s?.trips ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums">
                      {s?.days ?? 0}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[12px] tabular-nums text-[var(--color-ink-3)]">
                      {u.monthlyTripCapacity ?? "—"}/m
                    </td>
                    <td className="px-3 py-2 text-right">
                      {cdpClients.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--color-accent-2)]"
                          title={cdpClients.join(", ")}
                        >
                          <Crown size={9} strokeWidth={2} />
                          {cdpClients.length}
                        </span>
                      ) : (
                        <span className="text-[10.5px] text-[var(--color-ink-3)]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentUserId(u.id);
                          setRoleView(
                            u.role === "Admin"
                              ? "admin"
                              : u.role === "Manager" && u.team === "Formation"
                                ? "manager-formation"
                                : u.role === "Manager"
                                  ? "manager-deployment"
                                  : u.role === "Logistique"
                                    ? "logistique"
                                    : "ops",
                          );
                        }}
                        className="rounded-md border border-[var(--color-line)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                      >
                        Impersonate
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-[12.5px] text-[var(--color-ink-3)]"
                  >
                    Aucun collaborateur ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
        active
          ? "bg-[var(--color-ink)] text-white"
          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
      }`}
    >
      {children}
    </button>
  );
}
