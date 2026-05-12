"use client";

import { useStore } from "@/lib/store";
import { ActivityDrawer } from "./drawers/activity-drawer";
import { UserDrawer } from "./drawers/user-drawer";
import { useEffect } from "react";

export function RightDrawer() {
  const drawer = useStore((s) => s.drawer);
  const close = useStore((s) => s.closeDrawer);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (drawer) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer, close]);

  if (!drawer) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer"
        onClick={close}
        className="absolute inset-0 bg-[var(--color-ink)]/15 animate-overlay-in"
      />
      <aside
        role="dialog"
        aria-modal="true"
        className="absolute right-0 top-0 h-dvh w-full max-w-[480px] overflow-y-auto border-l border-[var(--color-line)] bg-[var(--color-surface)] shadow-[-12px_0_40px_-24px_rgba(20,17,15,0.18)] animate-drawer-in"
      >
        {drawer.kind === "activity" && <ActivityDrawer activityId={drawer.id} />}
        {drawer.kind === "user" && <UserDrawer userId={drawer.id} />}
      </aside>
    </div>
  );
}
