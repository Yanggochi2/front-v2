import ScheduleChip from "@/components/ui/ScheduleChip";
import type { CoverageDuty, CoverageStatus, ScheduleDay, ScheduleRow, ScheduleView } from "@/types/schedule.type";
import { DUTY_STYLE } from "./dutyStyle";

export type GridRow = { row: ScheduleRow; index: number };

type Props = {
  view: ScheduleView;
  days: ScheduleDay[];
  rows: GridRow[];
  coverage: CoverageStatus[] | null;
  selected: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number, el: HTMLElement) => void; // 없으면 보기 전용
  onScroll: () => void;
};

const DAY_TEXT = { default: "text-ink", sat: "text-brand", sun: "text-danger", holiday: "text-danger" } as const;
const WEEKDAY_TEXT = { default: "text-ink-sub", sat: "text-brand", sun: "text-danger", holiday: "text-danger" } as const;
// 토·일·공휴일 열을 본문에서도 구분하도록 머리글과 근무가 없는 칸에 옅은 배경을 깐다.
// 빈 칸은 근무 색(N 연보라·E 연주황)과 헷갈리지 않게 30%로 아주 옅게. 하단 인원 행은 인원 칩이 잘 보이도록 흰색 그대로.
const HEAD_BG = { default: "bg-canvas", sat: "bg-brand-soft", sun: "bg-danger-soft", holiday: "bg-danger-soft" } as const;
const EMPTY_BG = { default: "bg-white", sat: "bg-brand-soft/30", sun: "bg-danger-soft/30", holiday: "bg-danger-soft/30" } as const;

// 하단 인원 행. 세로 스크롤에도 보이도록 아래에서부터 쌓아 고정한다 (행 높이 h-11).
const COVERAGE_ROWS: { duty: CoverageDuty; bottom: string }[] = [
  { duty: "D", bottom: "bottom-22" },
  { duty: "E", bottom: "bottom-11" },
  { duty: "N", bottom: "bottom-0" },
];

// 숙련 그룹이 시작되는 행에 그룹 이름과 굵은 윗선을 단다.
// 표가 영역 높이에 맞춰 행을 늘리므로 구분용 행을 따로 넣지 않는다.
function groupStarts(rows: GridRow[]): Map<number, { name: string; count: number }> {
  const starts = new Map<number, { name: string; count: number }>();
  let current: { name: string; count: number } | null = null;
  rows.forEach(({ row }, i) => {
    if (!row.group) {
      current = null;
      return;
    }
    if (current && i > 0 && rows[i - 1].row.group === row.group) {
      current.count += 1;
      return;
    }
    current = { name: row.group, count: 1 };
    starts.set(i, current);
  });
  return starts;
}

