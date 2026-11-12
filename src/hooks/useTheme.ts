"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY, type Theme } from "@/lib/theme";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 바꾼 모드도 따라간다
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    applyTheme(readTheme());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  if (theme === "dark") document.documentElement.dataset.theme = "dark";
  else delete document.documentElement.dataset.theme;
}

// 화면 모드와 바꾸는 함수. 서버 렌더링 때는 라이트로 본다.
export function useTheme(): [Theme, (next: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);

  function set(next: Theme) {
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    applyTheme(next);
    listeners.forEach((l) => l());
  }

  return [theme, set];
}
