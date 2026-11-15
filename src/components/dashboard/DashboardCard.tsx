import type { ReactNode } from "react";

// 대시보드 그래프 한 덩어리 (제목 + 설명 + 내용)
export default function DashboardCard({
  title,
  description,
  aside,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col gap-5 rounded-[24px] border border-line bg-white p-7 shadow-card ${className}`}>
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-[21px] font-bold text-ink">{title}</h2>
          {description ? <p className="text-[16px] font-medium text-ink-mute">{description}</p> : null}
        </div>
        {aside ? <div className="ml-auto">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}
