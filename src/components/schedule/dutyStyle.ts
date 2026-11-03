import type { DutyCode, EditableDutyCode } from "@/types/schedule.type";

// Tailwind가 클래스를 찾을 수 있게 전체 문자열로 적는다.
export const DUTY_STYLE: Record<
  DutyCode,
  // cell: 근무(D·E·N·연차)는 진한 배경 + 흰 글씨로 또렷하게, OFF·교육은 옅은 회색으로 조용하게 (11/2 클라이언트 요청)
  // ring: 시트 칸 타일의 옅은 테두리. 진한 배경 칸은 테두리 없이
  { cell: string; edge: string; ring: string; weekLabel: string; monthLabel: string; brushLabel: string }
> = {
  D: { cell: "bg-duty-d-solid text-white font-bold", edge: "border-duty-d-edge", ring: "", weekLabel: "D", monthLabel: "D", brushLabel: "D 데이" },
  E: { cell: "bg-duty-e-solid text-white font-bold", edge: "border-duty-e-edge", ring: "", weekLabel: "E", monthLabel: "E", brushLabel: "E 이브닝" },
  N: { cell: "bg-duty-n-solid text-white font-bold", edge: "border-duty-n-edge", ring: "", weekLabel: "N", monthLabel: "N", brushLabel: "N 나이트" },
  O: { cell: "bg-duty-off text-duty-off-ink font-medium", edge: "border-duty-off-edge", ring: "", weekLabel: "OFF", monthLabel: "O", brushLabel: "OFF 휴무" },
  AL: { cell: "bg-duty-al-solid text-white font-bold", edge: "border-duty-al-edge", ring: "", weekLabel: "연차", monthLabel: "AL", brushLabel: "연차" },
  // TODO: 교육(ED) 칸 색은 시안이 없어 임시로 OFF와 같게 둔다 (글자 "교육"/"ED"로 구분).
  ED: { cell: "bg-duty-off text-duty-off-ink font-medium", edge: "border-duty-off-edge", ring: "", weekLabel: "교육", monthLabel: "ED", brushLabel: "교육" },
};

// 직접 입력할 수 있는 코드. 10/26 계약부터 연차(AL)·교육(ED)도 수간호사가 종이 달력을 보고 넣는다.
export const DUTY_ORDER: EditableDutyCode[] = ["D", "E", "N", "O", "AL", "ED"];

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
