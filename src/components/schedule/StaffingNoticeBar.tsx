import ScheduleButton from "@/components/ui/ScheduleButton";

type Props = {
  shortageDays: number; // 하루 필요 인원을 못 채운 날 수. 0이면 인원 적정
  onClose: () => void;
};

// 자동 생성 직후 인원 적정성 알림 (11/17 미팅). 인원이 모자라면 규칙을 낮추는 대신 인원이 모자란다고 알린다.
export default function StaffingNoticeBar({ shortageDays, onClose }: Props) {
  const short = shortageDays > 0;
  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[16px] px-4 py-2.5 ring-1 ring-inset print:hidden ${
        short ? "bg-danger-soft ring-danger/20" : "bg-ok-soft ring-ok/20"
      }`}
    >
      <p className={`text-[17px] font-bold ${short ? "text-danger" : "text-ok"}`}>
        {short ? "이 인원으로는 근무가 돌아가지 않습니다" : "근무 인원 적정합니다"}
      </p>
      <p className="text-[16px] font-medium text-ink-sub">
        {short
          ? `${shortageDays}일은 하루 필요 인원을 채우지 못했어요. 간호사를 더 등록하거나 병동 설정의 하루 필요 인원을 확인해 주세요.`
          : "날마다 필요한 인원을 모두 채웠어요."}
      </p>
      <div className="ml-auto flex items-center gap-2">
        {short ? (
          <ScheduleButton variant="neutral" size="xs" href="/ward-settings">
            병동 설정
          </ScheduleButton>
        ) : null}
        <ScheduleButton variant="neutral" size="xs" onClick={onClose}>
          닫기
        </ScheduleButton>
      </div>
    </div>
  );
}
