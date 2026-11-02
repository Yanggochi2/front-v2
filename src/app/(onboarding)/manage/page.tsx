import ManageEntry from "@/components/onboarding/ManageEntry";
import OnboardingTopBar from "@/components/onboarding/OnboardingTopBar";

// 관리 링크(/manage#token=…)로 들어오는 곳. 토큰은 주소의 # 뒤에 있어 서버로 오지 않으므로 브라우저에서 읽는다.
export default function ManagePage() {
  return (
    <div className="flex min-h-screen-ui flex-col">
      <OnboardingTopBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-6">
        <ManageEntry />
      </div>
    </div>
  );
}
