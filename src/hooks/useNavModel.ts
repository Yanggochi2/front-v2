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
// 10/26 계약부터 로그인하는 사람은 수간호사뿐이라 역할별 메뉴가 없다.
const NAV: NavModel = {
  mainItems: [
    // 자동 생성은 근무표 화면의 '자동 생성' 버튼 한 곳에서만 시작한다 (11/17 미팅: 진입점이 둘이라 헷갈림)
    { label: "근무표", href: "/schedule", exact: true },
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
