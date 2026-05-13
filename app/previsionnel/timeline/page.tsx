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
const WEEKS_VISIBLE = 156; // ~ 3 ans, on scroll horizontalement
const COL_CLIENT_W = 140;
const COL_EXTOOL_W = 100;
const COL_SIZE_W = 84;
const COL_FIXED_W = COL_CLIENT_W + COL_EXTOOL_W + COL_SIZE_W;
const CELL_W = 26;     // Densité Excel/Sheet
const CELL_H = 22;
const ROW_H = CELL_H + 12; // marge haut pour la bande de drag
const HEADER_H = 102;  // mois + jour + 3 zones vacances + jours fériés

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
// ============================================================
//  Vacances scolaires France (zones A / B / C) + jours fériés
// ============================================================
// Plages officielles 2025-2027 (dates de samedi début → dimanche fin)
interface DateRange { start: string; end: string }
interface VacationDef { A: DateRange[]; B: DateRange[]; C: DateRange[] }

const VACATIONS: VacationDef = {
  // Académies regroupées en zone — calendrier officiel
  A: [
    // 2025-26
    { start: "2025-10-18", end: "2025-11-02" }, // Toussaint
    { start: "2025-12-20", end: "2026-01-04" }, // Noël
    { start: "2026-02-07", end: "2026-02-22" }, // Hiver A
    { start: "2026-04-04", end: "2026-04-19" }, // Printemps A
    { start: "2026-07-04", end: "2026-08-31" }, // Été
    // 2026-27
    { start: "2026-10-17", end: "2026-11-02" }, // Toussaint
    { start: "2026-12-19", end: "2027-01-03" }, // Noël
    { start: "2027-02-06", end: "2027-02-22" }, // Hiver A
    { start: "2027-04-03", end: "2027-04-19" }, // Printemps A
  ],
  B: [
    { start: "2025-10-18", end: "2025-11-02" },
    { start: "2025-12-20", end: "2026-01-04" },
    { start: "2026-02-21", end: "2026-03-08" }, // Hiver B
    { start: "2026-04-18", end: "2026-05-03" }, // Printemps B
    { start: "2026-07-04", end: "2026-08-31" },
    { start: "2026-10-17", end: "2026-11-02" },
    { start: "2026-12-19", end: "2027-01-03" },
    { start: "2027-02-20", end: "2027-03-08" },
    { start: "2027-04-17", end: "2027-05-03" },
  ],
  C: [
    { start: "2025-10-18", end: "2025-11-02" },
    { start: "2025-12-20", end: "2026-01-04" },
    { start: "2026-02-14", end: "2026-03-01" }, // Hiver C
    { start: "2026-04-11", end: "2026-04-26" }, // Printemps C
    { start: "2026-07-04", end: "2026-08-31" },
    { start: "2026-10-17", end: "2026-11-02" },
    { start: "2026-12-19", end: "2027-01-03" },
    { start: "2027-02-13", end: "2027-03-01" },
    { start: "2027-04-10", end: "2027-04-26" },
  ],
};

function weekInRange(weekStart: Date, range: DateRange): boolean {
  const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);
  const s = new Date(range.start);
  const e = new Date(range.end);
  return weekStart <= e && weekEnd >= s;
}

function vacationZonesForWeek(weekStart: Date): { A: boolean; B: boolean; C: boolean } {
  return {
    A: VACATIONS.A.some((r) => weekInRange(weekStart, r)),
    B: VACATIONS.B.some((r) => weekInRange(weekStart, r)),
    C: VACATIONS.C.some((r) => weekInRange(weekStart, r)),
  };
}

// Jours fériés FR (calculés simplement pour 2025-2027)
const FIXED_HOLIDAYS: { md: string; label: string }[] = [
  { md: "01-01", label: "Jour de l'An" },
  { md: "05-01", label: "Fête du Travail" },
  { md: "05-08", label: "Victoire 1945" },
  { md: "07-14", label: "Fête nationale" },
  { md: "08-15", label: "Assomption" },
  { md: "11-01", label: "Toussaint" },
  { md: "11-11", label: "Armistice" },
  { md: "12-25", label: "Noël" },
];
// Lundi de Pâques + Ascension + Pentecôte (pré-calculé)
const MOVING_HOLIDAYS: { iso: string; label: string }[] = [
  { iso: "2026-04-06", label: "Lundi de Pâques" },
  { iso: "2026-05-14", label: "Ascension" },
  { iso: "2026-05-25", label: "Lundi de Pentecôte" },
  { iso: "2027-03-29", label: "Lundi de Pâques" },
  { iso: "2027-05-06", label: "Ascension" },
  { iso: "2027-05-17", label: "Lundi de Pentecôte" },
];

