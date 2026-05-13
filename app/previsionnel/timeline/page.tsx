"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type {
  Client,
  DeploymentWave,
  WaveCell,
  WaveCellKind,
} from "@/lib/types";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================
//  Constants
// ============================================================
const WEEK_MS = 7 * 86400000;
const WEEKS_VISIBLE = 30;
const COL_CLIENT_W = 160;
const COL_SIZE_W = 64;
const COL_DATE_W = 88;
const COL_FIXED_W = COL_CLIENT_W + COL_SIZE_W + COL_DATE_W;
const CELL_W = 48;
const CELL_H = 28;

// Couleurs reprises de la capture utilisateur (Excel-like)
const KIND_STYLE: Record<WaveCellKind, string> = {
  deploy: "bg-[#5b9bd5] text-white",            // bleu plein (S32, S33...)
  ko: "bg-[#1f4e79] text-white",                // bleu marine (KO)
  formation: "bg-[#f4cccc] text-[#7a2e1f]",     // rose clair (formation)
  accompagnement: "bg-[#e91e8c] text-white",    // magenta plein (accompagnement)
  pause: "bg-[#bfbfbf] text-[#5a5a5a]",         // gris
};

const KIND_LABEL: Record<WaveCellKind, string> = {
  deploy: "Déploiement (Sxx)",
  ko: "Kick-off",
  formation: "Formation — saisis nb personnes",
  accompagnement: "Accompagnement — saisis nb personnes",
  pause: "Pause / vacances",
};

// ============================================================
//  Helpers
// ============================================================
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

// Sxx = nº de semaine de déploiement = position dans la vague + 1
function sLabel(idx: number, offset: number): string {
  return `S${String(idx + 1 + offset).padStart(2, "0")}`;
}

