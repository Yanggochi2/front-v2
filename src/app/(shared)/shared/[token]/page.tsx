import SharedScheduleView from "@/components/shared/SharedScheduleView";
import SharedUnavailable from "@/components/shared/SharedUnavailable";
import { ApiError } from "@/lib/apiClient";
import { getSharedSchedule, type SharedScheduleData } from "@/services/sharingApi";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// 공유 링크로 보는 확정 근무표 (10/26 계약 5장).
// ?view=week|month(없으면 서버 defaultView) · ?week=N · ?sort=name(없으면 서버 기본 숙련도순)
// · ?q=이름(이름에 검색어가 들어간 사람만, 11/13 계약·7차 미팅)
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
      // 백엔드 검색어 최대 길이(100자)에 맞춘다
      q: one(q.q)?.trim().slice(0, 100) || undefined,
    });
  } catch (e) {
    // 링크를 다시 만들었거나 공유를 껐거나 확정을 취소하면 404
    gone = e instanceof ApiError && e.status === 404;
  }
  if (!data) return <SharedUnavailable reason={gone ? "gone" : "error"} retryHref={`/shared/${token}`} />;
  return <SharedScheduleView data={data} />;
}
