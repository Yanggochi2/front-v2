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
  spotCol?: number | null; // 위반 목록에서 고른 날. 그 열을 옅은 빨강으로 짚어 준다
  painting?: boolean; // 칸 바꾸기(브러시)를 고른 상태. 누르면 바로 바뀌는 칸임을 커서로 알린다
  onCellClick?: (row: number, col: number, el: HTMLElement) => void; // 없으면 보기 전용
  onScroll: () => void;
};

const DAY_TEXT = { default: "text-ink", sat: "text-brand", sun: "text-danger", holiday: "text-danger" } as const;
const WEEKDAY_TEXT = { default: "text-ink-sub", sat: "text-brand", sun: "text-danger", holiday: "text-danger" } as const;
// 토·일·공휴일 열을 본문에서도 구분하도록 머리글과 근무가 없는 칸에 옅은 배경을 깐다.
// 빈 칸은 근무 색(N 연보라·E 연주황)과 헷갈리지 않게 30%로 아주 옅게. 하단 인원 행은 인원 칩이 잘 보이도록 흰색 그대로.
const HEAD_BG = { default: "bg-canvas", sat: "bg-brand-soft", sun: "bg-danger-soft", holiday: "bg-danger-soft" } as const;
const EMPTY_BG = { default: "bg-white", sat: "bg-brand-soft/30", sun: "bg-danger-soft/30", holiday: "bg-danger-soft/30" } as const;

// 표가 영역 높이에 맞춰 행을 늘릴 때 한 행이 커질 수 있는 최대 높이(px). 이름 머리·인원 행 높이와 함께
// 표 높이를 정해, "확인 필요한 칸만 보기"처럼 행이 적을 때 몇 줄이 화면 가득 늘어나지 않게 한다.
const MAX_ROW_PX = { month: 40, week: 56 } as const;
const HEAD_PX = 48;
// 하단 인원 행 높이. 월간은 30명과 함께 한 화면에 들어오도록 낮게 둔다.
const COVERAGE_ROW_PX = { month: 26, week: 40 } as const;
const COVERAGE_ROW_H = { month: "h-[26px]", week: "h-10" } as const;

