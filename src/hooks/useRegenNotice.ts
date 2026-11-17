"use client";

import { useSyncExternalStore } from "react";

// 골라서 다시 짜기 결과 안내. 다시 짠 뒤 근무표 화면이 새로 그려져도 남도록 화면 밖(메모리)에 둔다.
// 새로고침하면 사라진다. 어느 근무표의 안내인지 함께 적어, 다른 달에서는 보이지 않게 한다.
type RegenNotice = { scheduleId: string; picked: number; changed: number };

let current: RegenNotice | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setRegenNotice(next: RegenNotice | null) {
  if (current === next) return;
  current = next;
  listeners.forEach((l) => l());
}

export function regenNoticeText({ picked, changed }: RegenNotice): string {
  if (changed === 0) return `고른 ${picked}칸은 바꿀 수 있는 다른 배치가 없어 그대로예요. 같은 날 다른 사람의 칸도 함께 고르면 바꿀 수 있어요`;
  if (changed < picked) return `고른 ${picked}칸 중 ${changed}칸이 바뀌었어요. 나머지는 지금 배치가 가장 잘 맞아 그대로예요`;
  return `고른 ${picked}칸을 다시 짰어요`;
}

export function useRegenNotice(scheduleId: string): RegenNotice | null {
  const notice = useSyncExternalStore(subscribe, () => current, () => null);
  return notice && notice.scheduleId === scheduleId ? notice : null;
}
