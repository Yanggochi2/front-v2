import { apiRequest, apiRequestList } from "@/lib/apiClient";
import { getRules, patchRule } from "@/services/rulesApi";
import type { WardSettingsData } from "@/types/ward.type";
import type { ApiWard } from "@/types/wardApi.type";

// GET /wards/me (+ NUR-02로 인원 수). 병동 설정 화면.
export async function getWardSettings(): Promise<WardSettingsData> {
  const [ward, all] = await Promise.all([
    apiRequest<ApiWard>("/wards/me"),
    apiRequestList<unknown>("/wards/me/nurses", { query: { size: 1 } }),
  ]);

  return {
    hospitalName: ward.hospitalName,
    wardName: ward.wardName,
    nurseCount: all.meta.totalElements,
    dailyRequired: ward.requiredStaff,
    // TODO: 규칙 시작 방식(프리셋) 표시값은 응답에 없다. 백엔드 확정 후 결정 (RULE-01)
    ruleStartLabel: undefined,
    shareCodeSet: ward.shareCodeSet ?? false,
  };
}

// 공유 링크 코드 정하기·바꾸기 (backend#106). 바꾸면 전에 코드를 입력한 간호사도 새 코드를 다시 넣어야 한다.
export function setShareCode(code: string): Promise<{ shareCodeSet: boolean }> {
  return apiRequest<{ shareCodeSet: boolean }>("/wards/me/share-code", { method: "PUT", body: { code } });
}

// 공유 링크 코드 끄기. 링크만 있으면 누구나 볼 수 있게 된다.
export function clearShareCode(): Promise<void> {
  return apiRequest<void>("/wards/me/share-code", { method: "DELETE" });
}

// 하루 필요 인원 수정. 병동의 필요 인원은 COVERAGE 규칙 값이라 RULE-01로 찾아 RULE-02로 고친다.
// 저장된 값을 돌려준다.
export async function updateRequiredStaff(next: WardSettingsData["dailyRequired"]): Promise<WardSettingsData["dailyRequired"]> {
  const { rules } = await getRules();
  const coverage = rules.find((r) => r.code === "COVERAGE");
  if (!coverage) throw new Error("필요 인원 규칙을 찾지 못했어요. 새로고침 후 다시 시도해 주세요.");
  const saved = await patchRule(coverage.id, { parameters: next, version: coverage.version });
  const p = saved.parameters as Partial<WardSettingsData["dailyRequired"]>;
  return { D: Number(p.D ?? next.D), E: Number(p.E ?? next.E), N: Number(p.N ?? next.N) };
}

