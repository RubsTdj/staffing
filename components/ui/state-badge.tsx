import type { ActivityState } from "@/lib/types";
import { Check, CheckCheck, Circle, CircleDashed, TrainFront, TriangleAlert } from "lucide-react";

interface Cfg {
  label: string;
  dot: string;
  text: string;
  bg: string;
  Icon?: typeof Check;
}

const CONFIG: Record<ActivityState, Cfg> = {
  draft: {
    label: "Brouillon",
    dot: "bg-[var(--color-status-todo)]",
    text: "text-[var(--color-ink-3)]",
    bg: "bg-[var(--color-line-2)]",
    Icon: CircleDashed,
  },
  "to-staff": {
    label: "À staffer",
    dot: "bg-[var(--color-status-partial)]",
    text: "text-[var(--color-tint-sand-ink)]",
    bg: "bg-[var(--color-tint-sand)]",
    Icon: Circle,
  },
  staffed: {
    label: "Staffé",
    dot: "bg-[var(--color-status-done)]",
    text: "text-[var(--color-tint-sage-ink)]",
    bg: "bg-[var(--color-tint-sage)]",
    Icon: Check,
  },
  validated: {
    label: "Validé",
    dot: "bg-[var(--color-status-done)]",
    text: "text-[var(--color-tint-sage-ink)]",
    bg: "bg-[var(--color-tint-sage)]",
    Icon: CheckCheck,
  },
  ready: {
    label: "Prêt au départ",
    dot: "bg-[var(--color-status-done)]",
    text: "text-[var(--color-tint-mist-ink)]",
    bg: "bg-[var(--color-tint-mist)]",
    Icon: TrainFront,
  },
  "cancel-requested": {
    label: "Annulation",
    dot: "bg-[var(--color-status-alert)]",
    text: "text-[var(--color-tint-pink-ink)]",
    bg: "bg-[var(--color-tint-pink)]",
    Icon: TriangleAlert,
  },
};

export function StateDot({
  state,
  size = 8,
}: {
  state: ActivityState;
  size?: number;
}) {
  const c = CONFIG[state];
  return (
    <span
      className={`inline-block rounded-full ${c.dot}`}
      style={{ width: size, height: size }}
      aria-label={c.label}
      title={c.label}
    />
  );
}

export function StateBadge({
  state,
  size = "md",
}: {
  state: ActivityState;
  size?: "sm" | "md";
}) {
  const c = CONFIG[state];
  const Icon = c.Icon;
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[10.5px]" : "px-2 py-0.5 text-[11px]";
  const ix = size === "sm" ? 10 : 11;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md ${pad} font-medium ${c.text} ${c.bg}`}
      title={c.label}
    >
      {Icon && <Icon size={ix} strokeWidth={1.9} />}
      <span>{c.label}</span>
    </span>
  );
}

export const STATE_LABELS = Object.fromEntries(
  Object.entries(CONFIG).map(([k, v]) => [k, v.label]),
) as Record<ActivityState, string>;
