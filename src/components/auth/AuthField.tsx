import type { InputHTMLAttributes } from "react";

type Props = {
  label: string;
  hint?: string;
  error?: string | null;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

// 라벨·입력·안내·오류가 한 묶음인 입력 칸. 입력 모양은 OnboardingInput과 같다.
export default function AuthField({ label, hint, error, id, ...rest }: Props) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="text-[17px] font-bold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-14 w-full rounded-[14px] bg-surface px-5 text-lg font-medium text-ink outline-none placeholder:text-ink-faint focus:ring-2 focus:ring-primary ${
          error ? "ring-2 ring-danger" : ""
        }`}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="text-base font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-base font-medium text-ink-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
