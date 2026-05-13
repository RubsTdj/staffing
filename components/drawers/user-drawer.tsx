"use client";

import { getAssigneeIds, useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { useMemo } from "react";

export function UserDrawer({ userId }: { userId: string }) {
  const close = useStore((s) => s.closeDrawer);
  const user = useStore((s) => s.users.find((u) => u.id === userId));
  const allActivities = useStore((s) => s.activities);
  const activities = useMemo(
    () => allActivities.filter((a) => getAssigneeIds(a).includes(userId)),
    [allActivities, userId],
  );
  if (!user) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <Avatar user={user} size={40} />
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
              Collaborateur
            </div>
            <h2 className="text-[20px] font-medium tracking-tight">
              {user.name}
            </h2>
            <div className="text-[11.5px] text-[var(--color-ink-3)]">
              {user.role} · {user.team} · {user.level}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded-md p-1.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
        >
          <X size={16} strokeWidth={1.8} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h3 className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
          Missions à venir ({activities.length})
        </h3>
        <ul className="mt-2 space-y-1.5">
          {activities.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[12.5px]"
            >
              {new Date(a.dateStart).toLocaleDateString("fr-FR")} · {a.type}{" "}
              {a.subCategory}
            </li>
          ))}
          {activities.length === 0 && (
            <li className="text-[12px] text-[var(--color-ink-3)]">
              Aucune mission programmée.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
