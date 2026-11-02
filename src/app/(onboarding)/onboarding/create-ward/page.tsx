import CreateWardForm from "@/components/onboarding/CreateWardForm";
import OnboardingHeading from "@/components/onboarding/OnboardingHeading";
import OnboardingTopBar from "@/components/onboarding/OnboardingTopBar";
import { getCreateWardDefaults } from "@/services/onboardingApi";

export default async function CreateWardPage() {
  const defaults = await getCreateWardDefaults();
  return (
    <div className="flex min-h-screen-ui flex-col">
      <OnboardingTopBar />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-6">
        <OnboardingHeading
          titleSize="md"
          title="새 병동을 만들어요"
          description="만든 사람이 이 병동의 수간호사가 되고, 관리 링크로 들어와요"
        />
        <CreateWardForm defaults={defaults} />
      </div>
    </div>
  );
}
