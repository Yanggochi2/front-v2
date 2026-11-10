"use client";

import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import ScheduleLegend from "@/components/schedule/ScheduleLegend";
import ScheduleShareButtons from "@/components/schedule/ScheduleShareButtons";
import { ScheduleReadOnlyNote } from "@/components/schedule/ScheduleToolbar";
import ScheduleChip from "@/components/ui/ScheduleChip";
import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import type { SharedScheduleData } from "@/services/sharingApi";
import type { ApiSharedSort } from "@/types/sharingApi.type";
import type { ScheduleView } from "@/types/schedule.type";

const noop = () => {};

// 확정·지난 근무표만 공유된다 (그 밖의 상태는 서버가 404)
const STATUS_LABEL: Partial<Record<SharedScheduleData["status"], string>> = {
  CONFIRMED: "확정",
  ARCHIVED: "지난 근무표",
};

// 같은 공유 주소에서 보기·주·정렬만 바꾼다. 서버 기본값(숙련도순)은 주소에 싣지 않는다.
function sharedHref(view: ScheduleView, week: number, sort: ApiSharedSort) {
  const q = new URLSearchParams({ view });
  if (view === "week") q.set("week", String(week));
  if (sort === "name") q.set("sort", "name");
  return `?${q}`;
}

// 공유 링크로 보는 확정 근무표. 수간호사 근무표 화면(ScheduleSheet)과 같은 틀이지만 보기 전용이라
// 칸을 누를 수 없고, 다른 달로 옮기거나 엑셀로 저장할 수 없다 (인쇄·PDF만).
export default function SharedScheduleView({ data }: { data: SharedScheduleData }) {
  const isMonth = data.view === "month";
  const viewOptions = [
    { value: "week", label: "주간", href: sharedHref("week", data.activeWeek, data.sort) },
    { value: "month", label: "월간", href: sharedHref("month", data.activeWeek, data.sort) },
  ];
  const weekOptions = Array.from({ length: data.weekCount }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}주`,
    href: sharedHref("week", i + 1, data.sort),
  }));
  const sortOptions = [
    { value: "proficiency", label: "숙련도", href: sharedHref(data.view, data.activeWeek, "proficiency") },
    { value: "name", label: "이름", href: sharedHref(data.view, data.activeWeek, "name") },
  ];
  const status = STATUS_LABEL[data.status];

  return (
    <div className="flex h-full flex-col gap-3 px-6 py-4 print:h-auto print:p-0 print:[zoom:0.86]">
      <p className="text-[22px] font-bold tracking-[-0.02em] text-ink print:hidden">Ottugi</p>
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 rounded-[24px] border border-line bg-white px-5 pt-3.5 pb-3 shadow-card print:border-0 print:p-0 print:shadow-none">
        {/* 1줄: 제목 · 상태 · 보기 전환 / 인쇄 */}
        <div className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="px-1 text-[28px] leading-normal font-bold tracking-[-0.02em] text-ink">{data.title}</h1>
          {status ? (
            <span className="print:hidden">
              <ScheduleChip tone={data.status === "CONFIRMED" ? "brand" : "gray"}>{status}</ScheduleChip>
            </span>
          ) : null}
          <span aria-hidden className="h-7 w-px bg-line print:hidden" />
          <div className="flex items-center gap-2 print:hidden">
            <ScheduleSegmented options={viewOptions} value={data.view} ariaLabel="보기 전환" itemClassName="w-20" />
            {isMonth ? null : (
              <ScheduleSegmented options={weekOptions} value={String(data.activeWeek)} ariaLabel="주 선택" itemClassName="w-14" />
            )}
          </div>
          <div className="ml-auto">
            <ScheduleShareButtons scheduleId="" yearMonth={data.yearMonth} canExport={false} />
          </div>
        </div>
        {/* 2줄: 보기 전용 안내 · 정렬 */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[18px] bg-canvas px-2.5 py-1.5 ring-1 ring-line ring-inset print:hidden">
          <ScheduleReadOnlyNote>확정된 근무표예요. 보기만 할 수 있어요</ScheduleReadOnlyNote>
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-bold text-ink">정렬</p>
            <ScheduleSegmented options={sortOptions} value={data.sort} ariaLabel="간호사 정렬" />
          </div>
        </div>
        <div className="relative min-h-0 flex-1 print:flex-none">
          <ScheduleGrid
            view={data.view}
            days={data.days}
            rows={data.rows.map((row, index) => ({ row, index }))}
            coverage={null}
            selected={null}
            onScroll={noop}
            checkColumn={false}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1">
          <p className="text-[15px] font-medium text-ink-mute print:hidden">연차·교육은 휴무(O)로 보여요.</p>
          <div className="ml-auto">
            <ScheduleLegend isMonth={isMonth} canManage={false} shared hasToday={data.days.some((d) => d.isToday)} />
          </div>
        </div>
      </section>
    </div>
  );
}
