import type { ReactNode } from "react";

export default function AdminFilterChip({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-11 shrink-0 items-center justify-center rounded-full border px-[18px] text-[16px] leading-normal font-bold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-line bg-white text-ink-sub hover:border-grid hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
