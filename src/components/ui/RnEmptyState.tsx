import type { ReactNode } from "react";

export default function RnEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-[18px] rounded-[28px] border border-line bg-white px-10 py-[72px] shadow-card">
      <div
        aria-hidden
        className="flex size-24 items-center justify-center rounded-full bg-primary-soft text-[40px] ring-[10px] ring-primary-soft/40 font-bold text-primary"
      >
        {icon}
      </div>
      <h2 className="max-w-[640px] text-center text-[26px] font-bold text-ink">{title}</h2>
      <p className="max-w-[560px] text-center text-[18px] font-medium text-ink-sub">
        {description}
      </p>
      <div className="flex justify-center">{action}</div>
    </section>
  );
}
