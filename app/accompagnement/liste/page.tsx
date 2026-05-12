"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { ClientGroup } from "@/components/views/client-group";
import { useStore } from "@/lib/store";
import type { Modality, SubCategory } from "@/lib/types";
import { Field, inputClass, Modal } from "@/components/ui/modal";
import { Plus, Search, Users2 } from "lucide-react";

export default function Page() {
  const activities = useStore((s) => s.activities);
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const createActivity = useStore((s) => s.createActivity);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const grouped = useMemo(() => {
    const accomp = activities.filter((a) => a.type === "Accompagnement");
    const filtered = query.trim()
      ? accomp.filter((a) => {
          const client = clients.find((c) => c.id === a.clientId);
          const centre = centres.find((c) => c.id === a.centreId);
          const q = query.toLowerCase();
          return (
            client?.name.toLowerCase().includes(q) ||
            centre?.name.toLowerCase().includes(q) ||
            a.subCategory?.toLowerCase().includes(q)
          );
        })
      : accomp;

    return clients
      .map((client) => {
        const clientActs = filtered.filter((a) => a.clientId === client.id);
        if (clientActs.length === 0) return null;
        const clientCentres = centres.filter((c) => c.clientId === client.id);
        const centresWithActs = clientCentres
          .map((centre) => ({
            centre,
            activities: clientActs.filter((a) => a.centreId === centre.id),
          }))
          .filter((g) => g.activities.length > 0);
        return { client, centres: centresWithActs, count: clientActs.length };
      })
      .filter(Boolean);
  }, [activities, clients, centres, query]);

  const totalCount = grouped.reduce((sum, g) => sum + (g?.count ?? 0), 0);

  return (
    <>
      <PageHeader
        breadcrumb={["Accompagnement", "Liste"]}
        title="Missions d'accompagnement"
        subtitle={`${totalCount} missions à staffer · groupées par client puis par centre.`}
        actionLabel="Créer un accompagnement"
        actionIcon={<Plus size={13} strokeWidth={1.8} />}
        onAction={() => setModalOpen(true)}
        right={
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-2 py-1">
              <Search size={12} strokeWidth={1.8} className="text-[var(--color-ink-3)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-44 bg-transparent text-[12px] outline-none placeholder:text-[var(--color-ink-3)]"
              />
            </div>
          </div>
        }
      />

      <div className="space-y-8 px-8 py-6">
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-line)] bg-white px-6 py-12 text-center">
            <p className="text-[13.5px] font-semibold text-[var(--color-ink)]">
              Aucune mission
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--color-ink-3)]">
              {query
                ? "Aucune mission ne correspond à votre recherche."
                : "Crée le premier accompagnement avec le bouton en haut à droite."}
            </p>
          </div>
        ) : (
          grouped.map(
            (g) =>
              g && (
                <ClientGroup
                  key={g.client.id}
                  client={g.client}
                  groups={g.centres}
                />
              ),
          )
        )}
      </div>

      {modalOpen && (
        <CreateAccompagnementModal
          onClose={() => setModalOpen(false)}
          onCreate={(p) => {
            createActivity({
              type: "Accompagnement",
              subCategory: p.subCategory,
              clientId: p.clientId,
              centreId: p.centreId,
              dateStart: p.dateStart,
              dateEnd: p.dateEnd,
              modality: p.modality,
              assignments: [],
            });
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}

function CreateAccompagnementModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (p: {
    clientId: string;
    centreId: string;
    dateStart: string;
    dateEnd: string;
    subCategory: SubCategory;
    modality: Modality;
  }) => void;
}) {
  const clients = useStore((s) => s.clients);
  const centres = useStore((s) => s.centres);
  const [clientId, setClientId] = useState("");
  const [centreId, setCentreId] = useState("");
  const [date, setDate] = useState("");
  const [days, setDays] = useState(3);
  const [subCategory, setSubCategory] = useState<SubCategory>("PDS");
  const [modality, setModality] = useState<Modality>("Présentiel");

  const availableCentres = useMemo(
    () => (clientId ? centres.filter((c) => c.clientId === clientId) : []),
    [centres, clientId],
  );
  const canSubmit = clientId && centreId && date;

  return (
    <Modal
      title="Nouvel accompagnement"
      icon={<Users2 size={14} strokeWidth={1.8} className="text-[var(--color-accent)]" />}
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
            onClick={() => {
              const start = new Date(`${date}T09:00:00`);
              const end = new Date(start);
              end.setDate(end.getDate() + Math.max(0, days - 1));
              end.setHours(17, 30, 0, 0);
              onCreate({
                clientId,
                centreId,
                dateStart: start.toISOString(),
                dateEnd: end.toISOString(),
                subCategory,
                modality,
              });
            }}
            className="rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Créer
          </button>
        </>
      }
    >
      <Field label="Client" hint="Détermine les centres disponibles.">
        <select
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setCentreId("");
          }}
          className={inputClass}
        >
          <option value="">— Sélectionner —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Centre"
        hint={
          clientId
            ? `${availableCentres.length} centre(s) du client`
            : "Choisis d'abord un client."
        }
      >
        <select
          value={centreId}
          onChange={(e) => setCentreId(e.target.value)}
          disabled={!clientId}
          className={`${inputClass} disabled:opacity-50`}
        >
          <option value="">— Sélectionner —</option>
          {availableCentres.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.region}
              {c.isFormateur ? " · formateur" : ""}
              {c.isExterne ? " · externe" : ""}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Catégorie">
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value as SubCategory)}
            className={inputClass}
          >
            <option value="PDS">PDS</option>
            <option value="AM">AM</option>
            <option value="IPRP">IPRP</option>
          </select>
        </Field>
        <Field label="Modalité">
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as Modality)}
            className={inputClass}
          >
            <option value="Présentiel">Présentiel</option>
            <option value="Distanciel">Distanciel</option>
          </select>
        </Field>
        <Field label="Durée totale (jours)">
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value || "1", 10))}
            min={1}
            max={7}
            className={inputClass}
          />
        </Field>
      </div>
      <Field
        label="Date de début"
        hint="Convention : démarrer un mardi pour finir un jeudi."
      >
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </Field>
    </Modal>
  );
}
