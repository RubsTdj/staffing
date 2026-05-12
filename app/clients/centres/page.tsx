"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { Region } from "@/lib/types";
import { Field, inputClass, Modal } from "@/components/ui/modal";
import {
  Building2,
  CalendarDays,
  GraduationCap,
  MapPin,
  Pin,
  Plus,
  Users2,
} from "lucide-react";
import { useState } from "react";

const REGIONS: Region[] = [
  "IDF",
  "Bretagne",
  "PACA",
  "Nouvelle-Aquitaine",
  "Auvergne-Rhône-Alpes",
  "Hauts-de-France",
  "Grand Est",
  "Occitanie",
  "Normandie",
  "Centre-Val de Loire",
  "Pays de la Loire",
  "Bourgogne-Franche-Comté",
  "Corse",
];

const PIPELINE_LABEL = {
  signed: {
    label: "Signé",
    tint: "bg-[var(--color-tint-sage)] text-[var(--color-tint-sage-ink)]",
  },
  verbal: {
    label: "Accord de principe",
    tint: "bg-[var(--color-tint-sand)] text-[var(--color-tint-sand-ink)]",
  },
  intent: {
    label: "Ressenti",
    tint: "bg-[var(--color-tint-mist)] text-[var(--color-tint-mist-ink)]",
  },
  suspect: {
    label: "Suspect",
    tint: "bg-[var(--color-line-2)] text-[var(--color-ink-3)]",
  },
};

