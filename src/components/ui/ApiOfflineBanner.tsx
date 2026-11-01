import Link from "next/link";

// 서버에 연결하지 못했을 때 화면을 통째로 바꾸지 않고, 내용 맨 위에만 띄우는 얇은 안내.
export default function ApiOfflineBanner({ retryHref }: { retryHref: string }) {
  return (
    <div
      role="alert"
      className="flex w-full items-center justify-between gap-4 rounded-[16px] border border-[#ffd6d6] shadow-card bg-[#fff5f5] px-5 py-3 text-[16px] font-medium text-[#c92a3a]"
    >
      <p>서버에 연결하지 못했어요. 서버 주소를 확인해 주세요.</p>
      <Link href={retryHref} className="shrink-0 font-bold underline">
        다시 시도
      </Link>
    </div>
  );
}
