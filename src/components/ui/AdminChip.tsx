import type { ReactNode } from "react";

export type AdminChipTone = "gray" | "blue" | "red";

const tones: Record<AdminChipTone, string> = {
  gray: "bg-surface text-ink-sub ring-line",
  blue: "bg-primary-soft text-primary ring-primary/20",
  red: "bg-danger-soft text-danger ring-danger/20",
};

export default function AdminChip({
  tone = "gray",
  children,
}: {
  tone?: AdminChipTone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-[5px] ring-1 ring-inset text-[15px] leading-normal font-bold whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
