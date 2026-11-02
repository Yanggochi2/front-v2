import OnboardingTopBar from "@/components/onboarding/OnboardingTopBar";

// 로그인·회원가입. 사이드바 없는 레이아웃이고 앱 화면과 같은 80% 비율을 쓴다.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="ui-zoom flex min-h-screen-ui flex-col">
      <OnboardingTopBar />
      <div className="flex flex-1 items-center justify-center px-6 pb-16">{children}</div>
    </main>
  );
}
