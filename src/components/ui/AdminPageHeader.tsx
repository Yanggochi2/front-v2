import type { ReactNode } from "react";

export default function AdminPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex w-full flex-wrap items-end gap-4 border-b border-line pb-6">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h1 className="flex items-center gap-3 text-[30px] leading-normal font-bold tracking-[-0.02em] text-ink">
          <span aria-hidden className="h-7 w-1.5 shrink-0 rounded-full bg-primary" />
          {title}
        </h1>
        {subtitle ? (
          <p className="pl-[18px] text-[18px] leading-normal font-medium text-ink-sub">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
