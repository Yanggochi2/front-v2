import AdminButton from "@/components/ui/AdminButton";
import AdminChip from "@/components/ui/AdminChip";
import AdminNotice from "@/components/ui/AdminNotice";
import type { ReactNode } from "react";
import JoinCodeSection from "./JoinCodeSection";
import RequiredStaffSection from "./RequiredStaffSection";
import type { WardSettingsData } from "@/types/ward.type";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col items-start gap-2.5 rounded-[24px] border border-line bg-white shadow-card px-7 py-[26px]">
      <h2 className="flex items-center gap-2 text-[18px] leading-normal font-bold text-ink">
        <span aria-hidden className="size-2 rounded-full bg-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center gap-3 py-2">
      <p className="min-w-0 flex-1 text-[17px] leading-normal font-medium text-ink-sub">{label}</p>
      <p className="shrink-0 text-[18px] leading-normal font-bold whitespace-pre text-ink">{value}</p>
    </div>
  );
}

// ward가 null이면(서버 연결 실패) 값 없이 화면 틀만 보여 준다.
export default function WardSettingsView({ ward }: { ward: WardSettingsData | null }) {
  return (
    <>
      <Card title="병동 정보">
        <InfoRow label="병원" value={ward?.hospitalName ?? "-"} />
        <InfoRow label="병동" value={ward?.wardName ?? "-"} />
        <InfoRow label="함께 일하는 간호사" value={ward ? `${ward.nurseCount}명` : "-"} />
        {ward?.ruleStartLabel ? <InfoRow label="규칙 시작 방식" value={ward.ruleStartLabel} /> : null}
        <AdminButton>정보 고치기</AdminButton>
      </Card>
      <Card title="하루 필요 인원">
        {ward ? (
          <RequiredStaffSection initial={ward.dailyRequired} />
        ) : (
          <p className="text-[18px] leading-normal font-bold text-ink">-</p>
        )}
      </Card>
      <Card title="병동 코드">
        <JoinCodeSection initialCode={ward?.wardCode ?? "-"} />
        <p className="text-[16px] leading-normal font-medium text-ink-sub">
          코드를 다시 만들면 이전 코드로는 가입할 수 없어요. 이미 들어온 사람에게는 영향이 없어요.
        </p>
      </Card>
      <Card title="수간호사 권한">
        {(ward?.headNurses ?? []).map((h) => (
          <div key={h.id} className="flex items-center gap-3">
            <p className="text-[20px] leading-normal font-bold text-ink">
              {h.name}
              {h.isMe ? " (나)" : ""}
            </p>
            <AdminChip tone="blue">수간호사</AdminChip>
          </div>
        ))}
        <div className="flex flex-wrap gap-3">
          <AdminButton variant="primary">다른 사람에게 수간호사 추가</AdminButton>
          <AdminButton>권한 넘기기</AdminButton>
        </div>
      </Card>
      <AdminNotice tone="red">
        병동의 마지막 수간호사는 권한을 넘기기 전에는 나가거나 바꿀 수 없어요.
      </AdminNotice>
    </>
  );
}
