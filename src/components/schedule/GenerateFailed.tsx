import ScheduleButton from "@/components/ui/ScheduleButton";
import ScheduleChip from "@/components/ui/ScheduleChip";
import SchedulePageHeader from "@/components/ui/SchedulePageHeader";
import type { GenerationFailure } from "@/types/schedule.type";
import GeneratePartialApplyButton from "./GeneratePartialApplyButton";
import GenerateRelaxButton from "./GenerateRelaxButton";

export default function GenerateFailed({ data }: { data: GenerationFailure }) {
  return (
    <>
      <SchedulePageHeader title={data.title} subtitle={data.subtitle} />
      {/* 연한 빨강 배경/테두리(#fff5f5, #ffd6d6)는 토큰에 없어 임의 값 사용 */}
      <section className="flex w-full flex-col items-start gap-2.5 rounded-[20px] border border-[#ffd6d6] bg-[#fff5f5] px-7 shadow-card py-[26px]">
        <ScheduleChip tone="danger">{data.cause.tag}</ScheduleChip>
        <p className="text-[24px] font-bold text-ink">{data.cause.headline}</p>
        <p className="text-[17px] font-medium text-ink-sub">{data.cause.detail}</p>
      </section>
      {data.problems.length > 0 ? (
        <section className="flex w-full flex-col gap-3 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
          <h2 className="text-[20px] font-bold text-ink">남은 하드 위반</h2>
          <ul className="flex flex-col gap-1.5">
            {data.problems.map((m, i) => (
              <li key={`${i}-${m}`} className="text-[17px] font-medium text-ink-sub">
                · {m}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {/* 완화 선택지: 해가 없을 때 백엔드가 SOFT로 낮출 수 있는 규칙을 준다 */}
      {data.options.length > 0 ? (
        <ul className="grid w-full grid-cols-3 gap-6">
          {data.options.map((o) => (
            <li key={o.id} className="flex flex-col items-start gap-2.5 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
              <ScheduleChip tone={o.badge.tone}>{o.badge.label}</ScheduleChip>
              <p className="text-[20px] font-bold text-ink">{o.title}</p>
              <p className="text-[16px] font-medium text-ink-sub">{o.description}</p>
              <GenerateRelaxButton jobId={data.jobId} relaxationId={o.id} yearMonth={data.yearMonth} primary={o.primary} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-start gap-3">
        <GeneratePartialApplyButton jobId={data.jobId} yearMonth={data.yearMonth} />
        <ScheduleButton variant="neutral" size="sm" href={data.yearMonth ? `/schedule?ym=${data.yearMonth}` : "/schedule"}>
          취소
        </ScheduleButton>
      </div>
    </>
  );
}
