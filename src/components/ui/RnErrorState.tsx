import RnButton from "./RnButton";

// 화면 캡처에 에러 화면은 없다. 최소한의 안내만 둔다. TODO: 에러 화면 캡처가 생기면 반영
export default function RnErrorState({ message, retryHref }: { message: string; retryHref: string }) {
  return (
    <section
      role="alert"
      className="flex w-full flex-col items-center gap-[18px] rounded-[28px] border border-line bg-white px-10 py-[72px] shadow-card"
    >
      <p className="text-center text-[22px] font-bold text-ink">{message}</p>
      <RnButton variant="secondary" size="lg" href={retryHref}>
        다시 시도
      </RnButton>
    </section>
  );
}
