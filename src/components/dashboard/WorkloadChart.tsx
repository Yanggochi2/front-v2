import { CHART_DUTY_COLOR, DUTY_NAME, WORK_DUTIES } from "@/constants/dashboard.constants";
import type { ApiNurseWorkload } from "@/types/dashboardApi.type";
import ChartTip from "./ChartTip";
import DashboardCard from "./DashboardCard";

// 막대 안 숫자 색. 노란 D 위에는 흰 글씨가 안 보여 진한 글씨를 쓴다
const INSIDE_TEXT: Record<string, string> = { D: "text-ink", E: "text-white", N: "text-white" };

// 간호사별 D/E/N 근무 수를 한 줄 막대로 쌓아 누구에게 근무가 몰렸는지 본다. OFF는 오른쪽 숫자로.
export default function WorkloadChart({ rows }: { rows: ApiNurseWorkload[] }) {
  const work = (r: ApiNurseWorkload) => r.D + r.E + r.N;
  const max = Math.max(1, ...rows.map(work));

  const legend = (
    <ul className="flex items-center gap-4 text-[15px] font-medium text-ink-sub">
      {WORK_DUTIES.map((d) => (
        <li key={d} className="flex items-center gap-1.5">
          <span aria-hidden className="size-3.5 rounded-[3px]" style={{ background: CHART_DUTY_COLOR[d] }} />
          {d} {DUTY_NAME[d]}
        </li>
      ))}
    </ul>
  );

  return (
    <DashboardCard title="간호사별 근무량" description="D·E·N 근무 수와 OFF" aside={legend}>
      <ul className="flex flex-col gap-2.5">
        {rows.map((r) => {
          const total = work(r);
          return (
            <li key={r.nurseId} className="flex items-center gap-4">
              <span className="flex w-[150px] shrink-0 items-center gap-1.5 truncate text-[17px] font-bold text-ink">
                {r.name}
                {r.staffType === "NURSING_ASSISTANT" ? <span className="text-[13px] font-medium text-ink-mute">조무사</span> : null}
              </span>
              <span className="flex h-8 min-w-0 flex-1 items-center">
                {/* 막대 길이는 가장 많이 일한 사람 기준. 칸 사이 2px 흰 틈으로 구분한다 */}
                <span className="flex h-7 gap-[2px]" style={{ width: `${(total / max) * 100}%` }}>
                  {WORK_DUTIES.filter((d) => r[d] > 0).map((d, i, shown) => (
                    <ChartTip
                      key={d}
                      tip={`${r.name} · ${DUTY_NAME[d]} ${r[d]}번`}
                      className={`flex h-full items-center justify-center text-[14px] font-bold tabular-nums ${INSIDE_TEXT[d]} ${
                        i === shown.length - 1 ? "rounded-r-[4px]" : ""
                      }`}
                      style={{ flexGrow: r[d], flexBasis: 0, background: CHART_DUTY_COLOR[d] }}
                    >
                      {r[d] >= 2 ? r[d] : null}
                    </ChartTip>
                  ))}
                </span>
                <span className="ml-3 shrink-0 text-[16px] font-bold text-ink-sub tabular-nums">{total}</span>
              </span>
              <span className="w-[220px] shrink-0 text-right text-[16px] font-medium text-ink-sub tabular-nums">
                OFF {r.O}/{r.offTarget}
                {r.remainingOff > 0 ? <span className="font-bold text-danger"> · 남은 {r.remainingOff}</span> : null}
                {r.offCarry > 0 ? <span className="text-ink-mute"> · 이월 {r.offCarry}</span> : null}
              </span>
            </li>
          );
        })}
      </ul>
    </DashboardCard>
  );
}
