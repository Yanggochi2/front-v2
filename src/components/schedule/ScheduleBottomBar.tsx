"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { useGenerationStart } from "@/hooks/useGenerationStart";
import { useSubmit } from "@/hooks/useSubmit";
import { cancelScheduleConfirmation, confirmSchedule, getScheduleViolations } from "@/services/scheduleApi";
import type { ScheduleStatus } from "@/types/scheduleApi.type";
import ScheduleConfirmDialog from "./ScheduleConfirmDialog";

type DialogKind = "confirm" | "cancel" | "regenerate";

type Props = {
  scheduleId: string; // 비어 있으면 서버에 연결하지 못한 상태
  yearMonth: string;
  status: ScheduleStatus;
  hardViolationCount: number;
};

// 시트 아래 CTA. 화면 높이 안에 시트가 다 들어오도록 고정 배치 대신 흐름 안에 둔다.
export default function ScheduleBottomBar({ scheduleId, yearMonth, status, hardViolationCount }: Props) {
  const router = useRouter();
  const { submit, loading, error, setError } = useSubmit();
  const generation = useGenerationStart();
  // 같은 확정 시도는 같은 Idempotency-Key를 쓴다. 창을 열 때 만든다.
  const [dialog, setDialog] = useState<{ kind: DialogKind; key: string } | null>(null);
  const offline = scheduleId === "";
  const blocked = hardViolationCount > 0;

  function open(kind: DialogKind) {
    setError(null);
    generation.setError(null);
    setDialog({ kind, key: crypto.randomUUID() });
  }

  async function run(reason: string) {
    if (!dialog) return;
    const ok = await submit(() =>
      dialog.kind === "confirm"
        ? // 확정 창에서 확정하는 것을 남은 소프트 위반 전체를 확인한 것으로 본다 (백엔드는 미확인 위반이 있으면 409).
          // TODO: 위반을 하나씩 확인하는 목록 UI는 시안 확정 후
          getScheduleViolations(scheduleId, { severity: "SOFT", size: 100 }).then(({ data }) =>
            confirmSchedule(scheduleId, { acknowledgedSoftViolationIds: data.map((v) => v.id) }, dialog.key),
          )
        : cancelScheduleConfirmation(scheduleId, { reason }),
    );
    if (!ok) return;
    setDialog(null);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
      {status === "DRAFT" && blocked ? (
        <p
          title="규칙 위반을 모두 고쳐야 확정할 수 있어요"
          className="flex items-center gap-2 rounded-full bg-danger-soft py-1.5 pr-4 pl-1.5 text-[16px] font-bold text-danger ring-1 ring-danger/20 ring-inset"
        >
          <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-danger text-[14px] text-white">!</span>
          규칙 위반 {hardViolationCount}건이 남았어요
        </p>
      ) : null}
      {status === "CONFIRMED" ? (
        <p className="flex items-center gap-2 rounded-full bg-primary-soft py-1.5 pr-4 pl-1.5 text-[16px] font-bold text-primary ring-1 ring-primary/20 ring-inset">
          <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-primary text-[14px] text-white">✓</span>
          간호사들에게 공개된 근무표예요
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        {status === "DRAFT" ? (
          <>
            <ScheduleButton
              variant="primary-soft"
              size="sm"
              onClick={() => open("regenerate")}
              disabled={offline}
              className="disabled:opacity-50"
            >
              자동으로 다시 짜기
            </ScheduleButton>
            <ScheduleButton
              variant="primary"
              size="sm"
              onClick={() => open("confirm")}
              disabled={offline || blocked}
              className="disabled:opacity-50"
            >
              확정하기
            </ScheduleButton>
          </>
        ) : null}
        {status === "CONFIRMED" ? (
          <ScheduleButton variant="primary-soft" size="sm" onClick={() => open("cancel")}>
            확정 취소
          </ScheduleButton>
        ) : null}
      </div>
      {dialog?.kind === "confirm" ? (
        <ScheduleConfirmDialog
          title="근무표를 확정할까요?"
          description="확정하면 간호사들에게 공개되고 알림이 가요. 확정한 뒤에는 고칠 수 없고, 고치려면 확정을 취소해야 해요."
          confirmLabel="확정하기"
          busy={loading}
          error={error}
          onConfirm={run}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.kind === "regenerate" ? (
        <ScheduleConfirmDialog
          title="자동으로 다시 짤까요?"
          description="지금 근무표를 새로 짠 결과로 바꿔요. 직접 고친 칸도 바뀌어요. 연차는 그대로 남아요."
          confirmLabel="다시 짜기"
          busy={generation.loading}
          error={generation.error}
          onConfirm={() => generation.start(yearMonth)}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.kind === "cancel" ? (
        <ScheduleConfirmDialog
          title="확정을 취소할까요?"
          description="취소하면 다시 고칠 수 있는 상태가 되고, 간호사들에게 취소 알림과 사유가 가요."
          confirmLabel="확정 취소"
          reasonLabel="취소 사유"
          busy={loading}
          error={error}
          onConfirm={run}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </div>
  );
}
