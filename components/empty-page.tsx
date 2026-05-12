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
        <div className="paper-dots rounded-xl border border-dashed border-[var(--color-line)] bg-white/40 py-20 text-center">
          <p className="font-serif-italic text-[22px] text-[var(--color-ink-2)]">
            En construction
          </p>
          <p className="mt-1 text-[12.5px] text-[var(--color-ink-3)]">
            {hint ?? "Cette vue arrive dans la prochaine itération du prototype."}
          </p>
        </div>
      </div>
    </>
  );
}
