"use client";

import { useSyncExternalStore } from "react";

// 자동 생성이 끝난 뒤 근무표 화면에 띄우는 인원 적정성 알림 (11/17 미팅).
// 생성 뒤 근무표 화면이 새로 그려져도 남도록 화면 밖(메모리)에 둔다. 새로고침하면 사라진다.
// 어느 근무표의 어느 버전(생성 결과)에 대한 알림인지 적는다. 생성 직후 화면이 아직 생성 전 근무표를 보여 주는 동안
// 그 위반으로 알림을 판단하면 잠깐 반대 문구가 보이므로, 생성 결과 버전 이상이 화면에 올라왔을 때만 띄운다.
type StaffingNotice = { scheduleId: string; version: number };

let current: StaffingNotice | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setStaffingNotice(next: StaffingNotice | null) {
  if (current === next) return;
  current = next;
  listeners.forEach((l) => l());
}

export function useStaffingNotice(scheduleId: string, version: number): boolean {
  const notice = useSyncExternalStore(subscribe, () => current, () => null);
  return notice !== null && notice.scheduleId === scheduleId && version >= notice.version;
}
