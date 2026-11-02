export type NavItem = {
  label: string;
  href: string;
  badge?: number;
  exact?: boolean;
};

export type NavModel = {
  mainItems: NavItem[];
  adminItems: NavItem[];
};

// 사이드바와 상단 메뉴(사이드바 닫힘)가 같은 메뉴를 쓴다.
// 10/26 계약부터 관리 링크로 들어온 수간호사 화면 하나라 역할별 메뉴가 없다.
const NAV: NavModel = {
  mainItems: [
    { label: "근무표", href: "/schedule", exact: true },
    { label: "자동 생성", href: "/schedule/generate" },
    { label: "간호사 명단", href: "/nurses" },
    { label: "규칙 설정", href: "/rules" },
    { label: "통계·공정성", href: "/stats" },
  ],
  adminItems: [
    { label: "감사 로그", href: "/audit-log" },
    { label: "병동 설정", href: "/ward-settings" },
  ],
};

export function useNavModel(): NavModel {
  return NAV;
}

export function isNavActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
