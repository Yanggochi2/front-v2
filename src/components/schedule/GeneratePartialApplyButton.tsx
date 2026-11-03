"use client";

import { useRouter } from "next/navigation";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { useSubmit } from "@/hooks/useSubmit";
import { applyPartialResultForJob } from "@/services/generationApi";

// GEN-05. 실패한 작업의 부분 결과를 그대로 쓰고 근무표에서 직접 고친다.
export default function GeneratePartialApplyButton({ jobId, yearMonth }: { jobId: string; yearMonth: string }) {
  const router = useRouter();
  const { submit, loading, error } = useSubmit();

  async function apply() {
    if (await submit(() => applyPartialResultForJob(jobId))) {
      router.push(`/schedule?view=month&ym=${yearMonth}`);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <ScheduleButton variant="neutral" size="sm" onClick={apply} disabled={loading || jobId === ""}>
        부분 결과 그대로 쓰고 직접 고치기
      </ScheduleButton>
      {error ? (
        <p role="alert" className="text-[15px] font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
