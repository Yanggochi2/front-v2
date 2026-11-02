"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingButton from "@/components/ui/OnboardingButton";
import { ApiError } from "@/lib/apiClient";
import { clearManagementToken, readManagementToken, saveManagementToken } from "@/lib/managementToken";
import { getWard } from "@/services/shellApi";
import OnboardingHeading from "./OnboardingHeading";

type State = "checking" | "missing" | "invalid" | "offline";

const COPY: Record<Exclude<State, "checking">, { title: string; description: string }> = {
  missing: {
    title: "관리 링크로 들어와 주세요",
    description: "병동을 만들 때 받은 관리 링크를 열면 근무표를 고칠 수 있어요. 처음이면 병동을 새로 만들어요.",
  },
  invalid: {
    title: "이 관리 링크는 더 이상 쓸 수 없어요",
    description: "링크를 새로 만들었다면 새 링크로 들어와 주세요. 링크를 잃어버렸으면 운영자에게 새 링크를 받아 주세요.",
  },
  offline: {
    title: "서버에 연결하지 못했어요",
    description: "잠시 후 다시 시도해 주세요.",
  },
};

// 주소의 #token=…을 꺼내 저장하고 주소창에서 지운 뒤, 병동 정보(GET /wards/me)로 확인하고 근무표로 보낸다.
// # 뒤 값은 서버·Referer로 가지 않는다. 토큰 없이 들어오면 저장해 둔 토큰으로 들어간다.
export default function ManageEntry() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    const enter = async () => {
      const fromLink = new URLSearchParams(window.location.hash.slice(1)).get("token");
      if (fromLink) {
        saveManagementToken(fromLink);
        window.history.replaceState(window.history.state, "", window.location.pathname);
      }
      if (!fromLink && !readManagementToken(document.cookie)) return setState("missing");
      setState("checking");
      try {
        await getWard();
        router.replace("/schedule");
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          clearManagementToken();
          setState("invalid");
        } else {
          setState("offline");
        }
      }
    };
    void enter();
    // 이 화면을 연 채로 관리 링크를 붙여 넣으면 # 뒤만 바뀌어 페이지가 다시 열리지 않는다
    const onHash = () => void enter();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [router]);

  if (state === "checking") {
    return <p className="text-lg font-medium text-ink-sub">관리 화면을 여는 중이에요…</p>;
  }
  return (
    <>
      <OnboardingHeading titleSize="md" title={COPY[state].title} description={COPY[state].description} />
      <div className="flex gap-3">
        {state === "offline" ? (
          <OnboardingButton onClick={() => window.location.reload()}>다시 시도</OnboardingButton>
        ) : (
          <OnboardingButton href="/onboarding/create-ward">새 병동 만들기</OnboardingButton>
        )}
      </div>
    </>
  );
}
