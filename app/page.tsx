import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  ArrowRight,
  CheckCheck,
  ClipboardList,
  Inbox,
  Users,
} from "lucide-react";

const SHORTCUTS = [
  {
    href: "/accompagnement/liste",
    title: "Accompagnement · Liste",
    desc: "Staffer les missions terrain par client et par centre.",
    Icon: ClipboardList,
    eyebrow: "MVP",
  },
  {
    href: "/accompagnement/pools",
    title: "Accompagnement · Pools",
    desc: "Voir les pools de disponibilité par client.",
    Icon: Users,
    eyebrow: "MVP",
  },
  {
    href: "/demandes/feedback",
    title: "Une idée · Un problème",
    desc: "Remonter un bug ou proposer une amélioration.",
    Icon: Inbox,
    eyebrow: "MVP",
  },
];

const KPIS = [
  { label: "Missions à staffer", value: 4, hint: "cette semaine" },
  { label: "Couverture moyenne", value: "78%", hint: "ratio PDS" },
  { label: "Prêts au départ", value: 1, hint: "logistique OK" },
  { label: "Alertes annulation", value: 1, hint: "à traiter" },
];

export default function Home() {
  return (
    <>
      <PageHeader
        breadcrumb={["Workspace", "Accueil"]}
        title="Bonjour Camille,"
        serifTitle="voici votre semaine."
        subtitle="Vue d'ensemble des opérations de staffing en cours. Tout est mocké côté client pour ce prototype."
        showFilters={false}
      />
      <div className="space-y-10 px-8 py-8">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-[var(--color-line)] bg-white px-4 py-3.5"
            >
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
                {k.label}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[28px] font-medium tracking-tight text-[var(--color-ink)]">
                  {k.value}
                </span>
                <span className="text-[11px] text-[var(--color-ink-3)]">
                  {k.hint}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium tracking-tight">
              Démarrer ici
            </h2>
            <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-3)]">
              Vues prioritaires
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group relative flex flex-col gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4 transition-all hover:border-[var(--color-ink)]/15 hover:shadow-[0_10px_30px_-20px_rgba(20,17,15,0.18)]"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent-2)]">
                    <s.Icon size={15} strokeWidth={1.6} />
                  </span>
                  <span className="rounded-full bg-[var(--color-ink)] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em] text-white">
                    {s.eyebrow}
                  </span>
                </div>
                <div>
                  <h3 className="text-[14px] font-medium tracking-tight text-[var(--color-ink)]">
                    {s.title}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-ink-3)]">
                    {s.desc}
                  </p>
                </div>
                <span className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-[var(--color-ink-2)] group-hover:text-[var(--color-accent)]">
                  Ouvrir
                  <ArrowRight
                    size={12}
                    strokeWidth={1.8}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-8">
          <div className="flex items-start gap-3">
            <CheckCheck
              size={16}
              strokeWidth={1.8}
              className="mt-1 text-[var(--color-accent)]"
            />
            <div>
              <h3 className="text-[14px] font-medium tracking-tight">
                Le workspace, pas un dashboard.
              </h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--color-ink-2)]">
                Popsgo est pensé comme un{" "}
                <em className="font-serif-italic text-[var(--color-accent)]">
                  operating workspace
                </em>{" "}
                : chaque mission a un état lisible, un workflow explicite, et
                un seul endroit où agir. Pas de chiffres pour le chiffre, pas
                d'écrans qui mentent.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
