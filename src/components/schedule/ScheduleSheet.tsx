"use client";

import Link from "next/link";
import { movePeriod, scheduleHref } from "@/lib/schedulePeriod";
import { useCallback, useEffect, useMemo, useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import ScheduleChip from "@/components/ui/ScheduleChip";
import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import { useGenerationStart } from "@/hooks/useGenerationStart";
import { useScheduleEditor } from "@/hooks/useScheduleEditor";
import { compareNurses } from "@/lib/nurseSort";
import type { EditableDutyCode, ScheduleRowSort, ScheduleSheetData, ScheduleView } from "@/types/schedule.type";
import type { ScheduleStatus } from "@/types/scheduleApi.type";
import ScheduleBottomBar from "./ScheduleBottomBar";
import ScheduleCellPopover from "./ScheduleCellPopover";
import ScheduleGrid from "./ScheduleGrid";
import ScheduleShareButtons from "./ScheduleShareButtons";
import ScheduleToolbar from "./ScheduleToolbar";

type Popover = { row: number; col: number; top: number; left: number; above: boolean };

const POPOVER_WIDTH = 386;
const POPOVER_HEIGHT = 170;
// 위반 메시지 한 줄당 늘어나는 팝오버 높이 (위/아래 배치 계산용)
const POPOVER_PROBLEM_LINE = 26;


// 제목 옆 근무표 상태 표시 (수간호사 화면)
const STATUS_CHIP: Record<ScheduleStatus, { label: string; tone: "gray" | "brand" }> = {
  DRAFT: { label: "작성 중", tone: "gray" },
  GENERATING: { label: "자동 생성 중", tone: "brand" },
  CONFIRMED: { label: "확정", tone: "brand" },
  ARCHIVED: { label: "지난 근무표", tone: "gray" },
};

// canManage: 수간호사만 true. 간호사는 확정된 근무표를 보기만 하므로 편집 도구와 확정 버튼을 숨긴다.
export default function ScheduleSheet({ sheet, canManage = true }: { sheet: ScheduleSheetData; canManage?: boolean }) {
  const editor = useScheduleEditor(sheet);
  const { rows, setDuty } = editor;
  const [brush, setBrush] = useState<EditableDutyCode | null>(null);
  const [checkOnly, setCheckOnly] = useState(false);
  const [sort, setSort] = useState<ScheduleRowSort>("skill");
  const [popover, setPopover] = useState<Popover | null>(null);
  const [showEmptyGuide, setShowEmptyGuide] = useState(canManage && sheet.unassigned);
  const generation = useGenerationStart();
  const api = sheet.api;

  const closePopover = useCallback(() => setPopover(null), []);

  useEffect(() => {
    if (!popover) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePopover();
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('[role="dialog"], table button')) closePopover();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", closePopover);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", closePopover);
    };
  }, [popover, closePopover]);

  function handleCellClick(row: number, col: number, el: HTMLElement) {
    if (brush) {
      setDuty(row, col, brush);
      closePopover();
      return;
    }
    // 화면 비율(zoom)이 걸려 있어도 위치가 맞도록, 화면 기준 좌표를 비율로 나눠 쓴다.
    const rect = el.getBoundingClientRect();
    const f = el.offsetWidth ? rect.width / el.offsetWidth : 1;
    const height = POPOVER_HEIGHT + (rows[row].cells[col].violations?.length ?? 0) * POPOVER_PROBLEM_LINE;
    const above = rect.bottom + (8 + height) * f > window.innerHeight;
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - (POPOVER_WIDTH * f) / 2, window.innerWidth - (POPOVER_WIDTH + 8) * f));
    setPopover({ row, col, left: left / f, above, top: (above ? rect.top - 8 * f : rect.bottom + 8 * f) / f });
  }

  const gridRows = useMemo(() => {
    const all = rows.map((row, index) => ({ row, index }));
    // 숙련 그룹 묶음(서버 순서대로 붙어 있음)은 유지하고 묶음 안에서만 정렬한다.
    const groupOrder = [...new Set(rows.map((r) => r.group))];
    all.sort(
      (a, b) =>
        groupOrder.indexOf(a.row.group) - groupOrder.indexOf(b.row.group) ||
        compareNurses(sort, a.row, b.row),
    );
    return checkOnly ? all.filter(({ row }) => row.needsCheck || row.cells.some((c) => c.flag)) : all;
  }, [rows, checkOnly, sort]);

  const isMonth = sheet.view === "month";
  const period = { yearMonth: sheet.yearMonth, week: sheet.activeWeek };
  const prevHref = scheduleHref(sheet.view, movePeriod(period, sheet.view, -1));
  const nextHref = scheduleHref(sheet.view, movePeriod(period, sheet.view, 1));
  const viewOptions: { value: ScheduleView; label: string; href: string }[] = [
    { value: "week", label: "주간", href: scheduleHref("week", period) },
    { value: "month", label: "월간", href: scheduleHref("month", period) },
  ];
  const weekOptions = Array.from({ length: sheet.weekCount }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}주`,
    href: scheduleHref("week", { yearMonth: sheet.yearMonth, week: i + 1 }),
  }));

  return (
    <>
      {/* 24인치(1920×1080)에서 월간 근무표가 스크롤 없이 한 화면에 들어오도록 위아래 여백과 줄 수를 줄였다. */}
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-[24px] border border-line bg-white px-5 py-4 shadow-card print:border-0 print:p-0 print:shadow-none">
          <div className="flex min-h-[52px] flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-[28px] leading-normal font-bold tracking-[-0.02em] text-ink">{sheet.title}</h2>
              <Link href={prevHref} aria-label="이전" className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-[22px] font-bold text-ink-sub shadow-[0_1px_2px_rgb(25_31_40/0.05)] transition-colors hover:border-grid hover:bg-canvas hover:text-ink print:hidden">
                ‹
              </Link>
              <Link href={nextHref} aria-label="다음" className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-[22px] font-bold text-ink-sub shadow-[0_1px_2px_rgb(25_31_40/0.05)] transition-colors hover:border-grid hover:bg-canvas hover:text-ink print:hidden">
                ›
              </Link>
              {canManage ? (
                <span className="flex items-center gap-2 print:hidden">
                  <ScheduleChip tone={STATUS_CHIP[api.status].tone}>{STATUS_CHIP[api.status].label}</ScheduleChip>
                  <span className="text-[15px] font-medium text-ink-mute">칸을 눌러 바로 수정 · 자동 저장</span>
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <ScheduleSegmented
                options={viewOptions}
                value={isMonth ? "month" : "week"}
                ariaLabel="보기 전환"
                itemClassName="w-24"
              />
              {isMonth ? null : (
                <ScheduleSegmented options={weekOptions} value={String(sheet.activeWeek)} ariaLabel="주 선택" />
              )}
            </div>
            <ScheduleShareButtons scheduleId={api.scheduleId} yearMonth={sheet.yearMonth} canExport={canManage} />
            {canManage ? (
              <div className="ml-auto print:hidden">
                <ScheduleBottomBar
                  scheduleId={api.scheduleId}
                  yearMonth={sheet.yearMonth}
                  status={api.status}
                  hardViolationCount={editor.hardViolationCount}
                />
              </div>
            ) : null}
          </div>
          {canManage ? (
            <div className="rounded-[18px] bg-canvas px-3 py-2 ring-1 ring-line ring-inset print:hidden">
              <ScheduleToolbar
                brush={brush}
                onBrushChange={setBrush}
                canUndo={editor.canUndo}
                onUndo={editor.undo}
                canRedo={editor.canRedo}
                onRedo={editor.redo}
                checkOnly={checkOnly}
                onCheckOnlyChange={setCheckOnly}
                sort={sort}
                onSortChange={setSort}
              />
            </div>
          ) : null}
          {editor.saveError ? (
            <p role="alert" className="text-[16px] font-bold text-danger">
              {editor.saveError}
            </p>
          ) : null}
          <div className="relative min-h-0 flex-1 print:flex-none">
            <ScheduleGrid
              view={sheet.view}
              days={sheet.days}
              rows={gridRows}
              coverage={editor.coverage}
              selected={sheet.selectedCell}
              onCellClick={canManage ? handleCellClick : undefined}
              onScroll={closePopover}
            />
            {showEmptyGuide ? (
              <div className="absolute top-1/3 left-1/2 flex w-[min(432px,calc(100%-2rem))] print:hidden -translate-x-1/2 flex-col items-center gap-3 rounded-[24px] border border-line bg-white p-6 text-center shadow-pop">
                <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-[26px] font-bold text-primary ring-8 ring-primary-soft/40">＋</span>
                <p className="text-[22px] font-bold text-ink">아직 비어 있어요</p>
                <p className="text-[16px] font-medium text-ink-sub">
                  칸을 눌러 근무를 넣거나, 자동 생성으로 한 번에 채워요. 연차는 이미 들어가 있어요.
                </p>
                {generation.error ? (
                  <p role="alert" className="text-[16px] font-bold text-danger">
                    {generation.error}
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <ScheduleButton
                    variant="brand"
                    size="sm"
                    onClick={() => generation.start(sheet.yearMonth)}
                    disabled={generation.loading}
                    className="disabled:opacity-50"
                  >
                    {generation.loading ? "만드는 중…" : "자동 생성"}
                  </ScheduleButton>
                  <ScheduleButton variant="neutral" size="sm" onClick={() => setShowEmptyGuide(false)}>
                    직접 채우기
                  </ScheduleButton>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
      {popover ? (
        <ScheduleCellPopover
          top={popover.top}
          left={popover.left}
          above={popover.above}
          problems={rows[popover.row].cells[popover.col].violations}
          onPick={(code) => {
            setDuty(popover.row, popover.col, code);
            closePopover();
          }}
        />
      ) : null}
    </>
  );
}
