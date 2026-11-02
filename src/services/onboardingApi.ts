import { apiRequest } from "@/lib/apiClient";
import { CREATE_WARD_DEFAULTS } from "@/constants/onboarding.constants";
import type { CreateWardDefaults, CreateWardInput } from "@/types/onboarding.type";
import type { WorkspaceCreateRequest, WorkspaceCreateResponse } from "@/types/wardApi.type";

// TODO: 규칙 프리셋 목록과 기본 인원 API는 명세에 없다. 화면 기본값은 constants를 쓴다.
export async function getCreateWardDefaults(): Promise<CreateWardDefaults> {
  return CREATE_WARD_DEFAULTS;
}

// POST /workspaces (10/26 계약). 로그인한 계정이 새 병동의 수간호사가 된다.
// 이미 병동이 있으면 409 MEMBERSHIP_ALREADY_EXISTS, 로그인하지 않았으면 401 UNAUTHENTICATED.
export async function createWorkspace(input: CreateWardInput): Promise<void> {
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
  await apiRequest<WorkspaceCreateResponse>("/workspaces", {
    method: "POST",
    body,
    idempotencyKey: crypto.randomUUID(),
  });
}
