import { ApiError, apiRequest, apiRequestBlob, apiRequestList } from "@/lib/apiClient";
import { monthDates, resolvePeriod, todayKst, weekCountOf } from "@/lib/schedulePeriod";
import type {
  ApiCellBulkPatch,
  ApiCellBulkPatchResult,
  ApiConfirmCancelRequest,
  ApiConfirmRequest,
  ApiCoverage,
  ApiSchedule,
  ApiViolation,
  ApiViolationQuery,
} from "@/types/scheduleApi.type";
import { getNurseSortInfoMap } from "./nursesApi";
import { getApprovedOffKeys } from "./requestsApi";
import { getHolidays } from "./rulesApi";
import type {
  CoverageDuty,
  CoverageStatus,
  DayTone,
  ScheduleDay,
  ScheduleIssue,
  ScheduleRow,
  ScheduleSheetData,
  SchedulePageData,
  SchedulePageParams,
} from "@/types/schedule.type";
import type { NurseRole } from "@/types/nurses.type";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const SCHEDULES = "/wards/me/schedules";

// ---- 매핑 (API -> UI 타입) ----

// holidays: 날짜 → 공휴일 이름
function toDay(date: string, today: string, holidays: Map<string, string>): ScheduleDay {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const holidayName = holidays.get(date);
  const tone: DayTone =
    holidayName !== undefined ? "holiday" : weekday === 0 ? "sun" : weekday === 6 ? "sat" : "default";
  return { date: Number(date.slice(8)), weekday: WEEKDAYS[weekday], tone, isToday: date === today, holidayName };
}

const COVERAGE_DUTIES: CoverageDuty[] = ["D", "E", "N"];

// 날짜별 근무(D/E/N) 인원. 하나라도 UNDER면 그날은 미달.
export function toCoverageStatuses(coverage: ApiCoverage[], dates: string[]): CoverageStatus[] {
  const byDate = new Map<string, ApiCoverage[]>();
  coverage.forEach((c) => byDate.set(c.date, [...(byDate.get(c.date) ?? []), c]));
  return dates.map((d) => {
    const items = byDate.get(d) ?? [];
    const counts: CoverageStatus["counts"] = {};
    items.forEach((c) => {
      if ((COVERAGE_DUTIES as string[]).includes(c.dutyCode)) {
        counts[c.dutyCode as CoverageDuty] = { actual: c.actualCount, required: c.requiredCount };
      }
    });
    return { short: items.some((c) => c.status === "UNDER"), counts };
  });
}

// 숙련 그룹이 있으면 같은 그룹끼리 붙인다. 그룹 순서는 처음 나온 순서를 따른다.
function groupRows(rows: ScheduleRow[]): ScheduleRow[] {
  if (rows.every((r) => !r.group)) return rows;
  const order: string[] = [];
  rows.forEach((r) => {
    const key = r.group ?? "";
    if (!order.includes(key)) order.push(key);
  });
  return order.flatMap((key) => rows.filter((r) => (r.group ?? "") === key));
}

// 공휴일 조회는 수간호사만 된다. 실패하거나 권한이 없으면 공휴일 없이 시트를 보여 준다.
async function getHolidayNames(yearMonth: string): Promise<Map<string, string>> {
  try {
    const list = await getHolidays(yearMonth);
    return new Map(list.filter((h) => h.isHoliday).map((h) => [h.date, h.name || "공휴일"]));
  } catch {
    return new Map();
  }
}

// HARD 위반이 걸린 칸에 표시와 메시지를 달고, 위반이 있는 행에 '확인 필요'를 단다.
export function applyViolationFlags(rows: ScheduleRow[], dates: string[], violations: ApiViolation[]): ScheduleRow[] {
  const anyByNurse = new Set(violations.map((v) => v.nurseId));
  const hardByCell = new Map<string, string[]>();
  violations
    .filter((v) => v.severity === "HARD" && v.nurseId)
    .forEach((v) => {
      const key = `${v.nurseId}|${v.date}`;
      hardByCell.set(key, [...(hardByCell.get(key) ?? []), v.message]);
    });
  return rows.map((r) => ({
    ...r,
    needsCheck: anyByNurse.has(r.nurseKey),
    cells: r.cells.map((c, i) => {
      const { flag: _flag, violations: _violations, ...rest } = c;
      void _flag;
      void _violations;
      const messages = hardByCell.get(`${r.nurseKey}|${dates[i]}`);
      return messages ? { ...rest, flag: "violation" as const, violations: messages } : rest;
    }),
  }));
}

// 확정을 막는 규칙 위반(HARD) 목록
export function toIssues(violations: ApiViolation[]): ScheduleIssue[] {
  return violations
    .filter((v) => v.severity === "HARD")
    .map((v) => ({ id: v.id, nurseKey: v.nurseId, date: v.date, message: v.message }));
}

