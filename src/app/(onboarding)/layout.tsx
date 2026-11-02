// 병동 만들기는 사이드바 없는 별도 레이아웃 (AGENTS.md 6.4)
export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return <main className="ui-zoom min-h-screen-ui">{children}</main>;
}