function holidaysInWeek(weekStart: Date): { date: Date; label: string }[] {
  const res: { date: Date; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getTime() + i * 86400000);
    const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const iso = `${d.getFullYear()}-${md}`;
    const fixed = FIXED_HOLIDAYS.find((h) => h.md === md);
    if (fixed) res.push({ date: d, label: fixed.label });
    const moving = MOVING_HOLIDAYS.find((h) => h.iso === iso);
    if (moving) res.push({ date: d, label: moving.label });
  }
  return res;
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

  // Esc → retour en mode sélection (sortie d'urgence si l'utilisateur
  // s'est trompé d'outil ou n'identifie plus le mode actif)
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && tool.kind !== "select") {
        setTool({ kind: "select" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool.kind]);

  const applyTool = (waveId: string, cellIdx: number) => {
    if (tool.kind === "select") return;
    const wave = waves.find((w) => w.id === waveId);
    const current = wave?.cells[cellIdx];

    if (tool.kind === "erase") {
      if (!current) return; // no-op si déjà vide
      setCell(waveId, cellIdx, null);
      return;
    }
    if (tool.kind === "formation" || tool.kind === "accompagnement") {
      // no-op si même kind ET même headcount → évite les écrasements involontaires
      if (
        current &&
        current.kind === tool.kind &&
        current.headcount === tool.headcount
      ) {
        return;
      }
      setCell(waveId, cellIdx, {
        kind: tool.kind,
        headcount: tool.headcount,
      });
      return;
    }
    if (current && current.kind === tool.kind) return; // no-op
    setCell(waveId, cellIdx, { kind: tool.kind });
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Prévisionnel", "Timeline déploiement"]}
        title="Timeline déploiement"
        subtitle="Choisis un outil dans la palette, peins les semaines. Glisse le bloc d'une vague pour le décaler entier. Tire les bords pour l'allonger."
        showFilters={false}
        actionLabel="Nouveau client"
        actionIcon={<Plus size={14} strokeWidth={2.2} />}
        onAction={() => setCreating(true)}
        right={
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
            <NavButton onClick={() => setOffsetWeeks((v) => v - 52)} title="−1 an">
              «
            </NavButton>
            <NavButton onClick={() => setOffsetWeeks((v) => v - 13)} title="−3 mois">
              ‹‹
            </NavButton>
            <NavButton onClick={() => setOffsetWeeks((v) => v - 4)} title="−1 mois">
              ‹
            </NavButton>
            <NavButton onClick={() => setOffsetWeeks((v) => v - 1)} title="−1 semaine">
              <ChevronLeft size={11} strokeWidth={2} />
            </NavButton>
            <button
              type="button"
              onClick={() => setOffsetWeeks(-2)}
              className={`rounded-[5px] px-2 py-1 text-[11.5px] font-medium ${
                offsetWeeks === -2
                  ? "bg-[var(--color-ink)] text-white"
                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
              }`}
            >
              Auj.
            </button>
            <NavButton onClick={() => setOffsetWeeks((v) => v + 1)} title="+1 semaine">
              <ChevronRight size={11} strokeWidth={2} />
            </NavButton>
            <NavButton onClick={() => setOffsetWeeks((v) => v + 4)} title="+1 mois">
              ›
            </NavButton>
            <NavButton onClick={() => setOffsetWeeks((v) => v + 13)} title="+3 mois">
              ››
            </NavButton>
            <NavButton onClick={() => setOffsetWeeks((v) => v + 52)} title="+1 an">
              »
            </NavButton>
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
                  Crée le premier avec « Nouveau client » en haut à droite.
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
        <CreateWaveModal clients={clients} onClose={() => setCreating(false)} />
      )}
    </>
  );
}

