import type { ApiCoverageStatus } from "@/types/scheduleApi.type";

// 그래프용 D·E·N 색. 근무표와 같은 색 계열(노랑·주황·남색)에서 dataviz 검사(색약 구분 ΔE, 일반 구분 ΔE ≥ 15)를
// 통과하도록 단계를 고른 값이다. 근무표 칸 색(--color-duty-*-solid)의 D·E는 서로 너무 비슷해 그래프에는 쓰지 않는다.
// D는 흰 바탕 대비가 3:1보다 낮아서 막대마다 숫자를 함께 쓴다.
export const CHART_DUTY_COLOR = {
  D: "#d9a400",
  E: "#c2331f",
  N: "#4f46e5",
} as const;

export const WORK_DUTIES = ["D", "E", "N"] as const;
export type WorkDuty = (typeof WORK_DUTIES)[number];

// 듀티별 배정 수 막대 이름
export const DUTY_NAME: Record<string, string> = {
  D: "데이",
  E: "이브닝",
  N: "나이트",
  O: "OFF",
  AL: "연차",
  ED: "교육",
};

// 필요 인원 충족 상태. 색만으로 구분하지 않도록 기호와 이름을 같이 쓴다.
export const COVERAGE_STATUS: Record<ApiCoverageStatus, { label: string; mark: string; cell: string }> = {
  MET: { label: "딱 맞음", mark: "", cell: "bg-ok-soft text-ok" },
  UNDER: { label: "부족", mark: "▼", cell: "bg-danger-soft text-danger font-bold" },
  OVER: { label: "초과", mark: "▲", cell: "bg-duty-d text-duty-d-ink font-bold" },
};

export const SCHEDULE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "초안",
  GENERATING: "만드는 중",
  CONFIRMED: "확정",
  ARCHIVED: "지난 근무표",
};
