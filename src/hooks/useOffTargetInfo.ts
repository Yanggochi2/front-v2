"use client";

import { useEffect, useState } from "react";
import { getOffCarry, type OffCarrySummary } from "@/services/dashboardApi";
import { getOffTarget } from "@/services/rulesApi";
import type { ApiOffTarget } from "@/types/rulesApi.type";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; offTarget: ApiOffTarget | null; carry: OffCarrySummary | null };

// 그 달 OFF 목표와 지난달 이월을 불러온다. 쓰는 컴포넌트가 생길 때(자동 생성 창이 열릴 때) 한 번 불러온다.
// 이월은 덧붙이는 정보라 불러오지 못해도 목표는 보여 준다.
export function useOffTargetInfo(yearMonth: string): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    Promise.all([getOffTarget(yearMonth), getOffCarry(yearMonth).catch(() => null)])
      .then(([offTarget, carry]) => alive && setState({ status: "ready", offTarget, carry }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [yearMonth]);

  return state;
}
