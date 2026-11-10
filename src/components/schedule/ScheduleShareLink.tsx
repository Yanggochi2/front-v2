"use client";

import { useEffect, useState } from "react";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { useSubmit } from "@/hooks/useSubmit";
import { issueShareLink, revokeShareLink } from "@/services/sharingApi";

// 확정 근무표의 공유 링크 만들기·복사·다시 만들기·끄기 (10/26 계약 5장).
// 서버는 지금 링크가 있는지 알려 주지 않고 만든 순간에만 주소를 준다. 그래서 이 창에서 만든 링크만 보여 준다.
export default function ScheduleShareLink({ scheduleId, shareable }: { scheduleId: string; shareable: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [revoked, setRevoked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { submit, loading, error } = useSubmit();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading]);

  async function issue() {
    // 이 창에서 이미 만든 링크가 있으면 다시 만들 때 한 번 더 묻는다
    if (url && !window.confirm("새로 만들면 지금 링크는 더 이상 열리지 않아요. 계속할까요?")) return;
    await submit(async () => {
      const link = await issueShareLink(scheduleId);
      setUrl(`${window.location.origin}${link.sharePath}`);
      setRevoked(false);
      setCopied(false);
    });
  }

  async function revoke() {
    if (!window.confirm("공유를 끄면 이 근무표의 공유 링크는 더 이상 열리지 않아요. 계속할까요?")) return;
    await submit(async () => {
      await revokeShareLink(scheduleId);
      setUrl(null);
      setRevoked(true);
    });
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <ScheduleButton variant="primary-soft" size="xs" onClick={() => setOpen(true)} disabled={!scheduleId}>
        공유 링크
      </ScheduleButton>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px]">
          <div role="dialog" aria-modal="true" aria-labelledby="share-link-title" className="flex w-[560px] flex-col gap-4 rounded-[28px] bg-white p-8 shadow-pop">
            <h2 id="share-link-title" className="text-[24px] font-bold text-ink">
              간호사들에게 보여 줄 공유 링크
            </h2>
            <p className="text-[17px] font-medium text-ink-sub">
              링크를 받은 사람은 로그인 없이 이 근무표를 볼 수만 있어요. 이름·직급·근무만 보이고, 연차·교육은 휴무로 보여요.
            </p>
            {url ? (
              <p className="rounded-[14px] bg-surface px-5 py-4 font-mono text-[16px] break-all text-ink">{url}</p>
            ) : (
              <p className={shareable ? "text-[16px] font-medium text-ink-mute" : "rounded-[14px] bg-surface px-5 py-4 text-[17px] font-bold text-ink-sub"}>
                {!shareable
                  ? "확정한 뒤에 공유 링크를 만들 수 있어요. 근무표를 확정하면 이 창에서 링크를 만들고 끌 수 있어요."
                  : revoked
                    ? "공유를 껐어요. 이전 링크는 더 이상 열리지 않아요."
                    : "이미 만든 링크가 있다면, 새로 만들면 이전 링크는 열리지 않아요."}
              </p>
            )}
            {error ? (
              <p role="alert" className="text-[16px] font-medium text-danger">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button type="button" onClick={revoke} disabled={loading || !shareable} className="mr-auto h-11 rounded-[12px] px-3 text-[17px] font-bold text-danger transition-colors hover:bg-danger-soft disabled:opacity-50">
                공유 끄기
              </button>
              <ScheduleButton variant="neutral" size="sm" onClick={() => setOpen(false)} disabled={loading}>
                닫기
              </ScheduleButton>
              {url ? (
                <>
                  <ScheduleButton variant="neutral" size="sm" onClick={issue} disabled={loading}>
                    새로 만들기
                  </ScheduleButton>
                  <ScheduleButton variant="brand" size="sm" onClick={copy}>
                    {copied ? "복사했어요" : "링크 복사"}
                  </ScheduleButton>
                </>
              ) : (
                <ScheduleButton variant="brand" size="sm" onClick={issue} disabled={loading || !shareable}>
                  {loading ? "만드는 중…" : "링크 만들기"}
                </ScheduleButton>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
