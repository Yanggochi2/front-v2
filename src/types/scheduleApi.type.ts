// docs/API.md 근무표·자동 생성 모델. 명세에 모양이 없는 필드는 unknown으로 두고 TODO로 남긴다.
import type { PageMeta } from "./api.type";
import type { ApiDutyRole } from "./nursesApi.type";

// ED는 교육·학회. 10/26 계약부터 연차(AL)와 함께 직접 입력하고, 자동 생성 때 항상 그대로 남는다.
export type ApiDutyCode = "D" | "E" | "N" | "O" | "AL" | "ED";
export type ScheduleStatus = "DRAFT" | "GENERATING" | "CONFIRMED" | "ARCHIVED";

export type ApiScheduleNurse = {
  id: string;
  name: string;
  // TODO: 백엔드 확정 후 결정 (숙련 그룹 필드 이름. 비즈니스 로직 10-19 기준 추가 예정)
  skillGroup?: string | null;
  // 아래와 그 밖의 Nurse 필드(숙련도·경력 등)는 역할별로 다르다. 받은 것만 표시한다.
  dutyRole?: ApiDutyRole;
  careerMonths?: number | null;
  [key: string]: unknown;
};

export type ApiScheduleCell = {
  nurseId: string;
  date: string; // YYYY-MM-DD
  dutyCode: ApiDutyCode | null;
  editable: boolean;
  // TODO: 백엔드 확정 후 결정 (날짜별 차지 지정 필드 이름. 비즈니스 로직 10-19 6장)
  isCharge?: boolean;
};

export type ApiCoverageStatus = "UNDER" | "MET" | "OVER";

export type ApiCoverage = {
  date: string;
  dutyCode: ApiDutyCode;
  actualCount: number;
  requiredCount: number;
  status: ApiCoverageStatus;
};

export type ApiViolation = {
  id: string;
  severity: "HARD" | "SOFT";
  ruleId: string;
  nurseId: string | null; // TODO: 병동 단위 위반(커버리지 등)에 null이 오는지 명세 없음
  date: string | null;
  currentValue: unknown; // TODO: 백엔드 확정 후 결정
  message: string;
};

export type ApiSchedule = {
  id: string;
  yearMonth: string; // YYYY-MM
  status: ScheduleStatus;
  version: number;
  nurses: ApiScheduleNurse[];
  cells: ApiScheduleCell[];
  coverage: ApiCoverage[];
  statistics?: ApiNurseStatistic[]; // 수간호사는 전원, 일반 간호사는 본인만
  confirmedAt: string | null;
};

// SCH-04. 소속 기간 밖 칸은 서버가 거절한다.
export type ApiCellChange = { nurseId: string; date: string; dutyCode: ApiDutyCode | null };
export type ApiCellBulkPatch = { baseVersion: number; changes: ApiCellChange[] };
export type ApiCellBulkPatchResult = {
  changedCells: ApiScheduleCell[];
  version: number;
  coverage: ApiCoverage[];
  violations: ApiViolation[];
};

export type ApiViolationQuery = {
  severity?: "HARD" | "SOFT";
  nurseId?: string;
  ruleId?: string;
  page?: number;
  size?: number;
};
export type ApiViolationList = { data: ApiViolation[]; meta: PageMeta };

// SCH-07 / SCH-08
export type ApiConfirmRequest = { acknowledgedSoftViolationIds: string[] };
export type ApiConfirmCancelRequest = { reason: string };

// GEN
export type GenerationJobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "STOPPED" | "NO_SOLUTION" | "FAILED";

export type ApiGenerationJob = {
  id: string;
  scheduleId: string;
  status: GenerationJobStatus;
  stage: unknown; // TODO: 백엔드 확정 후 결정 (단계 이름/번호 형식)
  elapsedSeconds: number;
  progress: number; // TODO: 0~1인지 0~100인지 명세 없음
  hardViolationCount: number;
  metrics: unknown; // TODO: 백엔드 확정 후 결정
  conflicts: unknown; // TODO: 백엔드 확정 후 결정
  relaxations: ApiRelaxation[]; // 해 없음(NO_SOLUTION)일 때 완화할 수 있는 규칙들
  error?: string | null; // 실패(FAILED) 사유. 명세에는 없고 백엔드 응답에 있다
};

// 자동 생성 때 그대로 둘 칸. 근무 코드 없이 칸 위치만 보낸다 (10/26 계약 4장). AL·ED는 넣지 않아도 남는다.
export type ApiFixedCell = { nurseId: string; date: string };

export type ApiGenerationStart = {
  fixedCells: ApiFixedCell[];
  maxSeconds: number;
};
export type ApiGenerationStop = { applyBestResult: boolean };
export type ApiGenerationRelaxations = { relaxationIds: string[] };
export type ApiGenerationPartialApply = { baseVersion: number };
export type ApiScheduleWithViolations = { schedule: ApiSchedule; violations: ApiViolation[] }; // GEN-05

// 근무표 응답의 간호사별 집계 (듀티 코드별 개수 + 주말·공휴일 근무)
export type ApiNurseStatistic = {
  nurseId: string;
  D: number;
  E: number;
  N: number;
  O: number;
  AL: number;
  ED?: number;
  offTarget: number | null;
  weekendWork: number;
  holidayWork: number;
};

// GEN-04 완화안. id를 relaxationIds로 보내면 그 규칙을 SOFT로 낮춰 다시 생성한다
export type ApiRelaxation = { id: string; ruleCode: string; ruleId: string; description: string };
