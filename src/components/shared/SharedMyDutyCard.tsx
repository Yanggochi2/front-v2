import { DUTY_STYLE } from "@/components/schedule/dutyStyle";
import ScheduleChip from "@/components/ui/ScheduleChip";
import type { DutyCode, ScheduleDay, ScheduleRow } from "@/types/schedule.type";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
const WEEKDAY_TONE = ["text-ink-sub", "text-ink-sub", "text-ink-sub", "text-ink-sub", "text-ink-sub", "text-brand", "text-danger"];
const DATE_TONE = { default: "text-ink", sat: "text-brand", sun: "text-danger", holiday: "text-danger" } as const;

const ROLE_LABEL: Record<string, string> = { HEAD_NURSE: "수간호사" };
const DUTY_ROLE_LABEL: Record<string, string> = { CHARGE: "차지" };

// 요약에 세는 근무. 연차·교육은 공유 화면에서 O로 오므로 OFF에 들어간다.
const SUMMARY: { label: string; codes: DutyCode[]; code: DutyCode }[] = [
  { label: "데이", codes: ["D"], code: "D" },
  { label: "이브닝", codes: ["E"], code: "E" },
  { label: "나이트", codes: ["N"], code: "N" },
  { label: "OFF", codes: ["O", "AL", "ED"], code: "O" },
];

// 한 사람의 한 달 근무 카드: 요약 + 월~일 달력. days와 row.cells는 같은 순서(그 달 1일부터)다.
export default function SharedMyDutyCard({ row, days, yearMonth }: { row: ScheduleRow; days: ScheduleDay[]; yearMonth: string }) {
  const [year, month] = yearMonth.split("-").map(Number);
  // 1일이 월요일부터 며칠째 칸인지 (월=0 … 일=6)
  const lead = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const badge = (row.role && ROLE_LABEL[row.role]) ?? (row.dutyRole && DUTY_ROLE_LABEL[row.dutyRole]) ?? null;

  return (
    <article aria-label={`${row.name} 근무`} className="flex flex-col gap-4 rounded-[20px] border border-line bg-canvas p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-ink">{row.name}</h2>
        {badge ? <ScheduleChip tone="brand">{badge}</ScheduleChip> : null}
        <ul aria-label="이번 달 근무 일수" className="ml-auto flex flex-wrap items-center gap-2">
          {SUMMARY.map(({ label, codes, code }) => {
            const count = row.cells.filter((c) => c.duty !== null && codes.includes(c.duty)).length;
            return (
              <li key={label} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line ring-inset">
                <span aria-hidden className={`flex h-6 min-w-7 items-center justify-center rounded-[6px] px-1 text-[13px] leading-none ${DUTY_STYLE[code].cell}`}>
                  {DUTY_STYLE[code].monthLabel}
                </span>
                <span className="text-[16px] font-bold text-ink">
                  {label} {count}일
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div role="grid" aria-label={`${row.name} ${month}월 달력`} className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <p key={w} role="columnheader" className={`py-1 text-center text-[16px] font-bold ${WEEKDAY_TONE[i]}`}>
            {w}
          </p>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <div key={`lead-${i}`} aria-hidden />
        ))}
        {days.map((day, i) => {
          const duty = row.cells[i]?.duty ?? null;
          return (
            <div
              key={day.date}
              role="gridcell"
              className={`flex min-h-[86px] flex-col gap-1.5 rounded-[14px] p-2 ring-1 ring-inset ${day.isToday ? "bg-primary-soft ring-primary/30" : "bg-white ring-line"}`}
            >
              <span
                className={
                  day.isToday
                    ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white"
                    : `flex h-7 w-7 items-center justify-center text-[15px] font-bold ${DATE_TONE[day.tone]}`
                }
              >
                {day.date}
              </span>
              {duty ? (
                <span className={`flex h-10 items-center justify-center rounded-[10px] text-[18px] ${DUTY_STYLE[duty].cell}`}>{DUTY_STYLE[duty].weekLabel}</span>
              ) : (
                <span className="flex h-10 items-center justify-center text-[16px] font-medium text-ink-faint">-</span>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
