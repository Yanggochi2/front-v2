import Link from "next/link";
import type { ReactNode } from "react";
import { BUTTON_BASE, BUTTON_TONE } from "./buttonStyles";

type Props = {
  variant: "primary" | "secondary";
  size?: "md" | "lg";
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

// requests/nurses 화면용 버튼. md=48px(헤더·행 버튼), lg=56px(폼·빈 상태 버튼)
export default function RnButton({
  variant,
  size = "md",
  href,
  type = "button",
  onClick,
  disabled,
  className = "",
  children,
}: Props) {
  const cls = `${BUTTON_BASE} ${size === "lg" ? "h-14 rounded-[16px] px-7 text-[18px]" : "h-12 rounded-[14px] px-5 text-[16px]"} ${BUTTON_TONE[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
