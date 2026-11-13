import type { DutyRole, NurseRole, NurseStatus, StaffType } from "@/types/nurses.type";

export const NURSE_ROLE_LABEL: Record<NurseRole, string> = {
  HEAD_NURSE: "수간호사",
  NURSE: "간호사",
};

export const STAFF_TYPE_LABEL: Record<StaffType, string> = {
  NURSE: "간호사",
  NURSING_ASSISTANT: "간호조무사",
};

export const DUTY_ROLE_LABEL: Record<DutyRole, string> = {
  GENERAL: "일반",
  CHARGE: "차지",
  NEW: "신입",
  NIGHT_ONLY: "나이트 전담",
};

export const PRECEPTOR_LABEL = "프리셉터";

// 상태 값은 API 명세(ACTIVE|PREGNANT|ON_LEAVE|RETIRED). 퇴사는 등록 불가(COM-02, NUR-05로 처리).
export const NURSE_STATUS_LABEL: Record<NurseStatus, string> = {
  ACTIVE: "재직",
  PREGNANT: "임신",
  ON_LEAVE: "휴직",
  RETIRED: "퇴사",
};

export const REGISTRABLE_STATUSES: NurseStatus[] = ["ACTIVE", "PREGNANT", "ON_LEAVE"];

// 숙련도 1~5 (API 명세 NurseCreate.skillLevel)
export const SKILL_LEVELS = [1, 2, 3, 4, 5];
