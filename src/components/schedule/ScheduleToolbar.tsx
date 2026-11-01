import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import ScheduleToggle from "@/components/ui/ScheduleToggle";
import type { EditableDutyCode, ScheduleRowSort } from "@/types/schedule.type";
import { BRUSH_BG, BRUSH_RING, DUTY_ORDER, DUTY_STYLE } from "./dutyStyle";

type Props = {
  brush: EditableDutyCode | null;
  onBrushChange: (code: EditableDutyCode | null) => void;
  canUndo: boolean;
  onUndo: () => void;
  canRedo: boolean;
  onRedo: () => void;
  checkOnly: boolean;
  onCheckOnlyChange: (value: boolean) => void;
  sort: ScheduleRowSort;
  onSortChange: (value: ScheduleRowSort) => void;
};

// 숙련 그룹 묶음은 그대로 두고 묶음 안의 순서만 바꾼다. 기준은 lib/nurseSort.ts
const SORT_OPTIONS: { value: ScheduleRowSort; label: string }[] = [
  { value: "skill", label: "숙련도" },
  { value: "name", label: "이름" },
];

export default function ScheduleToolbar({
  brush,
  onBrushChange,
  canUndo,
  onUndo,
  canRedo,
  onRedo,
  checkOnly,
  onCheckOnlyChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="pr-1 text-[16px] font-bold text-ink">칸 바꾸기</p>
        {DUTY_ORDER.map((code) => {
          const active = brush === code;
          return (
            <button
              key={code}
              type="button"
              aria-pressed={active}
              onClick={() => onBrushChange(active ? null : code)}
              className={`flex h-11 items-center gap-2 rounded-[12px] px-3.5 text-[16px] font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active
                  ? `${BRUSH_BG[code]} shadow-[0_2px_8px_rgb(25_31_40/0.12)] ring-2 ${BRUSH_RING[code]}`
                  : "border border-line bg-white text-ink-sub hover:border-grid hover:text-ink"
              }`}
            >
              {/* 근무 색 견본: 시트 칸과 같은 색이라 눌러 둔 근무를 바로 알아본다 */}
              <span aria-hidden className={`size-4 rounded-[5px] border ${DUTY_STYLE[code].cell.split(" ")[0]} ${DUTY_STYLE[code].edge}`} />
              {DUTY_STYLE[code].brushLabel}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[16px] font-bold text-ink">정렬</p>
          <ScheduleSegmented options={SORT_OPTIONS} value={sort} onChange={onSortChange} ariaLabel="간호사 정렬" />
        </div>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Ctrl+Z"
          className="flex h-11 items-center rounded-[12px] px-3 text-[16px] font-medium text-ink-sub transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          ↶ 되돌리기
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Ctrl+Y"
          className="flex h-11 items-center rounded-[12px] px-3 text-[16px] font-medium text-ink-sub transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          ↷ 다시 실행
        </button>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <ScheduleToggle checked={checkOnly} onChange={onCheckOnlyChange} label="확인 필요한 칸만 보기" />
      </div>
    </div>
  );
}
