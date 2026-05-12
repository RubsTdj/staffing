"use client";

import { PageHeader } from "@/components/page-header";
import { useStore } from "@/lib/store";
import { TICKET_PRIORITIES, TICKET_TYPES } from "@/lib/mock-data";
import type { FeedbackKind, FeedbackPriority } from "@/lib/types";
import { Paperclip, Send } from "lucide-react";
import { useRef, useState } from "react";

export default function Page() {
  const tickets = useStore((s) => s.tickets);
  const addTicket = useStore((s) => s.addTicket);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<FeedbackKind>("Idée");
  const [priority, setPriority] = useState<FeedbackPriority>("Moyenne");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<string | undefined>();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!title.trim()) return;
    addTicket({
      title,
      type,
      priority,
      description,
      attachmentName: attachment,
    });
    setTitle("");
    setDescription("");
    setAttachment(undefined);
  };

  return (
    <>
      <PageHeader
        breadcrumb={["Demandes", "Idée · Bug"]}
        title="Une idée ? Un problème ?"
        subtitle="Remonte un bug, propose une amélioration ou pose une question produit."
        showFilters={false}
      />
      <div className="grid gap-6 px-8 py-6 md:grid-cols-[1fr,360px]">
        <section className="rounded-xl border border-[var(--color-line)] bg-white p-5">
          <div className="space-y-4">
            <Field label="Titre">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex : Impossible de filtrer les centres formateurs"
                className="w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-ink)]/30"
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Type">
                <div className="flex flex-wrap gap-1">
                  {TICKET_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
                        t === type
                          ? "bg-[var(--color-ink)] text-white"
                          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Priorité">
                <div className="flex flex-wrap gap-1">
                  {TICKET_PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
                        p === priority
                          ? "bg-[var(--color-ink)] text-white"
                          : "border border-[var(--color-line)] bg-white text-[var(--color-ink-2)] hover:bg-[var(--color-line-2)]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Description détaillée">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Étapes pour reproduire, attendu vs. obtenu, contexte client…"
                className="min-h-[140px] w-full resize-none rounded-md border border-[var(--color-line)] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[var(--color-ink)]/30"
              />
            </Field>
            <Field label="Capture d'écran / document">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setAttachment(f.name);
                }}
                onClick={() => fileRef.current?.click()}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-4 py-6 text-[12.5px] transition-colors ${
                  dragOver
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]"
                    : "border-[var(--color-line)] bg-[var(--color-line-2)]/30 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]/60"
                }`}
              >
                <Paperclip size={13} strokeWidth={1.7} />
                {attachment ? (
                  <span className="font-medium text-[var(--color-ink-2)]">
                    {attachment}
                  </span>
                ) : (
                  <>Glisse un fichier ici ou clique pour parcourir</>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAttachment(f.name);
                  }}
                />
              </div>
            </Field>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={submit}
                disabled={!title.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12.5px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={12} strokeWidth={2} />
                Envoyer
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-[var(--color-line)] bg-white p-5">
          <h3 className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-3)]">
            Mes demandes
          </h3>
          {tickets.length === 0 ? (
            <p className="text-[12.5px] text-[var(--color-ink-3)]">
              Pas encore de demande envoyée.
            </p>
          ) : (
            <ul className="space-y-2">
              {tickets.map((t) => (
                <li
                  key={t.id}
                  className="rounded-md border border-[var(--color-line)] px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium">{t.title}</span>
                    <span className="rounded bg-[var(--color-line-2)] px-1 py-px text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                      {t.type}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[var(--color-ink-3)]">
                    Priorité {t.priority.toLowerCase()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-3)]">
        {label}
      </span>
      {children}
    </label>
  );
}
