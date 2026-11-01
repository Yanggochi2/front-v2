import type { DutyCode } from "@/types/schedule.type";
import { DUTY_STYLE } from "./dutyStyle";

const DUTIES: { code: DutyCode; name: string }[] = [
  { code: "D", name: "데이" },
  { code: "E", name: "이브닝" },
  { code: "N", name: "나이트" },
  { code: "O", name: "휴무" },
  { code: "AL", name: "연차" },
];

const BADGE = "rounded-full px-1 text-[11px] leading-tight font-bold text-white";

type Props = {
  isMonth: boolean; // 월간은 칸 표시가 짧다 (O·AL·희·C)
  canManage: boolean; // 빈 칸·규칙 위반 표시는 편집하는 수간호사에게만 보인다
  hasToday: boolean;
};

// 시트 아래 범례. 시트 칸과 같은 모양으로 그리고, 인쇄본에도 남긴다.
export default function ScheduleLegend({ isMonth, canManage, hasToday }: Props) {
  return (
    <ul aria-label="범례" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] font-medium text-ink-sub">
      {DUTIES.map(({ code, name }) => (
        <li key={code} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={`flex h-5 min-w-6 items-center justify-center rounded-[5px] px-1 text-[12px] leading-none ${DUTY_STYLE[code].cell} ${DUTY_STYLE[code].ring}`}
          >
            {isMonth ? DUTY_STYLE[code].monthLabel : DUTY_STYLE[code].weekLabel}
          </span>
          {name}
        </li>
      ))}
      <li aria-hidden className="h-4 w-px bg-line" />
      <li className="flex items-center gap-1.5">
        <span aria-hidden className={`${BADGE} bg-ink-sub`}>
          {isMonth ? "희" : "희망"}
        </span>
        승인된 희망 오프
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className={`${BADGE} bg-primary`}>
          {isMonth ? "C" : "차지"}
        </span>
        차지
      </li>
      {canManage ? (
        <>
          <li className="flex items-center gap-1.5 print:hidden">
            <span aria-hidden className="h-5 w-6 rounded-[5px] border border-dashed border-grid" />
            빈 칸
          </li>
          <li className="flex items-center gap-1.5 print:hidden">
            <span aria-hidden className="h-5 w-6 rounded-[5px] ring-2 ring-danger ring-inset" />
            규칙 위반
          </li>
        </>
      ) : null}
      {hasToday ? (
        <li className="flex items-center gap-1.5 print:hidden">
          <span aria-hidden className="size-4 rounded-full bg-primary" />
          오늘
        </li>
      ) : null}
    </ul>
  );
}
