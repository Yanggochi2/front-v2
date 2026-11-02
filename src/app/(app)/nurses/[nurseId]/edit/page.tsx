import NurseForm from "@/components/nurses/NurseForm";
import RnButton from "@/components/ui/RnButton";
import RnEmptyState from "@/components/ui/RnEmptyState";
import RnErrorState from "@/components/ui/RnErrorState";
import RnPageHeader from "@/components/ui/RnPageHeader";
import { getNurse, getPreceptorCandidates } from "@/services/nursesApi";

export default async function EditNursePage({ params }: PageProps<"/nurses/[nurseId]/edit">) {
  const { nurseId } = await params;
  const [nurse, newNurses] = await Promise.all([getNurse(nurseId).catch(() => null), getPreceptorCandidates()]);

  if (!nurse) {
    return (
      <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
        <RnPageHeader title="간호사 정보 수정" subtitle="간호사 정보를 불러오지 못했어요" />
        <RnErrorState message="간호사 정보를 불러오지 못했어요." retryHref={`/nurses/${nurseId}/edit`} />
      </div>
    );
  }

  // 명단에서는 수정 버튼을 숨기지만 주소로 바로 들어올 수 있어 여기서도 막는다.
  if (nurse.status === "RETIRED") {
    return (
      <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
        <RnPageHeader title="간호사 정보 수정" subtitle={`${nurse.name}님은 퇴사 처리된 간호사예요`} />
        <RnEmptyState
          icon="!"
          title="퇴사한 간호사는 수정할 수 없어요"
          description="퇴사 처리된 간호사의 정보는 바꿀 수 없어요. 명단에서 퇴사자 포함을 켜면 볼 수 있어요."
          action={
            <RnButton variant="primary" size="lg" href="/nurses">
              명단으로
            </RnButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-12 pt-12 pb-10">
      <RnPageHeader title="간호사 정보 수정" subtitle={`${nurse.name}님의 근무 배정 정보를 수정해요`} />
      <NurseForm nurse={nurse} newNurses={newNurses} />
    </div>
  );
}
