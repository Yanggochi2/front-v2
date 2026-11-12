import type { ReactNode } from "react";

type Props = { className?: string; children: ReactNode };

export default function OnboardingCard({ className = "", children }: Props) {
  return (
    <section
      className={`rounded-3xl border border-line bg-card ${className}`}
    >
      {children}
    </section>
  );
}
