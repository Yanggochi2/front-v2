import ScheduleEmptyState from "@/components/schedule/ScheduleEmptyState";
import ScheduleNotCreated from "@/components/schedule/ScheduleNotCreated";
import ScheduleSheet from "@/components/schedule/ScheduleSheet";
import ApiOfflineBanner from "@/components/ui/ApiOfflineBanner";
import SchedulePageHeader from "@/components/ui/SchedulePageHeader";
import { getOfflineSheet, getSchedulePage } from "@/services/scheduleApi";
import type { SchedulePageData } from "@/types/schedule.type";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// 월별 보기는 /schedule?view=month 로 둔다 (router.md 참고).
export default async function SchedulePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const params = {
    // 보기·기간 없이 처음 열면 월간으로 연다. 주간 링크는 ym·week를 달고 오므로 그대로 주간이다.
    view: first(sp.view) ?? (!sp.ym && !sp.week ? "month" : undefined),
    ym: first(sp.ym),
    week: first(sp.week),
  };
  let data: SchedulePageData | null = null;
  try {
    data = await getSchedulePage(params);
  } catch {
    data = null;
  }

  if (!data) {
    // 서버에 연결하지 못해도 근무표 틀(날짜 열, 도구 모음, 버튼)은 그대로 보여 준다.
    return (
      <div className="flex h-full w-full flex-col gap-3 px-6 py-3">
        <ApiOfflineBanner retryHref="/schedule" />
        <ScheduleSheet
          key={`offline-${params.view ?? ""}-${params.ym ?? ""}-${params.week ?? ""}`}
          sheet={getOfflineSheet(params)}
        />
      </div>
    );
  }

  if (data.kind === "sheet") {
    // 확정·확정 취소·자동 생성 뒤 다시 불러오면 버전이 바뀌므로 편집 상태를 새로 시작한다.
    const { view, yearMonth, activeWeek, unassigned, api } = data.sheet;
    return (
      <div className="flex h-full w-full flex-col px-6 py-3 print:h-auto print:p-0">
        <ScheduleSheet
          key={`${view}-${yearMonth}-${activeWeek}-${unassigned}-${api.version}`}
          sheet={data.sheet}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
      <SchedulePageHeader title="근무표" subtitle={data.periodLabel} />
      {data.kind === "no-nurses" ? <ScheduleEmptyState /> : <ScheduleNotCreated yearMonth={data.yearMonth} />}
    </div>
  );
}
