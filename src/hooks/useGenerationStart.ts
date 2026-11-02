"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "@/hooks/useSubmit";
import { generationHref, startGenerationForMonth } from "@/services/generationApi";

// 자동 생성 시작 버튼용. 시작한 뒤 작업 상태에 맞는 화면(근무표 / 진행 / 실패)으로 이동한다.
export function useGenerationStart() {
  const router = useRouter();
  const { submit, loading, error, setError } = useSubmit();

  // keepEntered: 지금 근무가 들어 있는 칸은 그대로 두고 빈 칸만 채운다
  async function start(yearMonth: string, keepEntered = false) {
    // 한 번 누를 때마다 새 키. 같은 클릭이 두 번 가도 작업은 하나만 생긴다.
    const key = crypto.randomUUID();
    let href: string | null = null;
    const ok = await submit(async () => {
      href = generationHref(await startGenerationForMonth(yearMonth, key, keepEntered), yearMonth);
    });
    if (ok && href) {
      router.push(href);
      router.refresh();
    }
  }

  return { start, loading, error, setError };
}
