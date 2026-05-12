"use client";

import { computeActivityState, computeRequired, useStore } from "@/lib/store";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCheck,
  Copy,
  Crown,
  MapPin,
  MessageSquare,
  Plus,
  Send,
  TrainFront,
  TriangleAlert,
  X,
} from "lucide-react";
import { StateBadge } from "@/components/ui/state-badge";
import { CategoryPill } from "@/components/ui/category-pill";
import { ModalityIcon } from "@/components/ui/modality-icon";
import { Avatar } from "@/components/ui/avatar";
import type { ValidationKind } from "@/lib/types";

export function ActivityDrawer({ activityId }: { activityId: string }) {
  const close = useStore((s) => s.closeDrawer);
  const activity = useStore((s) =>
    s.activities.find((a) => a.id === activityId),
  );
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const comments = useStore((s) =>
    s.comments.filter((c) => c.activityId === activityId),
  );
  const assignUser = useStore((s) => s.assignUser);
  const unassignUser = useStore((s) => s.unassignUser);
  const setValidation = useStore((s) => s.setActivityValidation);
  const requestCancel = useStore((s) => s.requestCancel);
  const duplicate = useStore((s) => s.duplicateActivity);
  const addComment = useStore((s) => s.addComment);
  const currentUserId = useStore((s) => s.currentUserId);

  const [query, setQuery] = useState("");
  const [obsAlert, setObsAlert] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");

  if (!activity) return null;

  const client = clients.find((c) => c.id === activity.clientId);
  const centre = centres.find((c) => c.id === activity.centreId);
  const assigned = activity.assignees
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as typeof users;
  const required = computeRequired(activity, centre);
  const state = computeActivityState(activity);
  const isOff = activity.type === "Off";

  const observerCount = assigned.filter(
    (u) => u.level === "Observateur",
  ).length;

  const cdpUsers = client
    ? users.filter((u) => u.cdpFor?.includes(client.id))
    : [];
  const cdpAssigned = assigned.some((u) => u.cdpFor?.includes(client?.id ?? ""));

  const candidates = useMemo(() => {
    return users
      .filter((u) => u.role === "OPS" && !activity.assignees.includes(u.id))
      .filter((u) =>
        query.trim()
          ? u.name.toLowerCase().includes(query.toLowerCase())
          : true,
      );
  }, [users, activity.assignees, query]);

  const handleAssign = (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u?.level === "Observateur" && observerCount >= 1) {
      setObsAlert(u.name);
      return;
    }
    assignUser(activity.id, userId);
  };

  const handleAddComment = () => {
    if (!commentBody.trim()) return;
    addComment({
      activityId: activity.id,
      authorId: currentUserId,
      body: commentBody.trim(),
      mentions: [],
    });
    setCommentBody("");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] px-6 pt-5 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
            <span>{isOff ? "Indisponibilité" : "Mission"}</span>
            <span className="text-[var(--color-line)]">·</span>
            <span className="font-mono text-[10.5px]">#{activity.id.toUpperCase()}</span>
          </div>
          <h2 className="mt-1 flex items-baseline gap-2 text-[17px] font-semibold tracking-tight">
            {isOff ? (
              <span>{assigned[0]?.name ?? "—"} · Off</span>
            ) : (
              <>
                <span>{client?.name}</span>
                <span className="text-[var(--color-ink-3)] font-normal">·</span>
                <span className="text-[var(--color-ink-2)] font-medium">
                  {centre?.name}
                </span>
              </>
            )}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {!isOff && (
              <CategoryPill
                type={activity.type}
                subCategory={activity.subCategory ?? "PDS"}
                modality={activity.modality}
              />
            )}
            <StateBadge state={state} />
            {activity.cdpAssigned && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10.5px] font-medium text-[var(--color-accent-2)]">
                <Crown size={10} strokeWidth={1.9} />
                CDP assigné
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => duplicate(activity.id)}
            className="rounded-md p-1.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
            title="Dupliquer (double-clic)"
          >
            <Copy size={14} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
            aria-label="Fermer"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Meta */}
        <section className="grid grid-cols-2 gap-3">
          <Meta icon={<Calendar size={13} strokeWidth={1.6} />} label="Période">
            {new Date(activity.dateStart).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
            {" → "}
            {new Date(activity.dateEnd).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
          </Meta>
          {!isOff && client && (
            <Meta icon={<Building2 size={13} strokeWidth={1.6} />} label="Client">
              {client.name} · {client.kind}
            </Meta>
          )}
          {!isOff && centre && (
            <Meta
              icon={<MapPin size={13} strokeWidth={1.6} />}
              label={`Centre · ${centre.region}`}
            >
              {centre.address}
            </Meta>
          )}
          {!isOff && (
            <Meta
              icon={<ModalityIcon modality={activity.modality} />}
              label="Modalité"
            >
              {activity.modality}
            </Meta>
          )}
        </section>

        {!isOff && (
          <>
            {/* Ratio */}
            <section className="rounded-lg border border-[var(--color-line)] bg-white p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                  Ratio d'accompagnement
                </div>
                <span className="font-mono text-[11px] text-[var(--color-ink-3)]">
                  {assigned.length} / {required}
                </span>
              </div>
              <div className="mt-1.5 text-[14px] tracking-tight">
                {required > assigned.length ? (
                  <span className="text-[var(--color-ink)]">
                    <span className="font-semibold">
                      {required - assigned.length}
                    </span>{" "}
                    accompagnant
                    {required - assigned.length > 1 ? "s " : " "}
                    requis
                  </span>
                ) : (
                  <span className="font-medium text-[var(--color-status-done)]">
                    Couverture complète
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11.5px] text-[var(--color-ink-3)]">
                {activity.type === "Formation"
                  ? "Règle : 2 formateurs requis par défaut."
                  : `Règle : 1 accompagnant pour 9 PDS+AM (${
                      centre?.nbSalaries
                        ? `${Math.round(centre.nbSalaries / 1000)}k salariés`
                        : "?"
                    } sur ce centre).`}
              </div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--color-line-2)]">
                <div
                  className="h-full rounded-full bg-[var(--color-status-done)] transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (assigned.length / Math.max(1, required)) * 100,
                    )}%`,
                  }}
                />
              </div>
              {!cdpAssigned && cdpUsers.length > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-[var(--color-tint-sand)] px-2.5 py-2 text-[11.5px] text-[var(--color-tint-sand-ink)]">
                  <TriangleAlert size={12} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                  <span>
                    Règle : le CDP doit toujours être assigné. Manquant —{" "}
                    {cdpUsers.map((u) => u.name).join(", ")}.
                  </span>
                </div>
              )}
            </section>

            {/* Assignees */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                  Équipe assignée
                </h3>
                <span className="text-[11px] text-[var(--color-ink-3)]">
                  {observerCount} observateur · max 1
                </span>
              </div>

              {assigned.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--color-line)] bg-white px-3 py-4 text-center text-[12px] text-[var(--color-ink-3)]">
                  Aucun collaborateur assigné
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {assigned.map((u) => {
                    const isCdp = u.cdpFor?.includes(client?.id ?? "");
                    return (
                      <li
                        key={u.id}
                        className="flex items-center gap-2.5 rounded-md border border-[var(--color-line)] bg-white px-2.5 py-2"
                      >
                        <Avatar user={u} size={26} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 truncate text-[13px] text-[var(--color-ink)]">
                            {u.name}
                            {isCdp && (
                              <Crown
                                size={11}
                                strokeWidth={1.8}
                                className="text-[var(--color-accent)]"
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-[var(--color-ink-3)]">
                            {u.level} · {u.team}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => unassignUser(activity.id, u.id)}
                          className="rounded-md p-1 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
                          aria-label="Retirer"
                        >
                          <X size={13} strokeWidth={1.6} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Add */}
              <div className="mt-3 rounded-lg border border-[var(--color-line)] bg-white">
                <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-2.5 py-1.5">
                  <Plus
                    size={13}
                    strokeWidth={1.8}
                    className="text-[var(--color-ink-3)]"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ajouter un collaborateur…"
                    className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-[var(--color-ink-3)]"
                  />
                </div>
                <ul className="max-h-48 overflow-y-auto py-1">
                  {candidates.slice(0, 6).map((u) => {
                    const isObsBlocked =
                      u.level === "Observateur" && observerCount >= 1;
                    return (
                      <li key={u.id}>
                        <button
                          type="button"
                          disabled={isObsBlocked}
                          onClick={() => handleAssign(u.id)}
                          className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-[12.5px] transition-colors ${
                            isObsBlocked
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-[var(--color-line-2)]"
                          }`}
                        >
                          <Avatar user={u} size={22} />
                          <span className="flex-1 truncate">{u.name}</span>
                          <span className="text-[10.5px] text-[var(--color-ink-3)]">
                            {u.level}
                            {isObsBlocked && " · bloqué"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {candidates.length === 0 && (
                    <li className="px-2.5 py-3 text-center text-[11.5px] text-[var(--color-ink-3)]">
                      Aucun candidat
                    </li>
                  )}
                </ul>
              </div>

              {obsAlert && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-[var(--color-status-alert)]/30 bg-[var(--color-tint-pink)] px-3 py-2.5 text-[12px] text-[var(--color-tint-pink-ink)]">
                  <AlertTriangle
                    size={14}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="font-medium">Limite atteinte</div>
                    <div className="opacity-90">
                      Impossible d'ajouter {obsAlert} : un seul observateur est
                      autorisé par déplacement.
                    </div>
                    <button
                      type="button"
                      onClick={() => setObsAlert(null)}
                      className="mt-1 text-[11px] underline underline-offset-2"
                    >
                      Compris
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Workflow */}
            <section>
              <h3 className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                Workflow
              </h3>
              <div className="rounded-lg border border-[var(--color-line)] bg-white p-3">
                <ValidationSteps
                  current={activity.validation}
                  onSelect={(v) => setValidation(activity.id, v)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={activity.validation === "prev"}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 py-1.5 text-[11.5px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={12} strokeWidth={2} />
                    Pousser sur Google Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => requestCancel(activity.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[11.5px] text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                  >
                    <AlertTriangle size={12} strokeWidth={1.8} />
                    Demander annulation
                  </button>
                </div>
              </div>
            </section>

            {/* Comments */}
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                  Commentaires
                </h3>
                <span className="text-[11px] text-[var(--color-ink-3)]">
                  {comments.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {comments.map((c) => {
                  const author = users.find((u) => u.id === c.authorId);
                  return (
                    <li
                      key={c.id}
                      className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-ink-3)]">
                        <span className="font-medium text-[var(--color-ink-2)]">
                          {author?.name}
                        </span>
                        <span>
                          {new Date(c.createdAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-[12.5px] text-[var(--color-ink-2)]">
                        {c.body}
                      </p>
                    </li>
                  );
                })}
                {comments.length === 0 && (
                  <li className="text-[11.5px] text-[var(--color-ink-3)]">
                    Aucun commentaire.
                  </li>
                )}
              </ul>
              <div className="mt-2 flex items-start gap-2 rounded-md border border-[var(--color-line)] bg-white p-2">
                <MessageSquare
                  size={13}
                  strokeWidth={1.6}
                  className="mt-1 text-[var(--color-ink-3)]"
                />
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Écrire un commentaire (mentions avec @)…"
                  className="min-h-[56px] flex-1 resize-none bg-transparent text-[12.5px] outline-none placeholder:text-[var(--color-ink-3)]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!commentBody.trim()}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-2.5 py-1.5 text-[11.5px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Publier
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-0.5 truncate text-[12.5px] text-[var(--color-ink)]">
        {children}
      </div>
    </div>
  );
}

function ValidationSteps({
  current,
  onSelect,
}: {
  current: ValidationKind;
  onSelect: (v: ValidationKind) => void;
}) {
  const steps: { key: ValidationKind; label: string; Icon: typeof Calendar }[] =
    [
      { key: "prev", label: "Prévisionnel", Icon: Calendar },
      { key: "validated", label: "Staffing validé", Icon: CheckCheck },
      { key: "ready", label: "Prêt au départ", Icon: TrainFront },
    ];
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-1">
      {steps.map((s, i) => {
        const active = i <= idx;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(s.key)}
              className={`flex w-full flex-col items-start gap-1 rounded-md border px-2 py-1.5 text-left transition-colors ${
                active
                  ? "border-[var(--color-ink)]/15 bg-[var(--color-line-2)]"
                  : "border-[var(--color-line)] bg-white hover:bg-[var(--color-line-2)]"
              }`}
            >
              <s.Icon
                size={12}
                strokeWidth={1.8}
                className={
                  active
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-ink-3)]"
                }
              />
              <div
                className={`text-[11px] ${
                  active
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-ink-3)]"
                }`}
              >
                {s.label}
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
