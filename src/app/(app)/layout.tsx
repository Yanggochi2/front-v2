import { redirect } from "next/navigation";
import { ApiError } from "@/lib/apiClient";
import AppShell from "@/components/layout/AppShell";
import { getShellInfo } from "@/services/shellApi";
import type { ShellInfo } from "@/types/shell.type";

// 서버에 닿지 못할 때 쓰는 중립 셸. 가짜 병동·사람 이름은 넣지 않는다.
const FALLBACK_SHELL: ShellInfo = { hospitalName: "", wardName: "", userName: "-" };

export default async function AppLayout({ children }: LayoutProps<"/">) {
  let shell: ShellInfo | null = null;
  let unauthenticated = false;
  try {
    shell = await getShellInfo();
  } catch (e) {
    // 세션이 없거나 만료되면 로그인으로 보낸다. 서버에 닿지 못한 경우에는 화면 틀만 보여 준다.
    if (!(e instanceof ApiError && e.status === 401)) return <AppShell shell={FALLBACK_SHELL}>{children}</AppShell>;
    unauthenticated = true;
  }
  if (unauthenticated) redirect("/login");
  // 병동을 아직 만들지 않은 수간호사는 병동 만들기로 보낸다 (docs/router.md 진입 분기).
  if (!shell) redirect("/onboarding/create-ward");

  return <AppShell shell={shell}>{children}</AppShell>;
}
