"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { applyViolationFlags, patchScheduleCells, toCoverageStatuses, toIssues } from "@/services/scheduleApi";
import type { CoverageStatus, DutyCode, EditableDutyCode, ScheduleRow, ScheduleSheetData } from "@/types/schedule.type";

type HistoryItem = { row: number; col: number; prev: DutyCode | null; next: DutyCode | null };

const SAVE_ERROR_MESSAGE: Record<string, string> = {
  VERSION_CONFLICT: "다른 곳에서 수정됐어요. 새로고침해 주세요",
  SCHEDULE_LOCKED: "다른 사람이 편집 중이에요",
  PROTECTED_CELL: "이 칸은 바꿀 수 없어요",
};
const SAVE_ERROR_DEFAULT = "저장하지 못했어요. 잠시 후 다시 시도해 주세요";

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

  function writeCell(row: number, col: number, duty: DutyCode | null) {
    setRows((prev) =>
      prev.map((r, i) =>
        i !== row ? r : { ...r, cells: r.cells.map((c, j) => (j === col ? { ...c, duty } : c)) },
      ),
    );
  }

  function save(row: number, col: number, duty: DutyCode | null): Promise<boolean> {
    const nurseId = rows[row].nurseKey;
    const date = api.dates[col];
    const job = queueRef.current.then(async () => {
      try {
        const res = await patchScheduleCells(api.scheduleId, {
          baseVersion: versionRef.current,
          changes: [{ nurseId, date, dutyCode: duty }],
        });
        versionRef.current = res.version;
        setCoverage((prev) => (prev ? toCoverageStatuses(res.coverage, api.dates) : prev));
        setRows((prev) => applyViolationFlags(prev, api.dates, res.violations));
        setIssues(toIssues(res.violations));
        setSaveError(null);
        return true;
      } catch (e) {
        setSaveError((e instanceof ApiError && SAVE_ERROR_MESSAGE[e.code]) || SAVE_ERROR_DEFAULT);
        return false;
      }
    });
    queueRef.current = job;
    return job;
  }

  function setDuty(row: number, col: number, duty: EditableDutyCode) {
    if (!api.editable) return;
    const old = rows[row].cells[col].duty;
    if (old === duty) return;
    const item: HistoryItem = { row, col, prev: old, next: duty };
    setHistory((h) => [...h, item]);
    setFuture([]);
    writeCell(row, col, duty);
    void save(row, col, duty).then((ok) => {
      if (ok) return;
      writeCell(row, col, old);
      setHistory((h) => h.filter((x) => x !== item));
    });
  }

  function undo() {
    const last = history[history.length - 1];
    if (!api.editable || !last) return;
    setHistory(history.slice(0, -1));
    setFuture((f) => [...f, last]);
    writeCell(last.row, last.col, last.prev);
    void save(last.row, last.col, last.prev).then((ok) => {
      if (ok) return;
      writeCell(last.row, last.col, last.next);
      setFuture((f) => f.filter((x) => x !== last));
      setHistory((h) => [...h, last]);
    });
  }

  function redo() {
    const next = future[future.length - 1];
    if (!api.editable || !next) return;
    setFuture(future.slice(0, -1));
    setHistory((h) => [...h, next]);
    writeCell(next.row, next.col, next.next);
    void save(next.row, next.col, next.next).then((ok) => {
      if (ok) return;
      writeCell(next.row, next.col, next.prev);
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
    undo,
    redo,
  };
}
