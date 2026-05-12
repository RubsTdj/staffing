import { MonitorSmartphone, School } from "lucide-react";
import type { Modality } from "@/lib/types";

export function ModalityIcon({
  modality,
  withLabel,
}: {
  modality: Modality;
  withLabel?: boolean;
}) {
  const Icon = modality === "Présentiel" ? School : MonitorSmartphone;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[var(--color-ink-3)]"
      title={modality}
    >
      <Icon size={14} strokeWidth={1.6} />
      {withLabel && <span className="text-[12px]">{modality}</span>}
    </span>
  );
}
