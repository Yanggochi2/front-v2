"use client";

import { useRouter } from "next/navigation";
import { setRegenNotice } from "@/hooks/useRegenNotice";
import { setStaffingNotice } from "@/hooks/useStaffingNotice";
import { useSubmit } from "@/hooks/useSubmit";
import { settleGeneration, startGenerationForCells, startGenerationForMonth } from "@/services/generationApi";
import type { ApiFixedCell, ApiGenerationJob } from "@/types/scheduleApi.type";

// 자동 생성 시작 버튼용. 시작한 뒤 작업 상태에 맞는 화면(근무표 / 진행 / 실패)으로 이동한다.
// 해 없음이어도 가장 나은 결과를 근무표에 넣고 근무표로 간다 (settleGeneration).
export function useGenerationStart() {
  const router = useRouter();
  const { submit, loading, error, setError } = useSubmit();

  // 한 번 누를 때마다 새 키. 같은 클릭이 두 번 가도 작업은 하나만 생긴다.
  // staffingNotice: 근무표로 가면 인원 적정성 알림을 띄운다
  async function run(yearMonth: string, begin: (idempotencyKey: string) => Promise<ApiGenerationJob>, staffingNotice: boolean) {
    const key = crypto.randomUUID();
    let href: string | null = null;
    const ok = await submit(async () => {
      const job = await begin(key);
      const next = await settleGeneration(job, yearMonth);
      if (staffingNotice && next.version !== null) setStaffingNotice({ scheduleId: job.scheduleId, version: next.version });
      href = next.href;
    });
    if (ok && href) {
      router.push(href);
      router.refresh();
    }
    return ok;
  }

  // keepEntered: 지금 근무가 들어 있는 칸은 그대로 두고 빈 칸만 채운다. 끝나면 인원 적정성 알림을 띄운다
  const start = (yearMonth: string, keepEntered = false) =>
    run(yearMonth, (key) => startGenerationForMonth(yearMonth, key, keepEntered), true);

  // 고른 칸만 다시 짠다. 나머지 근무는 그대로 둔다. 끝나면 몇 칸이 바뀌었는지 근무표 화면에 알려 준다
  const startCells = (yearMonth: string, scheduleId: string, cells: ApiFixedCell[]) =>
    run(yearMonth, async (key) => {
      const { job, changed } = await startGenerationForCells(scheduleId, cells, key);
      setRegenNotice(changed === null ? null : { scheduleId, picked: cells.length, changed });
      return job;
    }, false);

  return { start, startCells, loading, error, setError };
}
