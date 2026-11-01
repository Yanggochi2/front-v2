import ScheduleButton from "@/components/ui/ScheduleButton";

const STEPS = [
  { title: "간호사 등록", description: "함께 일할 간호사를 등록해요" },
  { title: "규칙 확인", description: "차지, 신입 같은 규칙을 확인해요" },
  { title: "근무표 만들기", description: "자동 생성으로 한 번에 만들어요" },
];

// 수간호사 · 간호사가 아직 없을 때
export default function ScheduleEmptyState() {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-[18px] rounded-[28px] border border-line bg-white px-10 shadow-card py-[72px] text-center">
        <div className="flex size-24 items-center justify-center rounded-full bg-primary-soft text-[40px] ring-[10px] ring-primary-soft/40 font-bold text-primary" aria-hidden>
          ＋
        </div>
        <p className="max-w-[640px] text-[26px] font-bold text-ink">함께 일하는 간호사가 아직 없어요</p>
        <p className="max-w-[560px] text-[18px] font-medium text-ink-sub">
          근무표를 만들려면 먼저 간호사를 등록해요. 병동 코드를 알려 주면 간호사가 직접 가입을 신청할 수도 있어요.
        </p>
        <div className="flex flex-wrap items-start justify-center gap-3">
          <ScheduleButton variant="brand" size="md" href="/nurses/new">
            간호사 등록
          </ScheduleButton>
          {/* TODO: 병동 코드 보기 이동 위치는 확정 전 (병동 설정 추측) */}
          <ScheduleButton variant="neutral" size="md" href="/ward-settings">
            병동 코드 보기
          </ScheduleButton>
        </div>
      </div>
      <ol className="grid w-full grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2.5 rounded-[24px] border border-line bg-white shadow-card px-7 py-6">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-[18px] font-bold text-primary">{i + 1}</span>
            <p className="text-[20px] font-bold text-ink">{s.title}</p>
            <p className="text-[16px] font-medium text-ink-sub">{s.description}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
