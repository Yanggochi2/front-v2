"use client";

import { useRouter } from "next/navigation";
import ScheduleButton from "@/components/ui/ScheduleButton";
import { useSubmit } from "@/hooks/useSubmit";
import { ApiError } from "@/lib/apiClient";
import { createSchedule } from "@/services/scheduleApi";

// 빈 근무표를 만들어 직접 작성을 시작한다 (11/16 미팅 "수동 작성 모드").
// 만들고 나면 근무표 화면에서 칸을 눌러 채우거나, 이미 짜 둔 근무표를 엑셀에서 가져올 수 있다.
export default function ScheduleCreateEmptyButton({ yearMonth }: { yearMonth: string }) {
  const router = useRouter();
  const { submit, loading, error } = useSubmit();

  async function create() {
    const ok = await submit(async () => {
      try {
        await createSchedule(yearMonth);
      } catch (e) {
        // 그사이 다른 창에서 만들었으면 그 근무표를 그대로 연다
        if (!(e instanceof ApiError && e.code === "SCHEDULE_ALREADY_EXISTS")) throw e;
      }
    });
    if (ok) router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <ScheduleButton variant="neutral" size="md" onClick={create} disabled={loading}>
        {loading ? "만드는 중…" : "빈 근무표로 직접 작성"}
      </ScheduleButton>
      {error ? (
        <p role="alert" className="text-[16px] font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
