"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { toErrorMessage } from "@/lib/apiErrorMessage";
import { applyImportPreview, createImportPreview, patchImportPreview } from "@/services/scheduleApi";
import type { ApiDutyCode, ApiImportPreview } from "@/types/scheduleApi.type";

type NurseOption = { id: string; name: string };

type Props = {
  scheduleId: string;
  monthLabel: string; // "11월"
  nurses: NurseOption[]; // 이 근무표의 간호사 (이름이 맞지 않는 줄을 누구로 볼지 고를 때 쓴다)
};

// 근무표 엑셀 가져오기 (SCH-10~12). 지난달 실제 근무표처럼 이미 짜 둔 근무를 한 번에 넣을 때 쓴다 (11/16 미팅 "실제 근무표를 넣고 다음 달 생성").
export default function ScheduleImportButton(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ScheduleButton variant="neutral" size="xs" onClick={() => setOpen(true)} disabled={!props.scheduleId}>
        엑셀에서 가져오기
      </ScheduleButton>
      {open ? <ScheduleImportDialog {...props} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

const SKIP = ""; // 그 줄은 가져오지 않음
const EMPTY = ""; // 그 글자는 빈 칸으로
// 연차(AL)는 서버가 가져오기로 받지 않는다 (엑셀의 AL 칸은 읽지 않고, 근무표의 연차 칸은 그대로 둔다)
const DUTY_OPTIONS: { value: ApiDutyCode; label: string }[] = [
  { value: "D", label: "D 데이" },
  { value: "E", label: "E 이브닝" },
  { value: "N", label: "N 나이트" },
  { value: "O", label: "OFF 휴무" },
  { value: "ED", label: "교육" },
];

const SELECT_CLS =
  "h-12 min-w-[220px] rounded-[12px] border border-line bg-white px-3 text-[16px] font-medium text-ink focus:border-primary focus:outline-none";

function ScheduleImportDialog({ scheduleId, monthLabel, nurses, onClose }: Props & { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"read" | "apply" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ApiImportPreview | null>(null);
  // 이름이 맞지 않는 줄(행 번호 → 간호사 id 또는 건너뛰기), 모르는 글자(글자 → 근무 또는 빈 칸)
  const [rowChoice, setRowChoice] = useState<Record<number, string>>({});
  const [codeChoice, setCodeChoice] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<number | null>(null);

  useEffect(() => dialogRef.current?.focus(), []);

  // 근무표에 넣은 뒤에 닫으면 바뀐 근무표를 다시 불러온다
  const close = useCallback(() => {
    onClose();
    if (applied !== null) router.refresh();
  }, [applied, onClose, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && busy === null && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, close]);

  async function read() {
    if (!file) return;
    setBusy("read");
    setError(null);
    try {
      const p = await createImportPreview(scheduleId, file);
      setPreview(p);
      // 같은 이름이 여럿이면 직접 고르게 비워 두고, 이름이 없는 줄은 건너뛰기를 처음 값으로 둔다
      setRowChoice(Object.fromEntries(p.unresolved.rows.map((n) => [n, SKIP])));
      setCodeChoice(Object.fromEntries(p.unresolved.codes.map((c) => [c, EMPTY])));
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function apply() {
    if (!preview) return;
    setBusy("apply");
    setError(null);
    try {
      let p = preview;
      if (p.unresolved.rows.length > 0 || p.unresolved.codes.length > 0) {
        p = await patchImportPreview(scheduleId, p.id, {
          nurseMappings: p.unresolved.rows.map((rowNumber) => ({ rowNumber, nurseId: rowChoice[rowNumber] || null })),
          dutyMappings: p.unresolved.codes.map((raw) => ({ raw, dutyCode: (codeChoice[raw] || null) as ApiDutyCode | null })),
        });
        setPreview(p);
      }
      const taken = new Set(p.nurseMappings.filter((m) => m.nurseId).map((m) => m.rowNumber));
      await applyImportPreview(scheduleId, p.id);
      // 결과 안내를 본 뒤 닫을 때 근무표를 다시 불러온다 (바로 불러오면 근무표가 새로 그려지며 이 창도 닫힌다)
      setApplied(p.cells.filter((c) => taken.has(c.rowNumber)).length);
    } catch (e) {
      setError(toErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const rowsByNumber = new Map(preview?.rows.map((r) => [r.rowNumber, r]) ?? []);
  const nameOf = new Map(nurses.map((n) => [n.id, n.name]));
  const matched = preview ? preview.rows.length - preview.unresolved.rows.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-import-title"
        className="flex max-h-[90vh] w-[640px] flex-col gap-5 overflow-y-auto rounded-[28px] bg-white p-8 shadow-pop outline-none"
      >
        <h2 id="schedule-import-title" className="text-[24px] font-bold text-ink">
          {monthLabel} 근무표를 엑셀에서 가져오기
        </h2>

        {applied !== null ? (
          <>
            <p role="status" className="text-[18px] font-medium text-ink-sub">
              엑셀의 근무 {applied}칸을 근무표에 넣었어요. 규칙에 맞지 않는 칸이 있으면 위반 목록에서 볼 수 있어요.
            </p>
            <div className="flex justify-end">
              <ScheduleButton variant="primary" onClick={close}>
                확인
              </ScheduleButton>
            </div>
          </>
        ) : preview === null ? (
          <>
            <div className="flex flex-col gap-3 text-[17px] font-medium text-ink-sub">
              <p>이미 짜 둔 근무표(예: 지난달 실제 근무)를 엑셀 파일로 한 번에 넣어요.</p>
              <ul className="flex flex-col gap-1.5 rounded-[16px] bg-canvas p-4 text-[16px]">
                <li>· 첫 열은 <b className="text-ink">이름</b>, 머리글 줄에는 <b className="text-ink">날짜(1~31)</b>가 있어야 해요.</li>
                <li>· 칸에는 D, E, N, OFF(또는 O)를 적어요. 다른 글자는 다음 단계에서 어떤 근무인지 고를 수 있어요.</li>
                <li>· ‘엑셀로 저장’으로 받은 파일을 고쳐서 올려도 돼요.</li>
                <li>· 연차는 가져오지 않아요. 가져온 뒤 근무표에서 직접 넣어 주세요.</li>
              </ul>
            </div>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              aria-label="근무표 엑셀 파일"
              disabled={busy !== null}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError(null);
              }}
              className="text-[16px] text-ink file:mr-3 file:h-12 file:cursor-pointer file:rounded-[14px] file:border file:border-line file:bg-white file:px-5 file:font-bold file:text-ink-sub hover:file:bg-canvas"
            />
            {error ? (
              <p role="alert" className="rounded-[16px] bg-danger-soft p-4 text-[17px] font-bold text-danger">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <ScheduleButton variant="neutral" onClick={close} disabled={busy !== null}>
                닫기
              </ScheduleButton>
              <ScheduleButton variant="primary" onClick={read} disabled={!file || busy !== null}>
                {busy === "read" ? "읽는 중…" : "파일 읽기"}
              </ScheduleButton>
            </div>
          </>
        ) : (
          <>
            <p role="status" className="text-[17px] font-medium text-ink-sub">
              간호사 {preview.rows.length}줄, 근무 {preview.cells.length}칸을 읽었어요. 이름이 맞는 줄은 {matched}줄이에요.
            </p>

            {preview.unresolved.rows.length > 0 ? (
              <section className="flex flex-col gap-2.5">
                <h3 className="text-[18px] font-bold text-ink">이름을 찾지 못한 줄 {preview.unresolved.rows.length}개</h3>
                <p className="text-[16px] font-medium text-ink-sub">명단에 없는 이름이거나 같은 이름이 여럿이에요. 누구의 근무인지 골라 주세요.</p>
                <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                  {preview.unresolved.rows.map((rowNumber) => {
                    const row = rowsByNumber.get(rowNumber);
                    // 같은 이름이 여럿이면 그 사람들만, 없는 이름이면 근무표의 모든 간호사에서 고른다
                    const options = row && row.candidates.length > 0 ? row.candidates.map((id) => ({ id, name: nameOf.get(id) ?? row.name })) : nurses;
                    return (
                      <li key={rowNumber} className="flex items-center justify-between gap-3 rounded-[14px] bg-canvas px-4 py-2.5">
                        <span className="min-w-0 truncate text-[17px] font-bold text-ink">
                          {row?.name ?? "-"} <span className="text-[15px] font-medium text-ink-mute">({rowNumber}번째 줄)</span>
                        </span>
                        <select
                          aria-label={`${row?.name ?? rowNumber} 줄을 누구로 볼지`}
                          value={rowChoice[rowNumber] ?? SKIP}
                          disabled={busy !== null}
                          onChange={(e) => setRowChoice((prev) => ({ ...prev, [rowNumber]: e.target.value }))}
                          className={SELECT_CLS}
                        >
                          <option value={SKIP}>이 줄은 가져오지 않기</option>
                          {options.map((n, i) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                              {row && row.candidates.length > 1 ? ` (${i + 1}번째)` : ""}
                            </option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            {preview.unresolved.codes.length > 0 ? (
              <section className="flex flex-col gap-2.5">
                <h3 className="text-[18px] font-bold text-ink">모르는 글자 {preview.unresolved.codes.length}개</h3>
                <p className="text-[16px] font-medium text-ink-sub">엑셀 칸에 적힌 글자가 어떤 근무인지 골라 주세요.</p>
                <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                  {preview.unresolved.codes.map((raw) => (
                    <li key={raw} className="flex items-center justify-between gap-3 rounded-[14px] bg-canvas px-4 py-2.5">
                      <span className="min-w-0 truncate text-[17px] font-bold text-ink">‘{raw}’</span>
                      <select
                        aria-label={`${raw} 글자를 어떤 근무로 볼지`}
                        value={codeChoice[raw] ?? EMPTY}
                        disabled={busy !== null}
                        onChange={(e) => setCodeChoice((prev) => ({ ...prev, [raw]: e.target.value }))}
                        className={SELECT_CLS}
                      >
                        <option value={EMPTY}>빈 칸으로 두기</option>
                        {DUTY_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="rounded-[14px] bg-primary-soft px-4 py-3 text-[16px] font-bold text-primary">
              넣으면 지금 근무표의 같은 칸은 엑셀 내용으로 바뀌어요. 연차 칸과 소속 기간 밖 칸은 그대로 둬요.
            </p>
            {error ? (
              <p role="alert" className="rounded-[16px] bg-danger-soft p-4 text-[17px] font-bold text-danger">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-3">
              <ScheduleButton variant="neutral" onClick={close} disabled={busy !== null}>
                닫기
              </ScheduleButton>
              <ScheduleButton variant="primary" onClick={apply} disabled={busy !== null || matched + Object.values(rowChoice).filter(Boolean).length === 0}>
                {busy === "apply" ? "넣는 중…" : "근무표에 넣기"}
              </ScheduleButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
