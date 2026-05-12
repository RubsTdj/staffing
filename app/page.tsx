import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import {
  ArrowRight,
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
  },
  {
    href: "/accompagnement/pools",
    title: "Accompagnement · Pools",
    desc: "Statuts de disponibilité par client.",
    Icon: Users,
  },
  {
    href: "/demandes/feedback",
    title: "Une idée · Un problème",
    desc: "Remonter un bug ou proposer une amélioration.",
    Icon: Inbox,
  },
];

const KPIS = [
  { label: "Missions à staffer", value: 4, hint: "7 prochains jours" },
  { label: "Couverture moyenne", value: "78%", hint: "ratio PDS" },
  { label: "Prêts au départ", value: 1, hint: "logistique validée" },
  { label: "Alertes", value: 1, hint: "annulation en attente" },
];

export default function Home() {
  return (
    <>
      <PageHeader
        breadcrumb={["Workspace", "Accueil"]}
        title="Aujourd'hui"
        subtitle="Vue d'ensemble des opérations de staffing en cours."
        showFilters={false}
      />
      <div className="space-y-8 px-8 py-6">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {KPIS.map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-[var(--color-line)] bg-white px-4 py-3"
            >
              <div className="text-[12px] font-medium text-[var(--color-ink-3)]">
                {k.label}
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[24px] font-semibold tracking-tight text-[var(--color-ink)] tabular-nums">
                  {k.value}
                </span>
                <span className="text-[11.5px] text-[var(--color-ink-3)]">
                  {k.hint}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[13px] font-semibold text-[var(--color-ink)]">
              Démarrer ici
            </h2>
            <span className="text-[11.5px] text-[var(--color-ink-3)]">
              Vues prioritaires
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex flex-col gap-3 rounded-xl border border-[var(--color-line)] bg-white p-4 transition-all hover:border-[var(--color-ink)]/15 hover:shadow-[0_4px_18px_-12px_rgba(20,17,15,0.18)]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-line-2)] text-[var(--color-ink-2)]">
                  <s.Icon size={15} strokeWidth={1.7} />
                </span>
                <div>
                  <h3 className="text-[13.5px] font-semibold text-[var(--color-ink)]">
                    {s.title}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--color-ink-3)]">
                    {s.desc}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-[var(--color-ink-2)] group-hover:text-[var(--color-accent)]">
                  Ouvrir
                  <ArrowRight
                    size={12}
                    strokeWidth={2}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
