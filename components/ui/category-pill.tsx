import type { ActivityType, Modality, SubCategory } from "@/lib/types";

function tintFor(
  type: ActivityType,
  modality: Modality,
): { bg: string; ink: string } {
  if (type === "Accompagnement") {
    return modality === "Présentiel"
      ? { bg: "var(--color-tint-pink)", ink: "var(--color-tint-pink-ink)" }
      : { bg: "var(--color-tint-mist)", ink: "var(--color-tint-mist-ink)" };
  }
  return modality === "Présentiel"
    ? { bg: "var(--color-tint-sand)", ink: "var(--color-tint-sand-ink)" }
    : { bg: "var(--color-tint-mist)", ink: "var(--color-tint-mist-ink)" };
}

export function CategoryPill({
  type,
  subCategory,
  modality,
}: {
  type: ActivityType;
  subCategory: SubCategory;
  modality: Modality;
}) {
  const c = tintFor(type, modality);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ background: c.bg, color: c.ink }}
    >
      <span className="opacity-80">{type}</span>
      <span className="opacity-50">·</span>
      <span>{subCategory}</span>
      <span className="opacity-50">·</span>
      <span className="opacity-80">{modality}</span>
    </span>
  );
}
