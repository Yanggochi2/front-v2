import SharedMyDutyView from "@/components/shared/SharedMyDutyView";
import SharedCodeGate from "@/components/shared/SharedCodeGate";
import SharedUnavailable from "@/components/shared/SharedUnavailable";
import { ApiError } from "@/lib/apiClient";
import { getSharedSchedule, type SharedScheduleData } from "@/services/sharingApi";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// 공유 링크로 들어온 간호사가 이름으로 내 한 달 근무만 보는 화면. ?q=이름 (이름에 검색어가 들어간 사람만)
// 데이터는 /shared/[token]과 같은 GET /shared/schedules/{token}?q= 를 쓴다.
export default async function SharedMyDutyPage({ params, searchParams }: PageProps<"/shared/[token]/me"> & { searchParams: SearchParams }) {
  const { token } = await params;
  // 백엔드 검색어 최대 길이(100자)에 맞춘다
  const name = one((await searchParams).q)?.trim().slice(0, 100) ?? "";
  let data: SharedScheduleData | null = null;
  let gone = false;
  let needsCode = false;
  try {
    data = await getSharedSchedule(token, { view: "month", q: name || undefined });
  } catch (e) {
    // 링크를 다시 만들었거나 공유를 껐거나 확정을 취소하면 404
    gone = e instanceof ApiError && e.status === 404;
    // 병동에 공유 코드가 있으면 코드를 맞혀야 볼 수 있다 (9차 미팅)
    needsCode = e instanceof ApiError && e.code === "SHARE_CODE_REQUIRED";
  }
  if (needsCode) return <SharedCodeGate token={token} />;
  if (!data) return <SharedUnavailable reason={gone ? "gone" : "error"} retryHref={`/shared/${token}/me`} />;
  return <SharedMyDutyView data={data} name={name} />;
}
