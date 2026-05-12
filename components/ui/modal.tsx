"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

export function Modal({
  title,
  icon,
  onClose,
  children,
  footer,
  size = "md",
}: {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const widths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/15 p-4 animate-overlay-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${widths[size]} overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_-24px_rgba(20,17,15,0.30)]`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3">
          <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
            {icon}
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--color-ink-3)] hover:bg-[var(--color-line-2)]"
          >
            <X size={15} strokeWidth={1.8} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-line)] bg-[var(--color-line-2)]/30 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-3)]">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-[11px] text-[var(--color-ink-3)]">
          {hint}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[var(--color-ink)]/30";
