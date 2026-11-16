// 이름으로 근무를 찾는 동안 보여 주는 자리
export default function SharedMyDutyLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <p role="status" className="text-[20px] font-bold text-ink-sub">
        근무를 불러오고 있어요
      </p>
    </div>
  );
}
