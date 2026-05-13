"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { Client, DeploymentWave, WaveCell, WaveCellKind } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================
//  Constants & helpers
// ============================================================
const WEEK_MS = 7 * 86400000;
const WEEKS_VISIBLE = 32; // ~ 8 mois
const COL_LABEL_WIDTH = 280;
const CELL_HEIGHT = 36;
const ROW_PADDING_Y = 8;

const KIND_STYLE: Record<WaveCellKind, string> = {
  deploy:
    "bg-[#dbeafe] text-[#1e3a8a] border border-[#bfdbfe]",
  ko:
    "bg-[#2563eb] text-white border border-[#1e40af] font-bold",
  formation:
    "bg-[#fbcfe8] text-[#9d174d] border border-[#f9a8d4]",
  accompagnement:
    "bg-[#ec4899] text-white border border-[#db2777] font-semibold",
  pause:
    "bg-[#e5e7eb] text-[#9ca3af] border border-[#d1d5db]",
};

const KIND_LABEL: Record<WaveCellKind, string> = {
  deploy: "Déploiement",
  ko: "Kick-off",
  formation: "Formation",
  accompagnement: "Accompagnement",
  pause: "Pause",
};

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - dow);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekIndexFromDate(viewStart: Date, date: Date): number {
  return Math.floor((+date - +viewStart) / WEEK_MS);
}

// Numéro de semaine de déploiement à afficher dans une cellule "deploy":
// on compte depuis la 1ère cellule de la vague, sauf qu'on saute le KO.
// Ex: [S, S, KO, S, S] → S01, S02, KO, S01, S02 (S repart à 1 après KO)
function deployLabel(cells: WaveCell[], idx: number): string {
  if (cells[idx]?.kind !== "deploy") return "";
  const koIdx = cells.findIndex((c) => c.kind === "ko");
  let count = 0;
  const start = koIdx >= 0 && idx > koIdx ? koIdx + 1 : 0;
  for (let i = start; i <= idx; i++) {
    if (cells[i].kind === "deploy") count++;
  }
  return `S${String(count).padStart(2, "0")}`;
}

