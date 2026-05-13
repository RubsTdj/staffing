"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type {
  Client,
  DeploymentWave,
  WaveCell,
  WaveCellKind,
} from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
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
const WEEKS_VISIBLE = 28;
const COL_CLIENT_W = 160;
const COL_SIZE_W = 60;
const COL_DATE_W = 84;
const COL_FIXED_W = COL_CLIENT_W + COL_SIZE_W + COL_DATE_W;
const CELL_W = 52;
const CELL_H = 32;
const ROW_H = CELL_H + 18; // marge haut pour le drag handle
const HEADER_H = 38;

// ============================================================
//  Visuel
// ============================================================
const KIND_BG: Record<WaveCellKind, string> = {
  deploy: "#5b9bd5",
  ko: "#1f4e79",
  formation: "#f4cccc",
  accompagnement: "#e91e8c",
  pause: "#bfbfbf",
};

const KIND_INK: Record<WaveCellKind, string> = {
  deploy: "#ffffff",
  ko: "#ffffff",
  formation: "#7a2e1f",
  accompagnement: "#ffffff",
  pause: "#5a5a5a",
};

const KIND_LABEL: Record<WaveCellKind, string> = {
  deploy: "Déploiement",
  ko: "Kick-off",
  formation: "Formation",
  accompagnement: "Accompagnement",
  pause: "Pause",
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
  return Math.round((+date - +viewStart) / WEEK_MS);
}
function sLabel(idx: number): string {
  return `S${String(idx + 1).padStart(2, "0")}`;
}
function isVacationWeek(d: Date): boolean {
  const m = d.getMonth();
  const dayNum = d.getDate();
  if (m === 11 && dayNum >= 19) return true; // Noël
  if (m === 9 && dayNum >= 25) return true; // Toussaint
  if (m === 10 && dayNum <= 7) return true;
  if (m === 1 && dayNum >= 14 && dayNum <= 28) return true; // Février
  if (m === 3 && dayNum >= 11 && dayNum <= 25) return true; // Pâques
  return false;
}

// ============================================================
//  Outil pinceau actif
// ============================================================
type Tool =
  | { kind: "select" }
  | { kind: "deploy" }
  | { kind: "ko" }
  | { kind: "formation"; headcount: number }
  | { kind: "accompagnement"; headcount: number }
  | { kind: "pause" }
  | { kind: "erase" };

const DEFAULT_HC = 8;

