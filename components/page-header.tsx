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
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur-sm">
      <div className="px-8 pt-5 pb-4">
        <nav className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className={
                  i === breadcrumb.length - 1
                    ? "font-medium text-[var(--color-ink-2)]"
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

        <div className="mt-1.5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[24px] font-semibold tracking-tight text-[var(--color-ink)]">
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
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-3 py-1.5 text-[12.5px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] hover:bg-[var(--color-ink-2)] transition-colors"
              >
                {actionIcon ?? <Plus size={13} strokeWidth={2} />}
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-1 border-t border-[var(--color-line-2)] px-8 py-2">
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
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-[var(--color-ink-2)] hover:bg-white hover:ring-1 hover:ring-[var(--color-line)] transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}
