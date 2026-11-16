import SharedScheduleView from "@/components/shared/SharedScheduleView";
import SharedUnavailable from "@/components/shared/SharedUnavailable";
import { ApiError } from "@/lib/apiClient";
import { getSharedSchedule, type SharedScheduleData } from "@/services/sharingApi";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// 공유 링크로 보는 확정 근무표 (10/26 계약 5장).
// ?view=week|month(없으면 서버 defaultView) · ?week=N · ?sort=name(없으면 서버 기본 숙련도순)
// · ?q=이름(이름에 검색어가 들어간 사람의 줄을 진하게, 나머지는 흐리게. 11/16 미팅)
export default async function SharedSchedulePage({ params, searchParams }: PageProps<"/shared/[token]"> & { searchParams: SearchParams }) {
  const { token } = await params;
  const q = await searchParams;
  const view = one(q.view);
  let data: SharedScheduleData | null = null;
  let gone = false;
  try {
    data = await getSharedSchedule(token, {
      sort: one(q.sort) === "name" ? "name" : undefined,
      view: view === "week" || view === "month" ? view : undefined,
      week: one(q.week),
      // 같이 근무하는 사람도 보이도록 서버에는 검색어를 보내지 않고, 받은 전체 근무표에서 내 줄만 표시한다
      highlight: one(q.q)?.trim().slice(0, 100) || undefined,
    });
  } catch (e) {
    // 링크를 다시 만들었거나 공유를 껐거나 확정을 취소하면 404
    gone = e instanceof ApiError && e.status === 404;
  }
  if (!data) return <SharedUnavailable reason={gone ? "gone" : "error"} retryHref={`/shared/${token}`} />;
  return <SharedScheduleView data={data} />;
}
