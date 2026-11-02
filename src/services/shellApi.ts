import { cache } from "react";
import { getMe } from "@/services/authApi";
import type { ShellInfo } from "@/types/shell.type";

// 레이아웃과 페이지가 한 요청 안에서 GET /me를 한 번만 부르도록 묶는다.
const getMeOnce = cache(getMe);

// GET /me → ShellInfo. 병동을 아직 만들지 않았으면 null (호출한 쪽에서 병동 만들기로 보낸다).
// 로그인하지 않았거나 세션이 끝났으면 401 UNAUTHENTICATED (호출한 쪽에서 /login으로 보낸다).
export async function getShellInfo(): Promise<ShellInfo | null> {
  const me = await getMeOnce();
  if (!me.membership || !me.ward) return null;
  return { hospitalName: me.ward.hospitalName, wardName: me.ward.wardName, userName: me.user.name };
}
