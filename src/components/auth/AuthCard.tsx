import type { ReactNode } from "react";
import OnboardingCard from "@/components/ui/OnboardingCard";

type Props = { title: string; description: string; children: ReactNode };

// 로그인·회원가입 화면의 가운데 카드
export default function AuthCard({ title, description, children }: Props) {
  return (
    <OnboardingCard className="flex w-full max-w-[520px] flex-col gap-7 px-10 py-11">
      <div className="flex flex-col gap-2">
        <h1 className="text-[30px] font-bold text-ink">{title}</h1>
        <p className="text-[17px] font-medium text-ink-sub">{description}</p>
      </div>
      {children}
    </OnboardingCard>
  );
}
