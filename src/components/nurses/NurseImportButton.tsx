"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RnButton from "@/components/ui/RnButton";
import { ApiError } from "@/lib/apiClient";
import { toErrorMessage } from "@/lib/apiErrorMessage";
import { downloadNurseImportTemplate, importNursesXlsx } from "@/services/nursesApi";
import type { ApiNurseImportRowError } from "@/types/nursesApi.type";

// 엑셀 일괄 등록 (11/2 미팅): 양식을 내려받아 채운 뒤 올린다.
// size="lg"는 빈 상태 화면용, 기본은 페이지 머리글용
export default function NurseImportButton({ size = "md" }: { size?: "md" | "lg" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RnButton variant="secondary" size={size} onClick={() => setOpen(true)} className={size === "md" ? "px-[22px] text-[18px]" : ""}>
        엑셀로 한꺼번에 등록
      </RnButton>
      {open ? <NurseImportDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

type ImportError = { message: string; lines: string[] };

const HEADER_PROBLEMS: [string, string][] = [
  ["missingHeaders", "없는 열"],
  ["unexpectedHeaders", "양식에 없는 열"],
  ["duplicateHeaders", "두 번 들어간 열"],
];

// INVALID_NURSE_EXCEL은 서버 문구가 그대로 안내가 된다. 행별 오류와 열 문제는 아래 줄로 풀어 보여 준다.
function toImportError(e: unknown): ImportError {
  if (!(e instanceof ApiError) || e.code !== "INVALID_NURSE_EXCEL") return { message: toErrorMessage(e), lines: [] };
  const details = e.details ?? {};
  const rows = (Array.isArray(details.errors) ? details.errors : []) as ApiNurseImportRowError[];
  const lines = rows.map((r) => `${r.row}행 ${r.field}: ${r.message ?? r.reason}`);
  for (const [key, label] of HEADER_PROBLEMS) {
    const headers = details[key];
    if (Array.isArray(headers) && headers.length > 0) lines.push(`${label}: ${headers.join(", ")}`);
  }
  return { message: e.message, lines };
}

function NurseImportDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"template" | "upload" | null>(null);
  const [error, setError] = useState<ImportError | null>(null);
  const [created, setCreated] = useState<number | null>(null);

  useEffect(() => dialogRef.current?.focus(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && busy === null && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function saveTemplate() {
    setBusy("template");
    setError(null);
    try {
      const url = URL.createObjectURL(await downloadNurseImportTemplate());
      const a = document.createElement("a");
      a.href = url;
      a.download = "간호사 등록 양식.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError({ message: toErrorMessage(e), lines: [] });
    } finally {
      setBusy(null);
    }
  }

  async function upload() {
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      setCreated(await importNursesXlsx(file));
      router.refresh();
    } catch (e) {
      setError(toImportError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nurse-import-title"
        className="flex max-h-[90vh] w-[600px] flex-col gap-6 overflow-y-auto rounded-[28px] bg-white p-8 shadow-pop outline-none"
      >
        <h2 id="nurse-import-title" className="text-[26px] font-bold text-ink">
          엑셀로 한꺼번에 등록
        </h2>

        {created !== null ? (
          <>
            <p role="status" className="text-[18px] font-medium text-ink-sub">
              간호사 {created}명을 등록했어요. 명단에서 확인해 보세요.
            </p>
            <div className="flex justify-end">
              <RnButton variant="primary" size="lg" onClick={onClose}>
                확인
              </RnButton>
            </div>
          </>
        ) : (
          <>
            <ol className="flex flex-col gap-5 text-[17px] font-medium text-ink-sub">
              <li className="flex flex-col gap-3">
                <span>
                  <b className="text-ink">1.</b> 등록 양식을 내려받아 간호사 정보를 한 줄에 한 명씩 채워 주세요. 쓰는 방법은 양식의 ‘작성 안내’ 시트에 있어요.
                </span>
                <RnButton variant="secondary" onClick={saveTemplate} disabled={busy !== null} className="self-start">
                  {busy === "template" ? "내려받는 중…" : "등록 양식 내려받기"}
                </RnButton>
              </li>
              <li className="flex flex-col gap-3">
                <span>
                  <b className="text-ink">2.</b> 채운 파일을 골라 올려 주세요. 틀린 줄이 하나라도 있으면 아무도 등록되지 않으니, 알려 드린 줄을 고쳐 다시 올리면 돼요.
                </span>
                <input
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  aria-label="채운 엑셀 파일"
                  disabled={busy !== null}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setError(null);
                  }}
                  className="text-[16px] text-ink file:mr-3 file:h-12 file:cursor-pointer file:rounded-[14px] file:border file:border-line file:bg-white file:px-5 file:font-bold file:text-ink-sub hover:file:bg-canvas"
                />
              </li>
            </ol>

            {error ? (
              <div role="alert" className="flex flex-col gap-2 rounded-[16px] bg-danger-soft p-4 text-danger">
                <p className="text-[17px] font-bold">{error.message}</p>
                {error.lines.length > 0 ? (
                  <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto text-[16px] font-medium">
                    {error.lines.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <RnButton variant="secondary" size="lg" onClick={onClose} disabled={busy !== null}>
                닫기
              </RnButton>
              <RnButton variant="primary" size="lg" onClick={upload} disabled={!file || busy !== null}>
                {busy === "upload" ? "등록하는 중…" : "등록하기"}
              </RnButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