// ============================================================
//  Page
// ============================================================
export default function Page() {
  const clients = useStore((s) => s.clients);
  const waves = useStore((s) => s.waves);
  const moveWave = useStore((s) => s.moveWave);
  const setCell = useStore((s) => s.setWaveCell);
  const resizeWave = useStore((s) => s.resizeWave);
  const createWave = useStore((s) => s.createWave);
  const deleteWave = useStore((s) => s.deleteWave);

  const [offsetWeeks, setOffsetWeeks] = useState(-2);
  const today = useMemo(() => new Date("2026-05-12"), []);
  const viewStart = useMemo(() => {
    const s = startOfWeekMonday(today);
    s.setDate(s.getDate() + offsetWeeks * 7);
    return s;
  }, [today, offsetWeeks]);

  const [tool, setTool] = useState<Tool>({ kind: "select" });
  const [creating, setCreating] = useState(false);
  const [editingHc, setEditingHc] = useState<{
    waveId: string;
    weekIndex: number;
  } | null>(null);

  // Drag-paint en cours sur une vague
  const paintingRef = useRef<{ waveId: string } | null>(null);

  const applyTool = (waveId: string, cellIdx: number) => {
    if (tool.kind === "select") return;
    if (tool.kind === "erase") {
      setCell(waveId, cellIdx, null);
      return;
    }
    if (tool.kind === "formation" || tool.kind === "accompagnement") {
      setCell(waveId, cellIdx, {
        kind: tool.kind,
        headcount: tool.headcount,
      });
      return;
    }
    setCell(waveId, cellIdx, { kind: tool.kind });
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Prévisionnel", "Timeline déploiement"]}
        title="Timeline déploiement"
        subtitle="Choisis un outil dans la palette, peins les semaines. Glisse le bloc d'une vague pour le décaler entier. Tire les bords pour l'allonger."
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

      {/* Palette d'outils */}
      <Toolbar tool={tool} setTool={setTool} />

      <div className="px-4 pb-6">
        <div className="overflow-x-auto rounded-md border border-[#9a9a9a] bg-white">
          <div style={{ minWidth: COL_FIXED_W + WEEKS_VISIBLE * CELL_W }}>
            <WeekHeader viewStart={viewStart} today={today} />
            {waves.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-[13px] font-semibold">Aucune vague</p>
                <p className="mt-1 text-[12px] text-[var(--color-ink-3)]">
                  Crée la première avec « Nouvelle vague » en haut à droite.
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
                    tool={tool}
                    onPaintStart={(waveId) => {
                      paintingRef.current = { waveId };
                    }}
                    onPaintEnd={() => {
                      paintingRef.current = null;
                    }}
                    paintingRef={paintingRef}
                    applyTool={applyTool}
                    onMove={(delta) => moveWave(w.id, delta)}
                    onResize={(newLen) => resizeWave(w.id, newLen)}
                    onDelete={() => deleteWave(w.id)}
                    onEditHc={(weekIndex) =>
                      setEditingHc({ waveId: w.id, weekIndex })
                    }
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {editingHc && (
        <HeadcountModal
          waveId={editingHc.waveId}
          weekIndex={editingHc.weekIndex}
          onClose={() => setEditingHc(null)}
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
//  Toolbar
// ============================================================
function Toolbar({
  tool,
  setTool,
}: {
  tool: Tool;
  setTool: (t: Tool) => void;
}) {
  const hcInputRef = useRef<HTMLInputElement>(null);

  const isActive = (kind: Tool["kind"]) => tool.kind === kind;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-surface-2)] px-4 py-2">
      <span className="mr-1 text-[10.5px] font-bold uppercase tracking-wider text-[var(--color-ink-3)]">
        Outil
      </span>

      <ToolButton
        active={isActive("select")}
        onClick={() => setTool({ kind: "select" })}
        label="↖"
        title="Sélectionner (clic = ouvrir éditeur, drag = déplacer le bloc)"
        bg="#ffffff"
        ink="#222"
        border
      />
      <ToolButton
        active={isActive("deploy")}
        onClick={() => setTool({ kind: "deploy" })}
        label="S"
        title="Déploiement"
        bg={KIND_BG.deploy}
        ink={KIND_INK.deploy}
      />
      <ToolButton
        active={isActive("ko")}
        onClick={() => setTool({ kind: "ko" })}
        label="KO"
        title="Kick-off"
        bg={KIND_BG.ko}
        ink={KIND_INK.ko}
      />
      <div className="flex items-center gap-1 rounded-md p-0.5 ring-1 ring-[var(--color-line)] bg-white">
        <ToolButton
          active={isActive("formation")}
          onClick={() =>
            setTool({
              kind: "formation",
              headcount:
                tool.kind === "formation" ? tool.headcount : DEFAULT_HC,
            })
          }
          label="F"
          title="Formation"
          bg={KIND_BG.formation}
          ink={KIND_INK.formation}
          flat
        />
        <input
          ref={hcInputRef}
          type="number"
          min={1}
          value={tool.kind === "formation" ? tool.headcount : ""}
          onFocus={() =>
            setTool({
              kind: "formation",
              headcount:
                tool.kind === "formation" ? tool.headcount : DEFAULT_HC,
            })
          }
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n) && n > 0) setTool({ kind: "formation", headcount: n });
          }}
          placeholder="nb"
          className="w-12 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-center text-[12px] tabular-nums outline-none focus:border-[#5b9bd5] focus:bg-white"
        />
      </div>
      <div className="flex items-center gap-1 rounded-md p-0.5 ring-1 ring-[var(--color-line)] bg-white">
        <ToolButton
          active={isActive("accompagnement")}
          onClick={() =>
            setTool({
              kind: "accompagnement",
              headcount:
                tool.kind === "accompagnement" ? tool.headcount : DEFAULT_HC,
            })
          }
          label="A"
          title="Accompagnement"
          bg={KIND_BG.accompagnement}
          ink={KIND_INK.accompagnement}
          flat
        />
        <input
          type="number"
          min={1}
          value={tool.kind === "accompagnement" ? tool.headcount : ""}
          onFocus={() =>
            setTool({
              kind: "accompagnement",
              headcount:
                tool.kind === "accompagnement" ? tool.headcount : DEFAULT_HC,
            })
          }
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n) && n > 0)
              setTool({ kind: "accompagnement", headcount: n });
          }}
          placeholder="nb"
          className="w-12 rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-center text-[12px] tabular-nums outline-none focus:border-[#5b9bd5] focus:bg-white"
        />
      </div>
      <ToolButton
        active={isActive("pause")}
        onClick={() => setTool({ kind: "pause" })}
        label="—"
        title="Pause / vacances"
        bg={KIND_BG.pause}
        ink={KIND_INK.pause}
      />
      <ToolButton
        active={isActive("erase")}
        onClick={() => setTool({ kind: "erase" })}
        label={<X size={14} strokeWidth={2.4} />}
        title="Effacer la cellule"
        bg="#ffffff"
        ink="#a00"
        border
      />

      <div className="ml-auto text-[11px] text-[var(--color-ink-3)]">
        Astuce : sélectionne un outil puis <strong>clic ou drag</strong> sur les semaines pour les peindre.
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  label,
  title,
  bg,
  ink,
  border,
  flat,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
  title: string;
  bg: string;
  ink: string;
  border?: boolean;
  flat?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 min-w-[34px] items-center justify-center rounded-md px-2 text-[12.5px] font-bold transition-all ${
        active ? "ring-2 ring-[#1f4e79] ring-offset-1 scale-105" : ""
      } ${flat ? "" : "shadow-sm hover:shadow-md"} ${border ? "border border-[var(--color-line)]" : ""}`}
      style={{ background: bg, color: ink }}
    >
      {label}
    </button>
  );
}

// ============================================================
//  WeekHeader
// ============================================================
function WeekHeader({ viewStart, today }: { viewStart: Date; today: Date }) {
  return (
    <div
      className="flex border-b border-[#9a9a9a] bg-white"
      style={{ height: HEADER_H }}
    >
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold uppercase text-[#222]"
        style={{ width: COL_CLIENT_W }}
      >
        ex-outil
      </div>
      <div
        className="flex items-center justify-end border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold uppercase text-[#222]"
        style={{ width: COL_SIZE_W }}
      >
        taille
      </div>
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold uppercase text-[#222]"
        style={{ width: COL_DATE_W }}
      >
        date dépl
      </div>
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
  tool,
  onPaintStart,
  onPaintEnd,
  paintingRef,
  applyTool,
  onMove,
  onResize,
  onDelete,
  onEditHc,
}: {
  wave: DeploymentWave;
  client: Client;
  viewStart: Date;
  tool: Tool;
  onPaintStart: (waveId: string) => void;
  onPaintEnd: () => void;
  paintingRef: React.MutableRefObject<{ waveId: string } | null>;
  applyTool: (waveId: string, cellIdx: number) => void;
  onMove: (delta: number) => void;
  onResize: (newLen: number) => void;
  onDelete: () => void;
  onEditHc: (weekIndex: number) => void;
}) {
  const startIdx = weekIndexFromDate(viewStart, new Date(wave.startMonday));
  const setNote = useStore((s) => s.setWaveNote);

  // Drag du bloc entier
  const [moveDelta, setMoveDelta] = useState(0);
  const moveRef = useRef<{ startX: number } | null>(null);

  const onMovePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    moveRef.current = { startX: e.clientX };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMovePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!moveRef.current) return;
    setMoveDelta(Math.round((e.clientX - moveRef.current.startX) / CELL_W));
  };
  const onMovePointerUp = () => {
    if (!moveRef.current) return;
    if (moveDelta !== 0) onMove(moveDelta);
    moveRef.current = null;
    setMoveDelta(0);
  };

  // Resize bord droit
  const [resizeDelta, setResizeDelta] = useState(0);
  const resizeRef = useRef<{ startX: number; direction: "left" | "right" } | null>(null);

  const onResizePointerDown = (
    e: ReactPointerEvent<HTMLDivElement>,
    direction: "left" | "right",
  ) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, direction };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onResizePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current) return;
    setResizeDelta(
      Math.round((e.clientX - resizeRef.current.startX) / CELL_W),
    );
  };
  const onResizePointerUp = () => {
    if (!resizeRef.current) return;
    const { direction } = resizeRef.current;
    if (resizeDelta !== 0) {
      if (direction === "right") {
        onResize(wave.cells.length + resizeDelta);
      } else {
        // Left: extends or shrinks at the start; we move the wave + adjust length
        const newLen = wave.cells.length - resizeDelta;
        onResize(newLen);
        onMove(resizeDelta);
      }
    }
    resizeRef.current = null;
    setResizeDelta(0);
  };

  // Date de bascule (KO) pour la colonne date dépl
  const koIdx = wave.cells.findIndex((c) => c.kind === "ko");
  const deplDate = (() => {
    if (koIdx < 0) return new Date(wave.startMonday);
    const d = new Date(wave.startMonday);
    d.setDate(d.getDate() + koIdx * 7);
    return d;
  })();

  // Largeur visuelle du bloc + position avec preview du drag
  const blockLeft =
    COL_FIXED_W +
    (startIdx + (moveRef.current ? moveDelta : 0) +
      (resizeRef.current?.direction === "left" ? resizeDelta : 0)) *
      CELL_W;
  const blockWidth =
    Math.max(
      1,
      wave.cells.length +
        (resizeRef.current?.direction === "right" ? resizeDelta : 0) +
        (resizeRef.current?.direction === "left" ? -resizeDelta : 0),
    ) * CELL_W;

  const isSelect = tool.kind === "select";

  return (
    <div
      className="group relative flex border-b border-[#d0d0d0] last:border-b-0"
      style={{ height: ROW_H }}
    >
      {/* Colonne client */}
      <div
        className="flex items-center gap-1 border-r border-[#9a9a9a] bg-[#fafafa] px-2"
        style={{ width: COL_CLIENT_W }}
      >
        <span className="truncate text-[12.5px] font-medium text-[#222]">
          {client.name}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto opacity-0 group-hover:opacity-100 rounded p-0.5 text-[#a00] hover:bg-[#fee]"
          title="Supprimer la vague"
        >
          <Trash2 size={11} strokeWidth={2} />
        </button>
      </div>

      {/* Colonne taille */}
      <div
        className="flex items-center justify-end border-r border-[#9a9a9a] bg-white px-2 font-mono text-[11px] tabular-nums text-[#444]"
        style={{ width: COL_SIZE_W }}
      >
        {client.nbSalaries >= 1000
          ? `${Math.round(client.nbSalaries / 1000)}K`
          : client.nbSalaries}
      </div>

      {/* Colonne date dépl */}
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-white px-2 font-mono text-[11px] tabular-nums text-[#444]"
        style={{ width: COL_DATE_W }}
      >
        {String(deplDate.getDate()).padStart(2, "0")}/
        {String(deplDate.getMonth() + 1).padStart(2, "0")}/
        {String(deplDate.getFullYear()).slice(2)}
      </div>

      {/* Grid empty cells (background) */}
      {Array.from({ length: WEEKS_VISIBLE }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="border-r border-[#e0e0e0]"
          style={{ width: CELL_W, height: ROW_H }}
        />
      ))}

      {/* Painted cells layer */}
      <div
        className="absolute left-0 top-0 flex"
        style={{ height: ROW_H, paddingLeft: COL_FIXED_W }}
        onPointerUp={() => {
          if (paintingRef.current) {
            onPaintEnd();
          }
        }}
        onPointerLeave={() => {
          if (paintingRef.current?.waveId === wave.id) onPaintEnd();
        }}
      >
        {Array.from({ length: WEEKS_VISIBLE }).map((_, colIdx) => {
          const cellIdx = colIdx - startIdx;
          const cell =
            cellIdx >= 0 && cellIdx < wave.cells.length
              ? wave.cells[cellIdx]
              : null;
          return (
            <div
              key={colIdx}
              style={{ width: CELL_W, height: ROW_H, padding: "14px 1px 2px" }}
              onPointerDown={(e) => {
                if (isSelect) return;
                if (cellIdx < 0) return; // ne peint pas avant la vague
                onPaintStart(wave.id);
                applyTool(wave.id, cellIdx);
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              }}
              onPointerEnter={() => {
                if (paintingRef.current?.waveId === wave.id && !isSelect && cellIdx >= 0) {
                  applyTool(wave.id, cellIdx);
                }
              }}
              onDoubleClick={() => {
                if (
                  cell &&
                  (cell.kind === "formation" || cell.kind === "accompagnement")
                ) {
                  onEditHc(cellIdx);
                }
              }}
            >
              {cell && (
                <div
                  className="flex h-full w-full items-center justify-center text-[11.5px] font-semibold tabular-nums"
                  style={{
                    background: KIND_BG[cell.kind],
                    color: KIND_INK[cell.kind],
                    cursor: isSelect ? "grab" : "crosshair",
                  }}
                  title={`${KIND_LABEL[cell.kind]}${cell.headcount ? ` · ${cell.headcount}p` : ""}${cell.kind === "formation" || cell.kind === "accompagnement" ? " · double-clic pour modifier le nb" : ""}`}
                >
                  {cell.kind === "ko"
                    ? "KO"
                    : cell.kind === "deploy"
                      ? sLabel(cellIdx)
                      : cell.kind === "pause"
                        ? ""
                        : cell.headcount ?? ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Block overlay — drag handle + resize handles */}
      {isSelect && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: blockLeft,
            top: 0,
            width: blockWidth,
            height: ROW_H,
          }}
        >
          {/* Drag handle (top) */}
          <div
            className="pointer-events-auto absolute left-0 right-0 top-0 flex h-3 items-center justify-center bg-[#1f4e79]/0 hover:bg-[#1f4e79]/15 transition-colors"
            style={{
              cursor: moveRef.current ? "grabbing" : "grab",
              userSelect: "none",
            }}
            onPointerDown={onMovePointerDown}
            onPointerMove={onMovePointerMove}
            onPointerUp={onMovePointerUp}
            title="Glisser pour décaler toute la vague"
          >
            <GripHorizontal size={12} strokeWidth={2} className="text-[#1f4e79] opacity-60" />
          </div>
          {/* Resize handle left */}
          <div
            className="pointer-events-auto absolute left-0 top-3 bottom-0 w-1.5 hover:bg-[#1f4e79]/30"
            style={{ cursor: "ew-resize" }}
            onPointerDown={(e) => onResizePointerDown(e, "left")}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            title="Tirer pour rallonger / raccourcir à gauche"
          />
          {/* Resize handle right */}
          <div
            className="pointer-events-auto absolute right-0 top-3 bottom-0 w-1.5 hover:bg-[#1f4e79]/30"
            style={{ cursor: "ew-resize" }}
            onPointerDown={(e) => onResizePointerDown(e, "right")}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            title="Tirer pour rallonger / raccourcir à droite"
          />
          {/* Subtle outline */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-3 ring-2 ring-[#1f4e79]/0 group-hover:ring-[#1f4e79]/35 transition"
          />
        </div>
      )}

      {/* Note */}
      {wave.note !== undefined ? (
        <input
          defaultValue={wave.note}
          onBlur={(e) => setNote(wave.id, e.currentTarget.value)}
          placeholder="annotation"
          className="ml-2 max-w-[200px] flex-1 self-center rounded-sm border border-transparent bg-transparent px-1 text-[11px] italic text-[#666] outline-none hover:border-[#ccc] focus:border-[#5b9bd5] focus:bg-white focus:not-italic"
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
//  HeadcountModal — édite le nb d'une cellule F/A existante
// ============================================================
function HeadcountModal({
  waveId,
  weekIndex,
  onClose,
}: {
  waveId: string;
  weekIndex: number;
  onClose: () => void;
}) {
  const wave = useStore((s) => s.waves.find((w) => w.id === waveId));
  const setCell = useStore((s) => s.setWaveCell);
  const cell = wave?.cells[weekIndex];
  const [v, setV] = useState<string>(cell?.headcount?.toString() ?? "");

  if (!wave || !cell) return null;
  if (cell.kind !== "formation" && cell.kind !== "accompagnement") return null;

  const submit = () => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0) {
      setCell(waveId, weekIndex, { kind: cell.kind, headcount: n });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-md border border-[#9a9a9a] bg-white shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#9a9a9a] bg-[#f2f2f2] px-3 py-2">
          <h3 className="text-[12.5px] font-semibold">
            {cell.kind === "formation" ? "Formation" : "Accompagnement"} — semaine {weekIndex + 1}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-[#888] hover:bg-[#eee]"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
        <div className="px-3 py-3">
          <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#666]">
            Nb personnes / jour
          </label>
          <input
            type="number"
            min={1}
            value={v}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
            className="mt-1 w-full rounded-sm border border-[#9a9a9a] bg-white px-2 py-1.5 text-[13px] tabular-nums outline-none focus:border-[#5b9bd5]"
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#9a9a9a] bg-[#fafafa] px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-[#9a9a9a] bg-white px-2.5 py-1 text-[11.5px] font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-sm bg-[#5b9bd5] px-2.5 py-1 text-[11.5px] font-semibold text-white hover:bg-[#1f4e79]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 p-4">
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
