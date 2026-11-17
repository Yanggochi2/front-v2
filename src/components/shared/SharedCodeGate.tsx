"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { useSubmit } from "@/hooks/useSubmit";
import { unlockSharedSchedule } from "@/services/sharingApi";

// 공유 링크 1차 보안 (9차 미팅): 수간호사가 정한 코드를 넣어야 근무표가 보인다.
// 맞히면 서버가 이 링크용 쿠키를 주므로, 같은 브라우저에서는 다시 묻지 않는다.
export default function SharedCodeGate({ token }: { token: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const { submit, loading, error } = useSubmit();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;
    if (await submit(() => unlockSharedSchedule(token, code))) router.refresh();
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-[22px] font-bold tracking-[-0.02em] text-ink">Ottugi</p>
      <form onSubmit={onSubmit} className="flex w-full max-w-[480px] flex-col items-stretch gap-4 rounded-[24px] border border-line bg-white p-8 shadow-card">
        <h1 className="text-[26px] font-bold text-ink">공유 코드를 입력해 주세요</h1>
        <p className="text-[17px] font-medium text-ink-sub">수간호사에게 받은 코드를 넣으면 근무표가 보여요. 이 브라우저에서는 다시 묻지 않아요.</p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={30}
          autoFocus
          autoComplete="off"
          aria-label="공유 코드"
          placeholder="예: 외과2025"
          className="h-14 rounded-[16px] bg-surface px-5 text-center text-[20px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-faint focus:ring-2 focus:ring-primary"
        />
        {error ? (
          <p role="alert" className="text-[16px] font-bold text-danger">
            {error}
          </p>
        ) : null}
        <ScheduleButton type="submit" variant="brand" size="md" disabled={loading || !code.trim()}>
          {loading ? "확인하는 중…" : "근무표 보기"}
        </ScheduleButton>
      </form>
    </div>
  );
}
