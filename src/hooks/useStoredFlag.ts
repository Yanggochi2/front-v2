"use client";

import { useSyncExternalStore } from "react";

// 이 브라우저에만 기억하는 켜기/끄기 설정 (사이드바 닫기, 큰 글씨). 서버 렌더링 때는 꺼진 것으로 본다.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStoredFlag(key: string, onValue: string, offValue: string): [boolean, (next: boolean) => void] {
  const on = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) === onValue;
      } catch {
        return false;
      }
    },
    () => false,
  );

  function set(next: boolean) {
    try {
      localStorage.setItem(key, next ? onValue : offValue);
    } catch {}
    listeners.forEach((l) => l());
  }

  return [on, set];
}
