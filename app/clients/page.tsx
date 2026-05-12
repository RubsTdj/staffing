"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import type { ClientKind, ClientPipeline } from "@/lib/types";
import { Field, inputClass, Modal } from "@/components/ui/modal";
import { Building2, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PIPELINE_LABEL: Record<
  ClientPipeline,
  { label: string; tint: string }
> = {
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

const KINDS: ClientKind[] = ["SPSTI", "Autonome", "Service de santé", "Autre"];

export default function Page() {
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const activities = useStore((s) => s.activities);
  const users = useStore((s) => s.users);
  const createClient = useStore((s) => s.createClient);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        breadcrumb={["Clients"]}
        title="Clients"
        subtitle="Liste des clients · drill-in vers leurs centres et leurs activités."
        showFilters={false}
        actionLabel="Ajouter un client"
        actionIcon={<Plus size={13} strokeWidth={1.8} />}
        onAction={() => setModalOpen(true)}
      />
      <div className="px-8 py-6">
        <ul className="grid gap-3 md:grid-cols-2">
          {clients.map((c) => {
            const clientCentres = centres.filter((x) => x.clientId === c.id);
            const formateurs = clientCentres.filter((x) => x.isFormateur).length;
            const externes = clientCentres.filter((x) => x.isExterne).length;
            const acts = activities.filter((a) => a.clientId === c.id);
            const cdp = users.find((u) => u.cdpFor?.includes(c.id));
            const pl = PIPELINE_LABEL[c.pipeline];
            return (
              <li
                key={c.id}
                className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-white"
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[15px] font-semibold tracking-tight">
                      {c.name}
                    </span>
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                      {c.kind}
                    </span>
                  </div>
                  <span
                    className={`inline-flex rounded-md px-1.5 py-0.5 text-[10.5px] font-medium ${pl.tint}`}
                  >
                    {pl.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 px-4 py-3 text-[12px]">
                  <Stat label="Salariés suivis" value={`${(c.nbSalaries / 1000).toFixed(0)}k`} />
                  <Stat label="Centres" value={`${clientCentres.length}`} hint={`${formateurs} F · ${externes} ext`} />
                  <Stat
                    label="Bascule"
                    value={
                      c.dateBascule
                        ? new Date(c.dateBascule).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })
                        : "—"
                    }
                  />
                  <Stat label="Déploiement" value={`${c.nbSemainesDeploiement ?? "—"} sem.`} />
                  <Stat
                    label="Formation"
                    value={`${c.estFormateurs ?? "—"} pers.`}
                    hint={`${c.estJoursFormation ?? "—"} j-h`}
                  />
                  <Stat
                    label="Accompagnement"
                    value={`${c.estAccompagnateurs ?? "—"} pers.`}
                    hint={`${c.estJoursAccomp ?? "—"} j-h`}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-4 py-2">
                  <span className="text-[11.5px] text-[var(--color-ink-3)]">
                    {cdp ? (
                      <>
                        CDP : <span className="font-medium text-[var(--color-ink-2)]">{cdp.name}</span>
                      </>
                    ) : (
                      "Pas de CDP assigné"
                    )}{" "}
                    · {acts.length} activités
                  </span>
                  <Link
                    href={`/clients/centres`}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink-2)] hover:text-[var(--color-accent)]"
                  >
                    Centres
                    <ChevronRight size={12} strokeWidth={2} />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {modalOpen && (
        <CreateClientModal
          onClose={() => setModalOpen(false)}
          onCreate={(c) => {
            createClient(c);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function CreateClientModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: {
    name: string;
    kind: ClientKind;
    pipeline: ClientPipeline;
    dateDebut: string;
    dateFin: string;
    nbSalaries: number;
    dateBascule?: string;
    nbSemainesDeploiement?: number;
    estFormateurs?: number;
    estAccompagnateurs?: number;
    estJoursFormation?: number;
    estJoursAccomp?: number;
    confidence?: number;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ClientKind>("SPSTI");
  const [pipeline, setPipeline] = useState<ClientPipeline>("intent");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [dateBascule, setDateBascule] = useState("");
  const [nbSalaries, setNbSalaries] = useState(50000);
  const [estFormateurs, setEstFormateurs] = useState(4);
  const [estAccompagnateurs, setEstAccompagnateurs] = useState(8);
  const [nbSemainesDeploiement, setNbSemaines] = useState(18);

  const canSubmit = name && dateDebut && dateFin;

  return (
    <Modal
      title="Nouveau client"
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
                name,
                kind,
                pipeline,
                dateDebut,
                dateFin,
                nbSalaries,
                dateBascule: dateBascule || undefined,
                nbSemainesDeploiement,
                estFormateurs,
                estAccompagnateurs,
                estJoursFormation: Math.round(nbSalaries / 1000),
                estJoursAccomp: Math.round(nbSalaries / 1000),
                confidence:
                  pipeline === "signed"
                    ? 100
                    : pipeline === "verbal"
                      ? 75
                      : pipeline === "intent"
                        ? 50
                        : 25,
              })
            }
            className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer le client
          </button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nom">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex : McDonald's France"
            className={inputClass}
          />
        </Field>
        <Field label="Type">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ClientKind)}
            className={inputClass}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pipeline">
          <select
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value as ClientPipeline)}
            className={inputClass}
          >
            <option value="suspect">Suspect</option>
            <option value="intent">Ressenti</option>
            <option value="verbal">Accord de principe</option>
            <option value="signed">Signé</option>
          </select>
        </Field>
        <Field label="Nb salariés suivis">
          <input
            type="number"
            value={nbSalaries}
            onChange={(e) => setNbSalaries(parseInt(e.target.value || "0", 10))}
            className={inputClass}
          />
        </Field>
        <Field label="Date début déploiement">
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Date fin déploiement">
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Date bascule (J0)" hint="Mardi recommandé">
          <input
            type="date"
            value={dateBascule}
            onChange={(e) => setDateBascule(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Durée déploiement (semaines)">
          <input
            type="number"
            value={nbSemainesDeploiement}
            onChange={(e) =>
              setNbSemaines(parseInt(e.target.value || "0", 10))
            }
            className={inputClass}
          />
        </Field>
        <Field label="Formateurs estimés">
          <input
            type="number"
            value={estFormateurs}
            onChange={(e) =>
              setEstFormateurs(parseInt(e.target.value || "0", 10))
            }
            className={inputClass}
          />
        </Field>
        <Field label="Accompagnateurs estimés">
          <input
            type="number"
            value={estAccompagnateurs}
            onChange={(e) =>
              setEstAccompagnateurs(parseInt(e.target.value || "0", 10))
            }
            className={inputClass}
          />
        </Field>
      </div>
    </Modal>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[14px] font-semibold tabular-nums text-[var(--color-ink)]">
          {value}
        </span>
        {hint && (
          <span className="text-[11px] text-[var(--color-ink-3)]">{hint}</span>
        )}
      </div>
    </div>
  );
}
