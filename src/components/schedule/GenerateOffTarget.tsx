"use client";

import { useOffTargetInfo } from "@/hooks/useOffTargetInfo";
import OffTargetCard from "./OffTargetCard";

// 자동 생성 창 안의 OFF 목표. 생성 전에 그 달 OFF 목표를 확인하고 고칠 수 있다 (예전 자동 생성 시작 화면에서 옮김).
export default function GenerateOffTarget({ yearMonth }: { yearMonth: string }) {
  const info = useOffTargetInfo(yearMonth);

  return (
    <div className="flex flex-col gap-2 rounded-[16px] bg-canvas px-4 py-3">
      <p className="text-[17px] font-bold text-ink">{Number(yearMonth.slice(5))}월 OFF 목표</p>
      {info.status === "loading" ? (
        <p className="text-[16px] font-medium text-ink-mute">불러오는 중…</p>
      ) : info.status === "error" ? (
        <p className="text-[16px] font-medium text-danger">OFF 목표를 불러오지 못했어요. 생성은 지금 정해진 목표대로 진행돼요.</p>
      ) : (
        <OffTargetCard yearMonth={yearMonth} initial={info.offTarget} locked={false} carry={info.carry} />
      )}
    </div>
  );
}
