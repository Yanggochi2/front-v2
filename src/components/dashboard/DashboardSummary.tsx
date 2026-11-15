import { SCHEDULE_STATUS_LABEL } from "@/constants/dashboard.constants";
import { NURSE_STATUS_LABEL } from "@/constants/nurses.constants";
import type { ApiDashboard } from "@/types/dashboardApi.type";

function Tile({ label, value, detail, tone = "ink" }: { label: string; value: string; detail?: string; tone?: "ink" | "danger" }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-line bg-white px-6 py-5 shadow-card">
      <p className="text-[16px] font-bold text-ink-sub">{label}</p>
      <p className={`text-[32px] leading-tight font-bold tracking-[-0.02em] ${tone === "danger" ? "text-danger" : "text-ink"}`}>{value}</p>
      {detail ? <p className="text-[15px] font-medium text-ink-mute">{detail}</p> : null}
    </div>
  );
}

// 숫자 하나로 보는 이달 요약: 인원, 필요 인원 부족, OFF, 근무표 상태
export default function DashboardSummary({ data }: { data: ApiDashboard }) {
  const count = (t: string) => data.staffComposition.find((c) => c.staffType === t)?.count ?? 0;
  const total = data.staffComposition.reduce((sum, c) => sum + c.count, 0);
  // 재직이 아닌 사람만 덧붙인다 (예: 휴직 1명)
  const away = data.staffStatuses
    .filter((s) => s.status !== "ACTIVE" && s.status !== "RETIRED" && s.count > 0)
    .map((s) => `${NURSE_STATUS_LABEL[s.status]} ${s.count}명`);
  const { under, over, met } = data.coverageSummary;
  const off = data.offSummary;
  const hasSchedule = data.schedule !== null;

  return (
    <div className="grid w-full grid-cols-4 gap-4">
      <Tile
        label="이달 인원"
        value={`${total}명`}
        detail={[`간호사 ${count("NURSE")}명`, `간호조무사 ${count("NURSING_ASSISTANT")}명`, ...away].join(" · ")}
      />
      <Tile
        label="필요 인원 부족"
        value={hasSchedule ? `${under}칸` : "-"}
        tone={under > 0 ? "danger" : "ink"}
        detail={hasSchedule ? `딱 맞음 ${met}칸 · 초과 ${over}칸` : "근무표가 생기면 보여요"}
      />
      <Tile
        label="OFF 배정"
        value={hasSchedule ? `${off.assigned} / ${off.target}` : "-"}
        detail={hasSchedule ? `남은 OFF ${off.remaining}개 · 지난달 이월 ${off.carried}개` : "근무표가 생기면 보여요"}
      />
      <Tile
        label="근무표"
        value={data.schedule ? (SCHEDULE_STATUS_LABEL[data.schedule.status] ?? data.schedule.status) : "없음"}
        detail={data.schedule ? `${Number(data.yearMonth.slice(5, 7))}월 근무표` : "이 달 근무표를 아직 만들지 않았어요"}
      />
    </div>
  );
}
