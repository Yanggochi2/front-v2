"use client";

import { useEffect, useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";

type Props = {
  title: string;
  description: string;
  confirmLabel: string;
  // 있으면 사유 입력칸을 보여 주고 비어 있으면 진행하지 않는다
  reasonLabel?: string;
  busy: boolean;
  error: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

// 근무표 확정 / 확정 취소 확인 창
export default function ScheduleConfirmDialog({
  title,
  description,
  confirmLabel,
  reasonLabel,
  busy,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const needsReason = reasonLabel !== undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-confirm-title"
        className="flex w-[480px] flex-col gap-4 rounded-[28px] bg-white p-8 shadow-pop"
      >
        <h2 id="schedule-confirm-title" className="text-[24px] font-bold text-ink">
          {title}
        </h2>
        <p className="text-[17px] font-medium text-ink-sub">{description}</p>
        {needsReason ? (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label={reasonLabel}
            placeholder={reasonLabel}
            rows={3}
            autoFocus
            className="w-full resize-none rounded-[14px] bg-surface px-4 py-3 text-[17px] font-medium text-ink outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
          />
        ) : null}
        {error ? (
          <p role="alert" className="text-[16px] font-bold text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-3 pt-2">
          <ScheduleButton variant="neutral" size="sm" onClick={onClose} disabled={busy}>
            닫기
          </ScheduleButton>
          <ScheduleButton
            variant="primary"
            size="sm"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || (needsReason && reason.trim() === "")}
            className="disabled:opacity-50"
          >
            {confirmLabel}
          </ScheduleButton>
        </div>
      </div>
    </div>
  );
}
