import { CalendarDays, CheckCheck, TrainFront } from "lucide-react";
import type { ValidationKind } from "@/lib/types";

const config: Record<
  ValidationKind,
  { label: string; tint: string; ink: string; Icon: typeof CalendarDays }
> = {
  prev: {
    label: "Prévisionnel",
    tint: "var(--color-tint-mist)",
    ink: "var(--color-tint-mist-ink)",
    Icon: CalendarDays,
  },
  validated: {
    label: "Staffing validé",
    tint: "var(--color-tint-sage)",
    ink: "var(--color-tint-sage-ink)",
    Icon: CheckCheck,
  },
  ready: {
    label: "Prêt au départ",
    tint: "var(--color-tint-sand)",
    ink: "var(--color-tint-sand-ink)",
    Icon: TrainFront,
  },
};

export function ValidationStatus({
  kind,
  compact,
}: {
  kind: ValidationKind;
  compact?: boolean;
}) {
  const c = config[kind];
  const { Icon } = c;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset"
      style={{
        background: c.tint,
        color: c.ink,
        boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${c.ink} 12%, transparent)`,
      }}
      title={c.label}
    >
      <Icon size={12} strokeWidth={1.8} />
      {!compact && <span>{c.label}</span>}
    </span>
  );
}
