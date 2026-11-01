// 수간호사 화면 버튼(AdminButton·RnButton·ScheduleButton)이 같이 쓰는 모양.
// Tailwind가 클래스를 찾을 수 있게 전체 문자열로 적는다.
export const BUTTON_BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-bold leading-normal transition-[background-color,box-shadow,transform,color,border-color] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

export const BUTTON_TONE = {
  primary: "bg-primary text-white shadow-cta hover:bg-primary-strong",
  secondary: "border border-line bg-white text-ink-sub shadow-[0_1px_2px_rgb(25_31_40/0.05)] hover:border-grid hover:bg-canvas hover:text-ink",
  soft: "bg-primary-soft text-primary ring-1 ring-primary/15 ring-inset hover:ring-primary/40",
} as const;
