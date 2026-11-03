"use client";

import { useRouter } from "next/navigation";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { useSubmit } from "@/hooks/useSubmit";
import { stopGeneration } from "@/services/generationApi";

// GEN-03. 지금까지의 가장 좋은 결과를 근무표에 쓰고 근무표로 간다.
export default function GenerateStopButton({ jobId, yearMonth }: { jobId: string; yearMonth: string }) {
  const router = useRouter();
  const { submit, loading, error } = useSubmit();

  async function stop() {
    if (await submit(() => stopGeneration(jobId, { applyBestResult: true }))) {
      router.replace(`/schedule?view=month&ym=${yearMonth}`);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <ScheduleButton variant="neutral" size="sm" onClick={stop} disabled={loading || jobId === ""}>
        중단하고 현재 결과 쓰기
      </ScheduleButton>
      {error ? (
        <p role="alert" className="text-[15px] font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
