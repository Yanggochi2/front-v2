import { apiRequest } from "@/lib/apiClient";
import type { ApiDashboard } from "@/types/dashboardApi.type";

// 수간호사 대시보드 (11/13 계약). 그 달 근무표가 없어도 인력 현황과 빈 통계를 200으로 준다.
export function getDashboard(yearMonth: string): Promise<ApiDashboard> {
  return apiRequest<ApiDashboard>("/wards/me/dashboard", { query: { yearMonth } });
}
