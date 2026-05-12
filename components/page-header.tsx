"use client";

import { ArrowUpDown, Filter, Layers, Plus } from "lucide-react";
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
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur-sm">
      <div className="px-8 pt-5 pb-3">
        <nav className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "text-[var(--color-ink-2)]"
                    : ""
                }
              >
                {b}
              </span>
              {i < breadcrumb.length - 1 && (
                <span className="text-[var(--color-line)]">/</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">
            {title}
          </h1>
          {right}
        </div>
        {subtitle && (
          <p className="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-[var(--color-ink-3)]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-8 pb-3">
        {showFilters ? (
          <div className="flex items-center gap-1">
            <FilterButton icon={<Layers size={13} strokeWidth={1.7} />}>
              Grouper
            </FilterButton>
            <FilterButton icon={<Filter size={13} strokeWidth={1.7} />}>
              Filtre
            </FilterButton>
            <FilterButton icon={<ArrowUpDown size={13} strokeWidth={1.7} />}>
              Trier
            </FilterButton>
          </div>
        ) : (
          <div />
        )}

        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[var(--color-ink-2)] transition-colors"
          >
            {actionIcon ?? <Plus size={13} strokeWidth={2} />}
            {actionLabel}
          </button>
        )}
      </div>
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
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-[var(--color-ink-2)] hover:bg-white hover:ring-1 hover:ring-[var(--color-line)] transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}
