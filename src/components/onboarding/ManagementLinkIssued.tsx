"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import OnboardingButton from "@/components/ui/OnboardingButton";
import OnboardingCard from "@/components/ui/OnboardingCard";
import { saveManagementToken, toManagementUrl } from "@/lib/managementToken";
import type { ManagementLink } from "@/types/wardApi.type";

// 병동을 만든 직후 관리 링크를 보여 준다. 로그인이 없어서 이 링크가 병동에 다시 들어오는 유일한 방법이다.
export default function ManagementLinkIssued({ link }: { link: ManagementLink }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const url = toManagementUrl(link.managementPath);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function enter() {
    saveManagementToken(link.managementToken);
    router.replace("/schedule");
  }

  return (
    <OnboardingCard className="flex w-full max-w-180 flex-col gap-5 px-10 py-9">
      <p className="text-[22px] font-bold text-ink">관리 링크를 꼭 저장해 주세요</p>
      <p className="text-lg font-medium text-ink-sub">
        로그인 대신 이 링크로 병동에 들어와요. 링크를 잃어버리면 다시 들어올 수 없으니 즐겨찾기에 넣거나 안전한 곳에 적어 두세요.
        다른 사람에게 보내면 그 사람도 근무표를 고칠 수 있어요.
      </p>
      <p className="rounded-[14px] bg-surface px-5 py-4 font-mono text-base break-all text-ink">{url}</p>
      <div className="flex flex-wrap justify-end gap-3">
        <OnboardingButton variant="secondary" onClick={copy}>
          {copied ? "복사했어요" : "링크 복사"}
        </OnboardingButton>
        <OnboardingButton onClick={enter}>관리 화면으로 가기</OnboardingButton>
      </div>
    </OnboardingCard>
  );
}