function toSheet(
  schedule: ApiSchedule,
  violations: ApiViolation[],
  holidays: Map<string, string>,
  approvedOff: Set<string>, // "간호사id|YYYY-MM-DD"
  sortInfo: Map<string, { role?: NurseRole; careerMonths?: number | null }>,
  view: "week" | "month",
  activeWeek: number,
  manage: boolean,
): ScheduleSheetData {
  const { yearMonth: nowYm, day } = todayKst();
  const all = monthDates(schedule.yearMonth);
  const weekCount = weekCountOf(schedule.yearMonth);
  const dates = view === "month" ? all : all.slice((activeWeek - 1) * 7, activeWeek * 7);
  const today = `${nowYm}-${String(day).padStart(2, "0")}`;

  const cellMap = new Map(schedule.cells.map((c) => [`${c.nurseId}|${c.date}`, c]));
  const rows: ScheduleRow[] = groupRows(
    schedule.nurses.map((n) => ({
      nurseKey: n.id,
      name: n.name,
      group: n.skillGroup ?? undefined,
      role: sortInfo.get(n.id)?.role,
      dutyRole: n.dutyRole,
      careerMonths: n.careerMonths ?? sortInfo.get(n.id)?.careerMonths ?? undefined,
      cells: dates.map((d) => {
        const c = cellMap.get(`${n.id}|${d}`);
        // 칸이 없으면 소속 기간 밖으로 보고 편집 불가로 둔다 (추측).
        return {
          duty: c?.dutyCode ?? null,
          editable: c ? c.editable : false,
          charge: c?.isCharge || undefined,
          approvedOff: approvedOff.has(`${n.id}|${d}`) || undefined,
        };
      }),
    })),
  );

  return {
    view,
    title: sheetTitle(view, schedule.yearMonth, activeWeek, nowYm, day),
    days: dates.map((d) => toDay(d, today, holidays)),
    rows: applyViolationFlags(rows, dates, violations),
    // 수간호사는 월간에서도 그날 인원을 보며 고친다. 간호사의 월간 보기는 지금처럼 인원 행 없이 둔다.
    coverage: view === "month" && !manage ? null : toCoverageStatuses(schedule.coverage, dates),
    issues: toIssues(violations),
    selectedCell: null,
    yearMonth: schedule.yearMonth,
    activeWeek,
    weekCount,
    lastSavedLabel: "-", // TODO: 마지막 수정 시각 필드가 명세에 없다
    unassigned: schedule.cells.length > 0 && schedule.cells.every((c) => c.dutyCode === null || c.dutyCode === "AL"),
    api: {
      scheduleId: schedule.id,
      version: schedule.version,
      dates,
      editable: schedule.status === "DRAFT",
      status: schedule.status,
    },
  };
}

function sheetTitle(view: "week" | "month", yearMonth: string, week: number, nowYm: string, day: number) {
  const month = Number(yearMonth.slice(5));
  if (view === "month") return `${month}월 근무`;
  if (yearMonth === nowYm && week === Math.min(weekCountOf(yearMonth), Math.ceil(day / 7))) return "이번 주 근무";
  return `${month}월 ${week}주 근무`;
}

// ---- 조회 ----

// view는 주/월 보기 전환 값이다. 역할은 서버가 세션에서 판정한다 (AGENTS.md 6.1).
export async function getSchedulePage(params: SchedulePageParams = {}): Promise<SchedulePageData> {
  const { yearMonth, week } = resolvePeriod(params.ym, params.week);
  const periodLabel = `${yearMonth.slice(0, 4)}년 ${Number(yearMonth.slice(5))}월`;
  let schedule: ApiSchedule;
  try {
    schedule = await getScheduleByYearMonth(yearMonth);
  } catch (e) {
    // TODO: 404가 '일반 간호사에게 확정본 없음'과 '수간호사에게 근무표 미생성' 중 무엇인지 명세에 없다.
    if (e instanceof ApiError && e.status === 404) return { kind: "nurse-unpublished", periodLabel };
    throw e;
  }
  if (schedule.nurses.length === 0) return { kind: "no-nurses", periodLabel };

  let violations: ApiViolation[] = [];
  let approvedOff = new Set<string>();
  const holidaysJob = getHolidayNames(schedule.yearMonth);
  const sortInfoJob = params.manage ? getNurseSortInfoMap() : Promise.resolve(new Map<string, { role?: NurseRole; careerMonths?: number | null }>());
  if (schedule.status === "DRAFT") {
    // 위반 목록과 승인된 희망 오프는 수간호사만 받는다. 실패해도 시트는 보여 준다.
    const offJob = getApprovedOffKeys(schedule.yearMonth).catch(() => approvedOff);
    try {
      violations = (await getScheduleViolations(schedule.id, { severity: "HARD", size: 100 })).data;
    } catch {}
    approvedOff = await offJob;
  }
  const [holidays, sortInfo] = await Promise.all([holidaysJob, sortInfoJob]);
  const view = params.view === "month" ? "month" : "week";
  return { kind: "sheet", sheet: toSheet(schedule, violations, holidays, approvedOff, sortInfo, view, week, !!params.manage) };
}

