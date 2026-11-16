"use client";

import { useEffect, useMemo } from "react";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import ScheduleLegend from "@/components/schedule/ScheduleLegend";
import SharedNameSearch from "@/components/shared/SharedNameSearch";
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

// 같은 공유 주소에서 보기·주·정렬·이름 검색만 바꾼다. 서버 기본값(숙련도순)은 주소에 싣지 않는다.
function sharedHref(view: ScheduleView, week: number, sort: ApiSharedSort, name = "") {
  const q = new URLSearchParams({ view });
  if (view === "week") q.set("week", String(week));
  if (sort === "name") q.set("sort", "name");
  if (name) q.set("q", name);
  return `?${q}`;
}

// 공유 링크로 보는 확정 근무표. 수간호사 근무표 화면(ScheduleSheet)과 같은 틀이지만 보기 전용이라
// 칸을 누를 수 없고, 다른 달로 옮기거나 엑셀로 저장할 수 없다 (인쇄·PDF만).
export default function SharedScheduleView({ data }: { data: SharedScheduleData }) {
  const isMonth = data.view === "month";
  const viewOptions = [
    { value: "week", label: "주간", href: sharedHref("week", data.activeWeek, data.sort, data.query) },
    { value: "month", label: "월간", href: sharedHref("month", data.activeWeek, data.sort, data.query) },
  ];
  const weekOptions = Array.from({ length: data.weekCount }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}주`,
    href: sharedHref("week", i + 1, data.sort, data.query),
  }));
  const sortOptions = [
    { value: "proficiency", label: "숙련도", href: sharedHref(data.view, data.activeWeek, "proficiency", data.query) },
    { value: "name", label: "이름", href: sharedHref(data.view, data.activeWeek, "name", data.query) },
  ];
  const status = STATUS_LABEL[data.status];
  const searched = data.query !== "";
  const focusRows = useMemo(() => new Set(data.matched), [data.matched]);
  const noMatch = searched && focusRows.size === 0;

  // 찾은 줄이 화면 밖(주간 보기·낮은 화면)에 있으면 보이는 곳으로 옮긴다
  useEffect(() => {
    if (focusRows.size > 0) document.querySelector("[data-focus-row]")?.scrollIntoView({ block: "nearest" });
  }, [focusRows]);

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
          <div className="ml-auto flex items-center gap-3">
            <SharedNameSearch
              query={data.query}
              view={data.view}
              week={data.activeWeek}
              sort={data.sort}
              clearHref={sharedHref(data.view, data.activeWeek, data.sort)}
            />
            <ScheduleShareButtons scheduleId="" yearMonth={data.yearMonth} canExport={false} />
          </div>
        </div>
        {/* 2줄: 보기 전용 안내 · 정렬 */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[18px] bg-canvas px-2.5 py-1.5 ring-1 ring-line ring-inset print:hidden">
          {noMatch ? (
            <p role="status" className="pl-2 text-[16px] font-bold text-danger">
              ‘{data.query}’ 이름을 가진 사람이 없어요. 이름을 다시 확인해 주세요
            </p>
          ) : searched ? (
            <p role="status" className="pl-2 text-[16px] font-bold text-primary">
              ‘{data.query}’ {focusRows.size > 1 ? `${focusRows.size}명의 줄` : "줄"}을 진하게 표시했어요. 같은 날 근무하는 사람도 함께 볼 수 있어요
            </p>
          ) : (
            <ScheduleReadOnlyNote>확정된 근무표예요. 보기만 할 수 있어요</ScheduleReadOnlyNote>
          )}
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
            focusRows={focusRows}
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
