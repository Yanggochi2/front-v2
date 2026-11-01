import ScheduleChip from "@/components/ui/ScheduleChip";
import SchedulePageHeader from "@/components/ui/SchedulePageHeader";
import { GENERATE_ESTIMATED_MINUTES } from "@/constants/schedule.constants";
import type { GenerationProgress } from "@/types/schedule.type";
import GenerateStopButton from "./GenerateStopButton";

const STATUS = {
  done: { label: "완료", tone: "gray", card: "border-line bg-white" },
  active: { label: "진행 중", tone: "brand", card: "border-primary bg-primary-soft ring-4 ring-primary-soft/60" },
  pending: { label: "대기", tone: "gray", card: "border-line bg-white" },
} as const;

export default function GenerateProgress({ data }: { data: GenerationProgress }) {
  return (
    <>
      <SchedulePageHeader
        title="근무표를 만들고 있어요"
        subtitle={`${data.periodLabel} · 보통 ${GENERATE_ESTIMATED_MINUTES}분 안에 끝나요, 창을 닫지 마세요`}
        action={<GenerateStopButton jobId={data.jobId} yearMonth={data.yearMonth} />}
      />
      <ol className="grid w-full grid-cols-3 gap-6">
        {data.steps.map((s) => {
          const st = STATUS[s.status];
          return (
            <li key={s.order} className={`flex flex-col items-start gap-2.5 rounded-[20px] border px-7 py-[26px] ${st.card}`}>
              <span
                className={`flex size-9 items-center justify-center rounded-full text-[18px] font-bold ${
                  s.status === "pending" ? "bg-surface text-ink-mute" : "bg-primary text-white"
                }`}
              >
                {s.status === "done" ? "✓" : s.order}
              </span>
              <p className="text-[22px] font-bold text-ink">{s.title}</p>
              <span className="flex items-center gap-2">
                {s.status === "active" ? <span aria-hidden className="size-2.5 animate-pulse rounded-full bg-primary" /> : null}
                <ScheduleChip tone={st.tone}>{st.label}</ScheduleChip>
              </span>
            </li>
          );
        })}
      </ol>
      <dl className="grid w-full grid-cols-3 gap-6">
        {data.metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-2.5 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
            <dt className="text-[16px] font-medium text-ink-sub">{m.label}</dt>
            <dd className={`text-[40px] leading-normal font-bold tracking-[-0.02em] ${m.tone === "danger" ? "text-danger" : "text-ink"}`}>{m.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
