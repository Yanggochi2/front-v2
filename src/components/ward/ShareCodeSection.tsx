"use client";

import { useState } from "react";
import AdminButton from "@/components/ui/AdminButton";
import { useSubmit } from "@/hooks/useSubmit";
import { clearShareCode, setShareCode } from "@/services/wardApi";

const MIN = 4;
const MAX = 30;

// 공유 링크 코드 (9차 미팅 "공유 링크 접속 시 1차 보안"). 정해 두면 간호사는 링크를 열 때 이 코드를 넣어야 한다.
// 코드는 서버에 해시로만 저장되어 다시 보여 줄 수 없다. 바꾸면 전에 넣은 간호사도 새 코드를 다시 넣는다.
export default function ShareCodeSection({ initialSet }: { initialSet: boolean }) {
  const [isSet, setIsSet] = useState(initialSet);
  const [code, setCode] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const { submit, loading, error } = useSubmit();
  const trimmed = code.trim();
  const valid = trimmed.length >= MIN && trimmed.length <= MAX;

  async function save() {
    if (await submit(() => setShareCode(trimmed))) {
      setIsSet(true);
      setCode("");
      setDone("코드를 저장했어요. 간호사들에게 링크와 함께 알려 주세요.");
    }
  }

  async function clear() {
    if (await submit(() => clearShareCode())) {
      setIsSet(false);
      setDone("코드를 껐어요. 이제 링크만 있으면 누구나 볼 수 있어요.");
    }
  }

  return (
    <>
      <p className="text-[17px] font-medium text-ink-sub">
        {isSet
          ? "지금 공유 링크는 코드를 넣어야 열려요. 코드는 저장한 뒤에는 다시 볼 수 없으니 따로 적어 두세요."
          : "코드를 정해 두면 간호사가 공유 링크를 열 때 코드를 넣어야 근무표가 보여요. 예: 병동 이름 + 연도"}
      </p>
      <div className="flex w-full max-w-[840px] flex-wrap items-center gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setDone(null);
          }}
          maxLength={MAX}
          autoComplete="off"
          aria-label="공유 코드"
          placeholder={isSet ? "새 코드로 바꾸기" : "예: 외과2025"}
          className="h-12 min-w-0 flex-1 rounded-[14px] bg-surface px-4 text-[18px] font-medium text-ink outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
        />
        <AdminButton variant="primary" onClick={save} disabled={loading || !valid}>
          {loading ? "저장 중…" : isSet ? "코드 바꾸기" : "코드 저장"}
        </AdminButton>
        {isSet ? (
          <AdminButton onClick={clear} disabled={loading}>
            코드 끄기
          </AdminButton>
        ) : null}
      </div>
      {code && !valid ? (
        <p role="alert" className="text-[16px] font-medium text-danger">
          코드는 {MIN}~{MAX}자로 넣어 주세요.
        </p>
      ) : null}
      {done ? (
        <p role="status" className="text-[16px] font-medium text-ink-sub">
          {done}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[16px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}
