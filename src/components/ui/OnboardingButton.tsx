import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex h-14 items-center justify-center rounded-xl px-7 text-lg font-bold whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-mute";
const variants: Record<Variant, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-surface text-ink-sub",
};

type Props = {
  variant?: Variant;
  href?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export default function OnboardingButton({
  variant = "primary",
  href,
  children,
  ...rest
}: Props) {
  const className = `${base} ${variants[variant]}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} {...rest}>
      {children}
    </button>
  );
}
