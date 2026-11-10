import NurseImportButton from "@/components/nurses/NurseImportButton";
import NursesBoard from "@/components/nurses/NursesBoard";
import RnButton from "@/components/ui/RnButton";
import RnEmptyState from "@/components/ui/RnEmptyState";
import ApiOfflineBanner from "@/components/ui/ApiOfflineBanner";
import RnPageHeader from "@/components/ui/RnPageHeader";
import { getNurses } from "@/services/nursesApi";
import type { NurseListResult } from "@/types/nurses.type";

function HeaderActions() {
  return (
    <div className="flex gap-3">
      <NurseImportButton />
      <RnButton variant="primary" href="/nurses/new" className="px-[22px] text-[18px]">
        간호사 등록
      </RnButton>
    </div>
  );
}

export default async function NursesPage() {
  let result: NurseListResult | null = null;
  try {
    result = await getNurses();
  } catch {
    result = null;
  }

  return (
    <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
      {result === null ? (
        <>
          <RnPageHeader
            title="간호사 명단"
            subtitle="재직 0명"
            action={<HeaderActions />}
          />
          <ApiOfflineBanner retryHref="/nurses" />
          <NursesBoard items={[]} />
        </>
      ) : result.items.length === 0 ? (
        <>
          <RnPageHeader title="간호사 명단" subtitle="재직 0명" />
          <RnEmptyState
            icon="＋"
            title="등록된 간호사가 없어요"
            description="첫 간호사를 등록하면 이 목록에 나타나요. 여러 명이면 엑셀 양식에 채워 한꺼번에 올릴 수 있어요."
            action={
              <div className="flex gap-3">
                <NurseImportButton size="lg" />
                <RnButton variant="primary" size="lg" href="/nurses/new">
                  간호사 등록
                </RnButton>
              </div>
            }
          />
        </>
      ) : (
        <>
          <RnPageHeader
            title="간호사 명단"
            subtitle={`재직 ${result.activeCount}명 · 퇴사자는 ‘퇴사자 보기’를 누르면 보여요`}
            action={<HeaderActions />}
          />
          <NursesBoard items={result.items} />
        </>
      )}
    </div>
  );
}
