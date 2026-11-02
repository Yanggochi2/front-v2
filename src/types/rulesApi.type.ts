// docs/API.md RULE-01~07 응답/요청 모양. 명세에 없는 필드는 만들지 않는다.
export type ApiRuleSeverity = "HARD" | "SOFT";

export type ApiRule = {
  id: string;
  code: string;
  name: string;
  severity: ApiRuleSeverity;
  enabled: boolean;
  // TODO: 백엔드 확정 후 결정 (parameters 내부 모양이 명세에 없다)
  parameters: Record<string, unknown>;
  version: number;
  // TODO: 백엔드 확정 후 결정 (지울 수 없는 기본 규칙 구분 필드. 없으면 code로 판단)
  builtIn?: boolean;
};

// 규칙 추가. ⚠️ 명세에 없는 API (POST /wards/me/rules). TODO: 백엔드 확정 후 결정
export type ApiRuleCreateBody = {
  code: string;
  name: string;
  severity: ApiRuleSeverity;
  enabled: boolean;
  parameters: Record<string, unknown>;
};

// RULE-02 요청. role/병동 ID는 담지 않는다.
export type ApiRulePatchBody = {
  enabled?: boolean;
  severity?: ApiRuleSeverity;
  parameters?: Record<string, unknown>;
  reason?: string;
  version?: number; // 낙관적 잠금. 다른 사람이 먼저 고쳤으면 409
};

// RULE-02 응답: Rule + ViolationSummary[]
// TODO: 백엔드 확정 후 결정 (ViolationSummary 모양이 명세에 없다)
export type ApiRulePatchResult = { rule: ApiRule; violationSummary: unknown[] };

// RULE-04
// 백엔드 응답 기준. 병동이 등록한 날만 오고, isHoliday=false는 공휴일 해제다.
export type ApiHoliday = {
  date: string; // YYYY-MM-DD
  isHoliday: boolean;
  name: string | null;
};

// RULE-05 요청
export type ApiHolidayPutBody = { isHoliday: boolean; name?: string; reason?: string };

// RULE-06/07. 10/26 계약 4장: 자동값(autoCount)은 주말∪등록 공휴일 + 1. 수간호사가 targetCount로 고치고, null로 보내면 자동으로 돌아간다.
// 일반 간호사의 OFF 개수 기본 하드 제약이다. 그 달 근무표가 없으면 404 TARGET_NOT_FOUND, 확정본이면 고칠 때 409 SCHEDULE_CONFIRMED.
export type ApiOffTarget = {
  yearMonth: string;
  targetCount: number;
  autoCount: number;
  holidayCount: number;
  source: "AUTO" | "MANUAL";
  reason: string | null;
};
export type ApiOffTargetPatchBody = { targetCount: number | null; reason?: string | null };
