// GET /wards/me/dashboard?yearMonth=YYYY-MM (수간호사 전용). 11/13 계약(백엔드 docs/client-1113-api.md "대시보드") 기준.
import type { ApiCoverage, ApiDutyCode, ScheduleStatus } from "./scheduleApi.type";
import type { ApiNurseStatus, ApiStaffType } from "./nursesApi.type";

export type ApiDashboard = {
  yearMonth: string;
  staffComposition: { staffType: ApiStaffType; count: number }[];
  staffStatuses: { status: ApiNurseStatus; count: number }[];
  /** 그 달 근무표가 없으면 null이고, 아래 근무 통계는 빈 값으로 온다 */
  schedule: { id: string; status: ScheduleStatus; version: number } | null;
  dutyDistribution: { dutyCode: ApiDutyCode; count: number }[];
  /** 일자·듀티 칸 수 (dailyCoverage의 status별 개수) */
  coverageSummary: { under: number; met: number; over: number };
  dailyCoverage: ApiCoverage[];
  offSummary: { target: number; assigned: number; remaining: number; carried: number };
  nurseWorkloads: ApiNurseWorkload[];
};

export type ApiNurseWorkload = {
  nurseId: string;
  name: string;
  staffType: ApiStaffType;
  D: number;
  E: number;
  N: number;
  O: number;
  AL: number;
  ED: number;
  offTarget: number;
  remainingOff: number;
  offCarry: number;
};
