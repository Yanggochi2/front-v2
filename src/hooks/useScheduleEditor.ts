"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { applyViolationFlags, forceScheduleOffs, patchScheduleCells, toCoverageStatuses, toIssues } from "@/services/scheduleApi";
import type { ApiCellBulkPatchResult } from "@/types/scheduleApi.type";
import type { CoverageStatus, DutyCode, EditableDutyCode, ScheduleRow, ScheduleSheetData } from "@/types/schedule.type";

type CellChange = { row: number; col: number; prev: DutyCode | null; next: DutyCode | null };
// 되돌리기 한 번 = 한 번에 바꾼 칸 묶음. 칸 하나 수정은 1칸, 강제 OFF는 고른 칸 전부가 한 묶음이다.
type HistoryItem = CellChange[];
export type CellPos = { row: number; col: number };

const SAVE_ERROR_MESSAGE: Record<string, string> = {
  VERSION_CONFLICT: "다른 곳에서 수정됐어요. 새로고침해 주세요",
  SCHEDULE_LOCKED: "다른 사람이 편집 중이에요",
  PROTECTED_CELL: "이 칸은 바꿀 수 없어요",
  INVALID_SCHEDULE_STATE: "작성 중인 근무표만 고칠 수 있어요. 새로고침해 주세요",
};
const SAVE_ERROR_DEFAULT = "저장하지 못했어요. 잠시 후 다시 시도해 주세요";
const saveErrorOf = (e: unknown) => (e instanceof ApiError && SAVE_ERROR_MESSAGE[e.code]) || SAVE_ERROR_DEFAULT;

// 입력칸에서 누른 단축키는 가로채지 않는다.
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
}

// 근무표 셀 편집 상태. 화면을 먼저 바꾸고 서버에 저장하며, 실패하면 되돌린다.
// 되돌리기/다시 실행은 클라이언트 메모리 스택이다 (AGENTS.md 6.2). 서버에는 바뀐 값을 일반 변경으로 보낸다.
export function useScheduleEditor(sheet: ScheduleSheetData) {
  const api = sheet.api;
  const [rows, setRows] = useState<ScheduleRow[]>(sheet.rows);
  const [coverage, setCoverage] = useState<CoverageStatus[] | null>(sheet.coverage);
  const [issues, setIssues] = useState(sheet.issues);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const versionRef = useRef(api.version);
  // 빠르게 연속으로 고쳐도 baseVersion이 어긋나지 않게 저장을 한 줄로 세운다.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());

  function writeCells(changes: CellChange[], pick: "prev" | "next") {
    const byRow = new Map<number, Map<number, DutyCode | null>>();
    for (const c of changes) byRow.set(c.row, (byRow.get(c.row) ?? new Map()).set(c.col, c[pick]));
    setRows((prev) =>
      prev.map((r, i) => {
        const cols = byRow.get(i);
        return cols ? { ...r, cells: r.cells.map((c, j) => (cols.has(j) ? { ...c, duty: cols.get(j)! } : c)) } : r;
      }),
    );
  }

  // 서버 응답의 버전·인원·위반을 화면에 반영한다 (칸 수정과 강제 OFF가 같은 모양으로 돌려준다).
  function applyResult(res: ApiCellBulkPatchResult) {
    versionRef.current = res.version;
    setCoverage((prev) => (prev ? toCoverageStatuses(res.coverage, api.dates) : prev));
    setRows((prev) => applyViolationFlags(prev, api.dates, res.violations));
    setIssues(toIssues(res.violations));
    setSaveError(null);
  }

  // 요청을 저장 줄 맨 뒤에 세운다. 성공하면 true, 실패하면 안내 문구를 띄우고 false.
  function enqueue(send: (baseVersion: number) => Promise<ApiCellBulkPatchResult>): Promise<boolean> {
    const job = queueRef.current.then(async () => {
      try {
        applyResult(await send(versionRef.current));
        return true;
      } catch (e) {
        setSaveError(saveErrorOf(e));
        return false;
      }
    });
    queueRef.current = job;
    return job;
  }

  function save(changes: CellChange[], pick: "prev" | "next"): Promise<boolean> {
    const body = changes.map((c) => ({ nurseId: rows[c.row].nurseKey, date: api.dates[c.col], dutyCode: c[pick] }));
    return enqueue((baseVersion) => patchScheduleCells(api.scheduleId, { baseVersion, changes: body }));
  }

  function setDuty(row: number, col: number, duty: EditableDutyCode) {
    if (!api.editable) return;
    const old = rows[row].cells[col].duty;
    if (old === duty) return;
    const item: HistoryItem = [{ row, col, prev: old, next: duty }];
    setHistory((h) => [...h, item]);
    setFuture([]);
    writeCells(item, "next");
    void save(item, "next").then((ok) => {
      if (ok) return;
      writeCells(item, "prev");
      setHistory((h) => h.filter((x) => x !== item));
    });
  }

  // 강제 OFF: 고른 칸을 한 번에 OFF로 바꾼다. 인원 부족 등 위반이 생겨도 서버가 막지 않는다.
  // 화면은 저장이 끝난 뒤에 바꾼다 (여러 칸이라 실패 시 깜빡이지 않게). 되돌리기 한 번에 전부 돌아간다.
  function forceOff(cells: CellPos[], reason: string): Promise<boolean> {
    if (!api.editable) return Promise.resolve(false);
    const item: HistoryItem = cells
      .map(({ row, col }) => ({ row, col, prev: rows[row].cells[col].duty, next: "O" as const }))
      .filter((c) => c.prev !== "O");
    if (item.length === 0) return Promise.resolve(true);
    const body = item.map((c) => ({ nurseId: rows[c.row].nurseKey, date: api.dates[c.col] }));
    const trimmed = reason.trim();
    return enqueue((baseVersion) =>
      forceScheduleOffs(api.scheduleId, { baseVersion, cells: body, ...(trimmed ? { reason: trimmed } : {}) }),
    ).then((ok) => {
      if (ok) {
        writeCells(item, "next");
        setHistory((h) => [...h, item]);
        setFuture([]);
      }
      return ok;
    });
  }

  function undo() {
    const last = history[history.length - 1];
    if (!api.editable || !last) return;
    setHistory(history.slice(0, -1));
    setFuture((f) => [...f, last]);
    writeCells(last, "prev");
    void save(last, "prev").then((ok) => {
      if (ok) return;
      writeCells(last, "next");
      setFuture((f) => f.filter((x) => x !== last));
      setHistory((h) => [...h, last]);
    });
  }

  function redo() {
    const next = future[future.length - 1];
    if (!api.editable || !next) return;
    setFuture(future.slice(0, -1));
    setHistory((h) => [...h, next]);
    writeCells(next, "next");
    void save(next, "next").then((ok) => {
      if (ok) return;
      writeCells(next, "prev");
      setHistory((h) => h.filter((x) => x !== next));
      setFuture((f) => [...f, next]);
    });
  }

  // 단축키: Ctrl/⌘+Z 되돌리기, Ctrl+Y 또는 ⌘+Shift+Z 다시 실행
  const shortcutRef = useRef({ undo, redo });
  useEffect(() => {
    shortcutRef.current = { undo, redo };
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || isTyping(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        shortcutRef.current.undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        shortcutRef.current.redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    rows,
    coverage,
    issues,
    saveError,
    canUndo: api.editable && history.length > 0,
    canRedo: api.editable && future.length > 0,
    setDuty,
    forceOff,
    undo,
    redo,
  };
}