export default function Page() {
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const toggleF = useStore((s) => s.toggleCentreFormateur);
  const toggleE = useStore((s) => s.toggleCentreExterne);
  const createCentre = useStore((s) => s.createCentre);

  const [filter, setFilter] = useState<"all" | "formateur" | "externe">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [presetClientId, setPresetClientId] = useState<string | undefined>();

  return (
    <>
      <PageHeader
        breadcrumb={["Clients", "Centres"]}
        title="Clients & Centres"
        subtitle="Une carte par client · détails du client en haut · liste des centres en dessous. Marquer un centre comme formateur ou externe."
        showFilters={false}
        actionLabel="Ajouter un centre"
        actionIcon={<Plus size={13} strokeWidth={1.8} />}
        onAction={() => {
          setPresetClientId(undefined);
          setModalOpen(true);
        }}
        right={
          <div className="flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-white p-0.5">
            {(["all", "formateur", "externe"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-[5px] px-2 py-1 text-[12px] font-medium transition-colors ${
                  f === filter
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                }`}
              >
                {f === "all" ? "Tous" : f === "formateur" ? "Formateurs" : "Externes"}
              </button>
            ))}
          </div>
        }
      />

      <div className="space-y-4 px-8 py-6">
        {clients.map((client) => {
          const clientCentres = centres
            .filter((c) => c.clientId === client.id)
            .filter((c) =>
              filter === "all"
                ? true
                : filter === "formateur"
                  ? c.isFormateur
                  : c.isExterne,
            );
          if (clientCentres.length === 0 && filter !== "all") return null;
          const formateurs = centres.filter(
            (c) => c.clientId === client.id && c.isFormateur,
          ).length;
          const externes = centres.filter(
            (c) => c.clientId === client.id && c.isExterne,
          ).length;
          const pl = PIPELINE_LABEL[client.pipeline];
          return (
            <section
              key={client.id}
              className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white"
            >
              {/* Header client */}
              <div className="border-b border-[var(--color-line)] bg-white px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-[17px] font-semibold tracking-tight">
                      {client.name}
                    </h2>
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                      {client.kind}
                    </span>
                    <span
                      className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${pl.tint}`}
                    >
                      {pl.label}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[var(--color-ink-3)]">
                    {clientCentres.length} centres · {formateurs} formateur
                    {formateurs > 1 ? "s" : ""} · {externes} externe
                    {externes > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <Stat
                    icon={<Users2 size={11} strokeWidth={1.7} />}
                    label="Salariés suivis"
                    value={`${(client.nbSalaries / 1000).toFixed(0)}k`}
                  />
                  <Stat
                    icon={<CalendarDays size={11} strokeWidth={1.7} />}
                    label="Début"
                    value={fmtDate(client.dateDebut)}
                  />
                  <Stat
                    icon={<CalendarDays size={11} strokeWidth={1.7} />}
                    label="Bascule J0"
                    value={client.dateBascule ? fmtDate(client.dateBascule) : "—"}
                  />
                  <Stat
                    icon={<CalendarDays size={11} strokeWidth={1.7} />}
                    label="Fin"
                    value={fmtDate(client.dateFin)}
                  />
                  <Stat
                    icon={<CalendarDays size={11} strokeWidth={1.7} />}
                    label="Déploiement"
                    value={`${client.nbSemainesDeploiement ?? "—"} sem.`}
                  />
                </div>
              </div>

              {/* Liste des centres du client */}
              <ul className="divide-y divide-[var(--color-line-2)]">
                {clientCentres.length === 0 && (
                  <li className="px-5 py-6 text-center text-[12.5px] text-[var(--color-ink-3)]">
                    Aucun centre {filter !== "all" ? `(${filter})` : ""} sur ce
                    client.
                  </li>
                )}
                {clientCentres.map((centre) => (
                  <li
                    key={centre.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-line-2)] text-[var(--color-ink-2)]">
                      <Building2 size={14} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-semibold">
                        {centre.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-[11.5px] text-[var(--color-ink-3)]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} strokeWidth={1.6} />
                          {centre.address}
                        </span>
                        <span>{centre.region}</span>
                        {centre.nbSalaries != null && (
                          <span>
                            {(centre.nbSalaries / 1000).toFixed(0)}k salariés
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Toggle
                        pressed={centre.isFormateur}
                        onClick={() => toggleF(centre.id)}
                        icon={<GraduationCap size={11} strokeWidth={1.9} />}
                        label="Formateur"
                        tint="accent"
                      />
                      <Toggle
                        pressed={!!centre.isExterne}
                        onClick={() => toggleE(centre.id)}
                        icon={<Pin size={11} strokeWidth={1.9} />}
                        label="Externe"
                        tint="neutral"
                      />
                    </div>
                  </li>
                ))}
                <li className="px-5 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPresetClientId(client.id);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--color-line)] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[var(--color-ink-3)] hover:border-[var(--color-ink)]/15 hover:text-[var(--color-ink-2)]"
                  >
                    <Plus size={11} strokeWidth={2} />
                    Ajouter un centre à {client.name}
                  </button>
                </li>
              </ul>
            </section>
          );
        })}
      </div>

      {modalOpen && (
        <CreateCentreModal
          presetClientId={presetClientId}
          onClose={() => setModalOpen(false)}
          onCreate={(c) => {
            createCentre(c);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function CreateCentreModal({
  presetClientId,
  onClose,
  onCreate,
}: {
  presetClientId?: string;
  onClose: () => void;
  onCreate: (c: {
    clientId: string;
    name: string;
    address: string;
    region: Region;
    isFormateur: boolean;
    isExterne: boolean;
    nbSalaries?: number;
  }) => void;
}) {
  const clients = useStore((s) => s.clients);
  const [clientId, setClientId] = useState(presetClientId ?? "");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState<Region>("IDF");
  const [nbSalaries, setNbSalaries] = useState(20000);
  const [isFormateur, setIsFormateur] = useState(false);
  const [isExterne, setIsExterne] = useState(false);

  const canSubmit = clientId && name && address;

  return (
    <Modal
      title="Nouveau centre"
      icon={<Building2 size={14} strokeWidth={1.8} className="text-[var(--color-accent)]" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-2)]"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                clientId,
                name,
                address,
                region,
                isFormateur,
                isExterne,
                nbSalaries: nbSalaries || undefined,
              })
            }
            className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer
          </button>
        </>
      }
    >
      <Field label="Client" hint="Le centre appartient à un client.">
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className={inputClass}
          disabled={!!presetClientId}
        >
          <option value="">— Sélectionner —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nom">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : Site Rennes"
            className={inputClass}
          />
        </Field>
        <Field label="Région">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className={inputClass}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Adresse">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="ex : 12 av. de la Bouvardière, 35000 Rennes"
            className={inputClass}
          />
        </Field>
        <Field label="Nb salariés sur ce centre">
          <input
            type="number"
            value={nbSalaries}
            onChange={(e) => setNbSalaries(parseInt(e.target.value || "0", 10))}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="flex gap-2 pt-2">
        <label className="flex items-center gap-2 text-[12.5px]">
          <input
            type="checkbox"
            checked={isFormateur}
            onChange={(e) => {
              setIsFormateur(e.target.checked);
              if (e.target.checked) setIsExterne(false);
            }}
          />
          Centre formateur
        </label>
        <label className="flex items-center gap-2 text-[12.5px]">
          <input
            type="checkbox"
            checked={isExterne}
            onChange={(e) => {
              setIsExterne(e.target.checked);
              if (e.target.checked) setIsFormateur(false);
            }}
          />
          Centre externe
        </label>
      </div>
    </Modal>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-0.5 text-[13.5px] font-semibold tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
    </div>
  );
}

function Toggle({
  pressed,
  onClick,
  icon,
  label,
  tint,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tint: "accent" | "neutral";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium transition-colors ${
        pressed
          ? tint === "accent"
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]"
            : "bg-[var(--color-ink)] text-white"
          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
