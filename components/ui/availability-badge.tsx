import type { Availability } from "@/lib/types";

const cfg: Record<Availability, { label: string; dot: string; text: string }> = {
  available: {
    label: "Disponible",
    dot: "bg-[var(--color-status-done)]",
    text: "text-[var(--color-ink-2)]",
  },
  backup: {
    label: "Backup",
    dot: "bg-[var(--color-status-partial)]",
    text: "text-[var(--color-ink-2)]",
  },
  unavailable: {
    label: "Indisponible",
    dot: "bg-[var(--color-status-alert)]",
    text: "text-[var(--color-ink-2)]",
  },
};

export function AvailabilityBadge({ value }: { value: Availability }) {
  const c = cfg[value];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      <span className={`text-[11px] ${c.text}`}>{c.label}</span>
    </span>
  );
}
