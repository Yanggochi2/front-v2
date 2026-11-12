"use client";

import ScheduleSegmented from "@/components/ui/ScheduleSegmented";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/lib/theme";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
];

// 병동 설정의 "화면 모드". 이 브라우저에서만 바뀌고 다른 사람 화면에는 영향이 없다.
export default function ThemeSetting() {
  const [theme, setTheme] = useTheme();
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <p className="text-[17px] leading-normal font-medium text-ink-sub">밝은 화면과 어두운 화면 중에서 골라요. 이 브라우저에만 저장돼요.</p>
      <ScheduleSegmented options={OPTIONS} value={theme} onChange={setTheme} ariaLabel="화면 모드" itemClassName="w-24" />
    </div>
  );
}
