// 병동 모델. 10/26 계약(백엔드 docs/client-1026-api.md 1장) 기준.

export type ApiWard = {
  id: string;
  hospitalName: string;
  wardName: string;
  requiredStaff: { D: number; E: number; N: number };
  createdAt: string;
};

// POST /workspaces. 로그인한 계정을 새 병동의 수간호사(이름·입사 연도·경력·소속 시작일)로 등록한다.
export type WorkspaceCreateRequest = {
  hospitalName: string;
  wardName: string;
  headName: string;
  joinedYear: number;
  careerMonths: number;
  affiliationStart: string; // YYYY-MM-DD
  requiredStaff: { D: number; E: number; N: number };
  rulePreset: string; // STANDARD | MINIMAL
};

export type WorkspaceCreateResponse = {
  ward: ApiWard;
  headNurseId: string;
};
