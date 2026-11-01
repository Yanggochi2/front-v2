import type { ReactNode } from "react";

export default function AdminEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-[18px] rounded-[28px] border border-line bg-white px-10 py-[72px] shadow-card text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-primary-soft text-[40px] ring-[10px] ring-primary-soft/40 leading-normal font-bold text-primary">
        {icon}
      </div>
      <p className="max-w-[640px] text-[26px] leading-normal font-bold text-ink">{title}</p>
      <p className="max-w-[560px] text-[18px] leading-normal font-medium text-ink-sub">
        {description}
      </p>
      {action}
    </section>
  );
}
