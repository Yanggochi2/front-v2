import ScheduleButton from "@/components/ui/ScheduleButton";

type Props = {
  count: number; // 지금 고른 칸 수
  busy: boolean;
  error: string | null;
  onSubmit: () => void;
  onClear: () => void;
  onClose: () => void;
};

// 골라서 다시 짜기 막대 (11/16 미팅 "바꾸고 싶은 칸만 지정해서 재생성"). 근무표 아래 안내 줄 자리에 둔다.
// 칸을 눌러(끌어서) 고르고 → 고른 칸만 자동으로 다시 짠다. 나머지 근무는 그대로 두고, 빈 칸이 있으면 함께 채운다.
export default function PartialRegenBar({ count, busy, error, onSubmit, onClear, onClose }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[16px] bg-primary-soft px-3 py-2 ring-1 ring-primary/20 ring-inset print:hidden">
      {error ? (
        <p role="alert" className="text-[16px] font-bold text-danger">
          {error}
        </p>
      ) : (
        <p className="text-[16px] font-bold text-primary">
          {busy
            ? "고른 칸을 다시 짜고 있어요. 1분쯤 걸릴 수 있어요"
            : count > 0
              ? `${count}칸 골랐어요. 나머지 근무는 그대로 둬요`
              : "다시 짤 칸을 누르거나 끌어서 골라 주세요. 연차·교육 칸은 바뀌지 않아요"}
        </p>
      )}
      <div className="ml-auto flex items-center gap-2">
        {count > 0 ? (
          <ScheduleButton variant="neutral" size="xs" onClick={onClear} disabled={busy}>
            고른 칸 풀기
          </ScheduleButton>
        ) : null}
        <ScheduleButton variant="neutral" size="xs" onClick={onClose} disabled={busy}>
          그만하기
        </ScheduleButton>
        <ScheduleButton variant="primary" size="xs" disabled={busy || count === 0} onClick={onSubmit}>
          {busy ? "다시 짜는 중…" : count > 0 ? `${count}칸만 다시 짜기` : "고른 칸만 다시 짜기"}
        </ScheduleButton>
      </div>
    </div>
  );
}
