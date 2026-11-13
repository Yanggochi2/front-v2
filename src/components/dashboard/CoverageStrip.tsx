import { COVERAGE_STATUS, DUTY_NAME, WORK_DUTIES } from "@/constants/dashboard.constants";
import { monthDates } from "@/lib/schedulePeriod";
import type { ApiCoverage } from "@/types/scheduleApi.type";
import ChartTip from "./ChartTip";
import DashboardCard from "./DashboardCard";

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

// 일자 × D/E/N 칸마다 실제 인원을 쓰고, 필요 인원과 비교한 상태(부족·딱 맞음·초과)를 색과 기호로 같이 보인다.
export default function CoverageStrip({ yearMonth, coverage }: { yearMonth: string; coverage: ApiCoverage[] }) {
  const dates = monthDates(yearMonth);
  const byKey = new Map(coverage.map((c) => [`${c.date}|${c.dutyCode}`, c]));
  const month = Number(yearMonth.slice(5, 7));

  const legend = (
    <ul className="flex items-center gap-4 text-[15px] font-medium text-ink-sub">
      {(["UNDER", "MET", "OVER"] as const).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span aria-hidden className={`flex size-6 items-center justify-center rounded-[6px] text-[12px] ${COVERAGE_STATUS[s].cell}`}>
            {COVERAGE_STATUS[s].mark}
          </span>
          {COVERAGE_STATUS[s].label}
        </li>
      ))}
    </ul>
  );

  return (
    <DashboardCard title="날짜별 필요 인원" description="칸 숫자는 실제 근무 인원이에요. 올려 보면 필요 인원이 나와요" aside={legend}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-separate border-spacing-[2px]">
          <thead>
            <tr>
              <th scope="col" className="w-[52px]" aria-label="듀티" />
              {dates.map((d) => {
                const day = new Date(`${d}T00:00:00`).getDay();
                return (
                  <th key={d} scope="col" className={`text-[13px] font-medium ${day === 0 ? "text-danger" : day === 6 ? "text-brand" : "text-ink-mute"}`}>
                    <span className="block text-[15px] font-bold">{Number(d.slice(8))}</span>
                    {WEEKDAY[day]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {WORK_DUTIES.map((duty) => (
              <tr key={duty}>
                <th scope="row" className="pr-2 text-left text-[16px] font-bold text-ink">
                  {duty}
                </th>
                {dates.map((d) => {
                  const c = byKey.get(`${d}|${duty}`);
                  if (!c) {
                    return (
                      <td key={d} className="h-9 rounded-[6px] bg-surface text-center text-[14px] text-ink-faint">
                        -
                      </td>
                    );
                  }
                  const s = COVERAGE_STATUS[c.status];
                  return (
                    <td key={d} className="h-9 p-0">
                      <ChartTip
                        tip={`${month}/${Number(d.slice(8))} ${DUTY_NAME[duty]} · ${c.actualCount}명 / 필요 ${c.requiredCount}명 · ${s.label}`}
                        className={`flex h-9 items-center justify-center gap-px rounded-[6px] text-[14px] tabular-nums ${s.cell}`}
                      >
                        {s.mark ? <span aria-hidden className="text-[9px]">{s.mark}</span> : null}
                        {c.actualCount}
                      </ChartTip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
