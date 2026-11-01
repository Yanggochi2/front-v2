import type { DutyCode, EditableDutyCode } from "@/types/schedule.type";
import { DUTY_ORDER, DUTY_STYLE } from "./dutyStyle";

type Props = {
  top: number;
  left: number;
  above: boolean;
  title: string; // 어느 칸인지 (예: 김서연 · 11월 12일 (목))
  current: DutyCode | null; // 지금 들어 있는 근무
  problems?: string[]; // 이 칸에 걸린 위반 메시지
  onPick: (code: EditableDutyCode) => void;
};

// 화면 좌표(fixed)로 놓아 시트 스크롤 영역에 잘리지 않게 한다.
// D·E·N·O 키로 고르는 것은 ScheduleSheet에서 받는다.
export default function ScheduleCellPopover({ top, left, above, title, current, problems, onPick }: Props) {
  return (
    <div
      role="dialog"
      aria-label={`${title} 근무 바꾸기`}
      style={{ top, left }}
      className={`fixed z-50 flex flex-col gap-3 rounded-[22px] border border-line bg-white p-4 shadow-pop ${above ? "-translate-y-full" : ""}`}
    >
      <div>
        <p className="text-[18px] font-bold text-ink">{title}</p>
        <p className="text-[14px] font-medium text-ink-sub">어떤 근무로 바꿀까요?</p>
      </div>
      {problems?.length ? (
        <ul className="flex max-w-[354px] flex-col gap-1 rounded-[12px] bg-danger-soft px-3 py-2">
          {problems.map((m) => (
            <li key={m} className="text-[15px] font-bold text-danger">
              · {m}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-1.5">
        {DUTY_ORDER.map((code) => {
          const now = current === code;
          return (
            <button
              key={code}
              type="button"
              aria-pressed={now}
              onClick={() => onPick(code)}
              className={`relative flex h-[52px] w-[66px] items-center justify-center rounded-[14px] border-2 ${DUTY_STYLE[code].cell} ${DUTY_STYLE[code].edge} text-[20px] transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgb(25_31_40/0.12)] active:translate-y-0 ${
                now ? "ring-2 ring-ink ring-offset-2" : ""
              }`}
            >
              {DUTY_STYLE[code].weekLabel}
              {now ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-1.5 text-[11px] leading-[16px] font-bold whitespace-nowrap text-white">
                  지금
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="text-[14px] font-medium text-ink-sub">누르면 바로 저장돼요 · 키보드 D·E·N·O로도 고를 수 있어요</p>
    </div>
  );
}
