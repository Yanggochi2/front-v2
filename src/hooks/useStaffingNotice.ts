"use client";

import { useSyncExternalStore } from "react";

// 자동 생성이 끝난 뒤 근무표 화면에 띄우는 인원 적정성 알림 (11/17 미팅).
// 생성 뒤 근무표 화면이 새로 그려져도 남도록 화면 밖(메모리)에 둔다. 새로고침하면 사라진다.
// 어느 근무표의 알림인지 적어, 다른 달에서는 보이지 않게 한다.
let current: string | null = null; // 알림을 띄울 scheduleId
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setStaffingNotice(scheduleId: string | null) {
  if (current === scheduleId) return;
  current = scheduleId;
  listeners.forEach((l) => l());
}

export function useStaffingNotice(scheduleId: string): boolean {
  const id = useSyncExternalStore(subscribe, () => current, () => null);
  return id !== null && id === scheduleId;
}
