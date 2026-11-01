"use client";

import Link from "next/link";
import ScheduleButton from "@/components/ui/ScheduleButton";
import SchedulePageHeader from "@/components/ui/SchedulePageHeader";
import { GENERATE_ESTIMATED_MINUTES } from "@/constants/schedule.constants";
import { useGenerationStart } from "@/hooks/useGenerationStart";
import { shiftMonth } from "@/lib/schedulePeriod";

const STEPS = [
  { title: "규칙 확인", description: "규칙 설정의 필수·권장 규칙을 지켜요" },
  { title: "희망 오프 반영", description: "간호사들이 낸 희망 오프와 연차를 먼저 넣어요" },
  { title: "직접 고치기", description: "만든 뒤에 칸을 눌러 바로 고칠 수 있어요" },
];

function monthLabel(yearMonth: string) {
  return `${yearMonth.slice(0, 4)}년 ${Number(yearMonth.slice(5))}월`;
}

// 자동 생성 시작 화면 (/schedule/generate, jobId 없음)
export default function GenerateStart({ yearMonth }: { yearMonth: string }) {
  const { start, loading, error } = useGenerationStart();

  return (
    <>
      <SchedulePageHeader
        title="근무표 자동 생성"
        subtitle={`달을 고르고 시작하면 보통 ${GENERATE_ESTIMATED_MINUTES}분 안에 끝나요`}
      />
      <section className="flex w-full flex-col items-start gap-6 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
        <div className="flex items-center gap-3">
          <Link
            href={`/schedule/generate?ym=${shiftMonth(yearMonth, -1)}`}
            aria-label="이전 달"
            className="flex size-12 items-center justify-center rounded-full border border-line bg-white text-[22px] font-bold text-ink-sub transition-colors hover:border-grid hover:bg-canvas hover:text-ink"
          >
            ‹
          </Link>
          <p className="min-w-[200px] rounded-[16px] bg-primary-soft px-5 py-2 text-center text-[28px] font-bold tracking-[-0.02em] text-primary">{monthLabel(yearMonth)}</p>
          <Link
            href={`/schedule/generate?ym=${shiftMonth(yearMonth, 1)}`}
            aria-label="다음 달"
            className="flex size-12 items-center justify-center rounded-full border border-line bg-white text-[22px] font-bold text-ink-sub transition-colors hover:border-grid hover:bg-canvas hover:text-ink"
          >
            ›
          </Link>
        </div>
        <p className="text-[17px] font-medium text-ink-sub">
          이 달 근무표가 없으면 새로 만들고, 있으면 지금 내용을 새로 짠 결과로 바꿔요. 확정된 근무표는 확정을 취소해야 다시 짤 수 있어요.
        </p>
        <div className="flex items-center gap-4">
          <ScheduleButton
            variant="primary"
            size="bar"
            onClick={() => start(yearMonth)}
            disabled={loading}
            className="disabled:opacity-50"
          >
            {loading ? "만드는 중…" : "자동 생성 시작"}
          </ScheduleButton>
          {error ? (
            <p role="alert" className="text-[17px] font-bold text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </section>
      <ol className="grid w-full grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col items-start gap-2.5 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-[18px] font-bold text-primary">{i + 1}</span>
            <p className="text-[22px] font-bold text-ink">{s.title}</p>
            <p className="text-[16px] font-medium text-ink-sub">{s.description}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
