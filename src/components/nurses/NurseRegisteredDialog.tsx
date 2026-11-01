"use client";

import { useEffect, useRef } from "react";
import RnButton from "@/components/ui/RnButton";

type Props = {
  name: string;
  onAddAnother: () => void;
};

// 등록 완료 안내.
// 지금은 간호사가 직접 가입해 병동 코드로 신청하면, 가입 승인에서 이 간호사 행과 연결한다.
// TODO: "등록하면 계정 발급 → 첫 로그인 때 비밀번호 설정" 흐름(10-20 확정안)이 백엔드에 생기면 안내를 바꾼다
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nurse-registered-title"
        className="flex w-[520px] flex-col outline-none gap-5 rounded-[28px] bg-white p-8 shadow-pop"
      >
        <h2 id="nurse-registered-title" className="text-[26px] font-bold text-ink">
          {name} 간호사를 등록했어요
        </h2>
        <div className="flex flex-col gap-2 rounded-[14px] bg-brand-soft p-5">
          <p className="text-[18px] font-bold text-ink">로그인은 이렇게 연결돼요</p>
          <p className="text-[17px] font-medium text-ink-sub">
            간호사가 가입한 뒤 병동 코드로 신청하면, 가입 승인에서 이 간호사와 연결해 주세요. 병동 코드는 병동 설정에
            있어요.
          </p>
        </div>
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
