// 랜딩(/) 화면 문구. 패널 안의 근무표·공유·기록 예시는 서비스를 설명하기 위한 예시 문구다.

export const LANDING_NAV = [
  { href: "#auto", label: "자동 생성" },
  { href: "#rules", label: "규칙 검사" },
  { href: "#share", label: "공유 링크" },
  { href: "#stats", label: "통계" },
  { href: "#audit", label: "감사 로그" },
] as const;

export const LANDING_DUTY_LEGEND = [
  { label: "D 주간", swatch: "bg-landing-d" },
  { label: "E 저녁", swatch: "bg-landing-e" },
  { label: "N 야간", swatch: "bg-landing-n" },
  { label: "O 휴무", swatch: "bg-landing-o" },
] as const;

export type LandingRow = { title: string; sub: string; tag?: { label: string; tone: "bad" | "ok" | "plain" }; time?: string };

export const LANDING_RULE_ROWS: LandingRow[] = [
  { title: "야간 직후 주간", sub: "간호사 3 · 6일", tag: { label: "위반", tone: "bad" } },
  { title: "연속 야간 상한", sub: "전원", tag: { label: "통과", tone: "plain" } },
  { title: "시간대별 최소 인원", sub: "30일 전체", tag: { label: "통과", tone: "plain" } },
];

export const LANDING_SHARE_ROWS: LandingRow[] = [
  { title: "11월 근무표", sub: "확정본 · 로그인 없이 보기", tag: { label: "공유 중", tone: "ok" } },
  { title: "10월 근무표", sub: "링크 교체", tag: { label: "이전 링크 꺼짐", tone: "plain" } },
  { title: "확정 취소", sub: "고치는 동안", tag: { label: "링크 꺼짐", tone: "plain" } },
];

export const LANDING_AUDIT_ROWS: LandingRow[] = [
  { title: "간호사 3 · 6일 D → O", sub: "수간호사", time: "14:02" },
  { title: "11월 근무표 자동 생성", sub: "시스템", time: "13:55" },
  { title: "10월 근무표 확정", sub: "수간호사", time: "09:30" },
];

// 3D 배경이 따라가는 섹션 순서. 섹션 id와 같아야 한다.
export const LANDING_SECTION_IDS = ["hero", "auto", "rules", "share", "stats", "audit", "cta"] as const;
