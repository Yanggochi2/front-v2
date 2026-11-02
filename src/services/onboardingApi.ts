import { apiRequest } from "@/lib/apiClient";
import { CREATE_WARD_DEFAULTS } from "@/constants/onboarding.constants";
import type { CreateWardDefaults, CreateWardInput } from "@/types/onboarding.type";
import type { ManagementLink, WorkspaceCreateRequest, WorkspaceCreateResponse } from "@/types/wardApi.type";

// TODO: 규칙 프리셋 목록과 기본 인원 API는 명세에 없다. 화면 기본값은 constants를 쓴다.
export async function getCreateWardDefaults(): Promise<CreateWardDefaults> {
  return CREATE_WARD_DEFAULTS;
}

// POST /workspaces (10/26 계약). 로그인 없이 병동과 수간호사를 함께 만들고 관리 링크를 받는다.
// 비밀값을 돌려주는 요청이라 백엔드가 Idempotency-Key 캐시에서 빼므로 키를 보내지 않는다 (다시 부르면 새 병동이 생긴다).
export async function createWorkspace(input: CreateWardInput): Promise<ManagementLink> {
  const body: WorkspaceCreateRequest = {
    hospitalName: input.hospitalName,
    wardName: input.wardName,
    headName: input.headName,
    joinedYear: input.joinedYear,
    careerMonths: input.careerMonths,
    affiliationStart: input.affiliationStart,
    requiredStaff: input.requiredStaff,
    rulePreset: input.rulePreset,
  };
  const { managementToken, managementPath } = await apiRequest<WorkspaceCreateResponse>("/workspaces", {
    method: "POST",
    body,
  });
  return { managementToken, managementPath };
}
