import GenerateProgress from "@/components/schedule/GenerateProgress";
import GenerateStart from "@/components/schedule/GenerateStart";
import GenerationPoller from "@/components/schedule/GenerationPoller";
import ApiOfflineBanner from "@/components/ui/ApiOfflineBanner";
import { resolvePeriod } from "@/lib/schedulePeriod";
import { getEmptyGenerationProgress, getGenerateStartInfo, getGenerationProgress } from "@/services/generationApi";
import { getOffTarget } from "@/services/rulesApi";
import type { GenerationProgress } from "@/types/schedule.type";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// ?jobId= 가 없으면 시작 화면(달 고르기), 있으면 그 작업의 진행 화면
export default async function ScheduleGeneratePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const jobId = first(sp.jobId);

  if (!jobId) {
    const { yearMonth } = resolvePeriod(first(sp.ym));
    // 불러오지 못하면 "넣어 둔 칸 지키기"를 보여 주지 않고 시작만 할 수 있다 (시작할 때 다시 확인한다)
    const [info, offTarget] = await Promise.all([
      getGenerateStartInfo(yearMonth).catch(() => null),
      // 불러오지 못하면(서버 오류) OFF 목표 카드를 숨긴다. 근무표가 없으면 null
      getOffTarget(yearMonth).catch(() => undefined),
    ]);
    return (
      <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
        <GenerateStart yearMonth={yearMonth} draft={info === "LOCKED" ? null : info} locked={info === "LOCKED"} offTarget={offTarget} />
      </div>
    );
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
