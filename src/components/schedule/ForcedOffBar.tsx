"use client";

import { useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";

type Props = {
  count: number; // 지금 고른 칸 수
  busy: boolean;
  notice: string | null; // 방금 지정한 결과 안내
  onSubmit: (reason: string) => Promise<boolean>; // 성공하면 true (사유 칸을 비운다)
  onClear: () => void;
  onClose: () => void;
};

// 백엔드 ForceOffPatch.reason 최대 길이
const REASON_MAX = 500;

// 강제 OFF 지정 막대 (7차 미팅 "인력 상황에 따라 강제로 오프 배정"). 근무표 아래 안내 줄 자리에 둔다.
// 칸을 눌러 고르고 → 사유(선택)를 적고 → 한 번에 OFF로 바꾼다. 인원 부족 같은 위반이 생겨도 막지 않고, 위반 목록에 그대로 뜬다.
export default function ForcedOffBar({ count, busy, notice, onSubmit, onClear, onClose }: Props) {
  const [reason, setReason] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[16px] bg-primary-soft px-3 py-2 ring-1 ring-primary/20 ring-inset print:hidden">
      <p className="text-[16px] font-bold text-primary">
        {count > 0 ? `${count}칸 골랐어요` : notice ?? "OFF로 바꿀 칸을 눌러 골라 주세요. 다시 누르면 빠져요"}
      </p>
      <label className="flex items-center gap-2 text-[15px] font-bold text-ink-sub">
        사유
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={REASON_MAX}
          placeholder="예: 인원 여유, 남은 OFF 소진 (선택)"
          className="h-10 w-[300px] rounded-[10px] border border-line bg-white px-3 text-[15px] font-medium text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none"
        />
      </label>
      <div className="ml-auto flex items-center gap-2">
        {count > 0 ? (
          <ScheduleButton variant="neutral" size="xs" onClick={onClear} disabled={busy}>
            고른 칸 풀기
          </ScheduleButton>
        ) : null}
        <ScheduleButton variant="neutral" size="xs" onClick={onClose} disabled={busy}>
          그만하기
        </ScheduleButton>
        <ScheduleButton
          variant="primary"
          size="xs"
          disabled={busy || count === 0}
          onClick={() => void onSubmit(reason).then((ok) => ok && setReason(""))}
        >
          {busy ? "지정하는 중…" : count > 0 ? `${count}칸 OFF로 지정` : "OFF로 지정"}
        </ScheduleButton>
      </div>
    </div>
  );
}