// ============================================================
//  Page
// ============================================================
export default function Page() {
  const clients = useStore((s) => s.clients);
  const waves = useStore((s) => s.waves);
  const moveWave = useStore((s) => s.moveWave);
  const createWave = useStore((s) => s.createWave);
  const deleteWave = useStore((s) => s.deleteWave);

  // Navigation horizontale par bloc de semaines
  const [offsetWeeks, setOffsetWeeks] = useState(-2);
  const today = useMemo(() => new Date("2026-05-12"), []);
  const viewStart = useMemo(() => {
    const s = startOfWeekMonday(today);
    s.setDate(s.getDate() + offsetWeeks * 7);
    return s;
  }, [today, offsetWeeks]);

  // Édition de cellule (popover) et annotation
  const [editing, setEditing] = useState<{
    waveId: string;
    weekIndex: number;
    anchor: { x: number; y: number };
  } | null>(null);

  // Création de vague
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={["Prévisionnel", "Timeline déploiement"]}
        title="Timeline déploiement"
        subtitle="Une ligne = une vague de déploiement. Glisser une ligne pour décaler. Cliquer une cellule pour éditer son type (S, KO, F, A, pause)."
        showFilters={false}
        actionLabel="Nouvelle vague"
        actionIcon={<Plus size={14} strokeWidth={2.2} />}
        onAction={() => setCreating(true)}
        right={
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
            <button
              type="button"
              onClick={() => setOffsetWeeks((v) => v - 8)}
              className="rounded-[5px] px-1.5 py-1 text-[12px] hover:bg-[var(--color-line-2)]"
              title="−8 semaines"
            >
              <ChevronLeft size={12} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setOffsetWeeks(-2)}
              className={`rounded-[5px] px-2 py-1 text-[12px] font-medium ${
                offsetWeeks === -2
                  ? "bg-[var(--color-ink)] text-white"
                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
              }`}
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setOffsetWeeks((v) => v + 8)}
              className="rounded-[5px] px-1.5 py-1 text-[12px] hover:bg-[var(--color-line-2)]"
              title="+8 semaines"
            >
              <ChevronRight size={12} strokeWidth={2} />
            </button>
          </div>
        }
      />

      <div className="px-6 py-5">
        <div className="card overflow-auto">
          {/* Header semaines */}
          <WeekHeader viewStart={viewStart} today={today} />

          {/* Lignes */}
          <div className="relative">
            {waves.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[13.5px] font-semibold">Aucune vague</p>
                <p className="mt-1 text-[12px] text-[var(--color-ink-3)]">
                  Crée la première avec le bouton « Nouvelle vague » en haut à droite.
                </p>
              </div>
            )}
            {waves.map((w) => {
              const client = clients.find((c) => c.id === w.clientId);
              if (!client) return null;
              return (
                <WaveRow
                  key={w.id}
                  wave={w}
                  client={client}
                  viewStart={viewStart}
                  onMove={(delta) => moveWave(w.id, delta)}
                  onDelete={() => deleteWave(w.id)}
                  onCellClick={(weekIndex, anchor) =>
                    setEditing({ waveId: w.id, weekIndex, anchor })
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Légende */}
        <Legend />
      </div>

      {editing && (
        <CellPopover
          waveId={editing.waveId}
          weekIndex={editing.weekIndex}
          anchor={editing.anchor}
          onClose={() => setEditing(null)}
        />
      )}

      {creating && (
        <CreateWaveModal
          clients={clients}
          onClose={() => setCreating(false)}
          onCreate={(clientId, monday) => {
            createWave(clientId, monday);
            setCreating(false);
          }}
        />
      )}
    </>
  );
}

// ============================================================
//  WeekHeader
// ============================================================
function WeekHeader({
  viewStart,
  today,
}: {
  viewStart: Date;
  today: Date;
}) {
  return (
    <div
      className="sticky top-0 z-10 grid border-b border-[var(--color-line)] bg-[var(--color-surface-2)]"
      style={{
        gridTemplateColumns: `${COL_LABEL_WIDTH}px repeat(${WEEKS_VISIBLE}, minmax(46px, 1fr))`,
      }}
    >
      <div className="grid grid-cols-3 border-r border-[var(--color-line)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink-3)]">
        <span className="col-span-2">Client / Vague</span>
        <span className="text-right">Dépl</span>
      </div>
      {Array.from({ length: WEEKS_VISIBLE }).map((_, i) => {
        const wk = new Date(viewStart.getTime() + i * WEEK_MS);
        const isMonthStart = wk.getDate() <= 7;
        const isCurrent =
          wk <= today && today < new Date(wk.getTime() + WEEK_MS);
        return (
          <div
            key={i}
            className={`flex flex-col items-center justify-end gap-0 border-l border-[var(--color-line-2)] py-1.5 text-[10px] tabular-nums ${
              isCurrent
                ? "bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent-2)]"
                : "text-[var(--color-ink-3)]"
            }`}
          >
            {isMonthStart && (
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-[var(--color-ink-2)]">
                {wk.toLocaleDateString("fr-FR", { month: "short" })}
              </span>
            )}
            <span className="font-medium">
              {String(wk.getDate()).padStart(2, "0")}/
              {String(wk.getMonth() + 1).padStart(2, "0")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
//  WaveRow — drag horizontal pour déplacer la vague
// ============================================================
function WaveRow({
  wave,
  client,
  viewStart,
  onMove,
  onDelete,
  onCellClick,
}: {
  wave: DeploymentWave;
  client: Client;
  viewStart: Date;
  onMove: (deltaWeeks: number) => void;
  onDelete: () => void;
  onCellClick: (weekIndex: number, anchor: { x: number; y: number }) => void;
}) {
  const startIdx = weekIndexFromDate(viewStart, new Date(wave.startMonday));

  // Drag state
  const [dragOffset, setDragOffset] = useState(0); // en pixels pendant le drag
  const dragRef = useRef<{ startX: number; cellWidth: number } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const setNote = useStore((s) => s.setWaveNote);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // ignore drag if started on a cell (let the click work)
    if ((e.target as HTMLElement).closest("[data-cell]")) return;
    const grid = rowRef.current?.querySelector<HTMLDivElement>("[data-grid]");
    if (!grid) return;
    const cellWidth =
      (grid.clientWidth - COL_LABEL_WIDTH) / WEEKS_VISIBLE;
    dragRef.current = { startX: e.clientX, cellWidth };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setDragOffset(e.clientX - dragRef.current.startX);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const px = e.clientX - dragRef.current.startX;
    const delta = Math.round(px / dragRef.current.cellWidth);
    dragRef.current = null;
    setDragOffset(0);
    if (delta !== 0) onMove(delta);
  };

  return (
    <div
      ref={rowRef}
      className="group relative grid border-b border-[var(--color-line-2)] last:border-b-0 hover:bg-[var(--color-surface-2)]/40"
      style={{
        gridTemplateColumns: `${COL_LABEL_WIDTH}px repeat(${WEEKS_VISIBLE}, minmax(46px, 1fr))`,
        minHeight: CELL_HEIGHT + ROW_PADDING_Y * 2,
      }}
      data-grid
    >
      {/* Colonne label client */}
      <div
        className="flex items-center gap-2 border-r border-[var(--color-line)] px-3 py-2"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          cursor: dragRef.current ? "grabbing" : "grab",
          userSelect: "none",
        }}
        title="Glisser horizontalement pour décaler toute la vague"
      >
        <GripVertical
          size={14}
          strokeWidth={1.8}
          className="text-[var(--color-ink-3)]/60 group-hover:text-[var(--color-ink-3)]"
        />
        <button
          type="button"
          onClick={() => onMove(-1)}
          className="rounded p-0.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          title="−1 semaine"
        >
          <ChevronLeft size={12} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          className="rounded p-0.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          title="+1 semaine"
        >
          <ChevronRight size={12} strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-[var(--color-ink)]">
            {client.name}
          </div>
          <div className="text-[10.5px] text-[var(--color-ink-3)]">
            {client.nbSalaries >= 1000
              ? `${Math.round(client.nbSalaries / 1000)}K`
              : client.nbSalaries}{" "}
            · {client.pipeline}
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-1 text-[var(--color-status-alert)] hover:bg-[var(--color-status-alert-bg)]"
          title="Supprimer la vague"
        >
          <Trash2 size={12} strokeWidth={1.8} />
        </button>
      </div>

      {/* Grid cells */}
      {Array.from({ length: WEEKS_VISIBLE }).map((_, colIdx) => {
        const cellIdx = colIdx - startIdx;
        const cell =
          cellIdx >= 0 && cellIdx < wave.cells.length
            ? wave.cells[cellIdx]
            : null;
        return (
          <div
            key={colIdx}
            className="relative border-l border-[var(--color-line-2)]/60"
            style={{ padding: `${ROW_PADDING_Y}px 2px` }}
          >
            {cell && (
              <button
                type="button"
                data-cell
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  onCellClick(cellIdx, {
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 4,
                  });
                }}
                className={`flex h-full w-full items-center justify-center rounded-md text-[11px] leading-none transition-transform hover:scale-[1.06] hover:shadow-sm ${KIND_STYLE[cell.kind]}`}
                style={{
                  transform: `translateX(${dragOffset}px)`,
                }}
                title={`${KIND_LABEL[cell.kind]}${cell.headcount ? ` · ${cell.headcount}p` : ""}`}
              >
                {cell.kind === "ko" ? (
                  "KO"
                ) : cell.kind === "deploy" ? (
                  <span className="font-mono text-[10.5px]">
                    {deployLabel(wave.cells, cellIdx)}
                  </span>
                ) : cell.kind === "pause" ? (
                  "—"
                ) : (
                  <span className="font-bold text-[12px] tabular-nums">
                    {cell.headcount ?? 0}
                  </span>
                )}
              </button>
            )}
            {!cell && (
              <button
                type="button"
                data-cell
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  onCellClick(cellIdx, {
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 4,
                  });
                }}
                className="h-full w-full rounded-md opacity-0 hover:bg-[var(--color-line-2)] hover:opacity-100"
                title="Ajouter une cellule"
              >
                <Plus
                  size={11}
                  strokeWidth={2}
                  className="mx-auto text-[var(--color-ink-3)]"
                />
              </button>
            )}
          </div>
        );
      })}

      {/* Note bord droit */}
      {wave.note !== undefined && (
        <input
          type="text"
          defaultValue={wave.note}
          onBlur={(e) => setNote(wave.id, e.currentTarget.value)}
          placeholder="Annotation…"
          className="absolute right-2 top-1 z-20 max-w-[200px] truncate rounded border border-transparent bg-transparent px-1.5 py-0.5 text-right text-[10.5px] italic text-[var(--color-ink-3)] outline-none hover:border-[var(--color-line)] focus:border-[var(--color-accent)] focus:bg-white focus:not-italic"
        />
      )}
      {wave.note === undefined && (
        <button
          type="button"
          onClick={() => setNote(wave.id, "")}
          className="absolute right-2 top-1 z-20 hidden text-[10px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] group-hover:inline-block"
          title="Ajouter une annotation"
        >
          + note
        </button>
      )}
    </div>
  );
}

// ============================================================
//  CellPopover — éditer une cellule
// ============================================================
function CellPopover({
  waveId,
  weekIndex,
  anchor,
  onClose,
}: {
  waveId: string;
  weekIndex: number;
  anchor: { x: number; y: number };
  onClose: () => void;
}) {
  const wave = useStore((s) => s.waves.find((w) => w.id === waveId));
  const setCell = useStore((s) => s.setWaveCell);
  const ref = useRef<HTMLDivElement>(null);

  const cell =
    wave && weekIndex >= 0 && weekIndex < wave.cells.length
      ? wave.cells[weekIndex]
      : null;

  const [headcount, setHeadcount] = useState<string>(
    cell?.headcount?.toString() ?? "",
  );

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const apply = (kind: WaveCellKind, hc?: number) => {
    setCell(waveId, weekIndex, { kind, headcount: hc });
    onClose();
  };

  const remove = () => {
    setCell(waveId, weekIndex, null);
    onClose();
  };

  const onHeadcountKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const n = parseInt(headcount, 10);
      if (!isNaN(n) && cell && (cell.kind === "formation" || cell.kind === "accompagnement")) {
        apply(cell.kind, n);
      }
    }
  };

  if (!wave) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={ref}
        className="absolute w-[260px] rounded-xl border border-[var(--color-line)] bg-white p-3 shadow-[var(--shadow-pop)]"
        style={{
          left: Math.min(Math.max(anchor.x - 130, 8), window.innerWidth - 268),
          top: Math.min(anchor.y, window.innerHeight - 320),
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink-3)]">
            Semaine {weekIndex + 1}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-5 gap-1.5">
          <KindButton
            label="S"
            title="Déploiement"
            kind="deploy"
            active={cell?.kind === "deploy"}
            onClick={() => apply("deploy")}
          />
          <KindButton
            label="KO"
            title="Kick-off"
            kind="ko"
            active={cell?.kind === "ko"}
            onClick={() => apply("ko")}
          />
          <KindButton
            label="F"
            title="Formation"
            kind="formation"
            active={cell?.kind === "formation"}
            onClick={() =>
              apply(
                "formation",
                cell?.kind === "formation" ? cell.headcount : 1,
              )
            }
          />
          <KindButton
            label="A"
            title="Accompagnement"
            kind="accompagnement"
            active={cell?.kind === "accompagnement"}
            onClick={() =>
              apply(
                "accompagnement",
                cell?.kind === "accompagnement" ? cell.headcount : 1,
              )
            }
          />
          <KindButton
            label="—"
            title="Pause"
            kind="pause"
            active={cell?.kind === "pause"}
            onClick={() => apply("pause")}
          />
        </div>

        {cell && (cell.kind === "formation" || cell.kind === "accompagnement") && (
          <div className="mt-3">
            <label className="block text-[10.5px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink-3)]">
              Nb personnes
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                onKeyDown={onHeadcountKey}
                className="w-full rounded-md border border-[var(--color-line)] bg-white px-2 py-1.5 text-[13px] tabular-nums outline-none focus:border-[var(--color-accent)]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const n = parseInt(headcount, 10);
                  if (!isNaN(n)) apply(cell.kind, n);
                }}
                className="btn btn-primary btn-sm"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {cell && (
          <button
            type="button"
            onClick={remove}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1.5 text-[11.5px] font-medium text-[var(--color-status-alert)] hover:bg-[var(--color-status-alert-bg)]"
          >
            <Trash2 size={11} strokeWidth={1.8} />
            Supprimer la cellule
          </button>
        )}
      </div>
    </div>
  );
}

