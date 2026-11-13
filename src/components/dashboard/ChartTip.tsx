import type { ReactNode } from "react";

type Props = {
  tip: string;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
};

// 그래프 막대·칸에 마우스를 올리거나 Tab으로 가면 정확한 값을 말풍선으로 보여 준다.
// 표시 영역(className)이 막대보다 크면 그만큼 고르기 쉬워진다.
export default function ChartTip({ tip, className = "", style, children }: Props) {
  return (
    <span tabIndex={0} aria-label={tip} style={style} className={`group/tip relative outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-ink px-3 py-1.5 text-[15px] font-medium text-white shadow-pop group-hover/tip:block group-focus-visible/tip:block"
      >
        {tip}
      </span>
    </span>
  );
}
