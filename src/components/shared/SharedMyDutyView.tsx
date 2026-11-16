import SharedMyDutyCard from "@/components/shared/SharedMyDutyCard";
import ScheduleButton from "@/components/ui/ScheduleButton";
import ScheduleChip from "@/components/ui/ScheduleChip";
import type { SharedScheduleData } from "@/services/sharingApi";

// 확정·지난 근무표만 공유된다 (그 밖의 상태는 서버가 404)
const STATUS_LABEL: Partial<Record<SharedScheduleData["status"], string>> = {
  CONFIRMED: "확정",
  ARCHIVED: "지난 근무표",
};

// 공유 링크로 내 근무만 보는 화면. 이름을 넣으면 그 사람의 한 달을 달력으로 보여 준다 (보기 전용).
export default function SharedMyDutyView({ data, name }: { data: SharedScheduleData; name: string }) {
  const [year, month] = data.yearMonth.split("-").map(Number);
  const status = STATUS_LABEL[data.status];
  const searched = name !== "";

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto px-6 py-4">
      <p className="text-[22px] font-bold tracking-[-0.02em] text-ink">Ottugi</p>
      <section className="mx-auto flex w-full max-w-[960px] flex-col gap-6 rounded-[24px] border border-line bg-white p-7 shadow-card">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-[30px] leading-normal font-bold tracking-[-0.02em] text-ink">
            {year}년 {month}월 내 근무
          </h1>
          {status ? <ScheduleChip tone={data.status === "CONFIRMED" ? "brand" : "gray"}>{status}</ScheduleChip> : null}
        </div>

        <form role="search" method="get" action="" className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={name}
            maxLength={100}
            required
            aria-label="내 이름"
            placeholder="내 이름을 입력해 주세요"
            className="h-14 min-w-0 flex-1 rounded-[16px] bg-surface px-5 text-[18px] font-medium text-ink outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
          />
          <ScheduleButton type="submit" variant="brand" size="md">
            내 근무 보기
          </ScheduleButton>
        </form>

        {!searched ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-[22px] font-bold text-ink">이름을 입력하면 내 근무만 보여 드려요</p>
            <p className="text-[17px] font-medium text-ink-sub">성만 입력해도 찾을 수 있어요.</p>
          </div>
        ) : data.rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-[22px] font-bold text-ink">‘{name}’ 이름을 가진 사람이 없어요</p>
            <p className="text-[17px] font-medium text-ink-sub">이름을 다시 확인해 주세요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {data.rows.length > 1 ? (
              <p className="text-[17px] font-medium text-ink-sub">‘{name}’이(가) 들어간 사람이 {data.rows.length}명이에요. 내 이름을 찾아 보세요.</p>
            ) : null}
            {data.rows.map((row) => (
              <SharedMyDutyCard key={row.nurseKey} row={row} days={data.days} yearMonth={data.yearMonth} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-[15px] font-medium text-ink-mute">연차·교육은 휴무(O)로 보여요.</p>
          <ScheduleButton variant="neutral" size="xs" href="./">
            병동 전체 근무표 보기
          </ScheduleButton>
        </div>
      </section>
    </div>
  );
}
