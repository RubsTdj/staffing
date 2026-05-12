import { PageHeader } from "./page-header";

export function EmptyPage({
  breadcrumb,
  title,
  hint,
}: {
  breadcrumb: string[];
  title: string;
  hint?: string;
}) {
  return (
    <>
      <PageHeader breadcrumb={breadcrumb} title={title} showFilters={false} />
      <div className="px-8 py-10">
        <div className="rounded-xl border border-[var(--color-line)] bg-white px-6 py-12 text-center">
          <p className="text-[14px] font-semibold text-[var(--color-ink)]">
            Bientôt disponible
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--color-ink-3)]">
            {hint ?? "Cette vue arrive dans la prochaine itération."}
          </p>
        </div>
      </div>
    </>
  );
}
