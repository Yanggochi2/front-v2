import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { BUTTON_BASE, BUTTON_TONE } from "./buttonStyles";

type Variant = "brand" | "neutral" | "primary" | "primary-soft";
type Size = "sm" | "md" | "xs" | "bar";

const VARIANT: Record<Variant, string> = {
  brand: BUTTON_TONE.primary,
  neutral: BUTTON_TONE.secondary,
  primary: BUTTON_TONE.primary,
  "primary-soft": BUTTON_TONE.soft,
};

const SIZE: Record<Size, string> = {
  xs: "min-h-12 rounded-[14px] px-4 py-[9px] text-[16px]",
  sm: "min-h-12 rounded-[14px] px-[22px] py-[11px] text-[18px]",
  md: "h-14 rounded-[16px] px-7 text-[18px]",
  bar: "rounded-[18px] px-[34px] py-4 text-[20px]",
};

type Props = {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export default function ScheduleButton({
  variant = "neutral",
  size = "sm",
  href,
  children,
  className = "",
  ...rest
}: Props) {
  const cls = `${BUTTON_BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
