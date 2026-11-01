"use client";

import type { ReactNode } from "react";

export default function RnFilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-11 shrink-0 whitespace-nowrap rounded-full border px-[18px] text-[16px] font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        selected
          ? "border-primary bg-primary-soft text-primary"
          : "border-line bg-white text-ink-sub hover:border-grid hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function RnFilterDivider() {
  return <div className="h-7 w-px shrink-0 bg-line" aria-hidden />;
}
