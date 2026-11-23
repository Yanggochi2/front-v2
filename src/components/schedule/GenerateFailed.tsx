import ScheduleButton from "@/components/ui/ScheduleButton";
import ScheduleChip from "@/components/ui/ScheduleChip";
import SchedulePageHeader from "@/components/ui/SchedulePageHeader";
import type { GenerationFailure } from "@/types/schedule.type";

// 자동 생성 실패 화면. 규칙을 낮춰 다시 만들기·부분 결과 쓰기는 두지 않는다 (11/17 미팅: 기획에 없고 헷갈림).
// 무엇을 못 지켰는지 보여 주고, 인원이 모자라면 그 사실을 알린 뒤 근무표로 돌아가게 한다.
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
          <h2 className="text-[20px] font-bold text-ink">지키지 못한 규칙</h2>
          <ul className="flex flex-col gap-1.5">
            {data.problems.map((m, i) => (
              <li key={`${i}-${m}`} className="text-[17px] font-medium text-ink-sub">
                · {m}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="flex flex-wrap items-start gap-3">
        {data.staffShortage ? (
          <>
            <ScheduleButton variant="brand" size="sm" href="/nurses">
              간호사 명단 보기
            </ScheduleButton>
            <ScheduleButton variant="neutral" size="sm" href="/ward-settings">
              하루 필요 인원 확인
            </ScheduleButton>
          </>
        ) : null}
        <ScheduleButton variant="neutral" size="sm" href={data.yearMonth ? `/schedule?view=month&ym=${data.yearMonth}` : "/schedule"}>
          근무표로 돌아가기
        </ScheduleButton>
      </div>
    </>
  );
}
