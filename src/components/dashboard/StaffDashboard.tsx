import type { ApiDashboard } from "@/types/dashboardApi.type";
import CoverageStrip from "./CoverageStrip";
import DashboardSummary from "./DashboardSummary";
import DutyDistributionChart from "./DutyDistributionChart";
import WorkloadChart from "./WorkloadChart";

// 수간호사 대시보드 (7차 미팅). 근무표가 없는 달은 인력 요약만 보인다.
export default function StaffDashboard({ data }: { data: ApiDashboard }) {
  return (
    <div className="flex w-full flex-col gap-5">
      <DashboardSummary data={data} />
      {data.schedule ? (
        <>
          <CoverageStrip yearMonth={data.yearMonth} coverage={data.dailyCoverage} />
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-5">
            <DutyDistributionChart items={data.dutyDistribution} />
            {data.nurseWorkloads.length > 0 ? (
              <WorkloadChart rows={data.nurseWorkloads} />
            ) : (
              <p className="rounded-[24px] border border-line bg-white p-7 text-[17px] font-medium text-ink-mute shadow-card">
                근무표에 들어간 간호사가 없어요
              </p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
