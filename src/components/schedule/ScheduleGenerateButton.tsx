"use client";

import ScheduleButton from "@/components/ui/ScheduleButton";
import { useGenerationStart } from "@/hooks/useGenerationStart";

// 근무표가 없는 달에서 바로 자동 생성을 시작한다. 빈 근무표를 만든 뒤 생성하고, 끝나면 근무표(또는 진행·실패 화면)로 간다.
export default function ScheduleGenerateButton({ yearMonth }: { yearMonth: string }) {
  const { start, loading, error } = useGenerationStart();

  return (
    <div className="flex flex-col items-center gap-2">
      <ScheduleButton variant="brand" size="md" onClick={() => start(yearMonth)} disabled={loading}>
        {loading ? "만드는 중…" : "자동 생성"}
      </ScheduleButton>
      {error ? (
        <p role="alert" className="text-[16px] font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
