import ScheduleButton from "@/components/ui/ScheduleButton";

export default function ScheduleErrorState({ retryHref }: { retryHref: string }) {
  return (
    <div role="alert" className="flex w-full flex-col items-center gap-4 rounded-[28px] border border-line bg-white px-10 shadow-card py-[72px] text-center">
      <p className="text-[26px] font-bold text-ink">불러오지 못했어요</p>
      <p className="text-[18px] font-medium text-ink-sub">잠시 후 다시 시도해 주세요.</p>
      <ScheduleButton variant="brand" size="md" href={retryHref}>
        다시 시도
      </ScheduleButton>
    </div>
  );
}
