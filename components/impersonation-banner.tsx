"use client";

import { useStore } from "@/lib/store";
import type { RoleView } from "@/lib/types";
import { Eye, Users } from "lucide-react";

const ROLE_LABEL: Record<RoleView, string> = {
  admin: "Admin",
  "manager-formation": "Manager Formation",
  "manager-deployment": "Manager Déploiement",
  ops: "OPS terrain",
  logistique: "Logistique",
};

// Quel user mocké est cohérent avec chaque rôle
const ROLE_USER: Record<RoleView, string> = {
  admin: "u10",
  "manager-formation": "u1",
  "manager-deployment": "u4",
  ops: "u3",
  logistique: "u13",
};

export function ImpersonationBanner() {
  const roleView = useStore((s) => s.roleView);
  const setRoleView = useStore((s) => s.setRoleView);
  const setCurrentUserId = useStore((s) => s.setCurrentUserId);
  const users = useStore((s) => s.users);

  const handle = (r: RoleView) => {
    setRoleView(r);
    setCurrentUserId(ROLE_USER[r]);
  };

  const currentUser = useStore((s) =>
    s.users.find((u) => u.id === s.currentUserId),
  );

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-ink)] px-4 py-1.5 text-white">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/70">
        <Eye size={11} strokeWidth={1.8} />
        Impersonation
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {(Object.entries(ROLE_LABEL) as [RoleView, string][]).map(([r, label]) => (
          <button
            key={r}
            type="button"
            onClick={() => handle(r)}
            className={`rounded-md px-2 py-0.5 text-[11.5px] font-medium transition-colors ${
              r === roleView
                ? "bg-[var(--color-accent)] text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/70">
        <Users size={11} strokeWidth={1.8} />
        Connecté en tant que{" "}
        <span className="font-medium text-white">
          {currentUser?.name ?? "—"}
        </span>
      </div>
    </div>
  );
}