// 하단 인원 행. 세로 스크롤에도 보이도록 아래에서부터 쌓아 고정한다 (bottom = 아래 행 높이의 합).
const COVERAGE_ROWS: { duty: CoverageDuty; bottom: Record<ScheduleView, string> }[] = [
  { duty: "D", bottom: { month: "bottom-[52px]", week: "bottom-20" } },
  { duty: "E", bottom: { month: "bottom-[26px]", week: "bottom-10" } },
  { duty: "N", bottom: { month: "bottom-0", week: "bottom-0" } },
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

export default function ScheduleGrid({ view, days, rows, coverage, selected, spotCol = null, painting = false, onCellClick, onScroll }: Props) {
  const isMonth = view === "month";
  const nameW = isMonth ? "w-[112px]" : "w-[151px]";
  // 월간: 28~30명이(수간호사 화면은 하단 인원 행까지) 24인치(브라우저 창 높이 약 940px) 한 화면에 들어오도록 최소 높이만 정하고,
  // 남는 높이는 표가 영역 높이까지(행당 MAX_ROW_PX 이하로) 행에 나눠 준다. 주간은 넉넉한 높이로 두고 넘치면 안에서 스크롤한다.
  const rowH = isMonth ? (coverage ? "h-[27px] print:h-6" : "h-7 print:h-6") : "h-10";
  // 칸 안의 근무 타일. 월간은 칸을 거의 채우고, 주간은 넓은 칸 가운데에 알약 모양으로 둔다.
  const tile = isMonth
    ? { pad: "p-[3px]", radius: "rounded-[6px]", shape: "w-full" }
    : { pad: "p-1", radius: "rounded-[10px]", shape: "w-full max-w-[148px]" };
  const headH = "h-12";
  const starts = groupStarts(rows);
  const tableMaxPx = HEAD_PX + (coverage ? COVERAGE_ROWS.length * COVERAGE_ROW_PX[view] : 0) + rows.length * MAX_ROW_PX[view];

  return (
    <div onScroll={onScroll} className="absolute inset-0 overflow-auto rounded-[16px] border border-line print:static print:overflow-visible print:rounded-none">
      {/* 시트 전체가 화면 안에 들어오도록 표를 영역 크기에 맞춘다. 영역이 너무 작을 때만 안에서 스크롤한다. */}
      <table style={{ height: `min(100%, ${tableMaxPx}px)` }} className="w-full table-fixed border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              scope="col"
              className={`sticky top-0 left-0 z-30 border-r border-b border-line bg-canvas pl-4 text-left text-[17px] font-bold text-ink-sub ${nameW} ${headH} ${isMonth ? "text-center pl-0" : ""}`}
            >
              이름
            </th>
            {days.map((d, i) => (
              <th
                key={d.date}
                scope="col"
                title={d.holidayName}
                className={`sticky top-0 z-20 border-r border-b border-line p-0 font-normal transition-colors ${headH} ${
                  spotCol === i ? "bg-danger-soft shadow-[inset_0_-3px_0_var(--color-danger)]" : d.isToday ? "bg-primary-soft" : HEAD_BG[d.tone]
                }`}
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
                  const editable = !!onCellClick && cell.editable !== false;
                  const day = days[col];
                  const style = cell.duty ? DUTY_STYLE[cell.duty] : null;
                  const label = style ? (isMonth ? style.monthLabel : style.weekLabel) : "";
                  const labelSize = isMonth ? (cell.duty === "AL" || cell.duty === "ED" ? "text-[15px]" : "text-[20px]") : cell.duty === "AL" || cell.duty === "ED" ? "text-[18px]" : "text-[22px]";
                  return (
                    <td
                      key={col}
                      title={cell.violations?.join("\n")}
                      className={`relative border-r border-b border-line transition-colors ${tile.pad} ${rowH} ${groupTop} ${
                        spotCol === col
                          ? "bg-danger-soft"
                          : day.isToday
                            ? "bg-primary-soft"
                            : `${EMPTY_BG[day.tone]} group-hover:bg-primary-soft/40`
                      }`}
                    >
                      <button
                        type="button"
                        disabled={!editable}
                        data-cell={`${index}:${col}`}
                        onClick={(e) => onCellClick?.(index, col, e.currentTarget)}
                        aria-label={`${row.name} ${day.date}일 ${label || "미배정"}${cell.charge ? " 차지" : ""}${cell.approvedOff ? " 희망 오프" : ""}`}
                        className={`group/cell flex size-full items-center justify-center focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default ${
                          painting ? "enabled:cursor-crosshair" : "enabled:cursor-pointer"
                        } ${tile.radius}`}
                      >
                        {/* 빈 칸(미배정)은 고칠 수 있을 때만 점선 타일로 보여 준다. 소속 기간 밖처럼 못 고치는 칸은 비워 둔다. */}
                        <span
                          className={`relative flex h-full items-center justify-center gap-1.5 leading-none transition-[filter,background-color,border-color] duration-100 ${tile.shape} ${tile.radius} ${labelSize} ${
                            style
                              ? `${style.cell} ${style.ring} ${editable ? "group-hover/cell:brightness-95" : ""}`
                              : editable
                                ? "border border-dashed border-grid text-ink group-hover/cell:border-primary group-hover/cell:bg-primary-soft"
                                : "text-ink"
                          }`}
                        >
                          {label}
                          {/* 주간은 희망·차지 표시를 타일 안에 글자로 붙인다 */}
                          {!isMonth && cell.approvedOff ? (
                            <span aria-hidden className="rounded-full bg-ink-sub px-1.5 py-0.5 text-[12px] leading-tight font-bold text-white">
                              희망
                            </span>
                          ) : null}
                          {!isMonth && cell.charge ? (
                            <span aria-hidden className="rounded-full bg-primary px-1.5 py-0.5 text-[12px] leading-tight font-bold text-white">
                              차지
                            </span>
                          ) : null}
                          {cell.flag === "violation" ? (
                            <span aria-hidden className="pointer-events-none absolute -inset-px rounded-[inherit] ring-[3px] ring-danger ring-inset" />
                          ) : null}
                          {isSelected ? (
                            <span aria-hidden className="pointer-events-none absolute -inset-px rounded-[inherit] ring-[3px] ring-primary ring-inset" />
                          ) : null}
                        </span>
                      </button>
                      {/* 월간은 칸이 좁아 희·C 표시를 타일 모서리에 얹는다 */}
                      {isMonth && cell.approvedOff ? (
                        <span aria-hidden className="pointer-events-none absolute top-1 left-1 rounded-full bg-ink-sub px-1 text-[10px] leading-tight font-bold text-white">
                          희
                        </span>
                      ) : null}
                      {isMonth && cell.charge ? (
                        <span aria-hidden className="pointer-events-none absolute top-1 right-1 rounded-full bg-primary px-1 text-[10px] leading-tight font-bold text-white">
                          C
                        </span>
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
            {COVERAGE_ROWS.map(({ duty, bottom }) => {
              const rowCls = `${COVERAGE_ROW_H[view]} ${bottom[view]} ${duty === "D" ? "border-t-2 border-t-grid" : ""}`;
              return (
                <tr key={duty}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-20 border-r border-b border-line bg-canvas pl-4 text-left font-bold text-ink-sub ${isMonth ? "text-[15px]" : "text-[16px]"} ${rowCls}`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={`${isMonth ? "size-3" : "size-3.5"} rounded-[4px] ${DUTY_STYLE[duty].cell.split(" ")[0]} ${DUTY_STYLE[duty].ring}`} />
                      {duty} 인원
                    </span>
                  </th>
                  {coverage.map((c, i) => {
                    const count = c.counts[duty];
                    const short = !!count && count.actual < count.required;
                    return (
                      <td
                        key={days[i].date}
                        title={count ? `${duty} ${count.actual}명 / 필요 ${count.required}명` : undefined}
                        className={`sticky z-10 border-r border-b border-line text-center transition-colors ${rowCls} ${
                          spotCol === i ? "bg-danger-soft" : days[i].isToday ? "bg-primary-soft" : "bg-white"
                        }`}
                      >
                        {!count ? (
                          <span className="text-[15px] text-ink-faint">-</span>
                        ) : isMonth ? (
                          // 월간은 칸이 좁고 행이 낮아 칩 대신 숫자만. 모자란 날만 빨간 바탕으로 띄운다.
                          <span
                            className={`inline-block rounded-[6px] px-1.5 text-[15px] leading-[20px] font-bold ${
                              short ? "bg-danger-soft text-danger ring-1 ring-danger/25 ring-inset" : "text-ink-mute"
                            }`}
                          >
                            {count.actual}/{count.required}
                          </span>
                        ) : (
                          <ScheduleChip tone={short ? "danger" : "gray"} shape="square">
                            {count.actual}/{count.required}
                          </ScheduleChip>
                        )}
                      </td>
                    );
                  })}
                  <td className={`sticky border-b border-line bg-white ${isMonth ? "right-0 z-20" : ""} ${rowCls}`} />
                </tr>
              );
            })}
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
