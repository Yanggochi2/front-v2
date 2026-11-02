import { apiRequest } from "@/lib/apiClient";
import { monthDates, todayKst } from "@/lib/schedulePeriod";
import { toDay } from "@/services/scheduleApi";
import type { ScheduleDay, ScheduleRow } from "@/types/schedule.type";
import type { ApiSharedSchedule, ApiSharedSort, ShareLink } from "@/types/sharingApi.type";

const scheduleShare = (scheduleId: string) => `/wards/me/schedules/${encodeURIComponent(scheduleId)}/share-link`;

// 공유 링크 만들기·다시 만들기. 확정(CONFIRMED)·지난(ARCHIVED) 근무표만 된다 (아니면 409 SCHEDULE_NOT_CONFIRMED).
// 다시 만들면 이전 링크는 바로 열리지 않는다. 비밀값을 돌려주는 요청이라 Idempotency-Key를 보내지 않는다.
export function issueShareLink(scheduleId: string): Promise<ShareLink> {
  return apiRequest<ShareLink>(scheduleShare(scheduleId), { method: "POST" });
}

// 공유 끄기. 확정을 취소해도 백엔드가 링크를 지운다.
export function revokeShareLink(scheduleId: string): Promise<void> {
  return apiRequest<void>(scheduleShare(scheduleId), { method: "DELETE" });
}

export type SharedScheduleData = {
  yearMonth: string;
  title: string;
  sort: ApiSharedSort;
  days: ScheduleDay[];
  rows: ScheduleRow[];
};

// GET /shared/schedules/{token} (로그인 없이). 링크가 바뀌었거나 꺼졌으면 404를 ApiError로 던진다.
// 공휴일 API는 수간호사 로그인이 있어야 해서 부르지 않는다. 주말만 색으로 구분한다.
export async function getSharedSchedule(token: string, sort?: ApiSharedSort): Promise<SharedScheduleData> {
  const s = await apiRequest<ApiSharedSchedule>(`/shared/schedules/${encodeURIComponent(token)}`, {
    query: { sort },
    anonymous: true,
  });
  const { yearMonth: nowYm, day } = todayKst();
  const today = `${nowYm}-${String(day).padStart(2, "0")}`;
  const dates = monthDates(s.yearMonth);
  const cells = new Map(s.cells.map((c) => [`${c.nurseId}|${c.date}`, c.dutyCode]));
  return {
    yearMonth: s.yearMonth,
    title: `${s.yearMonth.slice(0, 4)}년 ${Number(s.yearMonth.slice(5))}월 근무표`,
    sort: s.sort,
    days: dates.map((d) => toDay(d, today, new Map())),
    // 서버가 정렬한 순서 그대로 둔다
    rows: s.nurses.map((n) => ({
      nurseKey: n.id,
      name: n.name,
      role: n.role,
      dutyRole: n.dutyRole,
      cells: dates.map((d) => ({ duty: cells.get(`${n.id}|${d}`) ?? null, editable: false })),
    })),
  };
}
