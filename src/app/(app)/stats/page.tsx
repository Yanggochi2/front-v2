import StaffDashboard from "@/components/dashboard/StaffDashboard";
import StatsTable from "@/components/stats/StatsTable";
import ApiOfflineBanner from "@/components/ui/ApiOfflineBanner";
import AdminButton from "@/components/ui/AdminButton";
import AdminEmptyState from "@/components/ui/AdminEmptyState";
import AdminFilterChip from "@/components/ui/AdminFilterChip";
import AdminNotice from "@/components/ui/AdminNotice";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { todayKst } from "@/lib/schedulePeriod";
import { getDashboard } from "@/services/dashboardApi";
import { getStats } from "@/services/statsApi";
import type { ApiDashboard } from "@/types/dashboardApi.type";
import type { StatsData } from "@/types/stats.type";

const currentMonthLabel = () => {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
};

// 병동 전체 간호사별 근무 횟수와 OFF 개수 (공정성)
export default async function StatsPage() {
  // 이번 달 근무표의 간호사별 집계 (statsApi.ts)
  // 대시보드 그래프(7차 미팅)와 공정성 표는 따로 불러와, 한쪽이 실패해도 다른 쪽은 보인다
  const [statsResult, dashboardResult] = await Promise.allSettled([getStats(), getDashboard(todayKst().yearMonth)]);
  const data: StatsData | null = statsResult.status === "fulfilled" ? statsResult.value : null;
  const dashboard: ApiDashboard | null = dashboardResult.status === "fulfilled" ? dashboardResult.value : null;

  const isEmpty = data !== null && data.rows.length === 0;

  return (
    <div className="flex min-w-0 flex-col gap-8 px-12 pt-12 pb-10">
      <AdminPageHeader
        title="통계·공정성"
        subtitle={
          isEmpty || !data
            ? "간호사별 근무 횟수와 OFF 개수를 봐요"
            : `팀 평균과 많이 다른 사람은 색으로 알려줘요 · ${data.periodLabel}`
        }
      />
      {dashboard ? (
        <StaffDashboard data={dashboard} />
      ) : data ? (
        <AdminNotice tone="red">대시보드 그래프를 불러오지 못했어요. 잠시 후 새로고침해 주세요.</AdminNotice>
      ) : null}
      <h2 className="-mb-3 text-[22px] font-bold text-ink">간호사별 공정성</h2>
      {!data ? (
        <>
          <ApiOfflineBanner retryHref="/stats" />
          <div className="flex w-full flex-wrap items-center gap-2.5">
            <AdminFilterChip active>{currentMonthLabel()}</AdminFilterChip>
            <AdminFilterChip>확정본 기준</AdminFilterChip>
          </div>
          <StatsTable rows={[]} />
        </>
      ) : isEmpty ? (
        <AdminEmptyState
          icon="—"
          title="보여드릴 통계가 아직 없어요"
          description="근무표가 만들어지면 간호사별 근무 횟수와 OFF 개수를 볼 수 있어요."
          action={
            <AdminButton variant="primary" size="lg" href="/schedule">
              근무표 보기
            </AdminButton>
          }
        />
      ) : (
        <>
          <div className="flex w-full flex-wrap items-center gap-2.5">
            <AdminFilterChip active>{data.periodLabel}</AdminFilterChip>
            <AdminFilterChip>확정본 기준</AdminFilterChip>
          </div>
          <StatsTable rows={data.rows} />
        </>
      )}
    </div>
  );
}
