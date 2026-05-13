"use client";

import { useStore } from "@/lib/store";
import type { RoleView, Team } from "@/lib/types";
import { ALL_TEAMS } from "@/lib/types";
import { Eye, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const ROLES: { id: RoleView; label: string; hint: string }[] = [
  { id: "super-admin", label: "Super Admin", hint: "Toi · impersonation, params" },
  { id: "admin", label: "Admin", hint: "Toutes équipes, toutes actions" },
  { id: "manager", label: "Manager", hint: "Son équipe + pool global" },
  { id: "collaborateur", label: "Collab.", hint: "Mon planning" },
];

// User pick par défaut pour chaque rôle (mocks)
const ROLE_DEFAULT_USER: Record<RoleView, string> = {
  "super-admin": "u10", // Julien (Admin)
  admin: "u10",
  manager: "u1",        // Alice (Manager Formation)
  collaborateur: "u3",  // Chloé (OPS Formation Junior)
};

// Pour le sélecteur Manager : id du manager rattaché à chaque équipe (fallback)
const MANAGER_BY_TEAM: Partial<Record<Team, string>> = {
  Formation: "u1",
  Déploiement: "u4",
};

export function ImpersonationBanner() {
  const roleView = useStore((s) => s.roleView);
  const setRoleView = useStore((s) => s.setRoleView);
  const setCurrentUserId = useStore((s) => s.setCurrentUserId);
  const users = useStore((s) => s.users);
  const currentUserId = useStore((s) => s.currentUserId);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId],
  );

  const handleRole = (r: RoleView) => {
    setRoleView(r);
    if (r === "manager") {
      // garde le manager courant s'il en est un, sinon prend le Manager Formation par défaut
      const cur = users.find((u) => u.id === currentUserId);
      if (cur?.role !== "Manager") setCurrentUserId(ROLE_DEFAULT_USER.manager);
    } else if (r === "collaborateur") {
      const cur = users.find((u) => u.id === currentUserId);
      if (cur?.role !== "OPS") setCurrentUserId(ROLE_DEFAULT_USER.collaborateur);
    } else {
      setCurrentUserId(ROLE_DEFAULT_USER[r]);
    }
  };

  const showTeamPicker = roleView === "manager";
  const showCollabPicker = roleView === "collaborateur";

  const managers = useMemo(
    () => users.filter((u) => u.role === "Manager"),
    [users],
  );
  const collaborators = useMemo(
    () => users.filter((u) => u.role === "OPS"),
    [users],
  );

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-rail-line bg-rail px-3 py-1.5 text-rail-text-hi">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/60">
        <Eye size={11} strokeWidth={1.8} />
        Persona test
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {ROLES.map((r) => {
          const active = r.id === roleView;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRole(r.id)}
              title={r.hint}
              className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {showTeamPicker && (
        <UserPicker
          label="Manager"
          options={managers.map((u) => ({
            id: u.id,
            label: `${u.name} · ${u.team}`,
          }))}
          value={currentUserId}
          onChange={(id) => setCurrentUserId(id)}
          fallbackByTeam={MANAGER_BY_TEAM}
        />
      )}
      {showCollabPicker && (
        <UserPicker
          label="Collaborateur"
          options={collaborators.map((u) => ({
            id: u.id,
            label: `${u.name} · ${u.team} · ${u.level}`,
          }))}
          value={currentUserId}
          onChange={(id) => setCurrentUserId(id)}
        />
      )}

      <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/60">
        Connecté en tant que{" "}
        <span className="font-medium text-white">
          {currentUser?.name ?? "—"}
        </span>
      </div>
    </div>
  );
}

function UserPicker({
  label,
  options,
  value,
  onChange,
  fallbackByTeam,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  fallbackByTeam?: Partial<Record<Team, string>>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.id === value);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11.5px] text-white/85 hover:bg-white/10"
      >
        <span className="text-white/55">{label} :</span>
        <span className="font-medium">{current?.label ?? "—"}</span>
        <ChevronDown size={11} strokeWidth={2} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-72 overflow-y-auto rounded-lg border border-rail-line bg-rail-2 py-1 shadow-xl">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-[12px] transition-colors ${
                o.id === value
                  ? "bg-accent text-white"
                  : "text-white/75 hover:bg-white/10"
              }`}
            >
              {o.label}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-[11.5px] text-white/50">
              Aucun {label.toLowerCase()} dans les mocks
            </div>
          )}
        </div>
      )}
      {/* fallback unused vars — intentionally kept for future per-team quick pick */}
      <span className="hidden">{JSON.stringify(fallbackByTeam ?? {})}</span>
    </div>
  );
}
