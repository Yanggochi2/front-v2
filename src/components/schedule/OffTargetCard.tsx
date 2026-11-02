"use client";

import { useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { OFF_TARGET_FORMULA_LABEL } from "@/constants/rules.constants";
import { useSubmit } from "@/hooks/useSubmit";
import { patchOffTarget } from "@/services/rulesApi";
import type { ApiOffTarget } from "@/types/rulesApi.type";

const inputCls = "h-12 w-24 rounded-[14px] bg-surface px-4 text-center text-[20px] font-bold text-ink outline-none focus:ring-2 focus:ring-primary";

// 그 달 OFF 목표 (RULE-06/07, 10/26 계약 4장). 일반 간호사가 받는 OFF 개수의 기본 하드 제약이다.
// 자동값은 서버가 주말·공휴일 + 1로 계산하고, 수간호사가 고치거나 자동으로 되돌릴 수 있다.
type Props = {
  yearMonth: string;
  initial: ApiOffTarget | null; // 그 달 근무표가 없으면 null
  locked: boolean; // 확정된 근무표면 고칠 수 없다 (서버도 409 SCHEDULE_CONFIRMED)
};

export default function OffTargetCard({ yearMonth, initial, locked }: Props) {
  const [target, setTarget] = useState(initial);
  const [count, setCount] = useState(initial ? String(initial.targetCount) : "");
  const [reason, setReason] = useState("");
  const { submit, loading, error } = useSubmit();

  if (!target) {
    return (
      <p className="text-[17px] font-medium text-ink-sub">
        이 달 근무표를 만들면 OFF 목표가 정해져요 ({OFF_TARGET_FORMULA_LABEL}). 만든 뒤 여기서 고칠 수 있어요.
      </p>
    );
  }

  const value = Number(count);
  const valid = count.trim() !== "" && Number.isInteger(value) && value >= 0 && value <= 31;
  const changed = valid && value !== target.targetCount;

  async function save(next: number | null) {
    await submit(async () => {
      const saved = await patchOffTarget(yearMonth, { targetCount: next, reason: next === null ? null : reason.trim() || null });
      setTarget(saved);
      setCount(String(saved.targetCount));
      setReason("");
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="off-target" className="text-[18px] font-bold text-ink">
          일반 간호사 OFF
        </label>
        <input id="off-target" type="number" min={0} max={31} value={count} disabled={locked} onChange={(e) => setCount(e.target.value)} className={`${inputCls} disabled:opacity-60`} />
        <span className="text-[18px] font-medium text-ink-sub">일</span>
        <span className="text-[16px] font-medium text-ink-mute">
          {target.source === "AUTO"
            ? `자동 계산 (${OFF_TARGET_FORMULA_LABEL})`
            : `직접 정함 · 자동이면 ${target.autoCount}일${target.reason ? ` · ${target.reason}` : ""}`}
        </span>
      </div>
      {locked ? <p className="text-[16px] font-medium text-ink-mute">확정된 근무표라 고칠 수 없어요. 고치려면 확정을 취소해 주세요.</p> : null}
      {changed && !locked ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="바꾼 이유 (선택)"
            aria-label="바꾼 이유"
            className="h-12 min-w-[320px] rounded-[14px] bg-surface px-4 text-[17px] font-medium text-ink outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
          />
          <ScheduleButton variant="brand" size="xs" onClick={() => save(value)} disabled={loading}>
            {loading ? "저장 중…" : "저장"}
          </ScheduleButton>
        </div>
      ) : null}
      {target.source === "MANUAL" && !locked ? (
        <div>
          <ScheduleButton variant="neutral" size="xs" onClick={() => save(null)} disabled={loading}>
            자동 계산으로 되돌리기 ({target.autoCount}일)
          </ScheduleButton>
        </div>
      ) : null}
      {!valid && count.trim() !== "" ? <p className="text-[16px] font-medium text-danger">0~31 사이로 넣어 주세요.</p> : null}
      {error ? (
        <p role="alert" className="text-[16px] font-medium text-danger">
          {error}
        </p>
      ) : null}
      <p className="text-[15px] font-medium text-ink-mute">차지·수간호사는 평일에 일하고 주말·공휴일에 쉬어요. 중간에 들어오거나 나간 간호사는 소속 일수만큼 줄어요.</p>
    </div>
  );
}
