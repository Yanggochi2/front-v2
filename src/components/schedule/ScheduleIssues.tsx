"use client";

import { useEffect, useRef, useState } from "react";
import type { ScheduleIssue } from "@/types/schedule.type";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function dateLabel(date: string | null) {
  if (!date) return "-";
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${WEEKDAYS[d.getUTCDay()]})`;
}

type Props = {
  issues: ScheduleIssue[];
  names: Map<string, string>; // nurseKey → 이름
  onPick: (issue: ScheduleIssue) => void;
};

// 머리의 "규칙 위반 n건" 버튼과 목록 (SCH-05). 모두 고쳐야 확정할 수 있어서 확정 버튼 옆에 둔다.
// 항목을 누르면 근무표에서 그 칸(간호사 위반)이나 그날(인원 부족 같은 병동 위반)을 찾아 준다.
export default function ScheduleIssues({ issues, names, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // 날짜순, 같은 날이면 간호사 위반을 먼저
  const sorted = [...issues].sort(
    (a, b) => (a.date ?? "").localeCompare(b.date ?? "") || Number(!a.nurseKey) - Number(!b.nurseKey),
  );

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        title="규칙 위반을 모두 고쳐야 확정할 수 있어요"
        className="flex items-center gap-2 rounded-full bg-danger-soft py-1.5 pr-3 pl-1.5 text-[16px] font-bold text-danger ring-1 ring-danger/20 ring-inset transition-shadow hover:ring-danger/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
      >
        <span aria-hidden className="flex size-6 items-center justify-center rounded-full bg-danger text-[14px] text-white">!</span>
        규칙 위반 {issues.length}건이 남았어요
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="규칙 위반 목록"
          className="absolute top-full right-0 z-40 mt-2 flex w-[500px] flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-pop"
        >
          <div className="border-b border-line px-5 pt-4 pb-3">
            <p className="text-[18px] font-bold text-ink">규칙 위반 {issues.length}건</p>
            <p className="mt-0.5 text-[14px] font-medium text-ink-sub">모두 고쳐야 확정할 수 있어요. 누르면 근무표에서 그 칸이나 그날을 보여 줘요.</p>
          </div>
          <ul className="flex max-h-[520px] flex-col overflow-y-auto p-2">
            {sorted.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPick(issue);
                  }}
                  className="grid w-full grid-cols-[116px_72px_1fr] items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span className="font-bold text-ink">{dateLabel(issue.date)}</span>
                  <span className={`truncate font-bold ${issue.nurseKey ? "text-ink-sub" : "text-ink-mute"}`}>
                    {issue.nurseKey ? (names.get(issue.nurseKey) ?? "-") : "병동"}
                  </span>
                  <span className="font-medium text-danger">{issue.message}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
