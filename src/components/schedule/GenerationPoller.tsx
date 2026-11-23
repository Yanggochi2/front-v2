"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GENERATION_POLL_MS } from "@/constants/schedule.constants";
import { setStaffingNotice } from "@/hooks/useStaffingNotice";
import { generationHref, getGenerationJob, settleGeneration } from "@/services/generationApi";

// 진행 화면에서 작업 상태를 주기적으로 확인한다. 끝나면 결과 화면으로 옮기고,
// 진행 중이면 서버 컴포넌트를 다시 불러와 단계·지표를 갱신한다. 화면에는 아무것도 그리지 않는다.
export default function GenerationPoller({ jobId, yearMonth }: { jobId: string; yearMonth: string }) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    const timer = setInterval(async () => {
      try {
        const job = await getGenerationJob(jobId);
        if (stopped) return;
        if (generationHref(job, yearMonth).startsWith("/schedule/generate?")) {
          router.refresh();
          return;
        }
        // 끝났다. 해 없음이면 가장 나은 결과를 근무표에 넣는다. 근무표로 가면 인원 적정성 알림을 띄운다
        stopped = true;
        clearInterval(timer);
        try {
          const next = await settleGeneration(job, yearMonth);
          if (next.version !== null) setStaffingNotice({ scheduleId: job.scheduleId, version: next.version });
          router.replace(next.href);
        } catch {
          // 결과를 근무표에 넣지 못했으면(그사이 근무표가 바뀜 등) 실패 화면에서 이유를 보여 준다
          router.replace(`/schedule/generate/failed?jobId=${job.id}`);
        }
      } catch {
        // 잠깐 연결이 끊겨도 다음 주기에 다시 확인한다.
      }
    }, GENERATION_POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [jobId, yearMonth, router]);

  return null;
}
