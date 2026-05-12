import type { StaffingStatusKind } from "@/lib/types";

const labels: Record<StaffingStatusKind, string> = {
  todo: "À faire",
  partial: "En cours",
  done: "Complet",
  alert: "Alerte annulation",
};

const dotColors: Record<StaffingStatusKind, string> = {
  todo: "bg-[var(--color-status-todo)]",
  partial: "bg-[var(--color-status-partial)]",
  done: "bg-[var(--color-status-done)]",
  alert: "bg-[var(--color-status-alert)]",
};

export function StaffingDot({
  status,
  size = 8,
  pulse,
}: {
  status: StaffingStatusKind;
  size?: number;
  pulse?: boolean;
}) {
  return (
    <span
      aria-label={labels[status]}
      title={labels[status]}
      className={`inline-block rounded-full ${dotColors[status]} ${
        pulse && status === "alert"
          ? "ring-2 ring-[var(--color-status-alert)]/25"
          : ""
      }`}
      style={{ width: size, height: size }}
    />
  );
}

export function StaffingStatus({ status }: { status: StaffingStatusKind }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-[var(--color-ink-2)]">
      <StaffingDot status={status} pulse />
      <span className="tracking-tight">{labels[status]}</span>
    </span>
  );
}

export const STAFFING_LABELS = labels;
