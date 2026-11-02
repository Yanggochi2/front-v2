// 병동·관리 링크 모델. 10/26 계약(백엔드 docs/client-1026-api.md 1장) 기준.

export type ApiWard = {
  id: string;
  hospitalName: string;
  wardName: string;
  requiredStaff: { D: number; E: number; N: number };
  createdAt: string;
};

// POST /workspaces. 로그인 없이 새 병동과 수간호사(이름·입사 연도·경력·소속 시작일)를 함께 만든다.
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

// 관리 링크. managementPath는 `/manage#token=<비밀값>` 형태의 프론트 상대 경로다.
export type ManagementLink = {
  managementToken: string;
  managementPath: string;
};

export type WorkspaceCreateResponse = ManagementLink & {
  ward: ApiWard;
  headNurseId: string;
};
