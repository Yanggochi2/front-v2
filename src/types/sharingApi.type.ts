// 근무표 공유 링크 모델. 10/26 계약(백엔드 docs/client-1026-api.md 5장) 기준.
import type { ApiDutyCode, ScheduleStatus } from "./scheduleApi.type";
import type { ApiDutyRole, ApiNurseRole } from "./nursesApi.type";

// POST /wards/me/schedules/{id}/share-link. sharePath는 `/shared/<token>` 프론트 상대 경로다.
export type ShareLink = {
  shareToken: string;
  sharePath: string;
  scheduleId: string;
};

export type ApiSharedSort = "proficiency" | "name";

// GET /shared/schedules/{token}. 로그인 없이 보는 확정본. 이름·직급·근무만 온다 (경력·상태·통계 없음, AL/ED는 O로 옴).
export type ApiSharedSchedule = {
  yearMonth: string;
  status: ScheduleStatus;
  version: number;
  defaultView: "month" | "week";
  defaultSort: ApiSharedSort;
  sort: ApiSharedSort;
  /** ?q= 이름 검색어 (앞뒤 공백 제거). 11/13 계약부터 온다 */
  query?: string;
  nurses: { id: string; name: string; role: ApiNurseRole; dutyRole: ApiDutyRole }[];
  cells: { nurseId: string; date: string; dutyCode: ApiDutyCode | null; editable: boolean }[];
};
