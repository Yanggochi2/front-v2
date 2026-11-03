"use client";

import Link from "next/link";
import ScheduleButton from "@/components/ui/ScheduleButton";
import SchedulePageHeader from "@/components/ui/SchedulePageHeader";
import { GENERATE_ESTIMATED_MINUTES } from "@/constants/schedule.constants";
import { useState } from "react";
import ScheduleToggle from "@/components/ui/ScheduleToggle";
import OffTargetCard from "./OffTargetCard";
import { useGenerationStart } from "@/hooks/useGenerationStart";
import { shiftMonth } from "@/lib/schedulePeriod";
import type { ApiOffTarget } from "@/types/rulesApi.type";

const STEPS = [
  { title: "규칙 확인", description: "규칙 설정의 필수·권장 규칙을 지켜요" },
  { title: "고정 일정 먼저", description: "근무표에 넣어 둔 연차·교육과 종이 달력의 오프를 먼저 지켜요" },
  { title: "직접 고치기", description: "만든 뒤에 칸을 눌러 바로 고칠 수 있어요" },
];

function monthLabel(yearMonth: string) {
  return `${yearMonth.slice(0, 4)}년 ${Number(yearMonth.slice(5))}월`;
}

type Props = {
  yearMonth: string;
  // 이 달 작성 중 근무표의 근무가 들어 있는 칸·빈 칸 수. 근무표가 없거나 확정본이면 null
  draft: { entered: number; empty: number } | null;
  // 이 달 근무표가 확정·보관된 상태. 확정을 취소하기 전에는 시작할 수 없다
  locked: boolean;
  // 이 달 OFF 목표. 근무표가 없으면 null, 불러오지 못하면 undefined(카드를 숨긴다)
  offTarget: ApiOffTarget | null | undefined;
};

// 자동 생성 시작 화면 (/schedule/generate, jobId 없음)
export default function GenerateStart({ yearMonth, draft, locked, offTarget }: Props) {
  const { start, loading, error } = useGenerationStart();
  // 넣어 둔 근무가 있고 빈 칸이 남아 있으면 넣어 둔 칸을 지키는 쪽을 기본으로 한다
  const [keepEntered, setKeepEntered] = useState(!!draft && draft.entered > 0 && draft.empty > 0);

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
        {draft && draft.entered > 0 ? (
          <div className="flex flex-col gap-1">
            <ScheduleToggle checked={keepEntered} onChange={setKeepEntered} label={`넣어 둔 근무 ${draft.entered}칸은 그대로 두기`} />
            <p className="pl-[52px] text-[15px] font-medium text-ink-mute">
              {keepEntered ? `빈 칸 ${draft.empty}칸만 채워요.` : "연차·교육만 남기고 모두 새로 짜요."}
            </p>
          </div>
        ) : null}
        <div className="flex items-center gap-4">
          <ScheduleButton
            variant="primary"
            size="bar"
            onClick={() => start(yearMonth, keepEntered)}
            disabled={loading || locked}
            className="disabled:opacity-50"
          >
            {loading ? "만드는 중…" : "자동 생성 시작"}
          </ScheduleButton>
          {locked ? (
            <p className="text-[17px] font-bold text-ink-sub">
              확정된 근무표예요.{" "}
              <Link href={`/schedule?view=month&ym=${yearMonth}`} className="text-primary underline underline-offset-4">
                근무표에서 확정을 취소
              </Link>
              하면 다시 짤 수 있어요.
            </p>
          ) : error ? (
            <p role="alert" className="text-[17px] font-bold text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </section>
      {offTarget !== undefined ? (
        <section className="flex w-full flex-col items-start gap-4 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
          <h2 className="text-[20px] font-bold text-ink">{monthLabel(yearMonth)} OFF 목표</h2>
          <OffTargetCard key={yearMonth} yearMonth={yearMonth} initial={offTarget} locked={draft === null} />
        </section>
      ) : null}
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
