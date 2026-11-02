"use client";

import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import ScheduleLegend from "@/components/schedule/ScheduleLegend";
import ScheduleShareButtons from "@/components/schedule/ScheduleShareButtons";
import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import type { SharedScheduleData } from "@/services/sharingApi";

const noop = () => {};

// 공유 링크로 보는 확정 근무표. 보기 전용이라 칸을 누를 수 없고, 인쇄·PDF만 된다.
export default function SharedScheduleView({ data }: { data: SharedScheduleData }) {
  const sortOptions = [
    { value: "proficiency", label: "숙련도", href: "?" },
    { value: "name", label: "이름", href: "?sort=name" },
  ];
  return (
    <div className="flex h-full flex-col gap-3 px-6 py-4 print:h-auto print:p-0 print:[zoom:0.86]">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-[22px] font-bold tracking-[-0.02em] text-ink print:hidden">Ottugi</p>
        <span aria-hidden className="h-7 w-px bg-line print:hidden" />
        <h1 className="text-[28px] leading-normal font-bold tracking-[-0.02em] text-ink">{data.title}</h1>
        <div className="flex items-center gap-2 print:hidden">
          <p className="text-[16px] font-bold text-ink">정렬</p>
          <ScheduleSegmented options={sortOptions} value={data.sort} ariaLabel="간호사 정렬" />
        </div>
        <div className="ml-auto">
          <ScheduleShareButtons scheduleId="" yearMonth={data.yearMonth} canExport={false} />
        </div>
      </header>
      <section className="flex min-h-0 flex-1 flex-col gap-2.5 rounded-[24px] border border-line bg-white px-5 pt-3.5 pb-3 shadow-card print:border-0 print:p-0 print:shadow-none">
        <div className="relative min-h-0 flex-1 print:flex-none">
          <ScheduleGrid
            view="month"
            days={data.days}
            rows={data.rows.map((row, index) => ({ row, index }))}
            coverage={null}
            selected={null}
            onScroll={noop}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1">
          <p className="text-[15px] font-medium text-ink-mute print:hidden">확정된 근무표예요. 연차·교육은 휴무(O)로 보여요.</p>
          <div className="ml-auto">
            <ScheduleLegend isMonth canManage={false} shared hasToday={data.days.some((d) => d.isToday)} />
          </div>
        </div>
      </section>
    </div>
  );
}