// Vacances scolaires France (approx 2025-26-27) — pour colorer le header en rouge
function isVacationWeek(d: Date): boolean {
  const m = d.getMonth();
  const dayNum = d.getDate();
  // Noël (semaines des 22 et 29 décembre)
  if (m === 11 && dayNum >= 19) return true;
  // Toussaint (fin octobre)
  if (m === 9 && dayNum >= 25) return true;
  if (m === 10 && dayNum <= 7) return true;
  // Février (mi-février)
  if (m === 1 && dayNum >= 14 && dayNum <= 28) return true;
  // Pâques (mi-avril)
  if (m === 3 && dayNum >= 11 && dayNum <= 25) return true;
  return false;
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

  const [offsetWeeks, setOffsetWeeks] = useState(-2);
  const today = useMemo(() => new Date("2026-05-12"), []);
  const viewStart = useMemo(() => {
    const s = startOfWeekMonday(today);
    s.setDate(s.getDate() + offsetWeeks * 7);
    return s;
  }, [today, offsetWeeks]);

  const [editing, setEditing] = useState<{
    waveId: string;
    weekIndex: number;
    anchor: { x: number; y: number };
  } | null>(null);

  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={["Prévisionnel", "Timeline déploiement"]}
        title="Timeline déploiement"
        subtitle="Carte prévisionnelle par client. Clic cellule = poser le type (S, KO, F, A, pause). Glisser une ligne = décaler toute la vague."
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

      <div className="px-4 py-4">
        <div className="overflow-x-auto rounded-md border border-[#b0b0b0] bg-white">
          <div
            style={{
              minWidth: COL_FIXED_W + WEEKS_VISIBLE * CELL_W,
            }}
          >
            <WeekHeader viewStart={viewStart} today={today} />
            {waves.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-[13px] font-semibold">Aucune vague</p>
                <p className="mt-1 text-[12px] text-[var(--color-ink-3)]">
                  Crée la première avec « Nouvelle vague ».
                </p>
              </div>
            ) : (
              waves.map((w) => {
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
              })
            )}
          </div>
        </div>

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
function WeekHeader({ viewStart, today }: { viewStart: Date; today: Date }) {
  return (
    <div
      className="flex border-b border-[#9a9a9a] bg-white"
      style={{ height: 40 }}
    >
      {/* 3 colonnes fixes */}
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold text-[#222] uppercase"
        style={{ width: COL_CLIENT_W }}
      >
        ex-outil
      </div>
      <div
        className="flex items-center justify-end border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold text-[#222] uppercase"
        style={{ width: COL_SIZE_W }}
      >
        taille
      </div>
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold text-[#222] uppercase"
        style={{ width: COL_DATE_W }}
      >
        date dépl
      </div>
      {/* Header semaines */}
      {Array.from({ length: WEEKS_VISIBLE }).map((_, i) => {
        const wk = new Date(viewStart.getTime() + i * WEEK_MS);
        const vacation = isVacationWeek(wk);
        const isCurrent =
          wk <= today && today < new Date(wk.getTime() + WEEK_MS);
        return (
          <div
            key={i}
            className={`flex items-center justify-center border-r border-[#9a9a9a] text-[12px] font-bold ${
              vacation
                ? "bg-[#c00000] text-white"
                : isCurrent
                  ? "bg-[#fff2cc] text-[#7f6000]"
                  : "bg-[#f2f2f2] text-[#222]"
            }`}
            style={{ width: CELL_W }}
            title={wk.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          >
            {String(wk.getDate()).padStart(2, "0")}/
            {String(wk.getMonth() + 1).padStart(2, "0")}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
//  WaveRow
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
  const setNote = useStore((s) => s.setWaveNote);

  // Drag
  const [dragDelta, setDragDelta] = useState(0);
  const dragRef = useRef<{ startX: number } | null>(null);

  const onLabelPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onLabelPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setDragDelta(Math.round((e.clientX - dragRef.current.startX) / CELL_W));
  };
  const onLabelPointerUp = () => {
    if (!dragRef.current) return;
    if (dragDelta !== 0) onMove(dragDelta);
    dragRef.current = null;
    setDragDelta(0);
  };

  // dérive la date de bascule = 1ère cellule "ko"
  const koIdx = wave.cells.findIndex((c) => c.kind === "ko");
  const deplDate = (() => {
    if (koIdx < 0) return new Date(wave.startMonday);
    const d = new Date(wave.startMonday);
    d.setDate(d.getDate() + koIdx * 7);
    return d;
  })();

  return (
    <div className="group relative flex border-b border-[#d0d0d0] last:border-b-0">
      {/* Colonne client */}
      <div
        className="flex items-center gap-1 border-r border-[#9a9a9a] bg-[#fafafa] px-2 select-none"
        style={{
          width: COL_CLIENT_W,
          height: CELL_H + 2,
          cursor: dragRef.current ? "grabbing" : "grab",
        }}
        onPointerDown={onLabelPointerDown}
        onPointerMove={onLabelPointerMove}
        onPointerUp={onLabelPointerUp}
        title="Glisser pour décaler toute la vague"
      >
        <span className="truncate text-[12px] font-medium text-[#222]">
          {client.name}
        </span>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="ml-auto opacity-0 group-hover:opacity-100 rounded p-0.5 text-[#a00] hover:bg-[#fee]"
          title="Supprimer la vague"
        >
          <Trash2 size={10} strokeWidth={2} />
        </button>
      </div>

      {/* Colonne taille */}
      <div
        className="flex items-center justify-end border-r border-[#9a9a9a] bg-white px-2 font-mono text-[11px] tabular-nums text-[#444]"
        style={{ width: COL_SIZE_W, height: CELL_H + 2 }}
      >
        {client.nbSalaries >= 1000
          ? `${Math.round(client.nbSalaries / 1000)}K`
          : client.nbSalaries}
      </div>

      {/* Colonne date dépl */}
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-white px-2 font-mono text-[11px] tabular-nums text-[#444]"
        style={{ width: COL_DATE_W, height: CELL_H + 2 }}
      >
        {String(deplDate.getDate()).padStart(2, "0")}/
        {String(deplDate.getMonth() + 1).padStart(2, "0")}/
        {String(deplDate.getFullYear()).slice(2)}
      </div>

      {/* Cellules hebdo */}
      {Array.from({ length: WEEKS_VISIBLE }).map((_, colIdx) => {
        const cellIdx = colIdx - startIdx;
        const cell =
          cellIdx >= 0 && cellIdx < wave.cells.length
            ? wave.cells[cellIdx]
            : null;
        return (
          <div
            key={colIdx}
            className="border-r border-[#d0d0d0]"
            style={{ width: CELL_W, height: CELL_H + 2 }}
          >
            {cell ? (
              <button
                type="button"
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  onCellClick(cellIdx, {
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 2,
                  });
                }}
                className={`flex h-full w-full items-center justify-center text-[11px] tabular-nums ${KIND_STYLE[cell.kind]}`}
                style={{
                  transform: dragDelta ? `translateX(${dragDelta * CELL_W}px)` : undefined,
                  opacity: dragDelta ? 0.85 : 1,
                }}
                title={`${KIND_LABEL[cell.kind]}${cell.headcount ? ` · ${cell.headcount}p` : ""}`}
              >
                {cell.kind === "ko"
                  ? "KO"
                  : cell.kind === "deploy"
                    ? sLabel(cellIdx, 0)
                    : cell.kind === "pause"
                      ? ""
                      : cell.headcount ?? ""}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  const rect = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  onCellClick(cellIdx, {
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 2,
                  });
                }}
                className="h-full w-full bg-white hover:bg-[#f0f0f0]"
                aria-label="Cellule vide"
              />
            )}
          </div>
        );
      })}

      {/* Annotation */}
      {wave.note !== undefined ? (
        <input
          defaultValue={wave.note}
          onBlur={(e) => setNote(wave.id, e.currentTarget.value)}
          placeholder="annotation"
          className="ml-2 max-w-[220px] flex-1 self-center rounded-sm border border-transparent bg-transparent px-1 text-[11px] italic text-[#666] outline-none hover:border-[#ccc] focus:border-[#5b9bd5] focus:bg-white focus:not-italic"
        />
      ) : (
        <button
          type="button"
          onClick={() => setNote(wave.id, "")}
          className="ml-2 self-center text-[10px] text-[#aaa] opacity-0 group-hover:opacity-100 hover:text-[#222]"
          title="Ajouter une annotation"
        >
          + note
        </button>
      )}
    </div>
  );
}

// ============================================================
//  CellPopover
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
        className="absolute w-[240px] rounded-md border border-[#9a9a9a] bg-white p-2 shadow-[var(--shadow-pop)]"
        style={{
          left: Math.min(Math.max(anchor.x - 120, 8), window.innerWidth - 248),
          top: Math.min(anchor.y, window.innerHeight - 300),
        }}
      >
        <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#666]">
            Cellule
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-[#888] hover:bg-[#eee]"
          >
            <X size={11} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-5 gap-1">
          <KindButton
            label="S"
            kind="deploy"
            active={cell?.kind === "deploy"}
            onClick={() => apply("deploy")}
          />
          <KindButton
            label="KO"
            kind="ko"
            active={cell?.kind === "ko"}
            onClick={() => apply("ko")}
          />
          <KindButton
            label="F"
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
            kind="pause"
            active={cell?.kind === "pause"}
            onClick={() => apply("pause")}
          />
        </div>

        {cell && (cell.kind === "formation" || cell.kind === "accompagnement") && (
          <div className="mt-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#666]">
              Nb personnes / jour
            </label>
            <div className="mt-1 flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={headcount}
                onChange={(e) => setHeadcount(e.target.value)}
                onKeyDown={onHeadcountKey}
                className="w-full rounded-sm border border-[#9a9a9a] bg-white px-1.5 py-1 text-[12px] tabular-nums outline-none focus:border-[#5b9bd5]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const n = parseInt(headcount, 10);
                  if (!isNaN(n)) apply(cell.kind, n);
                }}
                className="rounded-sm bg-[#5b9bd5] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#1f4e79]"
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
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-sm border border-[#d4a0a0] bg-[#fef5f5] px-2 py-1 text-[11px] font-medium text-[#a00] hover:bg-[#fde4e4]"
          >
            <Trash2 size={10} strokeWidth={2} />
            Vider
          </button>
        )}
      </div>
    </div>
  );
}

function KindButton({
  label,
  kind,
  active,
  onClick,
}: {
  label: string;
  kind: WaveCellKind;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={KIND_LABEL[kind]}
      onClick={onClick}
      className={`flex h-8 items-center justify-center rounded-sm text-[12px] font-bold ${KIND_STYLE[kind]} ${active ? "ring-2 ring-[#1f4e79]" : ""}`}
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
      <div className="w-full max-w-md rounded-md border border-[#9a9a9a] bg-white shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between border-b border-[#9a9a9a] bg-[#f2f2f2] px-4 py-2">
          <h3 className="text-[13px] font-semibold">Nouvelle vague</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-[#888] hover:bg-[#eee]"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-3 px-4 py-3">
          <div>
            <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#666]">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[#9a9a9a] bg-white px-2 py-1 text-[12.5px] outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#666]">
              Premier lundi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[#9a9a9a] bg-white px-2 py-1 text-[12.5px] outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#9a9a9a] bg-[#fafafa] px-4 py-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-[#9a9a9a] bg-white px-3 py-1 text-[11.5px] font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!clientId || !date}
            onClick={() => {
              const d = startOfWeekMonday(new Date(date));
              onCreate(clientId, isoDate(d));
            }}
            className="rounded-sm bg-[#5b9bd5] px-3 py-1 text-[11.5px] font-semibold text-white hover:bg-[#1f4e79] disabled:opacity-40"
          >
            Créer
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
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#444]">
      <LegendChip kind="deploy" label="S — déploiement actif" />
      <LegendChip kind="ko" label="KO — kick-off" />
      <LegendChip kind="formation" label="F — formation (rose clair + nb p.)" />
      <LegendChip kind="accompagnement" label="A — accompagnement (magenta + nb p.)" />
      <LegendChip kind="pause" label="— pause / vacances" />
      <span className="ml-3 inline-flex items-center gap-1.5">
        <span className="inline-block h-3.5 w-5 bg-[#c00000]" />
        semaine vacances scolaires (header)
      </span>
    </div>
  );
}

function LegendChip({ kind, label }: { kind: WaveCellKind; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex h-4 w-7 items-center justify-center text-[10px] font-bold ${KIND_STYLE[kind]}`}
      >
        {kind === "ko" ? "KO" : kind === "deploy" ? "S" : kind === "pause" ? "" : ""}
      </span>
      {label}
    </span>
  );
}
