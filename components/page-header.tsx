"use client";

import { ArrowUpDown, ChevronRight, Filter, Layers, Plus } from "lucide-react";
import { ReactNode } from "react";

export interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  showFilters?: boolean;
  right?: ReactNode;
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  showFilters = true,
  right,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-paper)] shadow-[0_1px_0_rgba(11,18,32,0.04)]">
      <div className="px-8 pt-5 pb-4">
        <nav className="flex items-center gap-1 text-[11.5px] text-[var(--color-ink-3)]">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "font-semibold text-[var(--color-ink)]"
                    : "hover:text-[var(--color-ink-2)]"
                }
              >
                {b}
              </span>
              {i < breadcrumb.length - 1 && (
                <ChevronRight
                  size={11}
                  strokeWidth={2}
                  className="text-[var(--color-line-3)]"
                />
              )}
            </span>
          ))}
        </nav>

        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-ink)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--color-ink-3)]">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {right}
            {actionLabel && (
              <button
                type="button"
                onClick={onAction}
                className="btn btn-primary"
              >
                {actionIcon ?? <Plus size={14} strokeWidth={2.2} />}
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-1 border-t border-[var(--color-line-2)] bg-[var(--color-surface-2)] px-8 py-2">
          <FilterButton icon={<Layers size={13} strokeWidth={1.9} />}>
            Grouper
          </FilterButton>
          <FilterButton icon={<Filter size={13} strokeWidth={1.9} />}>
            Filtre
          </FilterButton>
          <FilterButton icon={<ArrowUpDown size={13} strokeWidth={1.9} />}>
            Trier
          </FilterButton>
        </div>
      )}
    </header>
  );
}

function FilterButton({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-[12px] font-medium text-[var(--color-ink-2)] transition-colors hover:border-[var(--color-line)] hover:bg-[var(--color-surface)] hover:shadow-[0_1px_2px_rgba(11,18,32,0.06)]"
    >
      {icon}
      {children}
    </button>
  );
}