// ============================================================
//  NavButton — bouton compact de navigation temporelle
// ============================================================
function NavButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-[5px] px-1.5 py-1 text-[11px] font-mono font-semibold leading-none text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
    >
      {children}
    </button>
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

      {/* Bandeau MODE ACTIF — bien visible pour éviter les fausses manips */}
      {tool.kind !== "select" ? (
        <div
          className="ml-auto flex items-center gap-2 rounded-md px-2.5 py-1 text-[11.5px] font-semibold"
          style={{
            background: KIND_BG[tool.kind === "erase" ? "pause" : tool.kind],
            color: KIND_INK[tool.kind === "erase" ? "pause" : tool.kind],
          }}
        >
          <span>
            Mode actif :{" "}
            {tool.kind === "deploy" && "Déploiement"}
            {tool.kind === "ko" && "Kick-off"}
            {tool.kind === "formation" && `Formation · ${tool.headcount} p/j`}
            {tool.kind === "accompagnement" &&
              `Accompagnement · ${tool.headcount} p/j`}
            {tool.kind === "pause" && "Pause"}
            {tool.kind === "erase" && "Effacement"}
          </span>
          <button
            type="button"
            onClick={() => setTool({ kind: "select" })}
            className="rounded-sm border border-current/40 bg-white/20 px-1.5 py-px text-[10.5px] font-bold hover:bg-white/40"
            title="Quitter le mode (raccourci : Échap)"
          >
            ESC ✕
          </button>
        </div>
      ) : (
        <div className="ml-auto text-[11px] text-[var(--color-ink-3)]">
          Astuce : clique un outil puis <strong>clic ou drag</strong> sur les
          semaines. <kbd className="rounded border border-[#ccc] bg-white px-1">Échap</kbd> pour quitter le mode.
        </div>
      )}
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
  // Pré-calcul des semaines avec leur métadonnées vacances/fériés
  const weeks = Array.from({ length: WEEKS_VISIBLE }).map((_, i) => {
    const wk = new Date(viewStart.getTime() + i * WEEK_MS);
    return {
      date: wk,
      zones: vacationZonesForWeek(wk),
      holidays: holidaysInWeek(wk),
      isCurrent: wk <= today && today < new Date(wk.getTime() + WEEK_MS),
      isFirstOfMonth: wk.getDate() <= 7,
    };
  });

  // Pré-calcul des bandes "Mois" pour montrer le mois en bandeau sur plusieurs cellules
  const monthBands: { startIdx: number; span: number; label: string; year: number }[] = [];
  weeks.forEach((w, i) => {
    const last = monthBands[monthBands.length - 1];
    const monthKey = `${w.date.getFullYear()}-${w.date.getMonth()}`;
    const lastKey = last ? `${last.year}-${new Date(weeks[last.startIdx].date).getMonth()}` : null;
    if (lastKey === monthKey) {
      last.span += 1;
    } else {
      monthBands.push({
        startIdx: i,
        span: 1,
        label: w.date.toLocaleDateString("fr-FR", { month: "short" }),
        year: w.date.getFullYear(),
      });
    }
  });

  return (
    <div className="sticky top-0 z-20 border-b border-[#9a9a9a] bg-white">
      {/* Ligne 0 — bandeau Mois Année (tout au-dessus, large) */}
      <div className="flex" style={{ height: 22 }}>
        <div
          className="flex items-center border-r border-[#9a9a9a] bg-[#e8e8e8] px-2 text-[10px] font-bold uppercase tracking-wider text-[#222]"
          style={{ width: COL_FIXED_W }}
        >
          Période
        </div>
        {monthBands.map((b, i) => (
          <div
            key={i}
            className={`flex items-center justify-center border-r border-[#9a9a9a] text-[10.5px] font-bold uppercase tracking-wider ${
              i % 2 === 0 ? "bg-[#eaeaea] text-[#222]" : "bg-[#f2f2f2] text-[#333]"
            }`}
            style={{ width: b.span * CELL_W }}
          >
            {b.label} {b.year !== weeks[0].date.getFullYear() || i === 0 ? `'${String(b.year).slice(2)}` : ""}
          </div>
        ))}
      </div>

      {/* Ligne 1 — labels colonnes + JOUR du lundi */}
      <div className="flex" style={{ height: 32 }}>
        <div
          className="flex items-center border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold uppercase text-[#222]"
          style={{ width: COL_CLIENT_W }}
        >
          Client
        </div>
        <div
          className="flex items-center border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold uppercase text-[#222]"
          style={{ width: COL_EXTOOL_W }}
        >
          Outil utilisé
        </div>
        <div
          className="flex items-center justify-end border-r border-[#9a9a9a] bg-[#f2f2f2] px-2 text-[11px] font-bold uppercase text-[#222]"
          style={{ width: COL_SIZE_W }}
          title="Nombre de salariés suivis chez ce client"
        >
          Nb salariés
        </div>
        {weeks.map((w, i) => (
          <div
            key={i}
            className={`flex items-center justify-center border-r border-[#9a9a9a] text-[10.5px] font-bold tabular-nums ${
              w.isCurrent
                ? "bg-[#fff2cc] text-[#7f6000]"
                : "bg-[#f2f2f2] text-[#222]"
            }`}
            style={{ width: CELL_W }}
            title={w.date.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          >
            {String(w.date.getDate()).padStart(2, "0")}
          </div>
        ))}
      </div>

      {/* Ligne 2 — zones de vacances A/B/C (3 mini-bandes) */}
      <div className="flex" style={{ height: 24 }}>
        <div
          className="flex items-center justify-end border-r border-[#9a9a9a] bg-[#f9f9f9] px-2 text-[10px] font-semibold uppercase tracking-wider text-[#666]"
          style={{ width: COL_FIXED_W }}
          title="Vacances scolaires par zone (calendrier officiel)"
        >
          Vac. zones
        </div>
        <div className="flex flex-col" style={{ flex: 1 }}>
          {(["A", "B", "C"] as const).map((zone) => (
            <div
              key={zone}
              className="flex"
              style={{ height: 8 }}
            >
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center border-r border-[#e5e5e5]"
                  style={{
                    width: CELL_W,
                    background: w.zones[zone]
                      ? zone === "A"
                        ? "#c00000"
                        : zone === "B"
                          ? "#ed7d31"
                          : "#7030a0"
                      : "transparent",
                  }}
                  title={w.zones[zone] ? `Vacances zone ${zone}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Ligne 3 — jours fériés (point + tooltip) */}
      <div className="flex" style={{ height: 24 }}>
        <div
          className="flex items-center justify-end border-r border-[#9a9a9a] bg-[#f9f9f9] px-2 text-[10px] font-semibold uppercase tracking-wider text-[#666]"
          style={{ width: COL_FIXED_W }}
        >
          Jours fériés
        </div>
        {weeks.map((w, i) => (
          <div
            key={i}
            className={`relative flex items-center justify-center border-r border-[#e5e5e5] ${
              w.holidays.length ? "bg-[#fde7e9]" : "bg-white"
            }`}
            style={{ width: CELL_W }}
            title={
              w.holidays.length
                ? w.holidays
                    .map(
                      (h) =>
                        `${String(h.date.getDate()).padStart(2, "0")}/${String(h.date.getMonth() + 1).padStart(2, "0")} — ${h.label}`,
                    )
                    .join("\n")
                : undefined
            }
          >
            {w.holidays.length > 0 && (
              <span className="inline-block h-2 w-2 rounded-full bg-[#c00000]" />
            )}
          </div>
        ))}
      </div>
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
      {/* Colonne Client */}
      <div
        className="flex items-center gap-1 border-r border-[#9a9a9a] bg-[#fafafa] px-2"
        style={{ width: COL_CLIENT_W }}
      >
        <span className="truncate text-[12px] font-medium text-[#222]">
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

      {/* Colonne Outil utilisé (que le client utilise aujourd'hui et qu'on remplace) */}
      <div
        className="flex items-center border-r border-[#9a9a9a] bg-white px-2 text-[11.5px] italic text-[#666]"
        style={{ width: COL_EXTOOL_W }}
        title="Outil actuellement utilisé par le client (qu'on remplace par le nôtre)"
      >
        <span className="truncate">{client.exTool ?? "—"}</span>
      </div>

      {/* Colonne Nb salariés suivis (date dépl en hint via title) */}
      <div
        className="flex items-center justify-end border-r border-[#9a9a9a] bg-white px-2 font-mono text-[11px] tabular-nums text-[#333]"
        style={{ width: COL_SIZE_W }}
        title={`Bascule (J0) : ${String(deplDate.getDate()).padStart(2, "0")}/${String(deplDate.getMonth() + 1).padStart(2, "0")}/${String(deplDate.getFullYear()).slice(2)}`}
      >
        {client.nbSalaries.toLocaleString("fr-FR")}
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
//  CreateWaveModal — wizard auto-rempli (mâche le travail)
// ============================================================
// L'utilisatrice répond à 5 questions simples ; on génère le pattern
// (pré-déploiement / KO / formation / accompagnement) tout seul.

// Ordre temporel d'un projet client (validé par utilisateur) :
//   KO → S1 → S2 → … → S(deployWeeks) → F × formationWeeks → A × accompWeeks
// Le projet démarre PAR le kick-off, pas avant.
interface WizardParams {
  deployWeeks: number;       // semaines de déploiement APRÈS le KO (S1, S2, …)
  formationWeeks: number;    // semaines de formation à la fin du déploiement
  formationHc: number;       // nb personnes / jour pendant la formation
  accompWeeks: number;       // semaines d'accompagnement à la toute fin
  accompHc: number;          // nb personnes / jour pendant l'accompagnement
}

const PRESETS: Record<string, { label: string; hint: string; params: WizardParams }> = {
  small: {
    label: "Petit déploiement",
    hint: "~ 8 semaines · pour un client de quelques centaines de salariés",
    params: { deployWeeks: 2, formationWeeks: 2, formationHc: 6, accompWeeks: 3, accompHc: 8 },
  },
  medium: {
    label: "Déploiement moyen",
    hint: "~ 16 semaines · entre 10K et 100K salariés",
    params: { deployWeeks: 5, formationWeeks: 3, formationHc: 8, accompWeeks: 7, accompHc: 12 },
  },
  big: {
    label: "Grand déploiement",
    hint: "~ 26 semaines · plus de 100K salariés, plusieurs vagues d'accomp",
    params: { deployWeeks: 8, formationWeeks: 4, formationHc: 10, accompWeeks: 13, accompHc: 18 },
  },
};

function buildCells(p: WizardParams): WaveCell[] {
  // Ordre temporel : KO puis déploiement puis formation puis accompagnement
  const cells: WaveCell[] = [{ kind: "ko" }];
  for (let i = 0; i < p.deployWeeks; i++) cells.push({ kind: "deploy" });
  for (let i = 0; i < p.formationWeeks; i++) {
    cells.push({ kind: "formation", headcount: p.formationHc });
  }
  for (let i = 0; i < p.accompWeeks; i++) {
    cells.push({ kind: "accompagnement", headcount: p.accompHc });
  }
  return cells;
}

function CreateWaveModal({
  clients,
  onClose,
}: {
  clients: Client[];
  onClose: () => void;
}) {
  const createWaveWithCells = useStore((s) => s.createWaveWithCells);

  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  // Date KO (J0 de la bascule) — bcp plus intuitif que "premier lundi"
  const [koDate, setKoDate] = useState(() => {
    const d = startOfWeekMonday(new Date("2026-05-12"));
    d.setDate(d.getDate() + 7 * 4); // ~ 1 mois plus tard par défaut
    return isoDate(d);
  });

  const [presetKey, setPresetKey] = useState<keyof typeof PRESETS>("medium");
  const [params, setParams] = useState<WizardParams>(PRESETS.medium.params);

  const applyPreset = (key: keyof typeof PRESETS) => {
    setPresetKey(key);
    setParams(PRESETS[key].params);
  };

  // Le projet démarre PAR le KO → startMonday = lundi du KO
  const startMonday = useMemo(() => {
    const d = startOfWeekMonday(new Date(koDate));
    return isoDate(d);
  }, [koDate]);

  const cells = useMemo(() => buildCells(params), [params]);
  const totalWeeks = cells.length;

  const submit = () => {
    if (!clientId || !koDate) return;
    createWaveWithCells(clientId, startMonday, cells);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-md border border-[#9a9a9a] bg-white shadow-[var(--shadow-pop)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#9a9a9a] bg-[#f2f2f2] px-4 py-2">
          <h3 className="text-[14px] font-semibold">Nouveau client — feuille de route</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-[#888] hover:bg-[#eee]"
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          {/* Colonne 1 : client + date KO + preset */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                1. Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 w-full rounded-sm border border-[#9a9a9a] bg-white px-2 py-1.5 text-[13px] outline-none focus:border-[#5b9bd5]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({Math.round(c.nbSalaries / 1000)}K)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                2. Date du kick-off
              </label>
              <input
                type="date"
                value={koDate}
                onChange={(e) => setKoDate(e.target.value)}
                className="mt-1 w-full rounded-sm border border-[#9a9a9a] bg-white px-2 py-1.5 text-[13px] outline-none focus:border-[#5b9bd5]"
              />
              <p className="mt-1 text-[10.5px] text-[#666]">
                Lundi du KO. Le projet démarre par cette semaine, puis les
                semaines S1, S2… se succèdent.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                3. Taille du déploiement
              </label>
              <div className="mt-1 grid grid-cols-1 gap-1">
                {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => applyPreset(k)}
                    className={`rounded-sm border px-2 py-1.5 text-left ${
                      presetKey === k
                        ? "border-[#1f4e79] bg-[#eaf2fb]"
                        : "border-[#ccc] bg-white hover:bg-[#f6f6f6]"
                    }`}
                  >
                    <div className="text-[12.5px] font-semibold text-[#222]">
                      {PRESETS[k].label}
                    </div>
                    <div className="text-[10.5px] text-[#666]">
                      {PRESETS[k].hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne 2 : ajustements fins + preview */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                4. Affine si besoin
              </label>
              <div className="mt-1 space-y-1.5 rounded-sm border border-[#ccc] bg-[#fafafa] p-2">
                <ParamRow
                  label="Déploiement après KO"
                  value={params.deployWeeks}
                  unit="sem"
                  onChange={(v) => setParams({ ...params, deployWeeks: v })}
                />
                <ParamRow
                  label="Formation"
                  value={params.formationWeeks}
                  unit="sem"
                  onChange={(v) => setParams({ ...params, formationWeeks: v })}
                />
                <ParamRow
                  label="Nb pers. formation"
                  value={params.formationHc}
                  unit="p/j"
                  onChange={(v) => setParams({ ...params, formationHc: v })}
                />
                <ParamRow
                  label="Accompagnement"
                  value={params.accompWeeks}
                  unit="sem"
                  onChange={(v) => setParams({ ...params, accompWeeks: v })}
                />
                <ParamRow
                  label="Nb pers. accomp."
                  value={params.accompHc}
                  unit="p/j"
                  onChange={(v) => setParams({ ...params, accompHc: v })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#444]">
                5. Aperçu ({totalWeeks} semaines)
              </label>
              <div className="mt-1 flex flex-wrap gap-px rounded-sm border border-[#ccc] bg-white p-1">
                {cells.map((cell, i) => (
                  <span
                    key={i}
                    className="flex h-7 min-w-[28px] items-center justify-center px-1 text-[10.5px] font-bold tabular-nums"
                    style={{
                      background: KIND_BG[cell.kind],
                      color: KIND_INK[cell.kind],
                    }}
                    title={KIND_LABEL[cell.kind]}
                  >
                    {cell.kind === "ko"
                      ? "KO"
                      : cell.kind === "deploy"
                        ? `S${String(i + 1).padStart(2, "0")}`
                        : cell.headcount}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-[10.5px] text-[#666]">
                Tu pourras encore ajuster cellule par cellule après création.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#9a9a9a] bg-[#fafafa] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-[#9a9a9a] bg-white px-3 py-1.5 text-[12px] font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!clientId || !koDate}
            onClick={submit}
            className="rounded-sm bg-[#1f4e79] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0f2e4f] disabled:opacity-40"
          >
            Créer la vague
          </button>
        </div>
      </div>
    </div>
  );
}

function ParamRow({
  label,
  value,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-[12px] text-[#333]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-6 w-6 rounded-sm border border-[#ccc] bg-white text-[11px] font-bold hover:bg-[#eaf2fb]"
      >
        −
      </button>
      <span className="w-9 text-center text-[12.5px] font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-6 w-6 rounded-sm border border-[#ccc] bg-white text-[11px] font-bold hover:bg-[#eaf2fb]"
      >
        +
      </button>
      <span className="w-9 text-[10.5px] text-[#666]">{unit}</span>
    </div>
  );
}
