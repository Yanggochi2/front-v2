import { redirect } from "next/navigation";
import CreateWardForm from "@/components/onboarding/CreateWardForm";
import OnboardingHeading from "@/components/onboarding/OnboardingHeading";
import OnboardingTopBar from "@/components/onboarding/OnboardingTopBar";
import { ApiError } from "@/lib/apiClient";
import { getMe } from "@/services/authApi";
import { getCreateWardDefaults } from "@/services/onboardingApi";

// 로그인한 수간호사가 처음 병동을 만드는 곳 (POST /workspaces).
export default async function CreateWardPage() {
  let userName = "";
  let unauthenticated = false;
  let hasWard = false;
  try {
    const me = await getMe();
    userName = me.user.name;
    hasWard = Boolean(me.membership && me.ward);
  } catch (e) {
    // 로그인하지 않았으면 로그인으로 보낸다. 서버에 닿지 못하면 폼은 그대로 보여 주고, 만들 때 오류를 알린다.
    unauthenticated = e instanceof ApiError && e.status === 401;
  }
  if (unauthenticated) redirect("/login");
  if (hasWard) redirect("/schedule");

  const defaults = await getCreateWardDefaults();
  return (
    <div className="flex min-h-screen-ui flex-col">
      <OnboardingTopBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-6">
        <OnboardingHeading titleSize="md" title="새 병동을 만들어요" description="만든 사람이 이 병동의 수간호사가 돼요" />
        <CreateWardForm defaults={defaults} userName={userName} />
      </div>
    </div>
  );
}
