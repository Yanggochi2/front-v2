import { DUTY_NAME } from "@/constants/dashboard.constants";
import type { ApiDashboard } from "@/types/dashboardApi.type";
import ChartTip from "./ChartTip";
import DashboardCard from "./DashboardCard";

// 듀티별 총 배정 수. 한 가지 값(배정 수)이라 막대는 한 색으로 칠하고 끝에 숫자를 쓴다.
export default function DutyDistributionChart({ items }: { items: ApiDashboard["dutyDistribution"] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <DashboardCard title="듀티별 배정" description="이달 근무표에 들어간 칸 수">
      <ul className="flex flex-col gap-3">
        {items.map((i) => (
          <li key={i.dutyCode} className="flex items-center gap-4">
            <span className="w-[92px] shrink-0 text-[17px] font-bold text-ink">
              {i.dutyCode} <span className="font-medium text-ink-mute">{DUTY_NAME[i.dutyCode] ?? ""}</span>
            </span>
            <span className="flex h-8 min-w-0 flex-1 items-center gap-3">
              {i.count > 0 ? (
                <ChartTip
                  tip={`${DUTY_NAME[i.dutyCode] ?? i.dutyCode} ${i.count}칸`}
                  className="flex h-full items-center"
                  style={{ width: `${(i.count / max) * 100}%` }}
                >
                  <span className="h-6 w-full rounded-r-[4px] bg-primary" />
                </ChartTip>
              ) : null}
              <span className="shrink-0 text-[17px] font-bold text-ink-sub tabular-nums">{i.count}</span>
            </span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