// 서버에 연결하지 못했을 때 보여 줄 빈 근무표 틀. 날짜 열은 실제 오늘 날짜로 만들고 간호사 행은 없다.
export function getOfflineSheet(params: SchedulePageParams = {}): ScheduleSheetData {
  const v = params.view === "month" ? "month" : "week";
  const { yearMonth, week: activeWeek } = resolvePeriod(params.ym, params.week);
  const { yearMonth: nowYm, day } = todayKst();
  const all = monthDates(yearMonth);
  const weekCount = weekCountOf(yearMonth);
  const dates = v === "month" ? all : all.slice((activeWeek - 1) * 7, activeWeek * 7);
  const today = `${nowYm}-${String(day).padStart(2, "0")}`;
  return {
    view: v,
    title: sheetTitle(v, yearMonth, activeWeek, nowYm, day),
    days: dates.map((d) => toDay(d, today, new Map())),
    rows: [],
    coverage: null,
    issues: [],
    selectedCell: null,
    yearMonth,
    activeWeek,
    weekCount,
    lastSavedLabel: "-",
    unassigned: false,
    api: { scheduleId: "", version: 0, dates, editable: false, status: "DRAFT" },
  };
}

// SCH-01. 그 달 근무표가 이미 있으면 409 SCHEDULE_ALREADY_EXISTS, 간호사가 없으면 422 NO_ACTIVE_NURSES
export function createSchedule(yearMonth: string): Promise<ApiSchedule> {
  return apiRequest<ApiSchedule>(SCHEDULES, { method: "POST", body: { yearMonth } });
}

// SCH-02 (구성원)
export function getScheduleByYearMonth(yearMonth: string): Promise<ApiSchedule> {
  return apiRequest<ApiSchedule>(SCHEDULES, { query: { yearMonth } });
}

// SCH-03
export function getScheduleById(scheduleId: string): Promise<ApiSchedule> {
  return apiRequest<ApiSchedule>(`${SCHEDULES}/${scheduleId}`);
}

// SCH-05
export function getScheduleCoverage(scheduleId: string): Promise<ApiCoverage[]> {
  return apiRequest<ApiCoverage[]>(`${SCHEDULES}/${scheduleId}/coverage`);
}

// SCH-06 (수간호사)
export function getScheduleViolations(scheduleId: string, query: ApiViolationQuery = {}) {
  return apiRequestList<ApiViolation>(`${SCHEDULES}/${scheduleId}/violations`, { query });
}

// ---- 변경 ----

// SCH-04. 전체 성공/전체 실패. 409 VERSION_CONFLICT, 423 SCHEDULE_LOCKED, 422 PROTECTED_CELL은 ApiError로 던진다.
// AL 직접 입력은 금지라 여기서도 막는다. 잠금 토큰은 P2(잠금 기능)에서 넘긴다.
export function patchScheduleCells(scheduleId: string, body: ApiCellBulkPatch, scheduleLockToken?: string) {
  if (body.changes.some((c) => c.dutyCode === "AL")) throw new Error("AL은 직접 입력할 수 없어요.");
  return apiRequest<ApiCellBulkPatchResult>(`${SCHEDULES}/${scheduleId}/cells`, {
    method: "PATCH",
    body,
    scheduleLockToken,
  });
}

// SCH-07. 같은 확정 시도는 같은 키를 쓰도록 호출부에서 키를 만들어 넘긴다.
export function confirmSchedule(scheduleId: string, body: ApiConfirmRequest, idempotencyKey: string) {
  return apiRequest<ApiSchedule>(`${SCHEDULES}/${scheduleId}/confirm`, { method: "POST", body, idempotencyKey });
}

// SCH-08
export function cancelScheduleConfirmation(scheduleId: string, body: ApiConfirmCancelRequest) {
  return apiRequest<ApiSchedule>(`${SCHEDULES}/${scheduleId}/confirmation-cancellations`, { method: "POST", body });
}

// SCH-09. 응답 xlsx Blob (저장은 호출부)
export function exportScheduleXlsx(scheduleId: string): Promise<Blob> {
  return apiRequestBlob(`${SCHEDULES}/${scheduleId}/export.xlsx`);
}

// TODO: SCH-10~15 (가져오기, 편집 잠금)는 2순위라 아직 만들지 않는다.

