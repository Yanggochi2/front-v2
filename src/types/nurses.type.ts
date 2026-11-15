export type NurseRole = "HEAD_NURSE" | "NURSE";
// 직급(근무 배정 역할). 프리셉터는 직급이 아니라 isPreceptor로 따로 둔다 (10/26 미팅)
export type DutyRole = "GENERAL" | "CHARGE" | "NEW" | "NIGHT_ONLY";
export type NurseStatus = "ACTIVE" | "PREGNANT" | "ON_LEAVE" | "RETIRED";
// 직종 (7차 미팅, 11/13 계약). 권한(role)·직급(dutyRole)과 따로 정한다.
export type StaffType = "NURSE" | "NURSING_ASSISTANT";

// TODO: 응답 필드는 백엔드 확정 후 결정. 일반 간호사 응답에는 숙련도·경력·상태가 없을 수 있다(서버 규칙).
export type Nurse = {
  id: string;
  name: string;
  role: NurseRole;
  /** 11/13 계약 전 응답에는 없다. 없으면 간호사로 본다 */
  staffType?: StaffType;
  /** 아래 필드는 받은 것만 표시한다 (일반 간호사 응답에는 없을 수 있음) */
  dutyRole?: DutyRole;
  isPreceptor?: boolean;
  status?: NurseStatus;
  careerYears?: number;
  careerMonths?: number;
  skill?: number;
  periodLabel?: string;
  /** 수간호사 응답에만. 로그인 계정이 연결된 간호사인지 */
  hasAccount?: boolean;
  /** 유효한 개인 초대 코드가 나가 있는지 */
  inviteActive?: boolean;
};

export type NurseDetail = Nurse & {
  joinedYear: number;
  preceptorOf: string[];
  affiliationStart: string;
  version: number;
};

// 간호사 등록 폼의 입력값. 날짜는 YYYY-MM-DD 문자열, 숫자는 입력 그대로 문자열.
export type NurseDraft = {
  name: string;
  staffType: StaffType;
  /** 입사 연도 (YYYY) */
  hireYear: string;
  dutyRole: DutyRole;
  isPreceptor: boolean;
  /** 담당 신입 간호사 id. 프리셉터일 때만 보낸다 */
  preceptorOf: string[];
  careerYears: string;
  careerMonths: string;
  skill: number;
  status: NurseStatus;
  periodStart: string;
};

/** 간호사 폼에서 검사하는 칸 (총 경력은 년·개월을 한 칸으로 본다) */
export type NurseDraftField = "name" | "hireYear" | "career" | "skill" | "periodStart";
export type NurseDraftErrors = Partial<Record<NurseDraftField, string>>;

export type NurseListResult = {
  items: Nurse[];
  activeCount: number;
};
