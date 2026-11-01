import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import ScheduleToggle from "@/components/ui/ScheduleToggle";
import type { EditableDutyCode, ScheduleRowSort } from "@/types/schedule.type";
import { BRUSH_BG, BRUSH_RING, DUTY_ORDER, DUTY_STYLE } from "./dutyStyle";

type Props = {
  editable: boolean; // false면(확정·자동 생성 중·서버 연결 실패) 칸 바꾸기와 되돌리기를 막고 정렬·보기만 남긴다
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

// 되돌리기·다시 실행 아이콘 (글자 화살표 ↶↷는 글꼴마다 작고 어긋나 보여 선 아이콘으로 그린다)
function HistoryIcon({ redo = false }: { redo?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
      {redo ? (
        <>
          <path d="M15 14l5-5-5-5" />
          <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5 5.5 5.5 0 0 0 9.5 20H13" />
        </>
      ) : (
        <>
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10.5A5.5 5.5 0 0 1 20 14.5 5.5 5.5 0 0 1 14.5 20H11" />
        </>
      )}
    </svg>
  );
}

export default function ScheduleToolbar({
  editable,
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
              disabled={!editable}
              onClick={() => onBrushChange(active ? null : code)}
              className={`flex h-11 items-center gap-2 rounded-[12px] px-3.5 text-[16px] font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active
                  ? `${BRUSH_BG[code]} shadow-[0_2px_8px_rgb(25_31_40/0.12)] ring-2 ${BRUSH_RING[code]}`
                  : "border border-line bg-white text-ink-sub hover:border-grid hover:text-ink"
              } disabled:pointer-events-none disabled:opacity-40`}
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
          disabled={!editable || !canUndo}
          title="Ctrl+Z"
          className="flex h-11 items-center gap-1.5 rounded-[12px] px-3 text-[16px] font-medium text-ink-sub transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <HistoryIcon />
          되돌리기
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!editable || !canRedo}
          title="Ctrl+Y"
          className="flex h-11 items-center gap-1.5 rounded-[12px] px-3 text-[16px] font-medium text-ink-sub transition-colors hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        >
          <HistoryIcon redo />
          다시 실행
        </button>
        <span aria-hidden className="mx-1 h-6 w-px bg-line" />
        <ScheduleToggle checked={checkOnly} onChange={onCheckOnlyChange} label="확인 필요한 칸만 보기" />
      </div>
    </div>
  );
}
