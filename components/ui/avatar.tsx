import type { User } from "@/lib/types";

const palette = [
  "#E8D9C8",
  "#D6E2D4",
  "#E0D4E4",
  "#E4D7C2",
  "#D9DEE6",
  "#EBD2C9",
  "#DDD8C5",
];

function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function Avatar({
  user,
  size = 22,
}: {
  user: Pick<User, "id" | "initials" | "level">;
  size?: number;
}) {
  const isObs = user.level === "Observateur";
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-medium text-[10px] tracking-tight text-[var(--color-ink)]"
      style={{
        width: size,
        height: size,
        background: colorFor(user.id),
        boxShadow: isObs
          ? "inset 0 0 0 1.5px var(--color-accent)"
          : "inset 0 0 0 1px rgba(20,17,15,0.08)",
      }}
      title={user.level}
    >
      {user.initials}
    </span>
  );
}

export function AvatarStack({
  users,
  max = 4,
}: {
  users: Pick<User, "id" | "initials" | "level">[];
  max?: number;
}) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((u, i) => (
        <span key={u.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <Avatar user={u} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className="ml-[-6px] inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium text-[var(--color-ink-2)] ring-1 ring-[var(--color-line)]"
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
