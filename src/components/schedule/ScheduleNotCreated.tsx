import ScheduleButton from "@/components/ui/ScheduleButton";
import ScheduleCreateEmptyButton from "./ScheduleCreateEmptyButton";

// 그 달 근무표를 아직 만들지 않았을 때 (GET 근무표 404). 자동 생성으로 만들거나, 빈 근무표를 만들어 직접 작성한다 (11/16 미팅).
export default function ScheduleNotCreated({ yearMonth }: { yearMonth: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-[18px] rounded-[24px] border border-line bg-white px-10 py-[60px] text-center">
      <div className="flex size-[96px] items-center justify-center gap-1 rounded-full bg-primary-soft" aria-hidden>
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full bg-primary" />
      </div>
      <p className="max-w-[640px] text-[26px] font-bold text-ink">이 달 근무표가 아직 없어요</p>
      <p className="max-w-[560px] text-[18px] font-medium text-ink-sub">
        자동 생성으로 한 번에 만들거나, 빈 근무표에 직접 적을 수 있어요. 이미 짜 둔 근무표(지난달 실제 근무 등)는 빈 근무표를 만든 뒤 엑셀에서 가져오면 돼요.
      </p>
      <div className="flex flex-wrap items-start justify-center gap-3">
        <ScheduleButton variant="brand" size="md" href={`/schedule/generate?ym=${yearMonth}`}>
          자동 생성으로 만들기
        </ScheduleButton>
        <ScheduleCreateEmptyButton yearMonth={yearMonth} />
      </div>
    </div>
  );
}
