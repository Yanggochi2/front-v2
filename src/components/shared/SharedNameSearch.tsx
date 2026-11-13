import ScheduleButton from "@/components/ui/ScheduleButton";
import type { ApiSharedSort } from "@/types/sharingApi.type";

type Props = {
  query: string;
  sort: ApiSharedSort;
};

// 공유 근무표에서 내 이름으로 내 근무만 찾아보는 검색창 (7차 미팅). 서버 화면이라 GET 폼으로 ?q= 를 붙인다.
export default function SharedNameSearch({ query, sort }: Props) {
  return (
    <form role="search" action="" method="get" className="flex items-center gap-2 print:hidden">
      {sort === "name" ? <input type="hidden" name="sort" value="name" /> : null}
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={100}
        aria-label="이름으로 찾기"
        placeholder="내 이름으로 찾기"
        className="h-12 w-[220px] rounded-[14px] bg-surface px-4 text-[17px] font-medium text-ink outline-none ring-1 ring-line ring-inset placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
      />
      <ScheduleButton type="submit" variant="brand" size="xs">
        찾기
      </ScheduleButton>
      {query ? (
        <ScheduleButton variant="neutral" size="xs" href={sort === "name" ? "?sort=name" : "?"}>
          전체 보기
        </ScheduleButton>
      ) : null}
    </form>
  );
}
