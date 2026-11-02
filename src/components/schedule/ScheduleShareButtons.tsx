"use client";

import { useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { toErrorMessage } from "@/lib/apiErrorMessage";
import { exportScheduleXlsx } from "@/services/scheduleApi";

type Props = {
  scheduleId: string; // 비어 있으면(서버 연결 실패) 엑셀 저장을 막는다
  yearMonth: string;
  canExport: boolean; // 엑셀 내보내기(SCH-09)는 관리 화면에서만 된다 (공유 링크 화면은 인쇄만)
};

// 근무표 공유: 엑셀 파일로 저장(SCH-09), 인쇄·PDF 저장(브라우저 인쇄, A4 가로)
export default function ScheduleShareButtons({ scheduleId, yearMonth, canExport }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveExcel() {
    setBusy(true);
    setError(null);
    try {
      const blob = await exportScheduleXlsx(scheduleId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${yearMonth} 근무표.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      {canExport ? (
        <ScheduleButton variant="neutral" size="xs" onClick={saveExcel} disabled={busy || !scheduleId} className="disabled:opacity-50">
          {busy ? "저장 중…" : "엑셀로 저장"}
        </ScheduleButton>
      ) : null}
      <ScheduleButton variant="neutral" size="xs" onClick={() => window.print()} title="PDF로 저장하려면 인쇄 창에서 'PDF로 저장'을 고르세요">
        인쇄·PDF
      </ScheduleButton>
      {error ? (
        <p role="alert" className="text-[15px] font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
