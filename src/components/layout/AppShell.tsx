"use client";

import { useStoredFlag } from "@/hooks/useStoredFlag";
import type { ShellInfo } from "@/types/shell.type";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

// 사이드바 열림/닫힘(닫으면 상단 메뉴로 바뀐다)과 큰 글씨. 선택은 이 브라우저에만 기억한다.
export default function AppShell({ shell, children }: { shell: ShellInfo; children: React.ReactNode }) {
  const [closed, setClosed] = useStoredFlag("ottugi.sidebar", "closed", "open");
  const [largeText, setLargeText] = useStoredFlag("ottugi.textSize", "large", "normal");
  const textSize = { largeText, onLargeTextChange: setLargeText };
  // 큰 글씨는 화면 비율(--ui-zoom)을 올려 글자·버튼·근무표를 함께 키운다 (globals.css .ui-zoom-large)
  const zoom = `ui-zoom ${largeText ? "ui-zoom-large" : ""}`;

  return !closed ? (
    <div className={`${zoom} flex h-screen-ui print:h-auto`}>
      <div className="contents print:hidden">
        <Sidebar shell={shell} onClose={() => setClosed(true)} {...textSize} />
      </div>
      <main className="min-w-0 flex-1 overflow-y-auto bg-canvas print:overflow-visible print:bg-white">{children}</main>
    </div>
  ) : (
    <div className={`${zoom} flex h-screen-ui flex-col print:h-auto`}>
      <div className="contents print:hidden">
        <TopNav shell={shell} onOpen={() => setClosed(false)} {...textSize} />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto bg-canvas print:overflow-visible print:bg-white">{children}</main>
    </div>
  );
}
