import { redirect } from "next/navigation";
import { ApiError } from "@/lib/apiClient";
import AppShell from "@/components/layout/AppShell";
import { getShellInfo } from "@/services/shellApi";
import type { ShellInfo } from "@/types/shell.type";

// 서버에 닿지 못할 때 쓰는 중립 셸. 가짜 병동 이름은 넣지 않는다.
const FALLBACK_SHELL: ShellInfo = { hospitalName: "", wardName: "" };

export default async function AppLayout({ children }: LayoutProps<"/">) {
  let shell: ShellInfo | null = null;
  try {
    shell = await getShellInfo();
  } catch (e) {
    // 관리 링크가 없거나 바뀌었으면(401 MANAGEMENT_LINK_REQUIRED) 안내 화면으로 보낸다. 서버에 닿지 못하면 화면 틀만 보여 준다.
    if (!(e instanceof ApiError && e.status === 401)) return <AppShell shell={FALLBACK_SHELL}>{children}</AppShell>;
  }
  if (!shell) redirect("/manage");

  return <AppShell shell={shell}>{children}</AppShell>;
}
