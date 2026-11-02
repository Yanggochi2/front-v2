import StatsTable from "@/components/stats/StatsTable";
import ApiOfflineBanner from "@/components/ui/ApiOfflineBanner";
import AdminButton from "@/components/ui/AdminButton";
import AdminEmptyState from "@/components/ui/AdminEmptyState";
import AdminFilterChip from "@/components/ui/AdminFilterChip";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { getStats } from "@/services/statsApi";
import type { StatsData } from "@/types/stats.type";

const currentMonthLabel = () => {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`;
};

// 병동 전체 간호사별 근무 횟수와 OFF 개수 (공정성)
export default async function StatsPage() {
  // 이번 달 근무표의 간호사별 집계 (statsApi.ts)
  let data: StatsData | null = null;
  try {
    data = await getStats();
  } catch {
    data = null;
  }

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
