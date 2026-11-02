import type { Metadata } from "next";

// 공유 링크 주소(/shared/<토큰>)는 비밀값이라 검색에 올리지 않고 다른 사이트로 Referer를 보내지 않는다.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// 로그인 없이 확정 근무표를 보는 화면. 사이드바 없이 앱 화면과 같은 80% 비율을 쓴다.
export default function SharedLayout({ children }: LayoutProps<"/">) {
  return <main className="ui-zoom h-screen-ui bg-canvas print:h-auto print:bg-white">{children}</main>;
}
