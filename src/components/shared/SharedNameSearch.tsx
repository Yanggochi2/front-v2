import ScheduleButton from "@/components/ui/ScheduleButton";
import type { ScheduleView } from "@/types/schedule.type";
import type { ApiSharedSort } from "@/types/sharingApi.type";

type Props = {
  query: string;
  view: ScheduleView;
  week: number;
  sort: ApiSharedSort;
  /** 검색을 풀었을 때 갈 주소 (보기·주·정렬은 그대로) */
  clearHref: string;
};

// 공유 근무표에서 내 이름으로 내 근무만 찾아보는 검색창 (7차 미팅). 서버 화면이라 GET 폼으로 ?q= 를 붙이고,
// 지금 보고 있는 보기·주·정렬은 숨은 칸으로 함께 보낸다.
export default function SharedNameSearch({ query, view, week, sort, clearHref }: Props) {
  return (
    <form role="search" action="" method="get" className="flex items-center gap-2">
      <input type="hidden" name="view" value={view} />
      {view === "week" ? <input type="hidden" name="week" value={week} /> : null}
      {sort === "name" ? <input type="hidden" name="sort" value="name" /> : null}
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={100}
        aria-label="이름으로 찾기"
        placeholder="내 이름으로 찾기"
        className="h-11 w-[200px] rounded-[12px] bg-white px-4 text-[16px] font-medium text-ink outline-none ring-1 ring-line ring-inset placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
      />
      <ScheduleButton type="submit" variant="brand" size="xs">
        찾기
      </ScheduleButton>
      {query ? (
        <ScheduleButton variant="neutral" size="xs" href={clearHref}>
          전체 보기
        </ScheduleButton>
      ) : null}
    </form>
  );
}
