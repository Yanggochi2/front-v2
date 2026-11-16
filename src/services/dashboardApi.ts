import { apiRequest } from "@/lib/apiClient";
import type { ApiDashboard } from "@/types/dashboardApi.type";

// 수간호사 대시보드 (11/13 계약). 그 달 근무표가 없어도 인력 현황과 빈 통계를 200으로 준다.
export function getDashboard(yearMonth: string): Promise<ApiDashboard> {
  return apiRequest<ApiDashboard>("/wards/me/dashboard", { query: { yearMonth } });
}

export type OffCarrySummary = { total: number; nurses: { name: string; count: number }[] };

// 그 달로 넘어온 OFF(지난달 확정본에서 못 쓴 OFF) 요약. 대시보드 응답에서 이월이 있는 간호사만 많은 순으로 추린다.
export async function getOffCarry(yearMonth: string): Promise<OffCarrySummary> {
  const d = await getDashboard(yearMonth);
  const nurses = d.nurseWorkloads
    .filter((w) => w.offCarry > 0)
    .map((w) => ({ name: w.name, count: w.offCarry }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
  return { total: d.offSummary.carried, nurses };
}
