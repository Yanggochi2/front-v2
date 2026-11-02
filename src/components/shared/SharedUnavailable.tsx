import ScheduleButton from "@/components/ui/ScheduleButton";

const COPY = {
  gone: {
    title: "이 공유 링크는 더 이상 열리지 않아요",
    description: "수간호사가 링크를 새로 만들었거나 공유를 껐어요. 새 링크를 받아 주세요.",
  },
  error: {
    title: "근무표를 불러오지 못했어요",
    description: "잠시 후 다시 시도해 주세요.",
  },
} as const;

// 공유 링크로 근무표를 볼 수 없을 때
export default function SharedUnavailable({ reason, retryHref }: { reason: keyof typeof COPY; retryHref: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[18px] px-6 text-center">
      <p className="text-[26px] font-bold text-ink">{COPY[reason].title}</p>
      <p className="max-w-[560px] text-[18px] font-medium text-ink-sub">{COPY[reason].description}</p>
      {reason === "error" ? (
        <ScheduleButton variant="brand" size="md" href={retryHref}>
          다시 시도
        </ScheduleButton>
      ) : null}
    </div>
  );
}
