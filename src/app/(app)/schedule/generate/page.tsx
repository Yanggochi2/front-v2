import { redirect } from "next/navigation";
import GenerateProgress from "@/components/schedule/GenerateProgress";
import GenerationPoller from "@/components/schedule/GenerationPoller";
import ApiOfflineBanner from "@/components/ui/ApiOfflineBanner";
import { resolvePeriod } from "@/lib/schedulePeriod";
import { getEmptyGenerationProgress, getGenerationProgress } from "@/services/generationApi";
import type { GenerationProgress } from "@/types/schedule.type";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// 자동 생성 작업의 진행 화면 (?jobId=). 시작은 근무표 화면의 '자동 생성' 버튼 한 곳에서만 한다 (11/17 미팅).
// 예전 시작 화면 주소(?ym=)로 들어오면 그 달 근무표로 보낸다.
export default async function ScheduleGeneratePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const jobId = first(sp.jobId);

  if (!jobId) {
    const { yearMonth } = resolvePeriod(first(sp.ym));
    redirect(`/schedule?view=month&ym=${yearMonth}`);
  }

  let data: GenerationProgress;
  let offline = false;
  try {
    data = await getGenerationProgress(jobId);
  } catch {
    data = getEmptyGenerationProgress();
    offline = true;
  }
  return (
    <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
      {offline ? <ApiOfflineBanner retryHref={`/schedule/generate?jobId=${encodeURIComponent(jobId)}`} /> : null}
      <GenerateProgress data={data} />
      {offline ? null : <GenerationPoller jobId={jobId} yearMonth={data.yearMonth} />}
    </div>
  );
}
