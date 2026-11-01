import type { DutyCode, EditableDutyCode } from "@/types/schedule.type";

// Tailwind가 클래스를 찾을 수 있게 전체 문자열로 적는다.
export const DUTY_STYLE: Record<
  DutyCode,
  // ring: 시트 칸 타일의 옅은 테두리. 근무(D·E·N·연차)는 같은 색 계열 선으로 또렷하게, OFF는 선 없이 조용하게
  { cell: string; edge: string; ring: string; weekLabel: string; monthLabel: string; brushLabel: string }
> = {
  D: { cell: "bg-duty-d text-duty-d-ink font-bold", edge: "border-duty-d-edge", ring: "ring-1 ring-duty-d-edge/50 ring-inset", weekLabel: "D", monthLabel: "D", brushLabel: "D 데이" },
  E: { cell: "bg-duty-e text-duty-e-ink font-bold", edge: "border-duty-e-edge", ring: "ring-1 ring-duty-e-edge/40 ring-inset", weekLabel: "E", monthLabel: "E", brushLabel: "E 이브닝" },
  N: { cell: "bg-duty-n text-duty-n-ink font-bold", edge: "border-duty-n-edge", ring: "ring-1 ring-duty-n-edge/35 ring-inset", weekLabel: "N", monthLabel: "N", brushLabel: "N 나이트" },
  O: { cell: "bg-duty-off text-duty-off-ink font-medium", edge: "border-duty-off-edge", ring: "", weekLabel: "OFF", monthLabel: "O", brushLabel: "OFF 휴무" },
  AL: { cell: "bg-duty-al text-duty-al-ink font-bold", edge: "border-duty-al-edge", ring: "ring-1 ring-duty-al-edge/40 ring-inset", weekLabel: "연차", monthLabel: "AL", brushLabel: "연차" },
  // TODO(🔶 ED 교육): 미확정. 표시 스타일만 임시로 OFF와 같게 둔다. 입력 UI 없음.
  ED: { cell: "bg-duty-off text-duty-off-ink font-medium", edge: "border-duty-off-edge", ring: "", weekLabel: "교육", monthLabel: "ED", brushLabel: "교육" },
};

// 직접 입력할 수 있는 코드. AL(연차)은 신청 승인으로만 들어가므로 직접 입력할 수 없다 (docs/API.md).
export const DUTY_ORDER: EditableDutyCode[] = ["D", "E", "N", "O"];

// 브러시 버튼 배경 (OFF는 Figma에서 회색 칩 색)
export const BRUSH_BG: Record<DutyCode, string> = {
  D: "bg-duty-d text-duty-d-ink",
  E: "bg-duty-e text-duty-e-ink",
  N: "bg-duty-n text-duty-n-ink",
  O: "bg-surface text-ink-sub",
  AL: "bg-duty-al text-duty-al-ink",
  ED: "bg-surface text-ink-sub",
};

export const BRUSH_RING: Record<DutyCode, string> = {
  D: "ring-duty-d-edge",
  E: "ring-duty-e-edge",
  N: "ring-duty-n-edge",
  O: "ring-duty-off-edge",
  AL: "ring-duty-al-edge",
  ED: "ring-duty-off-edge",
};
