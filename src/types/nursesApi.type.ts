// docs/API.md NUR-01~05 모델, 10/26 계약(백엔드 docs/client-1026-api.md 2장)으로 입사 연도·프리셉터가 바뀜.
export type ApiNurseRole = "HEAD_NURSE" | "NURSE";
// 프리셉터는 직급이 아니라 역할이라 isPreceptor로 따로 온다 (구형 PRECEPTOR 입력은 백엔드가 GENERAL + isPreceptor로 바꾼다)
export type ApiDutyRole = "CHARGE" | "NEW" | "GENERAL" | "NIGHT_ONLY";
export type ApiNurseStatus = "ACTIVE" | "PREGNANT" | "ON_LEAVE" | "RETIRED";

// TODO: 백엔드 확정 후 결정 — id 타입, 역할별로 어떤 필드가 빠지는지
export type ApiNurse = {
  id: string;
  name: string;
  role: ApiNurseRole;
  dutyRole?: ApiDutyRole;
  status?: ApiNurseStatus | null;
  joinedYear?: number | null; // 입사 연도. 입사일 원본은 백엔드만 가진다
  isPreceptor?: boolean;
  careerMonths?: number | null;
  skillLevel?: number | null;
  affiliationStart?: string;
  affiliationEnd?: string | null;
  preceptorOf?: string[] | null; // 담당 신입 간호사 id 목록
  version?: number;
  /** 수간호사 응답에만. 이 간호사 행에 로그인 계정이 연결돼 있는지 */
  hasAccount?: boolean;
  /** 수간호사 응답에만. 유효한 개인 초대 코드가 나가 있으면 만료 시각 */
  inviteExpiresAt?: string | null;
};

// NUR-01 본문. role은 보내지 않는다.
export type NurseCreate = {
  name: string;
  dutyRole: ApiDutyRole;
  status: ApiNurseStatus;
  joinedYear: number; // 1900 ~ 올해. 같은 이름·입사 연도의 재직자가 있으면 409 NURSE_ALREADY_EXISTS
  isPreceptor: boolean;
  careerMonths: number;
  skillLevel: number;
  affiliationStart: string;
  affiliationEnd?: string | null;
  /** 같은 병동의 재직 NEW 간호사만. 프리셉터가 아닌데 보내면 422 INVALID_PRECEPTOR */
  preceptorOf?: string[] | null; // 담당 신입 간호사 id 목록
};

// NUR-04 본문. role 제외. version은 낙관적 잠금 검사용으로 본문에 담는다.
export type NursePatch = Partial<NurseCreate> & { version?: number };

export type ApiNurseMutationResult = {
  nurse: ApiNurse;
  violations: unknown[];
  warnings: string[];
};

// NUR-02 쿼리
export type NurseListQuery = {
  q?: string;
  role?: ApiNurseRole;
  dutyRole?: ApiDutyRole;
  status?: ApiNurseStatus;
  includeRetired?: boolean;
  /** 예: "name,asc" */
  sort?: string;
  page?: number;
  size?: number;
};
