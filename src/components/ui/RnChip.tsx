import type { ReactNode } from "react";

const TONE = {
  gray: "bg-surface text-ink-sub ring-line",
  brand: "bg-primary-soft text-primary ring-primary/20",
  danger: "bg-danger-soft text-danger ring-danger/20",
} as const;

export default function RnChip({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof TONE;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-[5px] ring-1 ring-inset text-[15px] font-bold ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