export default function ScheduleGrid({ view, days, rows, coverage, selected, onCellClick, onScroll }: Props) {
  const isMonth = view === "month";
  const nameW = isMonth ? "w-[112px]" : "w-[151px]";
  // 월간: 28~30명이 24인치 한 화면에 들어오도록 최소 높이만 정하고, 남는 높이는 표(h-full)가 행에 나눠 준다.
  const rowH = isMonth ? "h-7 print:h-6" : "h-10";
  const headH = "h-12";
  const starts = groupStarts(rows);

  return (
    <div onScroll={onScroll} className="absolute inset-0 overflow-auto rounded-[16px] border border-line print:static print:overflow-visible print:rounded-none">
      {/* 시트 전체가 화면 안에 들어오도록 표를 영역 크기에 맞춘다. 영역이 너무 작을 때만 안에서 스크롤한다. */}
      <table className="h-full w-full table-fixed border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              scope="col"
              className={`sticky top-0 left-0 z-30 border-r border-b border-line bg-canvas pl-4 text-left text-[17px] font-bold text-ink-sub ${nameW} ${headH} ${isMonth ? "text-center pl-0" : ""}`}
            >
              이름
            </th>
            {days.map((d) => (
              <th
                key={d.date}
                scope="col"
                title={d.holidayName}
                className={`sticky top-0 z-20 border-r border-b border-line p-0 font-normal ${headH} ${d.isToday ? "bg-primary-soft" : HEAD_BG[d.tone]}`}
              >
                <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
                  {/* 주간 보기는 칸이 넓어 요일 자리에 공휴일 이름을 쓴다. 월간은 색으로만 구분하고 이름은 title로 */}
                  <span className={`max-w-full truncate px-1 text-[15px] font-medium ${WEEKDAY_TEXT[d.tone]}`}>
                    {d.holidayName && !isMonth ? `${d.weekday} · ${d.holidayName}` : d.weekday}
                  </span>
                  {/* 오늘은 날짜를 버건디 원으로 표시한다 */}
                  <span
                    className={`flex items-center justify-center rounded-full font-bold ${isMonth ? "size-7 text-[18px]" : "size-8 text-[20px]"} ${
                      d.isToday ? "bg-primary text-white" : DAY_TEXT[d.tone]
                    }`}
                  >
                    {d.date}
                  </span>
                </div>
              </th>
            ))}
            {isMonth ? (
              <th scope="col" className={`sticky top-0 right-0 z-30 w-[72px] border-b border-line bg-canvas text-[16px] font-bold text-ink-sub ${headH}`}>
                OFF 수
              </th>
            ) : (
              <th scope="col" className="w-[112px] border-b border-transparent bg-white" aria-label="확인 필요" />
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, index }, i) => {
            const start = starts.get(i);
            const groupTop = start ? "border-t-2 border-t-primary" : "";
            return (
              <tr key={row.nurseKey} className="group">
                <th
                  scope="row"
                  className={`sticky left-0 z-10 border-r border-b border-line bg-white text-left leading-tight text-[20px] font-bold text-ink transition-colors group-hover:bg-primary-soft ${nameW} ${rowH} ${groupTop} pl-4`}
                >
                  {start ? (
                    <span className={`mb-0.5 block w-fit rounded-full bg-primary-soft px-1.5 leading-tight font-bold text-primary ${isMonth ? "text-[11px]" : "text-[13px]"}`}>
                      {start.name} · {start.count}명
                    </span>
                  ) : null}
                  {row.name}
                </th>
                {row.cells.map((cell, col) => {
                  const isSelected = selected?.row === index && selected.col === col;
                  const style = cell.duty ? DUTY_STYLE[cell.duty] : null;
                  const label = style ? (isMonth ? style.monthLabel : style.weekLabel) : "";
                  const labelSize = isMonth ? (cell.duty === "AL" || cell.duty === "ED" ? "text-[15px]" : "text-[20px]") : cell.duty === "AL" || cell.duty === "ED" ? "text-[18px]" : "text-[22px]";
                  return (
                    <td key={col} title={cell.violations?.join("\n")} className={`relative border-r border-b border-line p-[2px] ${rowH} ${groupTop} ${EMPTY_BG[days[col].tone]}`}>
                      <button
                        type="button"
                        disabled={!onCellClick || cell.editable === false}
                        onClick={(e) => onCellClick?.(index, col, e.currentTarget)}
                        aria-label={`${row.name} ${days[col].date}일 ${label || "미배정"}${cell.charge ? " 차지" : ""}${cell.approvedOff ? " 희망 오프" : ""}`}
                        className={`flex size-full items-center justify-center leading-none transition-[filter,background-color] duration-100 enabled:cursor-pointer disabled:cursor-default ${isMonth ? "rounded-[6px]" : "rounded-[10px]"} ${style ? `${style.cell} enabled:hover:brightness-95` : "text-ink enabled:hover:bg-surface"} ${labelSize}`}
                      >
                        {label}
                      </button>
                      {cell.approvedOff ? (
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute top-[3px] left-[3px] rounded-full bg-ink-sub px-1 leading-tight font-bold text-white ${isMonth ? "text-[10px]" : "text-[12px]"}`}
                        >
                          {isMonth ? "희" : "희망"}
                        </span>
                      ) : null}
                      {cell.charge ? (
                        <span
                          aria-hidden
                          className={`pointer-events-none absolute top-[3px] right-[3px] rounded-full bg-primary px-1 leading-tight font-bold text-white ${isMonth ? "text-[10px]" : "text-[12px]"}`}
                        >
                          {isMonth ? "C" : "차지"}
                        </span>
                      ) : null}
                      {cell.flag === "violation" ? (
                        <span aria-hidden className={`pointer-events-none absolute inset-px ring-[3px] ring-danger ring-inset ${isMonth ? "rounded-[7px]" : "rounded-[11px]"}`} />
                      ) : null}
                      {isSelected ? (
                        <span aria-hidden className={`pointer-events-none absolute inset-px ring-[3px] ring-primary ring-inset ${isMonth ? "rounded-[7px]" : "rounded-[11px]"}`} />
                      ) : null}
                    </td>
                  );
                })}
                {isMonth ? (
                  <td className={`sticky right-0 z-10 border-b border-line bg-white text-center text-[20px] leading-none font-bold text-ink-sub transition-colors group-hover:bg-primary-soft ${rowH} ${groupTop}`}>
                    {row.cells.filter((c) => c.duty === "O").length}
                  </td>
                ) : (
                  <td className={`pl-4 ${rowH}`}>
                    {row.needsCheck ? <ScheduleChip tone="danger" shape="square">확인 필요</ScheduleChip> : null}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        {coverage ? (
          <tfoot>
            {COVERAGE_ROWS.map(({ duty, bottom }) => (
              <tr key={duty}>
                <th
                  scope="row"
                  className={`sticky left-0 z-20 h-11 border-r border-b border-line bg-canvas pl-4 text-left text-[16px] font-bold text-ink-sub ${bottom} ${duty === "D" ? "border-t-2 border-t-grid" : ""}`}
                >
                  {duty} 인원
                </th>
                {coverage.map((c, i) => {
                  const count = c.counts[duty];
                  return (
                    <td key={days[i].date} className={`sticky z-10 h-11 border-r border-b border-line bg-white text-center ${bottom} ${duty === "D" ? "border-t-2 border-t-grid" : ""}`}>
                      {count ? (
                        <ScheduleChip tone={count.actual < count.required ? "danger" : "ok"} shape="square">
                          {count.actual}/{count.required}
                        </ScheduleChip>
                      ) : (
                        <span className="text-[15px] text-ink-faint">-</span>
                      )}
                    </td>
                  );
                })}
                <td className={`sticky border-b border-line bg-white ${bottom} ${duty === "D" ? "border-t-2 border-t-grid" : ""}`} />
              </tr>
            ))}
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
