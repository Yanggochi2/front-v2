"use client";

import Link from "next/link";
import ScheduleToggle from "@/components/ui/ScheduleToggle";
import type { ShellInfo } from "@/types/shell.type";

// 사이드바를 닫았을 때의 상단 바. 메뉴 목록은 보이지 않고 사이드바를 다시 여는 버튼만 둔다.
type Props = {
  shell: ShellInfo;
  onOpen: () => void;
  largeText: boolean;
  onLargeTextChange: (next: boolean) => void;
};

export default function TopNav({ shell, onOpen, largeText, onLargeTextChange }: Props) {
  return (
    <header className="flex h-[72px] shrink-0 items-center gap-6 border-b border-line bg-white px-6">
      <button
        type="button"
        onClick={onOpen}
        aria-label="사이드바 열기"
        className="flex size-10 items-center justify-center rounded-[12px] text-[20px] font-bold text-ink-mute transition-colors hover:bg-surface hover:text-ink"
      >
        »
      </button>
      <Link href="/schedule" aria-label="홈으로" className="flex items-center gap-2">
        <span aria-hidden className="flex size-9 items-center justify-center rounded-[11px] bg-primary text-[19px] font-bold text-white shadow-cta">
          O
        </span>
        <span className="text-[22px] font-bold tracking-[-0.02em] text-ink">Ottugi</span>
      </Link>
      <div className="min-w-0 flex-1" />
      <ScheduleToggle checked={largeText} onChange={onLargeTextChange} label="큰 글씨" />
      {/* 로그인·프로필이 없어(10/26 계약) 지금 관리하는 병동을 보여 준다 */}
      <Link href="/ward-settings" className="flex shrink-0 items-center gap-2 text-[16px] font-medium text-ink-sub">
        {shell.hospitalName} <span className="font-bold text-ink">{shell.wardName}</span>
      </Link>
    </header>
  );
}
