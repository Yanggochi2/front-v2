"use client";

import { useEffect, useRef } from "react";
import RnButton from "@/components/ui/RnButton";

type Props = {
  name: string;
  onAddAnother: () => void;
};

// 등록 완료 안내. 간호사는 계정 없이 등록되고, 확정된 근무표는 공유 링크로 본다 (10/26 계약).
// Esc는 "한 명 더 등록"과 같다 (창을 닫고 빈 폼으로).
export default function NurseRegisteredDialog({ name, onAddAnother }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => dialogRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onAddAnother();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onAddAnother]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nurse-registered-title"
        className="flex w-[520px] flex-col outline-none gap-5 rounded-[28px] bg-card p-8 shadow-pop"
      >
        <h2 id="nurse-registered-title" className="text-[26px] font-bold text-ink">
          {name} 간호사를 등록했어요
        </h2>
        <p className="text-[17px] font-medium text-ink-sub">
          이제 근무표에 이 간호사의 줄이 생겨요. 확정한 근무표는 공유 링크로 간호사들에게 보여 줄 수 있어요.
        </p>
        <div className="flex justify-end gap-3">
          <RnButton variant="secondary" size="lg" onClick={onAddAnother}>
            한 명 더 등록
          </RnButton>
          <RnButton variant="primary" size="lg" href="/nurses">
            명단으로
          </RnButton>
        </div>
      </div>
    </div>
  );
}
