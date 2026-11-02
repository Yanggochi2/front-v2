import { cache } from "react";
import { apiRequest } from "@/lib/apiClient";
import type { ShellInfo } from "@/types/shell.type";
import type { ApiWard } from "@/types/wardApi.type";

// 레이아웃과 페이지가 한 요청 안에서 GET /wards/me를 한 번만 부르도록 묶는다.
export const getWard = cache(() => apiRequest<ApiWard>("/wards/me"));

// 관리 토큰이 없거나 바뀌었으면 401 MANAGEMENT_LINK_REQUIRED (호출한 쪽에서 /manage로 보낸다).
export async function getShellInfo(): Promise<ShellInfo> {
  const ward = await getWard();
  return { hospitalName: ward.hospitalName, wardName: ward.wardName };
}