function KindButton({
  label,
  title,
  kind,
  active,
  onClick,
}: {
  label: string;
  title: string;
  kind: WaveCellKind;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex h-9 flex-col items-center justify-center rounded-md text-[12px] font-semibold transition-transform hover:scale-105 ${KIND_STYLE[kind]} ${active ? "ring-2 ring-[var(--color-accent)] ring-offset-1" : ""}`}
    >
      {label}
    </button>
  );
}

// ============================================================
//  CreateWaveModal
// ============================================================
function CreateWaveModal({
  clients,
  onClose,
  onCreate,
}: {
  clients: Client[];
  onClose: () => void;
  onCreate: (clientId: string, startMonday: string) => void;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [date, setDate] = useState(() => {
    const d = startOfWeekMonday(new Date("2026-05-12"));
    return isoDate(d);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 p-4 animate-overlay-in">
      <div className="card-elevated w-full max-w-md">
        <div className="card-header">
          <h3 className="text-[14.5px] font-semibold">Nouvelle vague</h3>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded p-1 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink-3)]">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.10em] text-[var(--color-ink-3)]">
              Premier lundi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none"
            />
            <p className="mt-1 text-[10.5px] text-[var(--color-ink-3)]">
              La vague démarre par 2 semaines de déploiement, un KO, puis 3 semaines.
              Tu pourras éditer chaque cellule au clic.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface-2)] px-5 py-3">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button
            type="button"
            disabled={!clientId || !date}
            onClick={() => {
              // snap to monday
              const d = startOfWeekMonday(new Date(date));
              onCreate(clientId, isoDate(d));
            }}
            className="btn btn-primary"
          >
            Créer la vague
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  Legend
// ============================================================
function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--color-ink-3)]">
      <LegendChip kind="deploy" label="Déploiement (S01, S02…)" />
      <LegendChip kind="ko" label="Kick-off" />
      <LegendChip kind="formation" label="Formation (rose clair, nb personnes)" />
      <LegendChip kind="accompagnement" label="Accompagnement (rose foncé, nb personnes)" />
      <LegendChip kind="pause" label="Pause / vacances" />
    </div>
  );
}

function LegendChip({ kind, label }: { kind: WaveCellKind; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-4 w-6 rounded ${KIND_STYLE[kind]}`} />
      {label}
    </span>
  );
}
