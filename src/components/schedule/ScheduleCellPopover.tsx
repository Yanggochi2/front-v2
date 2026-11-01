import type { EditableDutyCode } from "@/types/schedule.type";
import { DUTY_ORDER, DUTY_STYLE } from "./dutyStyle";

type Props = {
  top: number;
  left: number;
  above: boolean;
  problems?: string[]; // 이 칸에 걸린 위반 메시지
  onPick: (code: EditableDutyCode) => void;
};

// 화면 좌표(fixed)로 놓아 시트 스크롤 영역에 잘리지 않게 한다.
export default function ScheduleCellPopover({ top, left, above, problems, onPick }: Props) {
  return (
    <div
      role="dialog"
      aria-label="이 칸을 바꿀까요?"
      style={{ top, left }}
      className={`fixed z-50 flex flex-col gap-3 rounded-[22px] border border-line bg-white p-4 shadow-pop ${above ? "-translate-y-full" : ""}`}
    >
      <p className="text-[18px] font-bold text-ink">이 칸을 바꿀까요?</p>
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
        {DUTY_ORDER.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onPick(code)}
            className={`flex h-[52px] w-[66px] items-center justify-center rounded-[14px] border-2 ${DUTY_STYLE[code].cell} ${DUTY_STYLE[code].edge} text-[20px] transition-transform duration-100 hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgb(25_31_40/0.12)] active:translate-y-0`}
          >
            {DUTY_STYLE[code].weekLabel}
          </button>
        ))}
      </div>
      <p className="text-[14px] font-medium text-ink-sub">누르면 바로 바뀌고 자동 저장돼요</p>
    </div>
  );
}
