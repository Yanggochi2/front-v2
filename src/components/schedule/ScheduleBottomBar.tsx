"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import ScheduleToggle from "@/components/ui/ScheduleToggle";
import { useGenerationStart } from "@/hooks/useGenerationStart";
import { useSubmit } from "@/hooks/useSubmit";
import { cancelScheduleConfirmation, confirmSchedule, getAllViolations, getScheduleById } from "@/services/scheduleApi";
import type { ScheduleStatus } from "@/types/scheduleApi.type";
import GenerateOffTarget from "./GenerateOffTarget";
import ScheduleConfirmDialog from "./ScheduleConfirmDialog";

type DialogKind = "confirm" | "cancel" | "generate" | "blocked";

type Props = {
  scheduleId: string; // 비어 있으면 서버에 연결하지 못한 상태
  yearMonth: string;
  status: ScheduleStatus;
  hardViolationCount: number; // 0보다 크면 확정 버튼을 막는다
  staffShortage: boolean; // 남은 위반에 하루 인원 부족(병동 위반)이 있다. 막힌 이유를 알려 줄 때 병동 설정을 함께 안내한다
  keepEnteredDefault: boolean; // 자동 생성 창의 "넣어 둔 칸 지키기" 처음 값
};

// 시트 아래 CTA. 화면 높이 안에 시트가 다 들어오도록 고정 배치 대신 흐름 안에 둔다.
export default function ScheduleBottomBar({ scheduleId, yearMonth, status, hardViolationCount, staffShortage, keepEnteredDefault }: Props) {
  const router = useRouter();
  const { submit, loading, error, setError } = useSubmit();
  const generation = useGenerationStart();
  // 같은 확정 시도는 같은 Idempotency-Key를 쓴다. 창을 열 때 만든다.
  const [dialog, setDialog] = useState<{ kind: DialogKind; key: string } | null>(null);
  const [keepEntered, setKeepEntered] = useState(keepEnteredDefault);
  // 확정 창을 열 때 센, 고칠 수 있는데 비어 있는 칸 수 (그 달 전체). 세는 중이거나 세지 못했으면 null
  const [emptyCount, setEmptyCount] = useState<number | null>(null);
  const offline = scheduleId === "";
  const blocked = hardViolationCount > 0;

  function open(kind: DialogKind) {
    setError(null);
    generation.setError(null);
    setKeepEntered(keepEnteredDefault);
    setDialog({ kind, key: crypto.randomUUID() });
    if (kind !== "confirm") return;
    // 빈 칸이 남아 있어도 서버는 확정을 받는다. 모르고 확정하지 않게 창에서 알려 준다 (주간 보기에서도 그 달 전체를 센다).
    setEmptyCount(null);
    getScheduleById(scheduleId)
      .then((s) => setEmptyCount(s.cells.filter((c) => c.dutyCode === null && c.editable).length))
      .catch(() => {});
  }

  async function run(reason: string) {
    if (!dialog) return;
    const ok = await submit(() =>
      dialog.kind === "confirm"
        ? // 확정 창에서 확정하는 것을 남은 소프트 위반 전체를 확인한 것으로 본다 (백엔드는 미확인 위반이 있으면 409).
          // 권장 규칙 위반이 100건을 넘어도 빠짐없이 보내야 한다 (11/16 미팅: 위반 표시가 없는데 확정이 안 되던 원인).
          // TODO: 위반을 하나씩 확인하는 목록 UI는 시안 확정 후
          getAllViolations(scheduleId, "SOFT").then((soft) =>
            confirmSchedule(scheduleId, { acknowledgedSoftViolationIds: soft.map((v) => v.id) }, dialog.key),
          )
        : cancelScheduleConfirmation(scheduleId, { reason }),
    );
    if (!ok) return;
    setDialog(null);
    router.refresh();
  }

  // 남은 위반 수(ScheduleIssues)와 공개 안내(도구 줄)는 시트 머리에서 따로 보여 준다.
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
      <div className="flex items-center gap-3">
        {status === "DRAFT" ? (
          <>
            <ScheduleButton
              variant="primary-soft"
              size="sm"
              onClick={() => open("generate")}
              disabled={offline}
            >
              자동 생성
            </ScheduleButton>
            {/* 막힌 확정 버튼은 회색으로 두되(11/13 미팅), 누르면 왜 막혔는지 알려 준다.
                막힌 버튼은 pointer-events가 꺼져 있어 누르면 감싼 span이 받는다 */}
            <span
              className={blocked && !offline ? "cursor-pointer" : undefined}
              title={blocked && !offline ? `필수 규칙 위반 ${hardViolationCount}건을 고쳐야 확정할 수 있어요` : undefined}
              onClick={blocked && !offline ? () => open("blocked") : undefined}
            >
              <ScheduleButton variant="primary" size="sm" onClick={() => open("confirm")} disabled={offline || blocked}>
                확정하기
              </ScheduleButton>
            </span>
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
          description="확정하면 공유 링크를 만들어 간호사들에게 보여 줄 수 있어요. 확정한 뒤에는 고칠 수 없고, 고치려면 확정을 취소해야 해요."
          confirmLabel="확정하기"
          busy={loading}
          error={error}
          onConfirm={run}
          onClose={() => setDialog(null)}
        >
          {emptyCount ? (
            <p role="alert" className="rounded-[14px] bg-danger-soft px-4 py-3 text-[16px] font-bold text-danger">
              빈 칸이 {emptyCount}칸 남아 있어요. 그대로 확정하면 그 칸은 근무가 없는 채로 공유돼요. 먼저 채우려면 닫고 ‘자동 생성’을 눌러 주세요.
            </p>
          ) : null}
        </ScheduleConfirmDialog>
      ) : null}
      {dialog?.kind === "blocked" ? (
        <ScheduleConfirmDialog
          title="아직 확정할 수 없어요"
          description={`필수 규칙 위반이 ${hardViolationCount}건 남아 있어요. 모두 고쳐야 확정할 수 있어요. 위쪽 ‘규칙 위반 ${hardViolationCount}건’을 누르면 어디가 문제인지 보여요.`}
          confirmLabel={staffShortage ? "병동 설정 열기" : "확인"}
          busy={false}
          error={null}
          onConfirm={() => (staffShortage ? router.push("/ward-settings") : setDialog(null))}
          onClose={() => setDialog(null)}
        >
          {staffShortage ? (
            <p className="rounded-[14px] bg-canvas px-4 py-3 text-[16px] font-medium text-ink-sub">
              날마다 인원이 모자라다면, 병동 설정의 <b className="text-ink">하루 필요 인원</b>이 간호사 수에 비해 많은지 확인해 주세요. 줄인 뒤 ‘자동 생성’을 누르면 돼요.
            </p>
          ) : null}
        </ScheduleConfirmDialog>
      ) : null}
      {dialog?.kind === "generate" ? (
        <ScheduleConfirmDialog
          title="자동 생성할까요?"
          description={
            keepEntered
              ? "근무가 들어 있는 칸은 그대로 두고 빈 칸만 채워요. 연차·교육도 그대로 남아요."
              : "연차·교육만 남기고 나머지 칸을 모두 새로 짜요. 직접 넣은 오프도 바뀌어요."
          }
          confirmLabel="자동 생성"
          busy={generation.loading}
          error={generation.error}
          onConfirm={() => generation.start(yearMonth, keepEntered)}
          onClose={() => setDialog(null)}
        >
          <ScheduleToggle checked={keepEntered} onChange={setKeepEntered} label="넣어 둔 근무는 그대로 두기 (종이 달력 오프 등)" />
          <GenerateOffTarget yearMonth={yearMonth} />
        </ScheduleConfirmDialog>
      ) : null}
      {dialog?.kind === "cancel" ? (
        <ScheduleConfirmDialog
          title="확정을 취소할까요?"
          description="취소하면 다시 고칠 수 있는 상태가 되고, 만들어 둔 공유 링크는 더 이상 열리지 않아요. 다시 확정한 뒤 새 링크를 만들어 주세요."
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
