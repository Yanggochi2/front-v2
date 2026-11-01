import Link from "next/link";
import type { ReactNode } from "react";
import { BUTTON_BASE, BUTTON_TONE } from "./buttonStyles";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-12 rounded-[14px] px-5 text-[16px]",
  md: "h-[52px] rounded-[14px] px-6 text-[18px]",
  lg: "h-14 rounded-[16px] px-7 text-[18px]",
};

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
};

export default function AdminButton({ variant = "secondary", size = "sm", href, children, onClick, disabled, type = "button" }: Props) {
  const cls = `${BUTTON_BASE} ${BUTTON_TONE[variant]} ${sizes[size]}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
