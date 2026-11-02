import ScheduleButton from "@/components/ui/ScheduleButton";

// 그 달 근무표를 아직 만들지 않았을 때 (GET 근무표 404). 자동 생성 화면에서 그 달을 골라 만든다.
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
        자동 생성으로 근무표를 만들어요. 종이 달력에 적힌 오프와 연차는 만든 뒤 칸에 넣을 수 있어요.
      </p>
      <ScheduleButton variant="brand" size="md" href={`/schedule/generate?ym=${yearMonth}`}>
        자동 생성으로 만들기
      </ScheduleButton>
    </div>
  );
}
