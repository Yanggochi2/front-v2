export function AdminErrorState({ message }: { message?: string }) {
  return (
    <section
      role="alert"
      className="flex w-full flex-col items-center gap-3 rounded-[28px] border border-line bg-white px-10 py-[72px] shadow-card text-center"
    >
      <p className="text-[26px] leading-normal font-bold text-ink">불러오지 못했어요</p>
      <p className="text-[18px] leading-normal font-medium text-ink-sub">
        {message ?? "잠시 뒤에 다시 시도해 주세요."}
      </p>
    </section>
  );
}

export function AdminLoading() {
  return (
    <div className="flex flex-col gap-8 px-12 pt-12 pb-10" aria-busy="true">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="h-[320px] w-full animate-pulse rounded-[20px] bg-surface" />
    </div>
  );
}
